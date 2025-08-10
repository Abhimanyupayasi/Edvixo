import Plan from '../models/Plan.js';

export const getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.find({}).populate({
            path: 'plans',
            populate: {
                path: 'features.feature',
                model: 'Feature'
            }
        });
            
        if (!plans) {
            return res.status(404).json({ message: 'No plans found' });
        }
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching plans', error: error.message });
    }
};

// Get all purchased (active) individual plans for current user
export const getMyPurchasedPlans = async (req, res) => {
    try {
    const auth = req.auth || (()=>({}));
    const { userId } = typeof auth === 'function' ? auth() : auth;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        // Lazy import to avoid circular
        const Payment = (await import('../models/payment.js')).default;

        const activePayments = await Payment.find({
            clerkUserId: userId,
            subscriptionEnd: { $gt: new Date() }
        }).select('plan subscriptionStart subscriptionEnd pricingTier notes amount currency').lean();

        if (!activePayments.length) return res.status(200).json({ success: true, plans: [] });

        const planIds = activePayments.map(p => p.plan);

        const parentPlans = await Plan.find({ 'plans._id': { $in: planIds } })
            .populate('plans.features.feature')
            .lean();

        const planMap = new Map();

        parentPlans.forEach(group => {
            group.plans.forEach(sub => {
                if (planIds.find(id => id.toString() === sub._id.toString())) {
                    if (!planMap.has(sub._id.toString())) {
                        planMap.set(sub._id.toString(), {
                            individualPlanId: sub._id,
                            parentPlanType: group.type,
                            name: sub.name,
                            description: sub.description,
                            features: (sub.features || []).filter(f => f.isIncluded && f.feature).map(f => ({
                                key: f.feature.key,
                                title: f.feature.title,
                                description: f.feature.description,
                                category: f.feature.category,
                                isIncluded: f.isIncluded
                            })),
                            subscriptions: []
                        });
                    }
                }
            });
        });

        activePayments.forEach(pay => {
            const entry = planMap.get(pay.plan.toString());
            if (entry) {
                entry.subscriptions.push({
                    paymentId: pay._id,
                    subscriptionStart: pay.subscriptionStart,
                        subscriptionEnd: pay.subscriptionEnd,
                    tier: pay.pricingTier,
                    amount: pay.amount,
                    currency: pay.currency,
                    planName: pay.notes?.planName
                });
            }
        });

        res.status(200).json({ success: true, plans: Array.from(planMap.values()) });
    } catch (error) {
        console.error('Error getMyPurchasedPlans:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch purchased plans', error: error.message });
    }
};

// Fetch a single purchased plan (by individual plan id) with its features
export const getIndividualPlanDetails = async (req, res) => {
    try {
        const { planId } = req.params;
    const auth = req.auth || (()=>({}));
    const { userId } = typeof auth === 'function' ? auth() : auth;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const Payment = (await import('../models/payment.js')).default;
        const payment = await Payment.findOne({ plan: planId, clerkUserId: userId, subscriptionEnd: { $gt: new Date() } }).lean();
        if (!payment) return res.status(404).json({ success: false, message: 'No active subscription for this plan' });

        const parent = await Plan.findOne({ 'plans._id': planId })
            .populate('plans.features.feature')
            .lean();
        if (!parent) return res.status(404).json({ success: false, message: 'Plan not found' });

        const sub = parent.plans.find(p => p._id.toString() === planId);
        if (!sub) return res.status(404).json({ success: false, message: 'Sub-plan not found' });

        const featureList = (sub.features || []).filter(f => f.isIncluded && f.feature).map(f => ({
            key: f.feature.key,
            title: f.feature.title,
            description: f.feature.description,
            category: f.feature.category,
            isIncluded: f.isIncluded
        }));

        res.status(200).json({ success: true, plan: {
            individualPlanId: sub._id,
            parentPlanType: parent.type,
            name: sub.name,
            description: sub.description,
            features: featureList,
            subscription: {
                subscriptionStart: payment.subscriptionStart,
                subscriptionEnd: payment.subscriptionEnd,
                tier: payment.pricingTier,
                amount: payment.amount,
                currency: payment.currency,
                planName: payment.notes?.planName
            }
        }});
    } catch (error) {
        console.error('Error getIndividualPlanDetails:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch plan details', error: error.message });
    }
};
