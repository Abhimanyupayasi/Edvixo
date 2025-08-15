import mongoose from 'mongoose';

const SchoolClassSchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  name: { type: String, required: true },
  section: { type: String },
  grade: { type: String },
  description: { type: String }
}, { timestamps: true });

SchoolClassSchema.index({ institutionId: 1, name: 1, section: 1 }, { unique: false });

export default mongoose.model('SchoolClass', SchoolClassSchema);
