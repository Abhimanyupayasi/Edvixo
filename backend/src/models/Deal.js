// models/Deal.js
import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Diwali Sale"
  description: String,
  discountType: { type: String, enum: ['percentage', 'flat'], required: true },
  value: { type: Number, required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  applicableTo: [{ type: String }], // e.g., ['Silver'], empty means all
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Deal = mongoose.model('Deal', dealSchema);
export default Deal;
