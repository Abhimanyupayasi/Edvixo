import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import {
  FiRefreshCw,
  FiSearch,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import PlanCard from "./PlanCard";
import { LoadingSkeleton } from "../utils/PlanUtils";
import { serverURL } from "../../utils/envExport";

const TABS = [
  { id: "Coaching", label: "🏫 Coaching" },
  { id: "School", label: "📚 School" },
  { id: "College", label: "🎓 College" },
];

const SORTS = [
  { id: "priceAsc", label: "Price: Low → High" },
  { id: "priceDesc", label: "Price: High → Low" },
  { id: "nameAsc", label: "Name: A → Z" },
  { id: "nameDesc", label: "Name: Z → A" },
  { id: "popular", label: "Most Popular" },
];

const PlansExplorer = () => {
  const { getToken } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("Coaching");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const token = await getToken();
      const { data } = await axios.get(`${serverURL}/billing/getAllPlans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to fetch plans. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const filteredSortedPlans = useMemo(() => {
    const activePlanGroup = plans.find(p => p.type === activeTab);
    const tabPlans = activePlanGroup?.plans || [];

    const searched = query.trim()
      ? tabPlans.filter(p =>
        `${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase()))
      : tabPlans;

    return searched.sort((a, b) => {
      const aPrice = a.pricingTiers?.[0]?.discountPrice || a.pricingTiers?.[0]?.basePrice || 0;
      const bPrice = b.pricingTiers?.[0]?.discountPrice || b.pricingTiers?.[0]?.basePrice || 0;

      switch (sortBy) {
        case "priceAsc": return aPrice - bPrice;
        case "priceDesc": return bPrice - aPrice;
        case "nameDesc": return b.name.localeCompare(a.name);
        case "popular":
          const aDiscount = a.pricingTiers?.[0]?.discountPrice
            ? ((a.pricingTiers[0].basePrice - a.pricingTiers[0].discountPrice) / a.pricingTiers[0].basePrice)
            : 0;
          const bDiscount = b.pricingTiers?.[0]?.discountPrice
            ? ((b.pricingTiers[0].basePrice - b.pricingTiers[0].discountPrice) / b.pricingTiers[0].basePrice)
            : 0;
          return bDiscount - aDiscount || bPrice - aPrice;
        default: return a.name.localeCompare(b.name);
      }
    });
  }, [plans, activeTab, query, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8 lg:px-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700">Education Plans</h1>
          <p className="text-sm text-gray-500 mt-1">Discover the perfect learning path for your goals.</p>
        </div>
        <button
          onClick={fetchPlans}
          disabled={loading}
          className={`btn btn-outline text-blue-600 border-blue-300 hover:bg-blue-50 ${loading ? "loading" : ""}`}
        >
          {!loading && <FiRefreshCw className="mr-2" />}
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn btn-sm md:btn-md rounded-full transition-all ${
              activeTab === tab.id
                ? "bg-blue-100 text-blue-800 font-semibold border border-blue-300"
                : "bg-white text-blue-600 border border-blue-100 hover:bg-blue-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plans..."
            className="input text-black w-full pl-10 border border-blue-100 bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          />
          <FiSearch className="absolute top-3 left-3 text-gray-400" />
        </div>
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <label className="label">
            <span className="label-text text-sm text-gray-600">Sort by</span>
          </label>
          <select
          
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select text-blue-800 w-full border border-blue-100 bg-white focus:border-blue-300"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Display Plans */}
      {loading ? (
        <LoadingSkeleton />
      ) : errorMsg ? (
        <div className="alert bg-red-50 border border-red-200 text-red-800 shadow-sm">
          <FiAlertCircle className="text-xl" />
          <div>
            <h3 className="font-bold">Error loading plans</h3>
            <div className="text-xs">{errorMsg}</div>
          </div>
          <button onClick={fetchPlans} className="btn btn-sm btn-outline border-red-300">
            Retry
          </button>
        </div>
      ) : filteredSortedPlans.length === 0 ? (
        <div className="card bg-white border border-gray-100 text-center p-6 shadow-sm">
          <div className="flex flex-col items-center">
            <FiInfo className="text-4xl text-blue-600 mb-2" />
            <h2 className="text-lg font-semibold">No {activeTab} plans found</h2>
            <p className="text-sm">{query ? "Try a different search term." : "Check back later for new plans."}</p>
          </div>
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
};

export default PlansExplorer;
