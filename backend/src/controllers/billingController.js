import { createOrder } from '../services/razorpayService.js';
import { verifyPayment as verifyRazorpaySignature } from '../services/razorpayService.js';
import Plan from '../models/Plan.js';
import Deal from '../models/Deal.js';
import Coupon from '../models/Coupon.js';

// Admin routes




// Add new tier (Silver, Gold, etc.) to a Plan type (Coaching, School, etc.)
export const createPlan = async (req, res) => {
  try {
    const { type, name, description, pricingTiers, features } = req.body;

    if (!['Coaching', 'School', 'College'].includes(type)) {
      throw new Error('Invalid or missing plan type');
    }

    if (!['Silver', 'Gold', 'Platinum', 'Diamond'].includes(name)) {
      throw new Error('Invalid or missing tier name');
    }

    if (!Array.isArray(pricingTiers) || pricingTiers.length === 0) {
      throw new Error('At least one pricing tier is required');
    }

    const cleanedPricing = pricingTiers.map(t => {
      if (![1, 3, 6, 12, 24, 48].includes(t.duration)) {
        throw new Error(`Invalid duration: ${t.duration}`);
      }
      if (typeof t.basePrice !== 'number' || t.basePrice < 0) {
        throw new Error('Invalid base price');
      }
      if (t.discountPrice && t.discountPrice > t.basePrice) {
        throw new Error('Discount cannot exceed base price');
      }
      return {
        duration: t.duration,
        basePrice: t.basePrice,
        discountPrice: t.discountPrice || undefined,
        currency: t.currency || 'INR'
      };
    });

    const cleanedFeatures = (features || [])
      .filter(f => f?.title?.trim())
      .map(f => ({
        title: f.title.trim(),
        description: f.description?.trim() || '',
        isIncluded: !!f.isIncluded
      }));

    let planGroup = await Plan.findOne({ type });

    if (!planGroup) {
      planGroup = await Plan.create({
        type,
        description: `${type} category`,
        plans: [{
          name,
          description: description || '',
          pricingTiers: cleanedPricing,
          features: cleanedFeatures,
          isActive: true
        }]
      });
    } else {
      if (planGroup.plans.some(p => p.name === name)) {
        throw new Error(`${name} plan already exists for ${type}`);
      }

      planGroup.plans.push({
        name,
        description: description || '',
        pricingTiers: cleanedPricing,
        features: cleanedFeatures,
        isActive: true
      });

      await planGroup.save();
    }

    res.status(201).json({ success: true, data: planGroup });

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};



export const updatePlan = async (req, res) => {
  try {
    const { type, name } = req.params;
    const updateData = req.body;

    const planGroup = await Plan.findOne({ type });
    if (!planGroup) throw new Error('Plan type not found');

    const plan = planGroup.plans.find(p => p.name === name);
    if (!plan) throw new Error(`Plan "${name}" not found in ${type}`);

    if (updateData.description) plan.description = updateData.description;
    if (typeof updateData.isActive === 'boolean') plan.isActive = updateData.isActive;

    if (Array.isArray(updateData.features)) {
      plan.features = updateData.features.map(f => ({
        title: f.title,
        description: f.description || '',
        isIncluded: !!f.isIncluded
      }));
    }

    if (Array.isArray(updateData.pricingTiers)) {
      plan.pricingTiers = updateData.pricingTiers.map(t => ({
        duration: t.duration,
        basePrice: t.basePrice,
        discountPrice: t.discountPrice,
        currency: t.currency || 'INR'
      }));
    }

    await planGroup.save();

    res.json({ success: true, data: plan });

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};



export const deletePlan = async (req, res) => {
  try {
    const { type, name } = req.params;

    const planGroup = await Plan.findOne({ type });
    if (!planGroup) throw new Error('Plan type not found');

    const originalLength = planGroup.plans.length;
    planGroup.plans = planGroup.plans.filter(p => p.name !== name);

    if (planGroup.plans.length === originalLength) {
      throw new Error(`Plan "${name}" not found in ${type}`);
    }

    await planGroup.save();

    res.json({ success: true, message: `${name} plan removed from ${type}` });

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};



// Helper function to update specific pricing tier
export const updatePricingTier = async (req, res) => {
  try {
    const { planId, tierId } = req.params;
    const updateData = req.body;

    const plan = await Plan.findOneAndUpdate(
      { _id: planId, 'pricingTiers._id': tierId },
      { $set: { 'pricingTiers.$': updateData } },
      { new: true }
    );

    if (!plan) {
      throw new Error('Plan or pricing tier not found');
    }

    res.json({
      success: true,
      data: plan
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// User routes
// User routes


// controller/planController.js

export const getAllPlansWithoutDeals = async (req, res) => {
  try {
    const allPlans = await Plan.find()
      .populate('plans.features.feature'); // populate nested feature docs
    res.status(200).json(allPlans);
  } catch (error) {
    console.error('Error fetching plans without deals:', error);
    res.status(500).json({ error: error.message });
  }
};


export const getPlansWithDeal = async (req, res) => {
  try {
    // 1. Fetch the one active deal
    const deal = await Deal.findOne({ isActive: true });

    // 2. Fetch all plans with populated features
    const allPlans = await Plan.find()
      .populate('plans.features.feature')
      .lean();

    // 3. Apply deal to pricing tiers
    const plansWithDeal = allPlans.map(plan => {
  const updatedPlans = plan.plans.map(p => {
        const updatedPricingTiers = p.pricingTiers.map(tier => {
          if (deal) {
            let discountedPrice = tier.basePrice;

            if (deal.discountType === 'percentage') {
              discountedPrice = Math.floor(tier.basePrice * (1 - deal.value / 100));
            } else if (deal.discountType === 'flat') {
              discountedPrice = Math.max(0, tier.basePrice - deal.value);
            }

            return {
              ...tier,
              dealApplied: true,
              originalPrice: tier.basePrice,
              discountedPrice,
              dealInfo: {
                title: deal.title,
                discountType: deal.discountType,
                value: deal.value
              }
            };
          } else {
            return {
              ...tier,
              dealApplied: false,
              discountedPrice: tier.basePrice
            };
          }
        });

        return {
          ...p,
          pricingTiers: updatedPricingTiers,
          // Ensure features retain populated structure: { feature: { _id,key,title,description,... }, isIncluded }
          features: (p.features || []).map(f => ({
            feature: f.feature && f.feature._id ? {
              _id: f.feature._id,
              key: f.feature.key,
              title: f.feature.title,
              description: f.feature.description,
              category: f.feature.category
            } : f.feature, // fallback
            isIncluded: f.isIncluded
          }))
        };
      });

      return {
        ...plan,
        plans: updatedPlans,
        hasDeal: !!deal,
        dealInfo: deal ? {
          title: deal.title,
          discountType: deal.discountType,
          value: deal.value
        } : null
      };
    });

    return res.status(200).json({ success: true, data: plansWithDeal });
  } catch (err) {
    console.error('Error in getPlansWithDeal:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET /deals - fetch all deals
export const getAllDeals = async (req, res) => {
  try {
    const deals = await Deal.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error.message);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
};










export const getPlanById = async (req, res) => {
  try {
    const { type, name } = req.params;

    const planGroup = await Plan.findOne({ type });
    if (!planGroup) throw new Error(`Plan type "${type}" not found`);

    const plan = planGroup.plans.find(p => p.name === name);
    if (!plan) throw new Error(`Plan "${name}" not found in "${type}"`);

    res.json({ type: planGroup.type, plan });

  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};


export const initiatePayment = async (req, res) => {
  try {
    const plan = await Plan.findById(req.body.planId);
    if (!plan) throw new Error('Plan not found');

    const order = await createOrder(plan.price.amount, plan.price.currency);
    
    res.json({
      orderId: order.id,
      amount: plan.price.amount,
      currency: plan.price.currency,
      plan: plan._id
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const verifyPaymentHandler = async (req, res) => {
  try {
    const isValid = verifyRazorpaySignature(
      req.body.razorpayOrderId,
      req.body.razorpayPaymentId,
      req.body.razorpaySignature
    );

    if (!isValid) throw new Error('Payment verification failed');

    // Save payment details to your database here
    // Create user subscription, etc.

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};