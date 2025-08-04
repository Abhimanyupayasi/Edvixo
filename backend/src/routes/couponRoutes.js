import express from 'express';
import { addCoupon } from '../controllers/couponController.js';

const router = express.Router();

router.post('/add', addCoupon);
//todo: apply coupon route 
export default router;
