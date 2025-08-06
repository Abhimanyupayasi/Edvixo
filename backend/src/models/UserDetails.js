import mongoose from 'mongoose';

const userDetailsSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  organizationType: {
    type: String,
    enum: ['school', 'college', 'university', 'other'],
    required: true
  },
  organizationName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userDetailsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const UserDetails = mongoose.model('UserDetails', userDetailsSchema);
export default UserDetails;