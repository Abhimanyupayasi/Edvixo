import express from 'express';
import { requireAuth } from '@clerk/express';
import { getMyFeatures } from '../controllers/featureController.js';

const router = express.Router();

// Get all features for the currently authenticated user's active plan
router.get('/my-features', requireAuth(), getMyFeatures);

export default router;
