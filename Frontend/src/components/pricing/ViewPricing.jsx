import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { 
  FiRefreshCw, 
  FiCheckCircle, 
  FiXCircle, 
  FiSearch, 
  FiChevronDown,
  FiAlertCircle,
  FiInfo
} from "react-icons/fi";
import { FaRupeeSign, FaStar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

const TABS = [
  { id: "coaching", label: "Coaching" },
  { id: "school", label: "School" },
  { id: "university", label: "University" }
];

const SORTS = [
  { id: "priceAsc", label: "Price: Low → High" },
  { id: "priceDesc", label: "Price: High → Low" },
  { id: "nameAsc", label: "Name: A → Z" },
  { id: "nameDesc", label: "Name: Z → A" }
];

/* ----------------------------- utils/helpers ----------------------------- */
const formatINR = (value) => 
  new Intl.NumberFormat("en-IN", { 
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value ?? 0);

const humanizeDuration = (n) => {
  if (!n) return "Custom";
  if (n === 1) return "Monthly";
  if (n < 12) return `${n} Months`;
  if (n === 12) return "Annual";
  return `${n/12} Years`;
};

const getPrimaryTier = (plan) => {
  const tiers = Array.isArray(plan?.pricingTiers) ? plan.pricingTiers : [];
  return tiers[0] ?? null;
};

const getEffectivePrice = (tier) => {
  if (!tier) return { show: 0, base: 0, hasDiscount: false };
  
  const hasDiscount = tier.discountedPrice > 0 && 
                    tier.discountedPrice < tier.basePrice;

  return {
    show: hasDiscount ? tier.discountedPrice : tier.basePrice,
    base: tier.basePrice,
    hasDiscount,
    discountPercent: hasDiscount 
      ? Math.round(100 - (tier.discountedPrice / tier.basePrice * 100))
      : 0
  };
};

let razorpayLoaded = false;
const ensureRazorpay = () => 
  new Promise((resolve) => {
    if (razorpayLoaded && window.Razorpay) return resolve(true);
    
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      razorpayLoaded = true;
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/* --------------------------------- main ---------------------------------- */
export default function PlansExplorer() {
  const { getToken } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("coaching");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("priceAsc");

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const token = await getToken();
      const { data } = await axios.get(`${BASE_URL}/billing/getAllPlanInfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setPlans(Array.isArray(data) ? data : data?.plans || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setErrorMsg(
        err?.response?.data?.message ||
        "We couldn't fetch plans right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const filteredSortedPlans = useMemo(() => {
    const withinTab = plans.filter((p) => p.planType === activeTab);

    const searched = query.trim()
      ? withinTab.filter((p) => {
          const searchText = `${p.name} ${p.description} ${p.tier} ${p.planType}`.toLowerCase();
          return searchText.includes(query.toLowerCase());
        })
      : withinTab;

    const withPrice = searched.map((p) => {
      const tier = getPrimaryTier(p);
      const { show } = getEffectivePrice(tier);
      return { 
        ...p, 
        __price: show ?? 0, 
        __name: (p.name || "").toLowerCase() 
      };
    });

    switch (sortBy) {
      case "priceAsc": return withPrice.sort((a, b) => a.__price - b.__price);
      case "priceDesc": return withPrice.sort((a, b) => b.__price - a.__price);
      case "nameDesc": return withPrice.sort((a, b) => b.__name.localeCompare(a.__name));
      case "nameAsc":
      default: return withPrice.sort((a, b) => a.__name.localeCompare(b.__name));
    }
  }, [plans, activeTab, query, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Subscription Plans
          </h1>
          <p className="text-gray-600 mt-1">
            Choose the perfect plan for your needs
          </p>
        </div>
        <button
          onClick={fetchPlans}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plans..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-gray-600">
            Sort by:
          </label>
          <div className="relative flex-1">
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* States */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
      ) : errorMsg ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
          <FiAlertCircle className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error loading plans</p>
            <p className="text-sm">{errorMsg}</p>
            <button
              onClick={fetchPlans}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : filteredSortedPlans.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-300">
          <FiInfo className="mx-auto text-gray-400 text-2xl mb-2" />
          <h3 className="text-lg font-medium text-gray-700">
            No {activeTab} plans found
          </h3>
          <p className="text-gray-500 mt-1">
            {query ? "Try a different search term" : "Check back later"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSortedPlans.map((plan) => (
            <PlanCard key={plan._id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);

  const tier = plan.pricingTiers?.[selectedTierIndex] || getPrimaryTier(plan);
  const { show, base, hasDiscount, discountPercent } = getEffectivePrice(tier);
  const durationText = humanizeDuration(tier?.duration);

  const handlePayment = async () => {
    setLoading(true);
    setPaymentStatus(null);
    
    try {
      const token = await getToken();
      
      // 1. Initiate payment with backend
      const { data: paymentInit } = await axios.post(
        `${BASE_URL}/billing/payment/initiate`,
        { 
          planId: plan._id,
          duration: tier.duration 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Ensure Razorpay is loaded
      const razorpayAvailable = await ensureRazorpay();
      if (!razorpayAvailable) {
        throw new Error("Payment service unavailable");
      }

      // 3. Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: (paymentInit?.amount || show) * 100, // in paise
        currency: paymentInit?.currency || 'INR',
        name: "EduConnect Pro",
        description: `${plan.name} (${plan.tier}) - ${durationText}`,
        order_id: paymentInit?.orderId,
        handler: async (response) => {
          try {
            // 4. Verify payment with backend
            await axios.post(
              `${BASE_URL}/billing/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan._id,
                duration: tier.duration
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setPaymentStatus('success');
          } catch (error) {
            console.error('Payment verification failed:', error);
            setPaymentStatus('failed');
          }
        },
        prefill: {
          name: user?.fullName || "Customer",
          email: user?.primaryEmailAddress?.emailAddress || "customer@example.com",
          contact: user?.primaryPhoneNumber?.phoneNumber || "9999999999"
        },
        theme: {
          color: "#4f46e5"
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus('cancelled');
          }
        }
      };

      // 5. Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
    >
      {/* Plan Header */}
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
            <FaRupeeSign className="mb-1" />
            <span className="text-3xl font-bold">{formatINR(show).replace('₹', '')}</span>
            <span className="text-sm opacity-90 ml-1">/ {durationText}</span>
          </div>
          
          {hasDiscount && (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm line-through opacity-80">
                {formatINR(base)}
              </span>
              <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                Save {discountPercent}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Plan Body */}
      <div className="p-6">
        <p className="text-gray-700 mb-6 line-clamp-3">
          {plan.description || "No description provided"}
        </p>

        {/* Duration Selector */}
        {plan.pricingTiers?.length > 1 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Billing Duration</h4>
            <div className="grid grid-cols-2 gap-2">
              {plan.pricingTiers.map((tier, index) => {
                const { show, base, hasDiscount } = getEffectivePrice(tier);
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedTierIndex(index)}
                    className={`p-3 border rounded-lg text-center transition ${
                      selectedTierIndex === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-medium text-sm">
                      {humanizeDuration(tier.duration)}
                    </p>
                    <div className="flex items-center justify-center mt-1">
                      <FaRupeeSign className="text-xs mr-1" />
                      <span className="font-bold">{show.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-gray-500 ml-1">/mo</span>
                    </div>
                    {hasDiscount && (
                      <p className="text-xs text-gray-500 mt-1 line-through">
                        {formatINR(base)}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Features</h4>
          <ul className="space-y-3">
            {plan.features?.slice(0, 5).map((feature, index) => (
              <li key={index} className="flex items-start">
                {feature.included ? (
                  <FiCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                ) : (
                  <FiXCircle className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                )}
                <div>
                  <p className={`text-sm ${
                    feature.included ? 'text-gray-800' : 'text-gray-500'
                  }`}>
                    {feature.name}
                  </p>
                  {feature.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {feature.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={loading || !plan.isActive}
          className={`w-full py-3 rounded-lg font-medium transition ${
            loading
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : plan.isActive
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? 'Processing...' : 'Subscribe Now'}
        </button>

        {/* Payment Status */}
        <AnimatePresence>
          {paymentStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-2 bg-green-50 text-green-700 rounded text-sm"
            >
              Payment successful! Thank you for subscribing.
            </motion.div>
          )}
          {paymentStatus === 'failed' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-2 bg-red-50 text-red-700 rounded text-sm"
            >
              Payment failed. Please try again.
            </motion.div>
          )}
          {paymentStatus === 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-2 bg-yellow-50 text-yellow-700 rounded text-sm"
            >
              Payment cancelled. You can try again anytime.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-500 flex justify-between items-center">
        <span>
          Created: {new Date(plan.createdAt).toLocaleDateString()}
        </span>
        <span className="capitalize">{plan.tier}</span>
      </div>
    </motion.div>
  );
}
