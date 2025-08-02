import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiCopy,
  FiCheck,
  FiEdit3,
  FiLayers,
  FiTag,
  FiActivity,
  FiCalendar,
  FiAlertCircle,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

// Pass baseUrl or set via Vite env. Example: VITE_SERVER_URL=https://api.example.com
const FALLBACK_BASE = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

/**
 * Props:
 *  - planId?: string                // optional; if absent, read from route param ":id"
 *  - baseUrl?: string               // optional; defaults to env or localhost
 *  - onBack?: () => void            // optional; show Back button if provided
 *  - onEdit?: (plan) => void        // optional; show Edit button if provided
 */
export default function ViewPlanByID({
  planId: planIdProp,
  baseUrl = FALLBACK_BASE,
  onBack,
  onEdit,
}) {
  const { id: planIdFromRoute } = useParams();
  const planId = planIdProp || planIdFromRoute;

  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [plan, setPlan] = useState(null);

  const [copiedKey, setCopiedKey] = useState(""); // "id" | "price"

  const formatINR = (amount = 0, currency = "INR") => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(Number(amount) || 0);
    } catch {
      return `${amount} ${currency}`;
    }
  };

  const fetchPlans = async () => {
    if (!planId) {
      setErrorMsg("No Plan ID provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const token = await getToken();
      const res = await axios.get(`${baseUrl}/billing/getAllPlanInfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const list = Array.isArray(res.data) ? res.data : res.data?.plans || [];
      const found =
        list.find((p) => p._id === planId || p.id === planId) ||
        list.find((p) => String(p._id || p.id) === String(planId));
      setPlan(found || null);
      if (!found) setErrorMsg("Plan not found.");
    } catch (err) {
      console.error("Fetch error:", err);
      setErrorMsg(
        err?.response?.data?.error || err.message || "Failed to fetch plan"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, baseUrl]);

  const stats = useMemo(() => {
    if (!plan) return null;
    const priceAmt = Number(plan?.price?.amount) || 0;
    return {
      price: formatINR(priceAmt, plan?.price?.currency || "INR"),
      status: plan?.isActive ? "Active" : "Inactive",
      planType: plan?.planType,
      tier: plan?.tier,
      createdAt: plan?.createdAt ? new Date(plan.createdAt) : null,
      updatedAt: plan?.updatedAt ? new Date(plan.updatedAt) : null,
    };
  }, [plan]);

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch (e) {
      console.warn("Copy failed", e);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Brand light background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50 to-purple-50" />
        <div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-60"
          style={{ background: "radial-gradient(closest-side, #9333EA33, transparent)" }}
        />
        <div
          className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full blur-3xl opacity-60"
          style={{ background: "radial-gradient(closest-side, #34D39933, transparent)" }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full blur-3xl opacity-60"
          style={{ background: "radial-gradient(closest-side, #FACC1533, transparent)" }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            {onBack && (
              <button className="btn btn-ghost" onClick={onBack} aria-label="Back">
                <FiArrowLeft /> Back
              </button>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              <span className="bg-gradient-to-r from-[#9333EA] via-[#FACC15] to-[#34D399] bg-clip-text text-transparent">
                Plan Details
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && plan && (
              <button className="btn btn-outline" onClick={() => onEdit(plan)}>
                <FiEdit3 /> Edit
              </button>
            )}
          </div>
        </div>

        {/* Content States */}
        {loading ? (
          <SkeletonView />
        ) : errorMsg ? (
          <div className="alert alert-error shadow">
            <FiAlertCircle />
            <span>{errorMsg}</span>
          </div>
        ) : !plan ? (
          <div className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur-xl shadow-xl p-10 text-center">
            <div className="text-5xl mb-3">🤷‍♂️</div>
            <h3 className="text-xl font-bold text-slate-900">Plan not found</h3>
            <p className="mt-1 text-slate-600">Check the Plan ID and try again.</p>
          </div>
        ) : (
          <>
            {/* Hero Card */}
            <div className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur-xl shadow-xl overflow-hidden">
              {/* Gradient strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#9333EA] via-[#FACC15] to-[#34D399]" />
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{plan.name || "Untitled Plan"}</h2>
                    <p className="mt-1 text-slate-600 max-w-2xl">
                      {plan.description || "No description provided."}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {stats?.planType && (
                        <span className="badge badge-primary capitalize">
                          <FiLayers className="mr-1" /> {stats.planType}
                        </span>
                      )}
                      {stats?.tier && (
                        <span className="badge badge-secondary capitalize">
                          <FiTag className="mr-1" /> {stats.tier}
                        </span>
                      )}
                      <span
                        className={`badge ${plan.isActive ? "badge-success" : "badge-ghost"} gap-1`}
                        title={plan.isActive ? "Active" : "Inactive"}
                      >
                        <FiActivity />
                        {stats?.status}
                      </span>
                    </div>
                  </div>

                  {/* Price block */}
                  <div className="rounded-xl border border-black/10 bg-white/70 p-4 min-w-[220px]">
                    <div className="text-sm text-slate-500">Price / month</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <div className="text-3xl font-extrabold text-slate-900">
                        {stats?.price}
                      </div>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleCopy(stats?.price || "", "price")}
                        aria-label="Copy price"
                        title="Copy price"
                      >
                        {copiedKey === "price" ? <FiCheck /> : <FiCopy />}
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Currency: {plan?.price?.currency || "INR"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Left: Features */}
              <div className="lg:col-span-2 rounded-2xl border border-black/10 bg-white/80 backdrop-blur-xl shadow-xl p-6">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Features
                </h3>
                <ul className="mt-3 space-y-2">
                  {(plan.features || []).length === 0 ? (
                    <li className="text-slate-500">No features listed.</li>
                  ) : (
                    plan.features.map((f, i) => (
                      <li key={i} className="flex items-start">
                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${f.included ? "bg-[#34D399]" : "bg-slate-300"}`} />
                        <span
                          className={`ml-2 text-sm ${
                            f.included ? "text-slate-800" : "text-slate-400 line-through"
                          }`}
                        >
                          {f.name}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Right: Meta */}
              <div className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur-xl shadow-xl p-6">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Plan Info
                </h3>
                <div className="mt-3 space-y-3 text-sm">
                  <MetaRow
                    label="Plan ID"
                    value={String(plan._id || plan.id || "—")}
                    icon={<FiTag />}
                    copyKey="id"
                    onCopy={handleCopy}
                    copiedKey={copiedKey}
                  />
                  <MetaRow
                    label="Status"
                    value={plan.isActive ? "Active" : "Inactive"}
                    icon={plan.isActive ? <FiCheckCircle className="text-green-600" /> : <FiXCircle />}
                  />
                  <MetaRow
                    label="Type"
                    value={plan.planType || "—"}
                    icon={<FiLayers />}
                  />
                  <MetaRow
                    label="Tier"
                    value={plan.tier || "—"}
                    icon={<FiTag />}
                  />
                  <MetaRow
                    label="Created"
                    value={stats?.createdAt ? stats.createdAt.toLocaleString() : "—"}
                    icon={<FiCalendar />}
                  />
                  <MetaRow
                    label="Updated"
                    value={stats?.updatedAt ? stats.updatedAt.toLocaleString() : "—"}
                    icon={<FiCalendar />}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function MetaRow({ label, value, icon, copyKey, onCopy, copiedKey }) {
  const canCopy = !!copyKey && !!value && value !== "—";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white/70 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-slate-500">{icon}</span>
        <span className="text-slate-500">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium text-slate-800 truncate max-w-[220px]" title={value}>
          {value}
        </span>
        {canCopy && (
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => onCopy(value, copyKey)}
            aria-label={`Copy ${label}`}
            title={`Copy ${label}`}
          >
            {copiedKey === copyKey ? <FiCheck /> : <FiCopy />}
          </button>
        )}
      </div>
    </div>
  );
}

function SkeletonView() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="p-6 animate-pulse">
          <div className="h-6 w-1/2 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-5/6 bg-slate-200 rounded mb-4" />
          <div className="h-10 w-48 bg-slate-200 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-black/10 bg-white/80 backdrop-blur-xl shadow-xl p-6 animate-pulse">
          <div className="h-4 w-28 bg-slate-200 rounded mb-4" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-slate-200 rounded" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur-xl shadow-xl p-6 animate-pulse">
          <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-full bg-slate-200 rounded mb-2" />
          ))}
        </div>
      </div>
    </div>
  );
}
