import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  name: { type: String, required: true },
  durationMonths: { type: Number, required: true },
  description: { type: String }
}, { timestamps: true });

CourseSchema.index({ institutionId: 1, name: 1 }, { unique: false });

export default mongoose.model('Course', CourseSchema);
