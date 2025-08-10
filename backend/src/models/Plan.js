// models/Plan.js
import mongoose from 'mongoose';

const planFeatureSchema = new mongoose.Schema({
  feature: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feature',
    required: true
  },
  isIncluded: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const pricingTierSchema = new mongoose.Schema({
  duration: { type: Number, required: true }, // in months
  basePrice: { type: Number, required: true },
  discountPrice: { type: Number },
  currency: { type: String, default: 'INR' }
}, { _id: true });

const individualPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  features: [planFeatureSchema],
  pricingTiers: [pricingTierSchema],
  isActive: { type: Boolean, default: true }
}, { _id: true });

const planSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'Coaching'
  description: String,
  plans: [individualPlanSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);

export default Plan;
