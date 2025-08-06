import { FaRupeeSign } from "react-icons/fa";
import { humanizeDuration } from "../utils/PlanUtils";

const PlanPricingTiers = ({ tiers, selectedIndex, onSelect }) => {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Choose Billing Duration</h4>
      
      <div className="flex flex-wrap gap-3">
        {tiers.map((tier, index) => {
          const isSelected = selectedIndex === index;
          const hasDiscount =
            tier.discountPrice > 0 && tier.discountPrice < tier.basePrice;
          const discountPercent = hasDiscount
            ? Math.round(100 - (tier.discountPrice / tier.basePrice) * 100)
            : 0;

          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={`w-full sm:w-auto px-4 py-3 rounded-lg border transition-all duration-150 flex-1 sm:flex-initial text-left
                ${isSelected
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-base-100 border-base-200 hover:bg-base-200"}`}
            >
              <div className="flex flex-col items-start gap-1">
                <p className="text-sm font-medium capitalize">{humanizeDuration(tier.duration)}</p>
                
                <div className="flex items-center gap-1 text-base font-bold">
                  <FaRupeeSign className="text-sm" />
                  {hasDiscount ? tier.discountPrice : tier.basePrice}
                  <span className="text-xs font-normal text-gray-400">/mo</span>
                </div>

                {hasDiscount && (
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="line-through">{tier.basePrice}</span>
                    <span className="badge badge-success badge-sm">Save {discountPercent}%</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlanPricingTiers;
