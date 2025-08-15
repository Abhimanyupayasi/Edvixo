import mongoose from 'mongoose';

const ParentInfoSchema = new mongoose.Schema({
  fatherName: { type: String },
  motherName: { type: String },
  guardianName: { type: String },
  fatherPhone: { type: String },
  motherPhone: { type: String },
  guardianPhone: { type: String },
  email: { type: String }
}, { _id: false });

const FeeSchema = new mongoose.Schema({
  total: { type: Number, default: 0 },
  paid: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' }
}, { _id: false });

const StudentSchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  // One of the following will be set based on institution type
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'SchoolClass', required: false, index: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: false, index: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: false, index: true },
  rollNo: { type: String, index: true, unique: true, sparse: true },
  admissionNo: { type: String },
  name: { type: String, required: true },
  gender: { type: String, enum: ['male','female','other'], default: 'other' },
  dob: { type: Date },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  parent: { type: ParentInfoSchema, default: {} },
  fee: { type: FeeSchema, default: {} },
  admissionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active','inactive'], default: 'active' }
}, { timestamps: true });

// Helpful compound indexes for common lookups
StudentSchema.index({ institutionId: 1, classId: 1, name: 1 });
StudentSchema.index({ institutionId: 1, batchId: 1, name: 1 });
StudentSchema.index({ institutionId: 1, courseId: 1, name: 1 });

export default mongoose.model('Student', StudentSchema);
