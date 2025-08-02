import express from 'express';
// import { isAdmin } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import {
  createPlan,
  updatePlan,
  deletePlan,
  getAllPlansWithoutDeals,
  getPlansWithDeal,
  getPlanById,
  initiatePayment,
  verifyPaymentHandler,
  getAllDeals
} from '../controllers/billingController.js';
import { isAuthenticated } from '../clerk/isAuthenticate.js';

const router = express.Router();

// Admin routes
router.post('/createPlan', isAdmin, createPlan);
router.put('/updatePlan/:id', isAdmin, updatePlan);
router.delete('/deletePlan/:id', isAdmin, deletePlan);


// User routes
router.get('/getAllPlans', getAllPlansWithoutDeals)
router.get('/getAllDeals', getAllDeals)
router.get('/getAllPlanInfo', getPlansWithDeal);
router.get('/getPlanInfo/:id',  getPlanById);
router.post('/payment/initiate', initiatePayment);
router.post('/payment/verify', verifyPaymentHandler);

export default router;