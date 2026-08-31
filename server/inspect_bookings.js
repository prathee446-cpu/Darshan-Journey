import dns from 'dns';
import { MongoClient } from 'mongodb';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const uri = 'mongodb+srv://Prathika:darshanjourneytemple@cluster0.tkdwmrz.mongodb.net/darshan_journey_db?retryWrites=true&w=majority';
const client = new MongoClient(uri);

async function inspectBookings() {
  try {
    await client.connect();
    const db = client.db('darshan_journey_db');
    const bookings = await db.collection('bookings').find({}).toArray();
    console.log(`=== Total Bookings in MongoDB: ${bookings.length} ===`);
    console.log(JSON.stringify(bookings, null, 2));
  } catch (err) {
    console.error('Error fetching bookings:', err);
  } finally {
    await client.close();
  }
}

inspectBookings();
