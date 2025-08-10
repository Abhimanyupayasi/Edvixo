import mongoose from 'mongoose';

const featureSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Feature key is required.'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  title: {
    type: String,
    required: [true, 'Feature title is required.'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Feature description is required.'],
    trim: true,
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  }
}, { timestamps: true });

const Feature = mongoose.model('Feature', featureSchema);

export default Feature;
