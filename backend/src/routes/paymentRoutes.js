import express from 'express';
import {
  homePayment,
  createOrder,
  verifyPayment,
  getUserPayments,
  getPaymentById
} from '../controllers/paymentController.js';
import { requireAuth } from '@clerk/express';

const router = express.Router();

// Public route (no auth required)
router.get('/', homePayment);

// Authenticated routes
router.post('/orders', requireAuth(), createOrder);
router.post('/verify', requireAuth(), verifyPayment);
router.get('/user', requireAuth(), getUserPayments);
router.get('/:paymentId', requireAuth(), getPaymentById);

export default router;