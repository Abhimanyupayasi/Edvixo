import { clerkClient } from '@clerk/clerk-sdk-node';
import UserDetails from '../models/UserDetails.js';
import Payment from "../models/payment.js";
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const homePayment = async (req, res) => {
  return res.status(200).json({
    success: true,
    home: "yes"
  });
};

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    console.log("createOrder req.body:", JSON.stringify(req.body, null, 2));
    const { amount, currency, plan, tier, organizationName, organizationType } = req.body;
    
    const auth = req.auth();
    const clerkUserId = auth.userId;
    
    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!plan || typeof plan !== 'object' || !plan._id) {
      console.error("Invalid plan data received:", plan);
      return res.status(400).json({ success: false, message: 'Invalid plan details provided. Plan object is missing or invalid.' });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: currency || 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        planId: plan.parentId, // The ID of the main plan document (e.g., 'Coaching')
        individualPlanId: plan._id, // The ID of the specific plan chosen (e.g., 'Silver Plan')
        planName: plan.name,
        tier: JSON.stringify(tier), // Store the whole tier object as a string
        organizationName,
        organizationType,
        clerkUserId
      }
    };

    const order = await razorpay.orders.create(options);
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Verify payment and store data
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const auth = req.auth();
    const clerkUserId = auth.userId;
    
    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Verify the payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
    
    // Fetch order details from Razorpay
    const order = await razorpay.orders.fetch(razorpay_order_id);
    
    // Fetch full user details from Clerk
    const clerkUser = await clerkClient.users.getUser(clerkUserId);

    // Prepare user data
    const userData = {
      clerkUserId,
      fullName: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
      phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || '',
      organizationType: order.notes.organizationType,
      organizationName: order.notes.organizationName
    };

    // Save or update user details
    let userDetails = await UserDetails.findOne({ clerkUserId });
    
    if (userDetails) {
      // Update existing user
      userDetails = await UserDetails.findOneAndUpdate(
        { clerkUserId },
        { $set: userData },
        { new: true }
      );
    } else {
      // Create new user
      userDetails = new UserDetails(userData);
      await userDetails.save();
    }
    
    const pricingTier = JSON.parse(order.notes.tier);

    // Calculate subscription dates
    const subscriptionStart = new Date();
    const subscriptionEnd = new Date(subscriptionStart);
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + pricingTier.duration);
    
    // Save payment details
    const payment = new Payment({
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
      amount: order.amount / 100,
      currency: order.currency,
      status: 'captured',
      plan: order.notes.individualPlanId, // Storing the ID of the specific sub-plan
      pricingTier: pricingTier,
      user: userDetails._id,
      clerkUserId,
      subscriptionStart,
      subscriptionEnd,
      invoiceId: `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      notes: {
        ...order.notes,
        planName: order.notes.planName, // Ensure planName is also stored
      }
    });
    
    await payment.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment verified and data stored successfully',
      payment,
      userDetails
    });
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

// Get user payments
export const getUserPayments = async (req, res) => {
  try {
    const clerkUserId = req.auth().userId;
    
    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const payments = await Payment.find({ clerkUserId })
      .populate('user', 'fullName email organizationType organizationName')
      .sort({ paymentDate: -1 });
    
    res.status(200).json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const clerkUserId = req.auth().userId;
    
    const payment = await Payment.findOne({
      _id: paymentId,
      clerkUserId
    }).populate('user');
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
};