import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is explicitly loaded from root directory and server directory
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Ensure reliable DNS resolution for MongoDB Atlas SRV queries on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if not supported in environment
}

export async function connectMongoose() {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.DATABASE_NAME || "darshan_journey_db";

  console.log(`MongoDB URI loaded: ${mongoUri ? 'YES' : 'NO'}`);

  if (!mongoUri) {
    console.error('============================================================');
    console.error('❌ MONGODB_URI is not defined in .env');
    console.error('============================================================');
    return false;
  }

  try {
    console.log(`🔄 Connecting Mongoose to MongoDB Atlas database "${dbName}"...`);
    await mongoose.connect(mongoUri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });

    const host = mongoose.connection.host || 'unknown-host';
    const activeDbName = mongoose.connection.name || mongoose.connection.db?.databaseName || dbName;
    const readyState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const stateStr = states[readyState] || 'unknown';

    console.log('============================================================');
    console.log(`MongoDB HOST: ${host}`);
    console.log(`MongoDB DATABASE: ${activeDbName}`);
    console.log(`MongoDB STATE: ${stateStr}`);
    console.log('ChatHistory collection: chathistories');
    console.log('============================================================');
    return true;
  } catch (err) {
    console.error('============================================================');
    console.error('❌ MONGODB ATLAS CONNECTION FAILED');
    console.error(`Reason: ${err.message}`);
    console.error('============================================================');
    return false;
  }
}

export default connectMongoose;
