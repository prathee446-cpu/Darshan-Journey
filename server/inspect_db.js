import dns from 'dns';
import { MongoClient } from 'mongodb';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const uri = 'mongodb+srv://Prathika:darshanjourneytemple@cluster0.tkdwmrz.mongodb.net/darshan_journey_db?retryWrites=true&w=majority';
const client = new MongoClient(uri);

async function inspect() {
  try {
    await client.connect();
    const db = client.db('darshan_journey_db');
    const collections = ['services', 'temples', 'bookings', 'users', 'admins', 'media', 'content', 'settings', 'products'];
    
    for (const name of collections) {
      const col = db.collection(name);
      const count = await col.countDocuments();
      const samples = await col.find({}, { projection: { id: 1, name: 1, title: 1, email: 1, customer: 1, key: 1 } }).limit(3).toArray();
      console.log(`=== Collection: ${name} (Count: ${count}) ===`);
      console.log(JSON.stringify(samples, null, 2));
    }
  } catch (err) {
    console.error('Inspect error:', err);
  } finally {
    await client.close();
  }
}

inspect();
