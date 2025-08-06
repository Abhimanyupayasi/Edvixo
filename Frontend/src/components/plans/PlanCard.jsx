// components/plans/PlanCard.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiXCircle, FiInfo } from "react-icons/fi";
import { FaRupeeSign, FaStar } from "react-icons/fa";
import { PriceDisplay, humanizeDuration } from "../utils/PlanUtils";
import PlanFeatures from "./PlanFeatures";
import PlanPricingTiers from "./PlanPricingTiers";
import PlanPaymentButton from "./PlanPaymentButton";

const PlanCard = ({ plan }) => {
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const tier = plan.pricingTiers?.[selectedTierIndex];
  const durationText = humanizeDuration(tier?.duration);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
    >
      {/* Plan Header */}
      <PlanHeader plan={plan} tier={tier} durationText={durationText} />
      
      {/* Plan Body */}
      <div className="p-6">
        <p className="text-gray-700 mb-6 line-clamp-3">
          {plan.description || "No description provided"}
        </p>

        {/* Duration Selector */}
        {plan.pricingTiers?.length > 1 && (
          <PlanPricingTiers 
            tiers={plan.pricingTiers} 
            selectedIndex={selectedTierIndex}
            onSelect={setSelectedTierIndex}
          />
        )}

        {/* Features */}
        <PlanFeatures features={plan.features} />

        {/* Payment Button */}
        <PlanPaymentButton 
          plan={plan} 
          tier={tier} 
          durationText={durationText} 
        />
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-500 flex justify-between items-center">
        <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
        <span className="capitalize">{plan.tier}</span>
      </div>
    </motion.div>
  );
};

const PlanHeader = ({ plan, tier, durationText }) => {
  const hasDiscount = tier?.discountPrice > 0 && tier.discountPrice < tier.basePrice;
  const discountPercent = hasDiscount 
    ? Math.round(100 - (tier.discountPrice / tier.basePrice * 100))
    : 0;

  return (
    <div className={`p-6 ${
      plan.tier === 'platinum' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' :
      plan.tier === 'gold' ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900' :
      'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold capitalize">{plan.name}</h3>
          <p className="text-sm opacity-90">{plan.planType} • {plan.tier}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          plan.isActive 
            ? 'bg-white bg-opacity-20' 
            : 'bg-gray-200 bg-opacity-50'
        }`}>
          {plan.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Pricing */}
      <div className="mt-4">
        <div className="flex items-end gap-1">
          <PriceDisplay 
            value={hasDiscount ? tier.discountPrice : tier.basePrice} 
            className="text-3xl font-bold" 
          />
          <span className="text-sm opacity-90 ml-1">/ {durationText}</span>
        </div>
        
        {hasDiscount && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm line-through opacity-80">
              <PriceDisplay value={tier.basePrice} />
            </span>
            <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
              Save {discountPercent}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanCard;