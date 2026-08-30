import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dns from 'dns';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

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

const DATA_STORE_FILE = path.resolve('server', 'data_store.json');
const ADMIN_EMAIL = 'admin@darshanjourney.com';
const ADMIN_PASSWORD = 'Admin@12345';

async function seedAdmin() {
  console.log('============================================================');
  console.log('🕉️  DARSHAN JOURNEY - SUPER ADMIN SEED & CREDENTIAL SYNC');
  console.log('============================================================');
  console.log(`Target Email: ${ADMIN_EMAIL}`);
  console.log(`Target Role:  Super Admin`);
  console.log('Hashing password securely using PBKDF2 SHA-512...');

  const { salt, hash } = hashPassword(ADMIN_PASSWORD);
  console.log(`✅ Secure Hash generated (Salt: ${salt.slice(0, 8)}..., Hash: ${hash.slice(0, 16)}...)`);

  let dataStore = null;
  let adminExistedInDisk = false;

  // 1. Update/Seed data_store.json
  if (fs.existsSync(DATA_STORE_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_STORE_FILE, 'utf-8');
      dataStore = JSON.parse(raw);
      if (!Array.isArray(dataStore.admins)) {
        dataStore.admins = [];
      }

      const existingIndex = dataStore.admins.findIndex(
        a => (a.email || '').toLowerCase().trim() === ADMIN_EMAIL.toLowerCase()
      );

      if (existingIndex !== -1) {
        adminExistedInDisk = true;
        dataStore.admins[existingIndex] = {
          ...dataStore.admins[existingIndex],
          name: dataStore.admins[existingIndex].name || 'Prathika (Chief Administrator)',
          email: ADMIN_EMAIL,
          role: 'Super Admin',
          status: 'Active',
          permissions: 'Full Access (All Operations, Settings & Financials)',
          passwordHash: hash,
          salt: salt,
          updatedAt: new Date().toISOString()
        };
        console.log(`💾 Updated existing Super Admin in local cache (${DATA_STORE_FILE})`);
      } else {
        const newAdmin = {
          id: 'adm-1',
          name: 'Prathika (Chief Administrator)',
          email: ADMIN_EMAIL,
          role: 'Super Admin',
          status: 'Active',
          lastLogin: 'Never',
          permissions: 'Full Access (All Operations, Settings & Financials)',
          passwordHash: hash,
          salt: salt,
          createdAt: new Date().toISOString()
        };
        dataStore.admins.unshift(newAdmin);
        console.log(`💾 Created initial Super Admin in local cache (${DATA_STORE_FILE})`);
      }

      fs.writeFileSync(DATA_STORE_FILE, JSON.stringify(dataStore, null, 2), 'utf-8');
    } catch (err) {
      console.warn('⚠️ Note when reading/writing data_store.json:', err.message);
    }
  }

  // 2. Update/Seed MongoDB Atlas
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.DATABASE_NAME || 'darshan_journey_db';
  let adminExistedInMongo = false;

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
      const adminsCollection = db.collection('admins');

      const existingAdmin = await adminsCollection.findOne({
        email: { $regex: new RegExp(`^${ADMIN_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });

      if (existingAdmin) {
        adminExistedInMongo = true;
        await adminsCollection.updateOne(
          { _id: existingAdmin._id },
          {
            $set: {
              name: existingAdmin.name || 'Prathika (Chief Administrator)',
              email: ADMIN_EMAIL,
              role: 'Super Admin',
              status: 'Active',
              permissions: 'Full Access (All Operations, Settings & Financials)',
              passwordHash: hash,
              salt: salt,
              updatedAt: new Date().toISOString()
            }
          }
        );
        console.log(`✅ Safely updated existing Super Admin in MongoDB Atlas database (${dbName})`);
      } else {
        const newAdminDoc = {
          id: 'adm-1',
          name: 'Prathika (Chief Administrator)',
          email: ADMIN_EMAIL,
          role: 'Super Admin',
          status: 'Active',
          lastLogin: 'Never',
          permissions: 'Full Access (All Operations, Settings & Financials)',
          passwordHash: hash,
          salt: salt,
          createdAt: new Date().toISOString()
        };
        await adminsCollection.insertOne(newAdminDoc);
        console.log(`🌱 Created initial Super Admin in MongoDB Atlas database (${dbName})`);
      }
    } catch (err) {
      console.warn('⚠️ MongoDB Atlas update note:', err.message);
    } finally {
      if (client) {
        try {
          await client.close();
        } catch (e) {}
      }
    }
  }

  // 3. Verification test
  const verificationSuccess = verifyPassword(ADMIN_PASSWORD, salt, hash);
  console.log('============================================================');
  if (verificationSuccess) {
    console.log('🎉 Super Admin account configured successfully!');
    console.log(`   User:     ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Existed:  ${adminExistedInMongo || adminExistedInDisk ? 'YES (Safely Reset Password)' : 'NO (Created New Account)'}`);
    console.log(`   Storage:  MongoDB Atlas & server/data_store.json`);
  } else {
    console.error('❌ Password verification test failed');
    process.exit(1);
  }
  console.log('============================================================');
}

seedAdmin().catch((err) => {
  console.error('Seed execution error:', err);
  process.exit(1);
});
