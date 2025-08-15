// src/app.js
import 'dotenv/config';
import express from 'express';
import { clerkClient, clerkMiddleware, getAuth, requireAuth } from '@clerk/express';
import cors from 'cors';
import { isAdmin } from './src/middlewares/isAdmin.js';
import paymentRouter from './src/routes/paymentRoutes.js';

const app = express();



// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
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