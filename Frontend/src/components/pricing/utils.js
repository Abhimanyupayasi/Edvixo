// components/pricing/utils.js

export const BASE_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

export const TABS = [
  { id: "coaching", label: "Coaching" },
  { id: "school", label: "School" },
  { id: "university", label: "University" },
];

export const SORTS = [
  { id: "priceAsc", label: "Price: Low → High" },
  { id: "priceDesc", label: "Price: High → Low" },
  { id: "nameAsc", label: "Name: A → Z" },
  { id: "nameDesc", label: "Name: Z → A" },
];

export const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value ?? 0);

export const humanizeDuration = (n) => (!n || n === 1 ? "month" : `${n} months`);

export const getPrimaryTier = (plan) => {
  const tiers = Array.isArray(plan?.pricingTiers) ? plan.pricingTiers : [];
  return tiers[0] ?? null;
};

export const getEffectivePrice = (tier) => {
  if (!tier) return { show: 0, base: 0, hasDiscount: false };
  const hasDiscount =
    typeof tier.discountedPrice === "number" &&
    tier.discountedPrice > 0 &&
    tier.discountedPrice < tier.basePrice;
  return {
    show: hasDiscount ? tier.discountedPrice : tier.basePrice,
    base: tier.basePrice,
    hasDiscount,
  };
};

let razorpayLoaded = false;
export const ensureRazorpay = () =>
  new Promise((resolve, reject) => {
    if (razorpayLoaded && window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      razorpayLoaded = true;
      resolve(true);
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
