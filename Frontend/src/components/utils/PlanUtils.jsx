// components/utils/PlanUtils.js
import { FaRupeeSign } from "react-icons/fa";

export const formatINR = (value) => 
  new Intl.NumberFormat("en-IN", { 
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value ?? 0);

export const humanizeDuration = (n) => {
  if (!n) return "Custom";
  if (n === 1) return "Monthly";
  if (n < 12) return `${n} Months`;
  if (n === 12) return "Annual";
  return `${n/12} Years`;
};

export const PriceDisplay = ({ value, className = "" }) => (
  <span className={`inline-flex items-center ${className}`}>
    <FaRupeeSign className="mr-0.5" />
    {value?.toLocaleString('en-IN') || '0'}
  </span>
);

export const LoadingSkeleton = ({ count = 3 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded mb-6"></div>
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded"></div>
          ))}
        </div>
        <div className="h-10 w-full bg-gray-200 rounded mt-6"></div>
      </div>
    ))}
  </div>
);