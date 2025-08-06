import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  razorpayPaymentId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpaySignature: {
    type: String
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
    default: 'created'
  },
  planType: {
    type: String,
    enum: ['gold', 'premium', 'basic', 'enterprise'],
    required: true
  },
  tier: {
    type: String,
    enum: ['school', 'college', 'university', 'corporate'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserDetails',
    required: true
  },
  clerkUserId: {
    type: String,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  subscriptionStart: {
    type: Date,
    required: true
  },
  subscriptionEnd: {
    type: Date,
    required: true
  },
  invoiceId: {
    type: String
  },
  notes: {
    type: Map,
    of: String
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;