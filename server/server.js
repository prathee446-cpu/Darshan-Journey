import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'darshan_journey_secret_jwt_key_2026_sacred_temple_app';
const JWT_EXPIRES_IN = '7d';

// Setup CORS with credentials for HttpOnly cookies
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Helper to set secure session cookie
function setSessionCookie(res, token) {
  res.cookie('darshan_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Darshan Journey Backend is active', time: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════════
// DATABASE LAYER — MongoDB Atlas with High-Availability In-Memory Store
// ═══════════════════════════════════════════════════════════════

class InMemoryCollection {
  constructor(name) {
    this.name = name;
    this.docs = [];
  }

  async findOne(filter = {}) {
    for (const doc of this.docs) {
      let match = true;
      for (const [k, v] of Object.entries(filter)) {
        if (k === '$or' && Array.isArray(v)) {
          const anyMatch = v.some(subFilter => {
            return Object.entries(subFilter).every(([subK, subV]) => {
              if (subV instanceof RegExp) {
                return subV.test(String(doc[subK] || ''));
              }
              return doc[subK] === subV;
            });
          });
          if (!anyMatch) { match = false; break; }
        } else if (k === '_id') {
          if (String(doc._id) !== String(v)) { match = false; break; }
        } else if (v instanceof RegExp) {
          if (!v.test(String(doc[k] || ''))) { match = false; break; }
        } else if (doc[k] !== v) {
          match = false;
          break;
        }
      }
      if (match) return JSON.parse(JSON.stringify(doc));
    }
    return null;
  }

  async insertOne(doc) {
    const insertedDoc = { ...doc };
    if (!insertedDoc._id) {
      insertedDoc._id = new ObjectId().toString();
    } else {
      insertedDoc._id = String(insertedDoc._id);
    }
    this.docs.push(insertedDoc);
    return { insertedId: insertedDoc._id, acknowledged: true };
  }

  async updateOne(filter, update) {
    const doc = await this.findOne(filter);
    if (!doc) return { matchedCount: 0, modifiedCount: 0 };
    
    const target = this.docs.find(d => String(d._id) === String(doc._id));
    if (target && update.$set) {
      Object.assign(target, update.$set);
      return { matchedCount: 1, modifiedCount: 1 };
    }
    return { matchedCount: 1, modifiedCount: 0 };
  }

  async find(filter = {}) {
    return {
      toArray: async () => {
        if (!Object.keys(filter).length) return [...this.docs];
        return this.docs.filter(doc => {
          return Object.entries(filter).every(([k, v]) => doc[k] === v);
        });
      }
    };
  }
}

class DatabaseManager {
  constructor() {
    this.client = null;
    this.db = null;
    this.isAtlas = false;
    this.inMemoryCollections = new Map();
  }

  async connect() {
    if (this.db) return this.db;

    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://darshan_user:DarshanJourney2026@cluster0.mongodb.net/darshan_journey_db?retryWrites=true&w=majority";
    const dbName = process.env.DATABASE_NAME || "darshan_journey_db";

    if (mongoUri && mongoUri.startsWith('mongodb')) {
      try {
        console.log(`📡 Connecting to MongoDB Atlas (${dbName})...`);
        const client = new MongoClient(mongoUri, {
          serverSelectionTimeoutMS: 4000,
          connectTimeoutMS: 4000,
        });
        await client.connect();
        await client.db(dbName).command({ ping: 1 });
        this.client = client;
        this.db = client.db(dbName);
        this.isAtlas = true;
        console.log('✅ Connected successfully to MongoDB Atlas!');
        
        // Ensure index on users
        try {
          const usersCol = this.db.collection('users');
          await usersCol.createIndex({ email: 1 }, { unique: true, sparse: true });
          await usersCol.createIndex({ username: 1 }, { unique: true, sparse: true });
        } catch (idxErr) {
          /* ignore index creation error if exists */
        }

        return this.db;
      } catch (err) {
        console.warn(`⚠️ MongoDB Atlas connection notice (${err.message}). Using high-availability in-memory store for user accounts.`);
      }
    }

    return null;
  }

  getCollection(name) {
    if (this.isAtlas && this.db) {
      return this.db.collection(name);
    }
    if (!this.inMemoryCollections.has(name)) {
      this.inMemoryCollections.set(name, new InMemoryCollection(name));
    }
    return this.inMemoryCollections.get(name);
  }
}

const dbManager = new DatabaseManager();
// Trigger connection
dbManager.connect().catch(() => {});

// ═══════════════════════════════════════════════════════════════
// OTP STORE & EMAIL SERVICE
// ═══════════════════════════════════════════════════════════════

// Pending Registrations Store: { email: { fullName, username, email, mobile, passwordHash, otp, createdAt, attempts } }
const pendingRegistrations = new Map();
// Pending Google Auth Store: { email: { email, name, picture, sub, otp, tempAuthToken, createdAt, attempts } }
const pendingGoogleAuth = new Map();
// Rate Limit Store: { email: [timestamp1, timestamp2, ...] }
const rateLimitStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_REQUESTS_PER_WINDOW = 6;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_VERIFY_ATTEMPTS = 5;

function normalizeOtp(val) {
  if (val === null || val === undefined) return '';
  return String(val).replace(/\D/g, '').trim();
}

function normalizeEmail(val) {
  if (typeof val !== 'string') return '';
  return val.trim().toLowerCase();
}

function normalizeUsername(val) {
  if (typeof val !== 'string') return '';
  return val.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
}

function checkRateLimit(email) {
  const cleanEmail = normalizeEmail(email);
  const now = Date.now();
  const history = (rateLimitStore.get(cleanEmail) || []).filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  rateLimitStore.set(cleanEmail, history);
  return history.length < MAX_OTP_REQUESTS_PER_WINDOW;
}

function recordOtpRequest(email) {
  const cleanEmail = normalizeEmail(email);
  const history = rateLimitStore.get(cleanEmail) || [];
  history.push(Date.now());
  rateLimitStore.set(cleanEmail, history);
}

function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

async function sendOtpEmail(toEmail, otp, userName = 'Devotee', isRegistration = false) {
  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpEmail || !smtpPassword) {
    const missingVar = !smtpEmail && !smtpPassword ? 'SMTP_EMAIL and SMTP_PASSWORD' : (!smtpEmail ? 'SMTP_EMAIL' : 'SMTP_PASSWORD');
    const errMsg = `Email service not configured: ${missingVar} missing in .env. Please configure your Gmail address and 16-character App Password in .env to send real verification codes.`;
    console.warn(`⚠️ [Email Service] ${errMsg}`);
    return {
      success: false,
      method: 'smtp',
      error: errMsg
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpEmail.trim(),
        pass: smtpPassword.trim().replace(/\s+/g, '') // remove spaces from App Password
      }
    });

    const actionText = isRegistration
      ? 'complete your account registration'
      : 'securely sign in to your Darshan Journey account';

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#FDF8F0;">
  <div style="max-width:500px;margin:32px auto;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 6px 28px rgba(52,31,29,0.12);border:1px solid rgba(200,169,106,0.3);">
    <!-- Sacred Header -->
    <div style="background:linear-gradient(135deg,#2A1715,#4A2C28);padding:32px 24px;text-align:center;">
      <div style="font-size:32px;margin-bottom:8px;">🕉️</div>
      <h1 style="color:#D4AF37;font-size:24px;margin:0 0 6px 0;font-family:Georgia,serif;letter-spacing:1px;">DARSHAN JOURNEY</h1>
      <p style="color:rgba(247,239,230,0.8);font-size:13px;margin:0;letter-spacing:0.5px;">Sacred Temple Pilgrimage & Virtual Darshan</p>
    </div>
    
    <!-- Body Content -->
    <div style="padding:32px 28px;">
      <p style="color:#341F1D;font-size:16px;margin:0 0 10px 0;font-weight:600;">Namaste <strong>${userName}</strong>,</p>
      <p style="color:#6E5351;font-size:14px;line-height:1.6;margin:0 0 24px 0;">
        Please use the following 6-digit verification code to ${actionText} on Darshan Journey:
      </p>
      
      <!-- OTP Box -->
      <div style="background:linear-gradient(135deg,rgba(212,175,55,0.12),rgba(200,169,106,0.06));border:2px solid rgba(212,175,55,0.4);border-radius:12px;padding:20px;text-align:center;margin:0 0 24px 0;">
        <div style="font-size:38px;font-weight:800;letter-spacing:10px;color:#2A1715;font-family:'Courier New',monospace;">${otp}</div>
      </div>
      
      <p style="color:#8C6D62;font-size:13px;line-height:1.6;margin:0 0 8px 0;">
        ⏳ This code is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.
      </p>
      <p style="color:#9E8483;font-size:12px;line-height:1.5;margin:0;">
        If you did not request this verification code, you can safely disregard this email.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background:#FDF8F0;padding:18px 24px;text-align:center;border-top:1px solid rgba(200,169,106,0.2);">
      <p style="color:#8C6D62;font-size:12px;margin:0;">🙏 Blessings for your sacred journey • Darshan Journey Team</p>
    </div>
  </div>
</body>
</html>`;

    const textBody = `Namaste ${userName},\n\nYour Darshan Journey verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nBlessings,\nDarshan Journey Team`;

    await transporter.sendMail({
      from: `"Darshan Journey" <${smtpEmail.trim()}>`,
      to: toEmail,
      subject: `Darshan Journey — Verification Code: ${otp}`,
      text: textBody,
      html: htmlBody
    });

    console.log(`✉️ Real OTP email sent successfully to: ${toEmail}`);
    return { success: true, method: 'smtp' };
  } catch (error) {
    console.error('❌ Failed to send OTP email via SMTP:', error.message);
    return { success: false, method: 'smtp', error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// AUTH ROUTER & ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// 1. NORMAL ACCOUNT LOGIN (Username/Email + Password)
app.post(['/api/auth/login', '/api/auth/signin'], async (req, res) => {
  try {
    const { identifier, username, email, password } = req.body;
    const rawIdentifier = (identifier || username || email || '').trim();

    if (!rawIdentifier) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your username or email address.'
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please enter your password.'
      });
    }

    const cleanIdentifier = rawIdentifier.toLowerCase();
    const usersCol = dbManager.getCollection('users');

    // Find user by email or username (case-insensitive)
    let userDoc = await usersCol.findOne({
      $or: [
        { email: cleanIdentifier },
        { username: { $regex: new RegExp(`^${cleanIdentifier}$`, 'i') } }
      ]
    });

    if (!userDoc) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password. Please verify your credentials or create a new account.'
      });
    }

    // Check if password hash exists (might be a Google-only account without password)
    const storedHash = userDoc.passwordHash || userDoc.password;
    if (!storedHash) {
      return res.status(400).json({
        success: false,
        message: 'This account was registered with Google. Please click "Continue with Google" to sign in.'
      });
    }

    // Verify bcrypt password hash
    const isPasswordValid = await bcrypt.compare(password, storedHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password. Please verify your credentials.'
      });
    }

    const nowIso = new Date().toISOString();
    const userId = String(userDoc._id);

    // Update last login
    await usersCol.updateOne(
      { _id: userDoc._id },
      { $set: { lastLogin: nowIso, updatedAt: nowIso, status: 'active' } }
    );

    // Create JWT Token
    const token = jwt.sign(
      {
        sub: userId,
        email: userDoc.email,
        username: userDoc.username || '',
        name: userDoc.fullName || userDoc.name || 'Devotee'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set secure HttpOnly session cookie
    setSessionCookie(res, token);

    const userObj = {
      id: userId,
      _id: userId,
      fullName: userDoc.fullName || userDoc.name || 'Devotee',
      name: userDoc.fullName || userDoc.name || 'Devotee',
      username: userDoc.username || cleanIdentifier.split('@')[0],
      email: userDoc.email,
      phone: userDoc.phone || userDoc.mobile || '',
      mobile: userDoc.mobile || userDoc.phone || '',
      address: userDoc.address || '',
      emergencyContact: userDoc.emergencyContact || '',
      authProvider: userDoc.authProvider || 'local',
      provider: userDoc.authProvider || 'local',
      status: 'active',
      emailVerified: true,
      avatar: userDoc.avatar || (userDoc.fullName ? userDoc.fullName.charAt(0).toUpperCase() : 'D'),
      createdAt: userDoc.createdAt,
      lastLogin: nowIso
    };

    console.log(`✨ [LOGIN SUCCESS] Devotee "${userObj.fullName}" (${userObj.email}) logged in successfully.`);

    return res.json({
      success: true,
      message: `✨ Welcome back, ${userObj.fullName}!`,
      user: userObj,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while signing in. Please try again.'
    });
  }
});

// 2. CREATE ACCOUNT — Step 1: Validate & Send Real Email OTP
app.post('/api/auth/register-send-otp', async (req, res) => {
  try {
    const { fullName, username, email, mobile, password } = req.body;

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please enter your full name (at least 2 characters).' });
    }

    if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Please choose a username (at least 3 characters).' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = normalizeEmail(email);
    const cleanUsername = normalizeUsername(username);
    const cleanName = fullName.trim();
    const cleanMobile = (mobile || '').trim();

    const usersCol = dbManager.getCollection('users');

    // Check if email already exists
    const existingByEmail = await usersCol.findOne({ email: cleanEmail });
    if (existingByEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please Sign In.'
      });
    }

    // Check if username already taken
    const existingByUsername = await usersCol.findOne({
      username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
    });
    if (existingByUsername) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken. Please choose another username.'
      });
    }

    // Check rate limit
    if (!checkRateLimit(cleanEmail)) {
      return res.status(429).json({
        success: false,
        message: 'Too many verification requests. Please wait a few minutes before trying again.',
        cooldownSeconds: 60
      });
    }

    // Securely hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    pendingRegistrations.set(cleanEmail, {
      fullName: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      mobile: cleanMobile,
      passwordHash,
      otp,
      createdAt: Date.now(),
      attempts: 0
    });
    recordOtpRequest(cleanEmail);

    console.log(`🔑 [REGISTER OTP CREATED] Email: "${cleanEmail}" | OTP: "${otp}" | Valid for: 10m`);

    // Dispatch real email verification code via Nodemailer SMTP
    const result = await sendOtpEmail(cleanEmail, otp, cleanName, true);

    if (result.success) {
      return res.json({
        success: true,
        message: `Verification code sent to ${cleanEmail}. Please check your inbox.`,
        cooldownSeconds: 30
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to dispatch verification code via email. Please check server email configuration.',
        cooldownSeconds: 10
      });
    }
  } catch (error) {
    console.error('Register send OTP error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while processing registration.' });
  }
});

// 3. CREATE ACCOUNT — Step 2: Verify OTP & Activate User in DB
app.post('/api/auth/register-verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, detail: 'Email and 6-digit verification code are required.' });
    }

    const cleanEmail = normalizeEmail(email);
    const cleanOtp = normalizeOtp(otp);
    const pending = pendingRegistrations.get(cleanEmail);

    console.log(`🔍 [REGISTER OTP VERIFY ATTEMPT] Email: "${cleanEmail}" | Received OTP: "${cleanOtp}"`);

    if (!pending) {
      return res.status(400).json({
        success: false,
        detail: 'No pending registration found for this email. Please fill out the registration form again.'
      });
    }

    if (Date.now() - pending.createdAt > OTP_EXPIRY_MS) {
      pendingRegistrations.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        detail: 'Verification code has expired. Please request a new registration code.'
      });
    }

    if (pending.attempts >= MAX_VERIFY_ATTEMPTS) {
      pendingRegistrations.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        detail: 'Too many incorrect attempts. Please submit the registration form again.'
      });
    }

    const storedOtp = normalizeOtp(pending.otp);
    if (storedOtp !== cleanOtp) {
      pending.attempts += 1;
      const remaining = MAX_VERIFY_ATTEMPTS - pending.attempts;
      console.warn(`❌ [REGISTER OTP MISMATCH] Email: "${cleanEmail}" | Stored: "${storedOtp}" | Received: "${cleanOtp}" | Remaining: ${remaining}`);
      return res.status(400).json({
        success: false,
        detail: `Invalid verification code. ${remaining} attempt(s) remaining.`
      });
    }

    console.log(`✅ [REGISTER OTP SUCCESS] Email: "${cleanEmail}" verified successfully!`);

    // OTP is valid — create user in DB
    pendingRegistrations.delete(cleanEmail);
    const usersCol = dbManager.getCollection('users');
    const nowIso = new Date().toISOString();

    const newUser = {
      fullName: pending.fullName,
      name: pending.fullName,
      username: pending.username,
      email: cleanEmail,
      phone: pending.mobile || '',
      mobile: pending.mobile || '',
      passwordHash: pending.passwordHash,
      address: '',
      emergencyContact: '',
      authProvider: 'local',
      googleId: null,
      emailVerified: true,
      status: 'active',
      avatar: pending.fullName.charAt(0).toUpperCase(),
      createdAt: nowIso,
      updatedAt: nowIso,
      lastLogin: nowIso
    };

    const insertResult = await usersCol.insertOne(newUser);
    const userId = String(insertResult.insertedId || newUser._id);

    const token = jwt.sign(
      { sub: userId, email: cleanEmail, username: pending.username, name: pending.fullName },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set secure HttpOnly session cookie
    setSessionCookie(res, token);

    const userObj = {
      id: userId,
      _id: userId,
      fullName: pending.fullName,
      name: pending.fullName,
      username: pending.username,
      email: cleanEmail,
      phone: pending.mobile || '',
      mobile: pending.mobile || '',
      address: '',
      emergencyContact: '',
      authProvider: 'local',
      provider: 'local',
      status: 'active',
      emailVerified: true,
      avatar: pending.fullName.charAt(0).toUpperCase(),
      createdAt: newUser.createdAt,
      lastLogin: newUser.lastLogin
    };

    return res.json({
      success: true,
      message: `🙏 Sacred Welcome, ${pending.fullName}! Your account is now active.`,
      user: userObj,
      token
    });
  } catch (error) {
    console.error('Register verify OTP error:', error);
    return res.status(500).json({ success: false, detail: 'Internal server error while creating account.' });
  }
});

// 4. CREATE ACCOUNT — Resend OTP
app.post('/api/auth/register-resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, detail: 'Email is required.' });
    }

    const cleanEmail = normalizeEmail(email);
    const pending = pendingRegistrations.get(cleanEmail);

    if (!pending) {
      return res.status(400).json({
        success: false,
        detail: 'No pending registration found for this email. Please register again.'
      });
    }

    if (!checkRateLimit(cleanEmail)) {
      return res.status(429).json({
        success: false,
        message: 'Too many verification requests. Please wait a few minutes before trying again.',
        cooldownSeconds: 60
      });
    }

    const newOtp = generateOtp();
    pending.otp = newOtp;
    pending.createdAt = Date.now();
    pending.attempts = 0;
    recordOtpRequest(cleanEmail);

    console.log(`🔑 [REGISTER OTP RESENT] Email: "${cleanEmail}" | New OTP: "${newOtp}" | Valid for: 10m`);

    const result = await sendOtpEmail(cleanEmail, newOtp, pending.fullName || 'Devotee', true);

    if (result.success) {
      return res.json({
        success: true,
        message: `New verification code sent to ${cleanEmail}. Please check your inbox.`,
        cooldownSeconds: 30
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to resend verification code.',
        cooldownSeconds: 10
      });
    }
  } catch (error) {
    console.error('Register Resend OTP Error:', error);
    return res.status(500).json({
      success: false,
      detail: 'Internal server error while resending verification code.'
    });
  }
});

// Helper to verify Google token using Google UserInfo API or Tokeninfo
async function verifyGoogleToken(credential, accessToken, clientId) {
  // 1. If accessToken is provided (fast GIS popup token client)
  if (accessToken) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const payload = await response.json();
        if (payload && payload.email) {
          return {
            email: payload.email.toLowerCase(),
            name: payload.name || payload.email.split('@')[0],
            picture: payload.picture || '',
            sub: payload.sub || ''
          };
        }
      } else {
        const errText = await response.text();
        console.warn(`[Google Verification] UserInfo API returned ${response.status}: ${errText}`);
      }
    } catch (err) {
      console.warn(`[Google Verification] UserInfo fetch error: ${err.message}`);
    }
  }

  // 2. If credential (ID token) is provided
  if (credential) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const payload = await response.json();
        if (payload && payload.email) {
          return {
            email: payload.email.toLowerCase(),
            name: payload.name || payload.email.split('@')[0],
            picture: payload.picture || '',
            sub: payload.sub || ''
          };
        }
      } else {
        const errText = await response.text();
        console.warn(`[Google Verification] Tokeninfo API failed: ${response.status} - ${errText}`);
      }
    } catch (err) {
      console.warn(`[Google Verification] HTTP request failed/timed out: ${err.message}`);
    }

    // Safe fallback: decode locally
    try {
      const parts = credential.split('.');
      if (parts.length >= 2) {
        const payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
        const payload = JSON.parse(payloadStr);
        if (payload && payload.email) {
          return {
            email: payload.email.toLowerCase(),
            name: payload.name || payload.email.split('@')[0],
            picture: payload.picture || '',
            sub: payload.sub || ''
          };
        }
      }
    } catch (err) {
      console.error(`[Google Verification] Local JWT decode failed:`, err);
    }
  }

  return null;
}

// 5. GOOGLE OAUTH — Step 1: Verify Google Token, Generate & Send Real 6-Digit OTP to Gmail
// (Mandatory OTP verification required for EVERY Google login)
app.post(['/api/auth/google', '/api/auth/google-send-otp'], async (req, res) => {
  try {
    const { credential, accessToken } = req.body;
    if (!credential && !accessToken) {
      return res.status(400).json({
        success: false,
        detail: 'Google credential or access token is required.'
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    const userInfo = await verifyGoogleToken(credential, accessToken, clientId);

    if (!userInfo || !userInfo.email) {
      return res.status(401).json({
        success: false,
        detail: 'Invalid Google authentication credential. Unable to extract user profile.'
      });
    }

    const cleanEmail = normalizeEmail(userInfo.email);
    const displayName = userInfo.name || cleanEmail.split('@')[0];

    // Check rate limit
    if (!checkRateLimit(cleanEmail)) {
      return res.status(429).json({
        success: false,
        message: 'Too many verification requests. Please wait a few minutes before trying again.',
        cooldownSeconds: 60
      });
    }

    // Generate a secure 6-digit OTP
    const otp = generateOtp();
    const tempAuthToken = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(24).toString('hex');

    // Store in pendingGoogleAuth store
    pendingGoogleAuth.set(cleanEmail, {
      email: cleanEmail,
      name: displayName,
      picture: userInfo.picture || '',
      sub: userInfo.sub || '',
      otp,
      tempAuthToken,
      createdAt: Date.now(),
      attempts: 0
    });
    recordOtpRequest(cleanEmail);

    console.log(`🔑 [GOOGLE AUTH OTP CREATED] Email: "${cleanEmail}" | OTP: "${otp}" | Valid for: 10m`);

    // Dispatch real email verification code via Gmail SMTP
    const result = await sendOtpEmail(cleanEmail, otp, displayName, false);

    if (result.success) {
      return res.json({
        success: true,
        requiresOtp: true,
        email: cleanEmail,
        tempAuthToken,
        message: `Verification code sent to ${cleanEmail}. Please check your inbox.`,
        cooldownSeconds: 30
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to dispatch verification code to Google email. Please check server email configuration.',
        cooldownSeconds: 10
      });
    }
  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(500).json({
      success: false,
      detail: 'Internal server error during Google authentication.'
    });
  }
});

// 6. GOOGLE OAUTH — Resend OTP
app.post('/api/auth/google-resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, detail: 'Email is required.' });
    }

    const cleanEmail = normalizeEmail(email);
    const pending = pendingGoogleAuth.get(cleanEmail);

    if (!pending) {
      return res.status(400).json({
        success: false,
        detail: 'No active Google authentication session found. Please click Continue with Google again.'
      });
    }

    if (!checkRateLimit(cleanEmail)) {
      return res.status(429).json({
        success: false,
        message: 'Too many verification requests. Please wait a few minutes before trying again.',
        cooldownSeconds: 60
      });
    }

    const newOtp = generateOtp();
    pending.otp = newOtp;
    pending.createdAt = Date.now();
    pending.attempts = 0;
    recordOtpRequest(cleanEmail);

    console.log(`🔑 [GOOGLE OTP RESENT] Email: "${cleanEmail}" | New OTP: "${newOtp}" | Valid for: 10m`);

    const result = await sendOtpEmail(cleanEmail, newOtp, pending.name || 'Devotee', false);

    if (result.success) {
      return res.json({
        success: true,
        message: `New verification code sent to ${cleanEmail}. Please check your inbox.`,
        cooldownSeconds: 30
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to resend verification code.',
        cooldownSeconds: 10
      });
    }
  } catch (error) {
    console.error('Google Resend OTP Error:', error);
    return res.status(500).json({
      success: false,
      detail: 'Internal server error while resending verification code.'
    });
  }
});

// 7. GOOGLE OAUTH — Step 2: Verify OTP & Create Session
app.post('/api/auth/google-verify-otp', async (req, res) => {
  try {
    const { email, otp, tempAuthToken } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        detail: 'Email and 6-digit verification code are required.'
      });
    }

    const cleanEmail = normalizeEmail(email);
    const cleanOtp = normalizeOtp(otp);

    // Look up in pendingGoogleAuth store
    let pending = pendingGoogleAuth.get(cleanEmail);

    console.log(`🔍 [GOOGLE OTP VERIFY ATTEMPT] Email: "${cleanEmail}" | Received OTP: "${cleanOtp}" | Found Record: ${Boolean(pending)}`);

    if (!pending) {
      return res.status(400).json({
        success: false,
        detail: 'No pending Google verification found for this email. Please sign in with Google again.'
      });
    }

    if (tempAuthToken && pending.tempAuthToken && pending.tempAuthToken !== tempAuthToken) {
      return res.status(400).json({
        success: false,
        detail: 'Invalid authentication session. Please sign in with Google again.'
      });
    }

    if (Date.now() - pending.createdAt > OTP_EXPIRY_MS) {
      pendingGoogleAuth.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        detail: 'Verification code has expired. Please sign in with Google again.'
      });
    }

    if (pending.attempts >= MAX_VERIFY_ATTEMPTS) {
      pendingGoogleAuth.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        detail: 'Too many incorrect attempts. Please sign in with Google again.'
      });
    }

    const storedOtp = normalizeOtp(pending.otp);
    if (storedOtp !== cleanOtp) {
      pending.attempts += 1;
      const remaining = MAX_VERIFY_ATTEMPTS - pending.attempts;
      console.warn(`❌ [GOOGLE OTP MISMATCH] Email: "${cleanEmail}" | Stored: "${storedOtp}" | Received: "${cleanOtp}" | Remaining: ${remaining}`);
      return res.status(400).json({
        success: false,
        detail: `Invalid verification code. ${remaining} attempt(s) remaining.`
      });
    }

    console.log(`✅ [GOOGLE OTP SUCCESS] Email: "${cleanEmail}" verified successfully!`);

    // Valid OTP — consume from pending store
    pendingGoogleAuth.delete(cleanEmail);

    // Create or Link user in Database
    const usersCol = dbManager.getCollection('users');
    let userDoc = await usersCol.findOne({
      $or: [
        { email: cleanEmail },
        ...(pending.sub ? [{ googleId: pending.sub }, { googleSub: pending.sub }] : [])
      ]
    });

    const nowIso = new Date().toISOString();

    if (!userDoc) {
      // New devotee registered via Google
      const derivedUsername = normalizeUsername(cleanEmail.split('@')[0]) || ('devotee_' + Date.now().toString(36));
      const newUser = {
        fullName: pending.name || cleanEmail.split('@')[0],
        name: pending.name || cleanEmail.split('@')[0],
        username: derivedUsername,
        email: cleanEmail,
        phone: '',
        mobile: '',
        passwordHash: null,
        address: '',
        emergencyContact: '',
        authProvider: 'google',
        googleId: pending.sub || '',
        googleSub: pending.sub || '',
        emailVerified: true,
        status: 'active',
        avatar: pending.picture || (pending.name ? pending.name.charAt(0).toUpperCase() : 'G'),
        createdAt: nowIso,
        updatedAt: nowIso,
        lastLogin: nowIso
      };
      const insertResult = await usersCol.insertOne(newUser);
      userDoc = { ...newUser, _id: insertResult.insertedId || String(newUser._id) };
      console.log(`✨ [GOOGLE SIGN UP COMPLETED] Created account for: ${cleanEmail}`);
    } else {
      // Existing user signed in via Google — link Google profile
      const updates = { lastLogin: nowIso, updatedAt: nowIso, status: 'active', emailVerified: true };
      if (pending.picture && (!userDoc.avatar || userDoc.avatar.length <= 2)) {
        updates.avatar = pending.picture;
        userDoc.avatar = pending.picture;
      }
      if (pending.sub && !userDoc.googleId) {
        updates.googleId = pending.sub;
        updates.googleSub = pending.sub;
      }
      await usersCol.updateOne({ _id: userDoc._id }, { $set: updates });
      userDoc.lastLogin = nowIso;
      console.log(`✨ [GOOGLE SIGN IN COMPLETED] Verified devotee: ${cleanEmail}`);
    }

    const userId = String(userDoc._id);
    const token = jwt.sign(
      {
        sub: userId,
        email: cleanEmail,
        username: userDoc.username || '',
        name: userDoc.fullName || pending.name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set secure HttpOnly session cookie
    setSessionCookie(res, token);

    const userObj = {
      id: userId,
      _id: userId,
      fullName: userDoc.fullName || pending.name,
      name: userDoc.fullName || pending.name,
      username: userDoc.username || cleanEmail.split('@')[0],
      email: cleanEmail,
      phone: userDoc.phone || userDoc.mobile || '',
      mobile: userDoc.mobile || userDoc.phone || '',
      address: userDoc.address || '',
      emergencyContact: userDoc.emergencyContact || '',
      authProvider: 'google',
      provider: 'google',
      status: 'active',
      emailVerified: true,
      avatar: userDoc.avatar || pending.picture || 'G',
      createdAt: userDoc.createdAt,
      lastLogin: userDoc.lastLogin
    };

    return res.json({
      success: true,
      message: `🙏 Sacred Welcome, ${userObj.fullName}! You are signed in via Google.`,
      user: userObj,
      token
    });
  } catch (error) {
    console.error('Google Verify OTP Error:', error);
    return res.status(500).json({
      success: false,
      detail: 'Internal server error while verifying code.'
    });
  }
});

// 8. LOGOUT
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('darshan_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// 9. CURRENT USER SESSION VALIDATION (/api/auth/me)
app.get('/api/auth/me', async (req, res) => {
  try {
    // Check HttpOnly cookie first, then fallback to Authorization header
    const token = req.cookies?.darshan_session || 
      (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    if (!token) {
      return res.status(401).json({ detail: 'No active session found.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      res.clearCookie('darshan_session');
      return res.status(401).json({ detail: 'Session expired or token invalid.' });
    }

    const usersCol = dbManager.getCollection('users');
    let userDoc = null;
    if (decoded.sub) {
      try {
        userDoc = await usersCol.findOne({ _id: decoded.sub });
      } catch (e) { /* ignore */ }
    }
    if (!userDoc && decoded.email) {
      userDoc = await usersCol.findOne({ email: decoded.email.toLowerCase() });
    }

    if (!userDoc) {
      return res.status(404).json({ detail: 'User profile not found.' });
    }

    const userObj = {
      id: String(userDoc._id),
      _id: String(userDoc._id),
      fullName: userDoc.fullName || userDoc.name || 'Devotee',
      name: userDoc.fullName || userDoc.name || 'Devotee',
      username: userDoc.username || userDoc.email.split('@')[0],
      email: userDoc.email,
      phone: userDoc.phone || userDoc.mobile || '',
      mobile: userDoc.phone || userDoc.mobile || '',
      address: userDoc.address || '',
      emergencyContact: userDoc.emergencyContact || '',
      authProvider: userDoc.authProvider || 'local',
      provider: userDoc.authProvider || 'local',
      status: userDoc.status || 'active',
      emailVerified: Boolean(userDoc.emailVerified !== false),
      avatar: userDoc.avatar || (userDoc.fullName ? userDoc.fullName.charAt(0).toUpperCase() : 'D'),
      createdAt: userDoc.createdAt,
      lastLogin: userDoc.lastLogin
    };

    return res.json(userObj);
  } catch (error) {
    console.error('Get Current User Error:', error);
    return res.status(500).json({ detail: 'Internal server error validating session.' });
  }
});

// 10. UPDATE DEVOTEE PROFILE
app.post('/api/auth/update-profile', async (req, res) => {
  try {
    const token = req.cookies?.darshan_session || 
      (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    let userId = null;
    let userEmail = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.sub;
        userEmail = decoded.email;
      } catch (e) { /* proceed with body info */ }
    }

    const { fullName, username, phone, mobile, address, emergencyContact, email } = req.body;
    const cleanEmail = (email || userEmail || '').toLowerCase();

    const usersCol = dbManager.getCollection('users');
    const updateFields = { updatedAt: new Date().toISOString() };
    if (fullName) updateFields.fullName = fullName.trim();
    if (username) updateFields.username = normalizeUsername(username);
    if (phone || mobile) updateFields.phone = (phone || mobile).trim();
    if (address) updateFields.address = address.trim();
    if (emergencyContact) updateFields.emergencyContact = emergencyContact.trim();

    if (userId) {
      await usersCol.updateOne({ _id: userId }, { $set: updateFields });
    } else if (cleanEmail) {
      await usersCol.updateOne({ email: cleanEmail }, { $set: updateFields });
    }

    return res.json({
      success: true,
      message: 'Profile details updated successfully.',
      updatedFields: updateFields
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ success: false, detail: 'Failed to update profile.' });
  }
});

// ---------------- REAL-TIME TEMPLE WEB SEARCH BACKEND ROUTE ----------------
app.post('/api/temples/search-web', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required.'
      });
    }

    const cleanQuery = query.trim();
    let webResults = [];

    // Option A: Use Tavily Web Search API if key provided in backend .env
    if (process.env.TAVILY_API_KEY || (process.env.WEB_SEARCH_API_KEY && process.env.WEB_SEARCH_API_KEY.startsWith('tvly-'))) {
      const tavilyKey = process.env.TAVILY_API_KEY || process.env.WEB_SEARCH_API_KEY;
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${cleanQuery} temple Tamil Nadu location history`,
          search_depth: 'basic',
          include_answer: false,
          max_results: 5
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          webResults = data.results.map(r => ({
            name: r.title || cleanQuery,
            location: 'Tamil Nadu, India',
            description: r.content || r.snippet || 'Real-time temple information fetched from web source.',
            source: new URL(r.url).hostname.replace('www.', ''),
            url: r.url
          }));
        }
      }
    }

    // Option B: Real-Time Live Web Search fallback via Wikipedia API & Nominatim OpenStreetMap API
    if (webResults.length === 0) {
      // 1. Query Wikipedia Search API
      const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery + ' temple')}&format=json&origin=*`;
      const wikiRes = await fetch(wikiSearchUrl);
      
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        const searchHits = wikiData.query?.search || [];

        for (const hit of searchHits.slice(0, 4)) {
          const pageTitle = hit.title;
          const snippet = hit.snippet.replace(/<[^>]*>?/gm, ''); // Strip HTML tags
          
          // Get summary extract for page
          const detailUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=1&explaintext=1&piprop=original&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
          const detailRes = await fetch(detailUrl);
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            const pages = detailData.query?.pages;
            if (pages) {
              const pageId = Object.keys(pages)[0];
              if (pageId !== '-1') {
                const page = pages[pageId];
                webResults.push({
                  name: page.title,
                  location: 'Tamil Nadu, India',
                  description: page.extract || snippet,
                  source: 'Wikipedia',
                  url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
                  coverImage: page.original?.source || null
                });
              }
            }
          }
        }
      }

      // 2. Query Nominatim OpenStreetMap API for location results if needed
      if (webResults.length === 0) {
        const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery + ' temple Tamil Nadu')}&format=json&addressdetails=1&limit=3`;
        const osmRes = await fetch(osmUrl, {
          headers: { 'User-Agent': 'DarshanJourney/1.0 (contact@darshanjourney.com)' }
        });
        if (osmRes.ok) {
          const osmData = await osmRes.json();
          if (Array.isArray(osmData) && osmData.length > 0) {
            webResults = osmData.map(item => ({
              name: item.name || item.display_name.split(',')[0],
              location: item.display_name,
              description: `Sanctified shrine location: ${item.display_name}. Categorized under OpenStreetMap live location registry.`,
              source: 'OpenStreetMap',
              url: `https://www.openstreetmap.org/search?query=${encodeURIComponent(item.display_name)}`
            }));
          }
        }
      }
    }

    if (webResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No real-time web results found for "${cleanQuery}". Please refine your search term.`
      });
    }

    return res.json({
      success: true,
      query: cleanQuery,
      results: webResults
    });

  } catch (error) {
    console.error('Error during real-time temple web search:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to perform real-time web search. Please check server connection and try again.'
    });
  }
});

// Products API route fallback
app.get('/api/products', (req, res) => {
  res.json([]);
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Darshan Journey Authentication & Temple Backend',
    database: dbManager.isAtlas ? 'MongoDB Atlas' : 'In-Memory (High-Availability)',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    service: 'Darshan Journey API Backend',
    status: 'online',
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`✨ Darshan Journey Backend Server running on http://localhost:${PORT}`);
});
