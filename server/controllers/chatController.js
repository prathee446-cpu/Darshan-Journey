import mongoose from 'mongoose';
import ChatHistory from '../models/ChatHistory.js';

// Predefined verified temple metadata & aliases mapping to enrich MongoDB records
const TEMPLE_ALIASES_MAP = {
  "t-1": [
    "meenakshi", "madurai", "meenakshi amman", "sundareswarar", "meenakshi sundareswarar",
    "madurai temple", "meenakshi temple", "madurai kovil", "madurai meenakshi"
  ],
  "t-2": [
    "thanjavur", "tanjore", "brihadeeswarar", "brihadishvara", "brihadeeswara",
    "big temple", "thanjavur big temple", "tanjore big temple", "peruvudaiyar", "periya kovil",
    "thanjavur temple", "tanjore temple", "thanjavur kovil", "tanjore kovil", "thanjai", "rajaraja chola"
  ],
  "t-3": [
    "kapaleeshwarar", "kapaleeswarar", "mylapore", "chennai", "karpagambal",
    "mylapore temple", "kapaleeshwarar temple", "chennai temple", "mylapore kovil"
  ],
  "t-4": [
    "rameswaram", "rameshwaram", "ramanathaswamy", "jyotirlinga",
    "rameswaram temple", "ramanathaswamy temple", "rameswaram kovil", "ramanathapuram"
  ],
  "t-5": [
    "srirangam", "ranganathaswamy", "ranganatha", "ranganathar", "trichy", "tiruchirappalli", "tiruchirapalli",
    "srirangam temple", "srirangam perumal", "trichy perumal", "srirangam kovil"
  ],
  "t-6": [
    "palani", "dhandayuthapani", "palani murugan", "dindigul", "sivagiri",
    "palani temple", "palani kovil", "dhandayuthapani swamy"
  ]
};

/**
 * Checks if a query is completely unrelated to Darshan Journey
 */
function isUnrelatedQuery(input) {
  const text = (input || '').toLowerCase().trim();

  // If asking about dress code, QR code, pin code, or temple matters, it is related
  if (
    text.includes('dress code') || text.includes('qr code') || text.includes('pincode') || 
    text.includes('pin code') || text.includes('temple') || text.includes('darshan') ||
    text.includes('pooja') || text.includes('seva') || text.includes('prasadam') ||
    text.includes('booking') || text.includes('journey')
  ) {
    return false;
  }

  // Explicit non-Darshan keywords
  const unrelatedPatterns = [
    /\bpython\b/, /\bjavascript\b/, /\bjava\b/, /\bc\+\+\b/, /\bprogramming\b/, /\bcoding\b/,
    /\b(write|create|debug|generate|run)\s+(code|script|program)\b/,
    /\bweather\b/, /\bforecast\b/, /\brain\b/, /\btemperature\b/,
    /\bcapital of\b/, /\bpresident\b/, /\bprime minister\b/, /\bwho is\b.*\b(actor|actress|politician|president|singer|cricketer)\b/,
    /\bformula\b/, /\bequation\b/, /\bcalculate\b/, /\bmath\b/, /\b2\s*[\+\-\*\/]\s*2\b/,
    /\brecipe for\b/, /\bhow to cook (pasta|pizza|cake|biryani)\b/,
    /\bmovie\b/, /\bnetflix\b/, /\bspotify\b/, /\bfootball\b/, /\bcricket score\b/,
    /\bjoke\b/, /\btell me a joke\b/, /\bstory about aliens\b/
  ];

  return unrelatedPatterns.some(pattern => pattern.test(text));
}

/**
 * Checks if query asks about a known temple not in Darshan Journey's active coverage
 */
function hasUnknownTempleReference(text) {
  const clean = text.toLowerCase();
  const knownOtherTemples = [
    "somnath", "kashi", "vishwanath", "kedarnath", "badrinath", "puri", "jagannath",
    "shirdi", "vaishno devi", "tirupati balaji", "venkateswara", "amarnath", "kamakhya",
    "golden temple amritsar", "akshardham", "mahakaleshwar", "omkareshwar", "trimbakeshwar"
  ];
  return knownOtherTemples.some(t => clean.includes(t));
}

/**
 * Database helper: Retrieve live temples from MongoDB collection `temples`
 */
async function fetchTemplesFromDb() {
  try {
    const db = mongoose.connection.db;
    if (!db) return [];
    const temples = await db.collection('temples').find({}).toArray();
    return temples;
  } catch (err) {
    console.error('❌ Error fetching temples from DB:', err.message);
    return [];
  }
}

/**
 * Database helper: Retrieve live services & products from MongoDB
 */
async function fetchServicesFromDb() {
  try {
    const db = mongoose.connection.db;
    if (!db) return { services: [], products: [] };
    const services = await db.collection('services').find({}).toArray();
    const products = await db.collection('products').find({}).toArray();
    return { services, products };
  } catch (err) {
    console.error('❌ Error fetching services from DB:', err.message);
    return { services: [], products: [] };
  }
}

/**
 * Database helper: Retrieve portal settings from MongoDB
 */
async function fetchPortalSettingsFromDb() {
  try {
    const db = mongoose.connection.db;
    if (!db) return null;
    const settings = await db.collection('settings').findOne({ key: 'portal_settings' });
    return settings;
  } catch (err) {
    console.error('❌ Error fetching settings from DB:', err.message);
    return null;
  }
}

/**
 * Database helper: Retrieve website content (homepage, about) from MongoDB
 */
async function fetchContentFromDb(key) {
  try {
    const db = mongoose.connection.db;
    if (!db) return null;
    const doc = await db.collection('content').findOne({ key: key });
    return doc;
  } catch (err) {
    console.error(`❌ Error fetching content for ${key} from DB:`, err.message);
    return null;
  }
}

/**
 * Match temple in query against database records and alias mappings
 */
function findTempleInQuery(text, dbTemples = []) {
  if (!text) return null;
  const clean = text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

  let bestMatch = null;
  let maxMatchedLength = 0;

  for (const temple of dbTemples) {
    const templeId = temple.id || temple._id?.toString();
    const candidates = [];

    if (temple.name) candidates.push(temple.name);
    if (temple.shortName) candidates.push(temple.shortName);
    if (temple.district) candidates.push(temple.district);
    if (temple.location) {
      // Split location like "Madurai, Tamil Nadu" -> "Madurai"
      const locPart = temple.location.split(',')[0].trim();
      candidates.push(locPart);
    }

    // Add predefined aliases if configured
    if (TEMPLE_ALIASES_MAP[templeId]) {
      candidates.push(...TEMPLE_ALIASES_MAP[templeId]);
    }

    for (const alias of candidates) {
      const aliasClean = alias.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
      if (!aliasClean || aliasClean.length < 3) continue;

      const regex = new RegExp(`(^|\\s)${aliasClean}(\\s|$)`, 'i');
      if ((regex.test(clean) || clean.includes(aliasClean)) && aliasClean.length > maxMatchedLength) {
        bestMatch = temple;
        maxMatchedLength = aliasClean.length;
      }
    }
  }

  // Safety check: Tanjore/Thanjavur should never match Meenakshi
  if (bestMatch && (clean.includes('tanjore') || clean.includes('thanjavur')) && bestMatch.name?.includes('Meenakshi')) {
    const brihadeeswarar = dbTemples.find(t => (t.name || '').includes('Brihadeeswarar') || (t.location || '').includes('Thanjavur'));
    if (brihadeeswarar) return brihadeeswarar;
  }

  return bestMatch;
}

/**
 * Core Answer Generator: Dynamically queries MongoDB collections in darshan_journey_db
 */
export async function generateAssistantReply(input) {
  const raw = (input || '').trim();
  const lower = raw.toLowerCase();

  console.log(`\n============================================================`);
  console.log(`🤖 CHATBOT RETRIEVAL TRACE:`);
  console.log(`📥 Incoming query: "${raw}"`);

  // 1. RULE: UNRELATED QUESTIONS -> Strict Scope Message
  if (isUnrelatedQuery(lower)) {
    console.log(`🏷️ Detected Intent: OFF_TOPIC_QUERY`);
    console.log(`🛡️ Off-topic protection triggered.`);
    console.log(`============================================================\n`);
    return {
      text: "🙏 I'm the Darshan Journey Assistant. I can only help with Darshan Journey's temples, darshan, pooja, seva, prasadam, bookings, and related services.",
      navAction: { label: "Explore Temples", path: "/explore" },
      quickActions: ["Explore Temples", "Book Darshan", "Darshan Timings", "Pooja & Seva", "Prasadam", "Booking Help"]
    };
  }

  // 2. GREETINGS / SALUTATIONS
  const isGreeting = /^(hi|hello|hey|namaste|vanakkam|pranam|om|start|good morning|good evening|good afternoon)[\s!.]*$/i.test(lower) ||
                     (lower.length < 15 && (lower.includes('hello') || lower.includes('namaste') || lower.includes('vanakkam')));
  if (isGreeting) {
    console.log(`🏷️ Detected Intent: GREETING`);
    console.log(`============================================================\n`);
    return {
      text: "🙏 **Namaste & Vanakkam!**\n\nWelcome to Darshan Journey. How can I help you with temple darshan, timings, pooja, prasadam, or bookings today?",
      navAction: { label: "Explore Temples", path: "/explore" },
      quickActions: ["Explore Temples", "Book Darshan", "Darshan Timings", "Pooja & Seva", "Prasadam", "Booking Help"]
    };
  }

  // Retrieve live DB data
  const dbTemples = await fetchTemplesFromDb();
  console.log(`📦 DB Collection: "temples" (Records found: ${dbTemples.length})`);

  // 3. CHECK FOR UNKNOWN / UNVERIFIED TEMPLES
  const matchedTemple = findTempleInQuery(lower, dbTemples);
  if (hasUnknownTempleReference(lower) && !matchedTemple) {
    console.log(`🏷️ Detected Intent: UNVERIFIED_TEMPLE_REFERENCE`);
    console.log(`⚠️ Query refers to temple outside active Darshan Journey coverage.`);
    console.log(`============================================================\n`);
    return {
      text: "I couldn't find that information in the Darshan Journey data.\n\nDarshan Journey currently covers verified Tamil Nadu temples in our database. You can browse all available temples below.",
      navAction: { label: "Explore Available Temples", path: "/explore" },
      quickActions: ["Explore Temples", "Book Darshan", "Darshan Timings", "Pooja & Seva"]
    };
  }

  // 4. SPECIFIC TEMPLE QUERY
  if (matchedTemple) {
    console.log(`🏷️ Detected Intent: TEMPLE_SPECIFIC_QUERY`);
    console.log(`🏛️ Matched Record: "${matchedTemple.name}" (ID: ${matchedTemple.id || matchedTemple._id}, Location: ${matchedTemple.location || matchedTemple.district})`);

    const templeName = matchedTemple.name || "Temple";
    const loc = matchedTemple.location || matchedTemple.district || "Tamil Nadu";
    const openTime = matchedTemple.openingTime || "5:00 AM";
    const closeTime = matchedTemple.closingTime || "9:00 PM";
    const darshanTime = matchedTemple.darshanTimings || `Morning: ${openTime} – 12:30 PM | Evening: 4:00 PM – ${closeTime}`;
    const dress = matchedTemple.dressCode || "Traditional attire required. Men: Dhoti/Veshti or trousers. Women: Saree, Salwar or modest traditional wear.";
    const desc = matchedTemple.description || matchedTemple.history || "Sacred pilgrimage shrine registered on Darshan Journey.";
    const festivals = matchedTemple.festivals || matchedTemple.events || "Brahmotsavam, Maha Shivaratri, Navarathri, and special festival celebrations.";

    // 4A. TIMINGS
    if (
      lower.includes('timing') || lower.includes('time') || lower.includes('open') ||
      lower.includes('close') || lower.includes('hour') || lower.includes('neram') ||
      (lower.includes('schedule') && !lower.includes('pooja'))
    ) {
      console.log(`🔍 Specific Query Attribute: TIMINGS`);
      console.log(`============================================================\n`);
      return {
        text: `🕒 **${templeName} Timings:**\n• Opening Time: ${openTime}\n• Closing Time: ${closeTime}\n• Darshan Schedule: ${darshanTime}`,
        navAction: { label: "Explore Temples", path: "/explore" },
        quickActions: ["Explore Temples", "Book Darshan", "Pooja & Seva", "Booking Help"]
      };
    }

    // 4B. LOCATION / ADDRESS / ENGA / ENGA IRUKU
    if (
      lower.includes('where') || lower.includes('address') || lower.includes('location') ||
      lower.includes('reach') || lower.includes('direction') || lower.includes('map') ||
      lower.includes('enga') || lower.includes('enge') || lower.includes('iruku') || lower.includes('irukku')
    ) {
      console.log(`🔍 Specific Query Attribute: LOCATION`);
      console.log(`============================================================\n`);
      return {
        text: `📍 **Location of ${templeName}:**\n• Location: ${loc}\n• District: ${matchedTemple.district || loc}`,
        navAction: { label: "Explore Temples", path: "/explore" },
        quickActions: ["Explore Temples", "Book Darshan", "Darshan Timings", "Booking Help"]
      };
    }

    // 4C. WHAT TEMPLE IS IT / ENNA / IDENTIFICATION / ABOUT
    if (
      lower.includes('enna') || lower.includes('what is') || lower.includes('which temple') ||
      lower.includes('meaning') || lower.includes('details') || lower.includes('tell me about') ||
      lower.includes('overview')
    ) {
      console.log(`🔍 Specific Query Attribute: DETAILS / IDENTIFICATION ("enna")`);
      console.log(`============================================================\n`);
      return {
        text: `🙏 **${templeName}**\n\n📍 Location: ${loc}\n🕒 Timings: ${openTime} – ${closeTime} (${darshanTime})\n✨ Description: ${desc}\n👗 Dress Code: ${dress}`,
        navAction: { label: "Explore Temples", path: "/explore" },
        quickActions: ["Explore Temples", "Book Darshan", "Darshan Timings", "Pooja & Seva"]
      };
    }

    // 4D. DRESS CODE
    if (
      lower.includes('dress') || lower.includes('wear') || lower.includes('attire') ||
      lower.includes('clothing') || lower.includes('pant') || lower.includes('shirt') ||
      lower.includes('dhoti') || lower.includes('saree') || lower.includes('udai')
    ) {
      console.log(`🔍 Specific Query Attribute: DRESS_CODE`);
      console.log(`============================================================\n`);
      return {
        text: `👗 **Dress Code for ${templeName}:**\n${dress}`,
        navAction: { label: "Explore Temples", path: "/explore" },
        quickActions: ["Explore Temples", "Book Darshan", "Darshan Timings", "Booking Help"]
      };
    }

    // 4E. ENTRY FEE / COST / PRICE
    if (
      lower.includes('price') || lower.includes('cost') || lower.includes('fee') ||
      lower.includes('ticket') || lower.includes('entry') || lower.includes('charge') ||
      lower.includes('rate') || lower.includes('how much') || lower.includes('kattanam') || lower.includes('evvalavu')
    ) {
      console.log(`🔍 Specific Query Attribute: PRICE / FEE`);
      console.log(`============================================================\n`);
      return {
        text: `🎟️ **Darshan & Entry for ${templeName}:**\n• General Darshan: Free Entry\n• Special Priority Pass & Online Booking: Available via Darshan Journey Quick Booking`,
        navAction: { label: "Book Darshan Now", path: "/quick-booking" },
        quickActions: ["Book Darshan", "Explore Temples", "Darshan Timings", "Booking Help"]
      };
    }

    // 4F. FESTIVALS & CELEBRATIONS
    if (
      lower.includes('festival') || lower.includes('utsavam') || lower.includes('celebration') ||
      lower.includes('event') || lower.includes('thiruvizha')
    ) {
      console.log(`🔍 Specific Query Attribute: FESTIVALS`);
      console.log(`============================================================\n`);
      return {
        text: `🎉 **Festivals & Sacred Events at ${templeName}:**\n${festivals}`,
        navAction: { label: "Explore Temples", path: "/explore" },
        quickActions: ["Explore Temples", "Book Darshan", "Darshan Timings", "Booking Help"]
      };
    }

    // 4G. HISTORY / ARCHITECTURE
    if (
      lower.includes('history') || lower.includes('who built') || lower.includes('architecture') ||
      lower.includes('origin') || lower.includes('significance') || lower.includes('varalaru') || lower.includes('kattiyathu')
    ) {
      console.log(`🔍 Specific Query Attribute: HISTORY`);
      console.log(`============================================================\n`);
      return {
        text: `🏛️ **History & Heritage of ${templeName}:**\n${desc}`,
        navAction: { label: "Explore Temples", path: "/explore" },
        quickActions: ["Explore Temples", "Book Darshan", "Darshan Timings", "Booking Help"]
      };
    }

    // 4H. GENERAL SUMMARY FOR THIS TEMPLE
    console.log(`🔍 Specific Query Attribute: GENERAL_SUMMARY`);
    console.log(`============================================================\n`);
    return {
      text: `🕉️ **${templeName}**\n📍 Location: ${loc}\n🕒 Timings: ${openTime} – ${closeTime}\n✨ Overview: ${desc}\n👗 Dress Code: ${dress}`,
      navAction: { label: "Book Darshan Now", path: "/quick-booking" },
      quickActions: ["Book Darshan", "Darshan Timings", "Pooja & Seva", "Explore Temples"]
    };
  }

  // 5. GENERAL TEMPLE TIMINGS ("What are the temple timings?", "temple timings", "darshan timings")
  if (
    lower.includes('temple timing') || lower.includes('temple timings') || lower.includes('darshan timing') ||
    lower.includes('darshan timings') || lower.includes('all timings') || lower.includes('opening hours') ||
    lower === 'timings' || lower === 'timing' || lower === 'timings?' || lower === 'timing?' ||
    lower.includes('what are the timings') || lower.includes('what are the temple timings')
  ) {
    console.log(`🏷️ Detected Intent: GENERAL_TEMPLE_TIMINGS`);
    const timingsSummary = dbTemples.map(t => {
      const tOpen = t.openingTime || '6:00 AM';
      const tClose = t.closingTime || '9:00 PM';
      return `• **${t.name}** (${t.location || t.district}): ${tOpen} – ${tClose}`;
    }).join('\n');

    console.log(`📦 Summarizing timings for ${dbTemples.length} temples.`);
    console.log(`============================================================\n`);
    return {
      text: `🕒 **Darshan Journey Temple Timings:**\n\n${timingsSummary}\n\nYou can view complete detailed pooja intervals and darshan schedules on our Explore page.`,
      navAction: { label: "Explore All Temples", path: "/explore" },
      quickActions: ["Explore Temples", "Book Darshan", "Pooja & Seva", "Booking Help"]
    };
  }

  // 6. BOOKING QUESTIONS ("Tell me about booking", "How can I book?", "How do I book", "booking process")
  if (
    lower.includes('booking') || lower.includes('how to book') || lower.includes('how can i book') ||
    lower.includes('how do i book') || lower.includes('can i book') || lower.includes('book darshan') ||
    lower.includes('book ticket') || lower.includes('slot booking') || lower.includes('priority pass') ||
    lower.includes('darshan pass') || lower === 'book' || lower === 'booking help'
  ) {
    console.log(`🏷️ Detected Intent: BOOKING_GUIDE`);
    console.log(`============================================================\n`);
    return {
      text: `📋 **How to Book on Darshan Journey:**\n\n1️⃣ **Quick Booking:** Navigate to the **Quick Booking** page.\n2️⃣ **Select Temple & Slot:** Choose your temple, date of visit, and morning/evening darshan slot.\n3️⃣ **Devotee Details:** Provide your name, contact details, Gothram, and Nakshatram.\n4️⃣ **Instant Confirmation:** Complete payment securely (UPI/Card/Net Banking) to generate your digital QR-code pass and receive instant confirmation.\n\nYou can manage and view all your confirmed passes in your Devotee Dashboard.`,
      navAction: { label: "Book Darshan Now", path: "/quick-booking" },
      quickActions: ["Book Darshan", "Explore Temples", "Darshan Timings", "Pooja & Seva"]
    };
  }

  // 7. SERVICES & OFFERINGS ("What services are available?", "services", "pooja & seva", "poojas")
  if (
    lower.includes('service') || lower.includes('services') || lower.includes('pooja & seva') ||
    lower.includes('pooja') || lower.includes('seva') || lower.includes('archana') ||
    lower.includes('abhishekam') || lower.includes('homam') || lower.includes('offerings') ||
    lower.includes('what poojas')
  ) {
    console.log(`🏷️ Detected Intent: SERVICES_CATALOG`);
    const { services, products } = await fetchServicesFromDb();
    console.log(`📦 DB Collection: "services" (${services.length} items) / "products" (${products.length} items)`);

    // Sample distinct real services
    const poojaSamples = services.filter(s => (s.category || '').includes('pooja') || (s.categorySlug || '').includes('pooja')).slice(0, 3);
    const poojaSampleText = poojaSamples.length > 0 
      ? poojaSamples.map(s => `• **${s.name || s.title}:** ${s.price || '₹501'} — ${s.description || 'Vedic temple pooja seva'}`).join('\n')
      : `• **Daily Archana & Ashtotharam:** Performed in your family's Gothram\n• **Maha Rudrabhishekam:** Sacred deity holy bath\n• **Ganapathi & Navagraha Homam:** Fire ritual for prosperity`;

    console.log(`============================================================\n`);
    return {
      text: `🪔 **Services & Offerings on Darshan Journey:**\n\n${poojaSampleText}\n\n• **Temple Prasadam Delivery:** Freshly sanctified prasadams delivered to your home.\n• **Pooja Essentials:** Pure cow ghee, dhoop, camphor, and brass thali sets.\n• **Virtual Live Darshan:** HD live stream Aarti passes.\n\nAll poojas and sevas include doorstep delivery of blessed prasadam.`,
      navAction: { label: "View All Services", path: "/services" },
      quickActions: ["Pooja & Seva", "Prasadam", "Book Darshan", "Explore Temples"]
    };
  }

  // 8. PRASADAM ("What is prasadam?", "prasadam", "order prasadam", "panchamirtham", "laddu")
  if (
    lower.includes('prasadam') || lower.includes('prasad') || lower.includes('panchamirtham') ||
    lower.includes('laddu') || lower.includes('puliyodarai')
  ) {
    console.log(`🏷️ Detected Intent: PRASADAM_INFO`);
    const { services, products } = await fetchServicesFromDb();
    const prasadamItems = services.filter(s => (s.category || '').includes('prasadam') || (s.categorySlug || '').includes('prasadam') || (s.name || '').toLowerCase().includes('prasadam') || (s.name || '').toLowerCase().includes('panchamirtham'));
    
    console.log(`📦 Found ${prasadamItems.length} prasadam records in database.`);

    const itemsText = prasadamItems.length > 0
      ? prasadamItems.slice(0, 4).map(p => `• **${p.name}:** ${p.price || '₹251'} — ${p.description || 'Authentic sanctified temple prasadam'}`).join('\n')
      : `• **Palani Panchamirtham (500g GI-Tagged Sealed Tin):** ₹251\n• **Tirupati Style Pure Ghee Laddu (4 Pcs Pack):** ₹301\n• **Srirangam Puliyodarai & Pongal Combo Box:** ₹351\n• **Sacred Mahaprashad & Holy Vibhuti Box:** ₹151`;

    console.log(`============================================================\n`);
    return {
      text: `🍯 **Authentic Temple Prasadam on Darshan Journey:**\n\nPrasadam is the sanctified divine offering blessed during daily temple rituals and deity aartis. Through Darshan Journey, authentic prasadams are sourced directly from verified temple kitchens and securely delivered to your doorstep.\n\n**Available Prasadam Offerings:**\n${itemsText}`,
      navAction: { label: "Order Temple Prasadam", path: "/services/category/temple-prasadam" },
      quickActions: ["Prasadam", "Pooja & Seva", "Book Darshan", "Explore Temples"]
    };
  }

  // 9. CONTACT SUPPORT / HOW TO CONTACT ("How can I contact Darshan Journey?", "contact support", "helpline")
  if (
    lower.includes('contact') || lower.includes('support') || lower.includes('customer care') ||
    lower.includes('helpdesk') || lower.includes('helpline') || lower.includes('call') ||
    lower.includes('phone') || lower.includes('email') || lower.includes('whatsapp')
  ) {
    console.log(`🏷️ Detected Intent: CONTACT_SUPPORT`);
    const settings = await fetchPortalSettingsFromDb();
    console.log(`📦 DB Collection: "settings" ->`, settings ? 'Loaded portal_settings' : 'Default');

    const email = settings?.supportEmail || "contact@darshanjourney.com";
    const phone = settings?.supportPhone || "+91 98765 43210";
    const whatsapp = settings?.whatsappHelpline || "+91 98765 43211";
    const address = settings?.templeAddress || "Temple Corridor, 108 Sacred Way, Mylapore, Chennai, Tamil Nadu - 600004";

    console.log(`============================================================\n`);
    return {
      text: `📞 **Contact Darshan Journey:**\n\n• **Support Helpline:** ${phone}\n• **WhatsApp Support:** ${whatsapp}\n• **Email:** ${email}\n• **Office Address:** ${address}\n• **Hours:** 6:00 AM – 9:00 PM (Daily)`,
      navAction: { label: "Contact Support", path: "/contact" },
      quickActions: ["Contact Support", "Booking Help", "Book Darshan", "Explore Temples"]
    };
  }

  // 10. ABOUT DARSHAN JOURNEY ("About Darshan Journey", "What is Darshan Journey", "Who are you")
  if (
    lower.includes('about darshan journey') || lower.includes('what is darshan journey') ||
    lower.includes('who are you') || lower.includes('about you') || lower.includes('about us') ||
    lower === 'about'
  ) {
    console.log(`🏷️ Detected Intent: ABOUT_PLATFORM`);
    const aboutDoc = await fetchContentFromDb('about');
    console.log(`📦 DB Collection: "content" (key: "about") ->`, aboutDoc ? 'Loaded' : 'Default');

    const desc = aboutDoc?.heroDescription || "Darshan Journey is an AI-powered spiritual platform dedicated to helping devotees discover, plan, and experience sacred pilgrimages across India with authentic guidance.";
    const mission = aboutDoc?.missionDescription || "To simplify spiritual journeys by providing reliable temple information, intelligent pilgrimage planning, and personalized devotional experiences.";

    console.log(`============================================================\n`);
    return {
      text: `🙏 **About Darshan Journey:**\n\n${desc}\n\n**Our Mission:**\n${mission}\n\nWe provide verified temple schedules, online Darshan passes, Vedic Pooja & Seva bookings, and doorstep temple Prasadam delivery.`,
      navAction: { label: "Learn More About Us", path: "/about" },
      quickActions: ["Explore Temples", "Book Darshan", "Pooja & Seva", "Prasadam"]
    };
  }

  // 11. PAYMENT METHODS / REFUND / CANCELLATION
  if (
    lower.includes('payment') || lower.includes('upi') || lower.includes('gpay') ||
    lower.includes('phonepe') || lower.includes('paytm') || lower.includes('card') ||
    lower.includes('refund') || lower.includes('cancel') || lower.includes('cancellation')
  ) {
    console.log(`🏷️ Detected Intent: PAYMENT_AND_REFUND`);
    console.log(`============================================================\n`);
    return {
      text: `💳 **Payments & Cancellation Policy:**\n\n• **Payment Methods:** Instant UPI (GPay, PhonePe, Paytm), Net Banking, Debit/Credit Cards.\n• **Instant Pass:** Digital QR Pass is generated immediately upon successful payment.\n• **Cancellation & Rescheduling:** Darshan passes can be rescheduled or cancelled up to 24 hours prior to the scheduled slot from your Devotee Dashboard.`,
      navAction: { label: "Go to Devotee Dashboard", path: "/dashboard" },
      quickActions: ["Devotee Dashboard", "Book Darshan", "Contact Support", "Booking Help"]
    };
  }

  // 12. EXPLORE / LIST TEMPLES ("explore", "temples list", "show temples")
  if (
    lower.includes('explore temple') || lower.includes('where can i explore') || lower.includes('list temple') ||
    lower.includes('show temple') || lower.includes('all temple') || lower === 'explore' || lower === 'explore temples' ||
    lower === 'temples' || lower === 'temple'
  ) {
    console.log(`🏷️ Detected Intent: EXPLORE_TEMPLES`);
    const templeList = dbTemples.slice(0, 6).map(t => `• **${t.name}** (${t.location || t.district})`).join('\n');
    console.log(`============================================================\n`);
    return {
      text: `🏛️ **Verified Temples on Darshan Journey:**\n\n${templeList}\n\nYou can view full temple histories, GPS locations, dress codes, and live timings on our Explore page.`,
      navAction: { label: "Explore Temples", path: "/explore" },
      quickActions: ["Explore Temples", "Book Darshan", "Darshan Timings", "Pooja & Seva"]
    };
  }

  // 13. FALLBACK: IF REQUESTED INFORMATION IS UNKNOWN IN DARSHAN JOURNEY DATA
  console.log(`⚠️ Intent unrecognized or information not found in Darshan Journey records.`);
  console.log(`🏷️ Triggering standard fallback response.`);
  console.log(`============================================================\n`);
  return {
    text: "I couldn't find that information in the Darshan Journey data.\n\nPlease ask about temple timings, dress codes, darshan booking, pooja services, or prasadam orders.",
    navAction: { label: "Explore Temples", path: "/explore" },
    quickActions: ["Explore Temples", "Book Darshan", "Darshan Timings", "Pooja & Seva", "Prasadam", "Booking Help"]
  };
}

/**
 * POST /api/chat/message
 * Handles incoming chatbot message, performs live DB retrieval, saves to MongoDB Atlas chathistories
 */
export async function handleChatMessage(req, res) {
  try {
    const readyState = mongoose.connection.readyState;
    if (readyState !== 1) {
      console.error('❌ Cannot process chat: MongoDB Atlas connection is not active (state:', readyState, ')');
      return res.status(503).json({
        success: false,
        error: 'MongoDB Atlas is not connected. Chat cannot be processed.'
      });
    }

    const { message, sessionId, userId } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message text is required'
      });
    }

    const cleanMessage = message.trim();
    const effectiveSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 1. Generate assistant response with live MongoDB data retrieval
    const assistantReply = await generateAssistantReply(cleanMessage);

    // 2. Find or create ChatHistory document
    let chatHistory = await ChatHistory.findOne({ sessionId: effectiveSessionId });

    if (!chatHistory && userId) {
      chatHistory = await ChatHistory.findOne({ userId });
    }

    if (!chatHistory) {
      chatHistory = new ChatHistory({
        sessionId: effectiveSessionId,
        userId: userId || null,
        messages: []
      });
    } else {
      if (userId && !chatHistory.userId) {
        chatHistory.userId = userId;
      }
    }

    // 3. Append user message
    chatHistory.messages.push({
      role: 'user',
      content: cleanMessage,
      timestamp: new Date()
    });

    // 4. Append assistant message
    chatHistory.messages.push({
      role: 'assistant',
      content: assistantReply.text,
      timestamp: new Date(),
      navAction: assistantReply.navAction || null,
      quickActions: assistantReply.quickActions || []
    });

    const dbName = mongoose.connection.name || mongoose.connection.db?.databaseName || 'darshan_journey_db';
    const colName = ChatHistory.collection?.name || 'chathistories';

    // 5. Save to MongoDB Atlas
    await chatHistory.save();

    return res.status(200).json({
      success: true,
      chatHistoryId: chatHistory._id,
      sessionId: effectiveSessionId,
      database: dbName,
      collection: colName,
      verified: true,
      reply: {
        role: 'assistant',
        content: assistantReply.text,
        text: assistantReply.text,
        navAction: assistantReply.navAction,
        quickActions: assistantReply.quickActions,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('❌ Chatbot message handling error:', err);
    return res.status(500).json({
      success: false,
      error: `Failed to process chat message: ${err.message}`
    });
  }
}

/**
 * GET /api/chat/history
 * Fetches existing messages for a session or authenticated user from MongoDB Atlas
 */
export async function getChatHistory(req, res) {
  try {
    const readyState = mongoose.connection.readyState;
    if (readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'MongoDB Atlas is not connected.'
      });
    }

    const { sessionId, userId } = req.query;

    if (!sessionId && !userId) {
      return res.status(200).json({
        success: true,
        messages: []
      });
    }

    let chatHistory = null;
    if (sessionId) {
      chatHistory = await ChatHistory.findOne({ sessionId });
    }
    if (!chatHistory && userId) {
      chatHistory = await ChatHistory.findOne({ userId });
    }

    if (!chatHistory) {
      return res.status(200).json({
        success: true,
        messages: []
      });
    }

    return res.status(200).json({
      success: true,
      chatHistoryId: chatHistory._id,
      sessionId: chatHistory.sessionId,
      messages: chatHistory.messages
    });
  } catch (err) {
    console.error('❌ Failed to retrieve chat history from MongoDB:', err);
    return res.status(500).json({
      success: false,
      error: `Failed to retrieve chat history: ${err.message}`
    });
  }
}

/**
 * POST /api/chat/reset
 * Resets/clears conversation history for the session in MongoDB Atlas
 */
export async function resetChatHistory(req, res) {
  try {
    const { sessionId, userId } = req.body;
    if (sessionId) {
      await ChatHistory.deleteOne({ sessionId });
    } else if (userId) {
      await ChatHistory.deleteOne({ userId });
    }

    return res.status(200).json({
      success: true,
      message: 'Chat history reset successfully'
    });
  } catch (err) {
    console.error('❌ Error resetting chat history in MongoDB:', err);
    return res.status(500).json({
      success: false,
      error: `Error resetting chat history: ${err.message}`
    });
  }
}

/**
 * GET /api/chat/db-test
 * Direct database verification endpoint querying MongoDB Atlas live state
 */
export async function getDbTest(req, res) {
  try {
    const readyState = mongoose.connection.readyState;
    const isConnected = (readyState === 1);
    const host = mongoose.connection.host || 'unknown';
    const dbName = mongoose.connection.name || mongoose.connection.db?.databaseName || 'darshan_journey_db';
    const colName = ChatHistory.collection?.name || 'chathistories';
    const count = isConnected ? await ChatHistory.countDocuments() : 0;

    return res.status(200).json({
      connected: isConnected,
      host: host,
      database: dbName,
      collection: colName,
      documentCount: count
    });
  } catch (err) {
    console.error('❌ DB test error:', err);
    return res.status(500).json({
      connected: false,
      error: err.message
    });
  }
}
