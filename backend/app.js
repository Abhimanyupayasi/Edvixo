// src/app.js
import 'dotenv/config';
import express from 'express';
import { clerkClient, clerkMiddleware, getAuth, requireAuth } from '@clerk/express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { isAdmin } from './src/middlewares/isAdmin.js';
import paymentRouter from './src/routes/paymentRoutes.js';

const app = express();

// Trust reverse proxy headers (X-Forwarded-Proto/Host) so HTTPS/cookies work behind proxies
app.set('trust proxy', 1);


// CORS allowlist (supports multiple, comma-separated)
const allowlist = new Set(
  (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
);

// Middleware
const platformRoot = (process.env.PLATFORM_ROOT_DOMAIN || 'sevalla.app').toLowerCase();
const corsOptions = {
  origin: (origin, cb) => {
    // Don’t throw on bad origins in dev; allow localhost and configured origins
    if (!origin) return cb(null, true);
    let host = '';
    try { host = new URL(origin).host; } catch { host = ''; }
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/i.test(origin);
  const isVercel = /\.vercel\.app$/i.test(host);
  const isPlatform = host === platformRoot || host.endsWith('.' + platformRoot);
  const ok = allowlist.has(origin) || isLocal || isVercel || isPlatform;
    return cb(null, ok);
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['authorization','content-type','x-requested-with','x-plan-id','x-student-access'],
  credentials: true
};

app.use(cors(corsOptions));
// Ensure OPTIONS preflight returns quickly after CORS headers are applied
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') return next();
  const origin = req.headers.origin;
  if (origin) {
    let host = '';
    try { host = new URL(origin).host; } catch { host = ''; }
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/i.test(origin);
    const isVercel = /\.vercel\.app$/i.test(host);
    const isPlatform = host === platformRoot || host.endsWith('.' + platformRoot);
    if (allowlist.has(origin) || isLocal || isVercel || isPlatform) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'authorization,content-type,x-requested-with,x-plan-id,x-student-access');
    }
  }
  return res.sendStatus(204);
});

// Note: Global CORS middleware above will handle preflight OPTIONS automatically.
app.use(express.json());
app.use(cookieParser());
app.use(clerkMiddleware());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the homepage!');
});

// Protected Route
app.get('/protected', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const user = await clerkClient.users.getUser(userId);
    res.json({ user });
  } catch (error) {
    console.log("Error", error)
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Auth Pages
app.get('/sign-in', (req, res) => {
  res.send('Sign-in page would be rendered here');
});

app.get('/admin', requireAuth(), isAdmin, (req, res) => {
  res.json({ message: 'Welcome admin!' });
});

import billingRoutes from './src/routes/billingRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import couponRoutes from './src/routes/couponRoutes.js';
import featureRoutes from './src/routes/featureRoutes.js';
import institutionRoutes from './src/routes/institutionRoutes.js';
import studentRoutes from './src/routes/studentRoutes.js';
import { getSignedUploadParams } from './src/utils/cloudinary.js';
import publicAuthRoutes from './src/routes/publicAuthRoutes.js';
import publicStudentRoutes from './src/routes/publicStudentRoutes.js';


// ... other middleware ...

app.use('/billing', billingRoutes);
app.use('/billing', (req,res,next)=>{ console.log('Billing route hit:', req.method, req.originalUrl); next(); });
app.use('/user', userRoutes);
app.use('/coupon', couponRoutes);
app.use('/features', requireAuth(), featureRoutes);
app.use('/payments',requireAuth(), paymentRouter );
app.use('/institutions', institutionRoutes);
// Debug log for students routes
app.use('/students', (req,res,next)=>{ console.log('Students route hit:', req.method, req.originalUrl); next(); });
app.use('/students', requireAuth(), studentRoutes);

// Public (student) routes - no Clerk auth
app.use('/public/auth', publicAuthRoutes);
app.use('/public/student', publicStudentRoutes);

// image upload signature endpoint (authenticated)
app.get('/media/signature', requireAuth(), (req,res)=>{
  try {
    const params = getSignedUploadParams();
    res.json({ success:true, data:params });
  } catch (e) {
    res.status(500).json({ success:false, message:e.message });
  }
});

// ... error handling ...

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).json({ error: 'Unauthorized' });
});

export default app;