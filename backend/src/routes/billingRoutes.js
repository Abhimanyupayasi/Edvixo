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
import { getAllPlans, getMyPurchasedPlans, getIndividualPlanDetails } from '../controllers/planController.js';
import { requireAuth } from '@clerk/express';

const router = express.Router();

console.log('billingRoutes module loaded');

// Admin routes
router.post('/createPlan', isAdmin, createPlan);
router.put('/updatePlan/:id', isAdmin, updatePlan);
router.delete('/deletePlan/:id', isAdmin, deletePlan);


// User routes
router.get('/plans', getAllPlans);
router.get('/my/purchased-plans', requireAuth(), getMyPurchasedPlans);
router.get('/my/plan/:planId', requireAuth(), getIndividualPlanDetails);
router.get('/getAllPlans', getAllPlansWithoutDeals)
router.get('/getAllDeals', getAllDeals)
router.get('/getAllPlanInfo', getPlansWithDeal);
router.get('/getPlanInfo/:id',  getPlanById);
router.post('/payment/initiate', initiatePayment);
router.post('/payment/verify', verifyPaymentHandler);

// Debug: list registered route paths under /billing
router.get('/_routes', (req, res) => {
  const paths = router.stack
    .filter(l => l.route && l.route.path)
    .map(l => Object.keys(l.route.methods).map(m => m.toUpperCase() + ' ' + l.route.path));
  res.json({ routes: paths.flat() });
});

export default router;