import dns from 'dns';
import { MongoClient } from 'mongodb';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.log('dns error', e);
}

const uri = 'mongodb+srv://Prathika:darshanjourneytemple@cluster0.tkdwmrz.mongodb.net/darshan_journey_db?retryWrites=true&w=majority';
const client = new MongoClient(uri);

async function test() {
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('✅ MONGO CONNECTED SUCCESSFUL');
    const db = client.db('darshan_journey_db');
    const cols = await db.listCollections().toArray();
    console.log('Collections in darshan_journey_db:', cols.map(c => c.name));
    for (const col of cols) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count} documents`);
    }
  } catch (err) {
    console.error('❌ MONGO ERROR:', err);
  } finally {
    await client.close();
  }
}

test();
