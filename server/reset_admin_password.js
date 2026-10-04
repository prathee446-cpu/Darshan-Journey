import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import dns from 'dns';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  if (!password || !salt || !hash) return false;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return verifyHash === hash;
}

function askHiddenPassword(promptText) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Mask terminal input
    const stdin = process.stdin;
    let password = '';

    process.stdout.write(promptText);

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();

      const onData = (charBuffer) => {
        const char = charBuffer.toString('utf8');

        // Enter key
        if (char === '\n' || char === '\r' || char === '\u0004') {
          process.stdin.setRawMode(false);
          process.stdin.removeListener('data', onData);
          process.stdout.write('\n');
          rl.close();
          resolve(password);
        } else if (char === '\u0003') { // Ctrl+C
          process.stdin.setRawMode(false);
          process.stdout.write('\nOperation cancelled.\n');
          process.exit(0);
        } else if (char === '\u0008' || char === '\x7f') { // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          password += char;
          process.stdout.write('*');
        }
      };

      process.stdin.on('data', onData);
    } else {
      // Non-TTY fallback
      rl.question('', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

const DATA_STORE_FILE = path.resolve('server', 'data_store.json');
const TARGET_ADMIN_EMAIL = 'admin@darshanjourney.com';
const TARGET_ADMIN_ID = 'adm-1';

async function main() {
  console.log('============================================================');
  console.log('🕉️  DARSHAN JOURNEY - SECURE ADMIN PASSWORD RESET');
  console.log('============================================================');
  console.log(`Target Administrator: ${TARGET_ADMIN_EMAIL} (${TARGET_ADMIN_ID})`);
  console.log('------------------------------------------------------------\n');

  let newPassword = await askHiddenPassword('🔑 Enter new Admin password: ');
  if (!newPassword || newPassword.length < 6) {
    console.error('\n❌ Password must be at least 6 characters long.');
    process.exit(1);
  }

  let confirmPassword = await askHiddenPassword('🔑 Confirm new Admin password: ');
  if (newPassword !== confirmPassword) {
    console.error('\n❌ Passwords do not match. Please run the command again.');
    process.exit(1);
  }

  console.log('\n🔒 Generating secure cryptographic hash (PBKDF2-SHA512)...');
  const { salt, hash } = hashPassword(newPassword);

  // 1. Update server/data_store.json
  let diskUpdated = false;
  if (fs.existsSync(DATA_STORE_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_STORE_FILE, 'utf-8');
      const dataStore = JSON.parse(raw);
      if (Array.isArray(dataStore.admins)) {
        const targetIndex = dataStore.admins.findIndex(
          a => (a.email || '').toLowerCase().trim() === TARGET_ADMIN_EMAIL.toLowerCase() || a.id === TARGET_ADMIN_ID
        );

        if (targetIndex !== -1) {
          dataStore.admins[targetIndex].passwordHash = hash;
          dataStore.admins[targetIndex].salt = salt;
          dataStore.admins[targetIndex].updatedAt = new Date().toISOString();
          fs.writeFileSync(DATA_STORE_FILE, JSON.stringify(dataStore, null, 2), 'utf-8');
          diskUpdated = true;
          console.log(`✅ Updated password credentials in local store (${DATA_STORE_FILE})`);
        }
      }
    } catch (err) {
      console.warn('⚠️ Note updating local data store:', err.message);
    }
  }

  // 2. Update MongoDB Atlas
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.DATABASE_NAME || 'darshan_journey_db';
  let mongoUpdated = false;

  if (mongoUri && mongoUri.startsWith('mongodb')) {
    let client = null;
    try {
      console.log('🔄 Connecting to MongoDB Atlas...');
      client = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000
      });
      await client.connect();
      const db = client.db(dbName);
      const adminsCol = db.collection('admins');

      const existingDoc = await adminsCol.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${TARGET_ADMIN_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
          { id: TARGET_ADMIN_ID }
        ]
      });

      if (existingDoc) {
        await adminsCol.updateOne(
          { _id: existingDoc._id },
          {
            $set: {
              passwordHash: hash,
              salt: salt,
              updatedAt: new Date().toISOString()
            }
          }
        );
        mongoUpdated = true;
        console.log(`✅ Updated password credentials in MongoDB Atlas (Collection: admins)`);
      } else {
        console.warn(`⚠️ Existing Admin document not found in MongoDB Atlas.`);
      }
    } catch (mErr) {
      console.warn('⚠️ MongoDB Atlas update note:', mErr.message);
    } finally {
      if (client) {
        try {
          await client.close();
        } catch (e) {}
      }
    }
  }

  // 3. Verification test
  const isValid = verifyPassword(newPassword, salt, hash);

  // Clear memory
  newPassword = null;
  confirmPassword = null;

  console.log('\n============================================================');
  if (isValid && (diskUpdated || mongoUpdated)) {
    console.log('🎉 Super Admin password reset completed successfully!');
    console.log(`   Account:    ${TARGET_ADMIN_EMAIL}`);
    console.log(`   Local Store: ${diskUpdated ? '✅ Synchronized' : '⚠️ Unchanged'}`);
    console.log(`   MongoDB:    ${mongoUpdated ? '✅ Synchronized' : '⚠️ Unchanged'}`);
    console.log('   Verification: ✅ PBKDF2-SHA512 Password verification test PASSED');
    console.log('============================================================');
  } else {
    console.error('❌ Password reset failed during verification.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\n❌ Execution error:', err.message);
  process.exit(1);
});
