// src/routes/userRoutes.js
import express from 'express';
import { isAdmin } from '../middlewares/isAdmin.js';
import { 
  getBillingInfo,
  getUserProfile,
  updateUserProfile
} from '../controllers/userController.js';

const router = express.Router();

// Admin/Owner routes
router.get('/billingInfo', isAdmin, getBillingInfo);

// Client routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

export default router;