// models/Coupon.js
import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'flat'], required: true },
  value: { type: Number, required: true }, // 20 means 20% or ₹20
  maxUsage: { type: Number, default: 1 }, // total allowed usage
  usedCount: { type: Number, default: 0 }, // how many times used
  applicableTo: [{ type: String }], // e.g., ['Silver', 'Gold'] or empty for all
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
