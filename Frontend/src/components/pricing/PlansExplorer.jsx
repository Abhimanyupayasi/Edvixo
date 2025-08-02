// components/pricing/PlansExplorer.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { FiRefreshCw, FiAlertCircle, FiSearch, FiChevronDown } from "react-icons/fi";
import SkeletonGrid from "./SkeletonGrid";
import PlanCard from "./PlanCard";
import { BASE_URL, TABS, SORTS, getPrimaryTier, getEffectivePrice } from "./utils";

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
      const res = await axios.get(`${BASE_URL}/billing/getAllPlanInfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = Array.isArray(res.data) ? res.data : res.data?.plans || [];
      setPlans(payload);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to fetch plans.");
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
          const t = (s) => (s || "").toLowerCase();
          return t(p.name + p.description + p.tier + p.planType).includes(t(query));
        })
      : withinTab;

    const withPrice = searched.map((p) => {
      const tier = getPrimaryTier(p);
      const { show } = getEffectivePrice(tier);
      return { ...p, __price: show ?? 0, __name: (p.name || "").toLowerCase() };
    });

    switch (sortBy) {
      case "priceDesc":
        return withPrice.sort((a, b) => b.__price - a.__price);
      case "nameAsc":
        return withPrice.sort((a, b) => a.__name.localeCompare(b.__name));
      case "nameDesc":
        return withPrice.sort((a, b) => b.__name.localeCompare(a.__name));
      case "priceAsc":
      default:
        return withPrice.sort((a, b) => a.__price - b.__price);
    }
  }, [plans, activeTab, query, sortBy]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header & Refresh */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <button
          onClick={fetchPlans}
          className="flex items-center px-3 py-2 bg-gray-800 rounded hover:bg-gray-200"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          <span className="ml-2 text-black">Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm ${
              activeTab === tab.id ? "bg-indigo-600 text-white" : "bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative w-full max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg"
          />
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-2 pl-3 pr-8 border rounded-lg"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Plan Cards */}
      {loading ? (
        <SkeletonGrid />
      ) : errorMsg ? (
        <div className="p-4 text-red-700 bg-red-100 border border-red-200 rounded">
          <FiAlertCircle className="inline mr-2" />
          {errorMsg}
        </div>
      ) : filteredSortedPlans.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No plans found.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSortedPlans.map((plan) => (
            <PlanCard key={plan._id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
