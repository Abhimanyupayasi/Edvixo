// src/controllers/userController.js
import Plan from "../models/plan.js";

/**
 * Get billing information (for admin/principle/owner)
 */
export const getBillingInfo = async (req, res) => {
  try {
    // Example: Get all plans with additional admin-only details
    const plans = await Plan.find({}).select('+isActive +createdAt');
    
    // Add any additional admin billing info here
    const billingInfo = {
      totalPlans: plans.length,
      activePlans: plans.filter(p => p.isActive).length,
      plans
    };

    res.json(billingInfo);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch billing information',
      details: error.message 
    });
  }
};

// Add other user-related controller functions as needed
export const getUserProfile = async (req, res) => {
  // Implementation for getting user profile
};

export const updateUserProfile = async (req, res) => {
  // Implementation for updating user profile
};