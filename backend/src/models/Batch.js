import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  name: { type: String, required: true },
  timing: { type: String },
  description: { type: String }
}, { timestamps: true });

BatchSchema.index({ institutionId: 1, name: 1 }, { unique: false });

export default mongoose.model('Batch', BatchSchema);
