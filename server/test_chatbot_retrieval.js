import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAssistantReply } from './controllers/chatController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://Prathika:darshanjourneytemple@cluster0.tkdwmrz.mongodb.net/darshan_journey_db?retryWrites=true&w=majority';
const dbName = process.env.DATABASE_NAME || 'darshan_journey_db';

const TEST_CASES = [
  // 1. Temple Details
  {
    query: "Tanjore temple enna?",
    type: "TEMPLE_SPECIFIC",
    expectedKeywords: ["Brihadeeswarar", "Thanjavur"]
  },
  {
    query: "Thanjavur temple enna?",
    type: "TEMPLE_SPECIFIC",
    expectedKeywords: ["Brihadeeswarar", "Thanjavur"]
  },
  {
    query: "Madurai temple enna?",
    type: "TEMPLE_SPECIFIC",
    expectedKeywords: ["Meenakshi", "Madurai"]
  },
  // 2. Timings
  {
    query: "What are the temple timings?",
    type: "TIMINGS",
    expectedKeywords: ["Timings", "Meenakshi", "Brihadeeswarar"]
  },
  // 3. Booking
  {
    query: "Tell me about booking",
    type: "BOOKING",
    expectedKeywords: ["How to Book", "Quick Booking", "QR-code"]
  },
  {
    query: "How can I book?",
    type: "BOOKING",
    expectedKeywords: ["How to Book", "Quick Booking"]
  },
  // 4. Services
  {
    query: "What services are available?",
    type: "SERVICES",
    expectedKeywords: ["Services", "Pooja", "Prasadam"]
  },
  // 5. Prasadam
  {
    query: "What is prasadam?",
    type: "PRASADAM",
    expectedKeywords: ["Prasadam", "Panchamirtham", "Laddu"]
  },
  // 6. Contact
  {
    query: "How can I contact Darshan Journey?",
    type: "CONTACT",
    expectedKeywords: ["Contact Darshan Journey", "Support Helpline", "Email"]
  },
  // 7. Off-Topic Protection
  {
    query: "What is the weather today?",
    type: "OFF_TOPIC",
    expectedKeywords: ["I'm the Darshan Journey Assistant. I can only help with Darshan Journey's temples"]
  },
  {
    query: "Tell me a joke",
    type: "OFF_TOPIC",
    expectedKeywords: ["I'm the Darshan Journey Assistant. I can only help with Darshan Journey's temples"]
  },
  {
    query: "Who is the president?",
    type: "OFF_TOPIC",
    expectedKeywords: ["I'm the Darshan Journey Assistant. I can only help with Darshan Journey's temples"]
  }
];

async function runTests() {
  console.log(`Connecting Mongoose to MongoDB Atlas "${dbName}"...`);
  await mongoose.connect(mongoUri, { dbName: dbName });
  console.log(`✅ Connected to MongoDB Atlas.`);

  let passed = 0;
  let failed = 0;

  for (const test of TEST_CASES) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`🧪 TESTING QUERY: "${test.query}"`);
    const reply = await generateAssistantReply(test.query);
    console.log(`💬 BOT RESPONSE:\n${reply.text}`);
    if (reply.navAction) {
      console.log(`🔗 NavAction: ${JSON.stringify(reply.navAction)}`);
    }

    let isMatch = true;
    for (const kw of test.expectedKeywords) {
      if (!reply.text.toLowerCase().includes(kw.toLowerCase())) {
        console.error(`❌ MISSING KEYWORD: "${kw}"`);
        isMatch = false;
      }
    }

    // Ensure fallback message is NOT triggered for valid questions
    if (test.type !== 'OFF_TOPIC' && reply.text.includes("I couldn't find that information")) {
      console.error(`❌ FAILED: Erroneous fallback triggered!`);
      isMatch = false;
    }

    if (isMatch) {
      console.log(`✅ TEST PASSED for "${test.query}"`);
      passed++;
    } else {
      console.error(`❌ TEST FAILED for "${test.query}"`);
      failed++;
    }
  }

  console.log(`\n============================================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${TEST_CASES.length} total tests.`);
  console.log(`============================================================\n`);

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
