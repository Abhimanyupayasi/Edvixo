// src/app.js
import 'dotenv/config';
import express from 'express';
import { clerkClient, clerkMiddleware, getAuth, requireAuth } from '@clerk/express';
import cors from 'cors';
import { isAdmin } from './src/middlewares/isAdmin.js';

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


// ... other middleware ...

app.use('/billing', billingRoutes);
app.use('/user', userRoutes);
app.use('/coupon', couponRoutes);

// ... error handling ...

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).json({ error: 'Unauthorized' });
});

export default app;