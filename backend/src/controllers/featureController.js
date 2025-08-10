import Payment from '../models/payment.js';
import Plan from '../models/Plan.js';
import Feature from '../models/Feature.js';
import mongoose from 'mongoose';

export const getMyFeatures = async (req, res) => {
  try {
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // 1. Get active subscriptions
    const activePayments = await Payment.find({
      clerkUserId: userId,
      subscriptionEnd: { $gt: new Date() }
    }).select('plan').lean();

    if (!activePayments || activePayments.length === 0) {
      return res.status(200).json({ success: true, features: [] });
    }

    const individualPlanIds = activePayments.map(p => p.plan);

    // 2. Find the parent plans containing these individual plans
    const mainPlans = await Plan.find({ 'plans._id': { $in: individualPlanIds } })
      .populate('plans.features.feature') // Populate the feature details!
      .lean();

    // 3. Aggregate features from the user's specific plans
    const uniqueFeatures = new Map();
    const userPlanIdStrings = individualPlanIds.map(id => id.toString());

    mainPlans.forEach(mainPlan => {
      mainPlan.plans.forEach(individualPlan => {
        if (userPlanIdStrings.includes(individualPlan._id.toString())) {
          individualPlan.features.forEach(planFeature => {
            if (planFeature.isIncluded && planFeature.feature) {
              const key = planFeature.feature.key;
              if (!uniqueFeatures.has(key)) {
                // Clone the feature doc and augment with inclusion + provenance
                uniqueFeatures.set(key, {
                  ...planFeature.feature,
                  isIncluded: true,
                  sourcePlanIds: [individualPlan._id]
                });
              } else {
                // Append provenance (which plan(s) granted this feature)
                const existing = uniqueFeatures.get(key);
                if (!existing.sourcePlanIds.includes(individualPlan._id)) {
                  existing.sourcePlanIds.push(individualPlan._id);
                }
              }
            }
          });
        }
      });
    });

    const allFeatures = Array.from(uniqueFeatures.values()).map(f => ({
      // Return a clean shape for the frontend
      key: f.key,
      title: f.title,
      description: f.description,
      category: f.category,
      isIncluded: true,
      sourcePlanIds: f.sourcePlanIds
    }));

    res.status(200).json({ success: true, features: allFeatures });

  } catch (error) {
    console.error('Error fetching user features:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch features', error: error.message });
  }
};

