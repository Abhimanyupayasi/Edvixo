// models/Plan.js
import mongoose from 'mongoose';

const featureSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  isIncluded: { type: Boolean, default: true }
});

const pricingTierSchema = new mongoose.Schema({
  duration: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  discountPrice: { type: Number },
  currency: { type: String, default: 'INR' }
});

const individualPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  features: [featureSchema],
  pricingTiers: [pricingTierSchema],
  isActive: { type: Boolean, default: true }
});

const planSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'Coaching'
  description: String,
  plans: [individualPlanSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
//export const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);
// const Plan = mongoose.model('Plan', planSchema);
// export default Plan;

const Plan = mongoose.models.Plan  || mongoose.model('Plan', planSchema);

export default Plan;
