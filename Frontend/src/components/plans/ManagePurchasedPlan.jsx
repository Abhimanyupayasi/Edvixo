import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import usePlanDetails from '../../hooks/usePlanDetails';
import useMyInstitutions from '../../hooks/useMyInstitutions';
import { FiArrowLeft, FiRefreshCw, FiSearch, FiGrid, FiList, FiClock, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const Skeleton = () => (
  <div className="animate-pulse space-y-6 max-w-5xl mx-auto">
    <div className="h-10 w-64 bg-base-300 rounded" />
    <div className="grid md:grid-cols-3 gap-6">
      {[...Array(3)].map((_,i)=>(<div key={i} className="h-48 bg-base-300 rounded" />))}
    </div>
    <div className="h-96 bg-base-300 rounded" />
  </div>
);

const statusBadge = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const daysLeft = Math.ceil((end - now)/(1000*60*60*24));
  if (daysLeft <= 0) return { label: 'Expired', color: 'badge-error', icon: <FiAlertTriangle /> };
  if (daysLeft <= 30) return { label: `${daysLeft}d left`, color: 'badge-warning', icon: <FiClock /> };
  return { label: `${daysLeft}d left`, color: 'badge-success', icon: <FiCheckCircle /> };
};

const ManagePurchasedPlan = () => {
  const { planId } = useParams();
  const { plan, loading, error } = usePlanDetails(planId);
  const { institutions, error: instError } = useMyInstitutions(planId);
  const [view, setView] = useState('grid');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = useMemo(()=>{
    if (!plan) return [];
    const set = new Set(plan.features.map(f => f.category || 'General'));
    return ['All', ...Array.from(set).sort()];
  },[plan]);

  const filtered = useMemo(()=>{
    if (!plan) return [];
    return plan.features.filter(f => {
      const matchQ = !query || f.title.toLowerCase().includes(query.toLowerCase()) || f.description.toLowerCase().includes(query.toLowerCase()) || f.key.toLowerCase().includes(query.toLowerCase());
      const cat = f.category || 'General';
      const matchC = categoryFilter === 'All' || cat === categoryFilter;
      return matchQ && matchC;
    });
  },[plan, query, categoryFilter]);

  if (loading) return <Skeleton />;
  if (error) return <div className="alert alert-error max-w-3xl mx-auto mt-6">Failed to load plan.</div>;
  if (!plan) return <div className="py-12 text-center">Plan not found.</div>;

  const sub = plan.subscription;
  const badge = statusBadge(sub.subscriptionEnd);
  const totalDays = Math.ceil((new Date(sub.subscriptionEnd) - new Date(sub.subscriptionStart))/(1000*60*60*24));
  const daysUsed = Math.max(0, totalDays - Math.ceil((new Date(sub.subscriptionEnd) - Date.now())/(1000*60*60*24)));
  const progress = Math.min(100, Math.max(0, (daysUsed/totalDays)*100));

  return (
    <div className="max-w-7xl mx-auto px-4 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link to="/dashboard" className="btn btn-sm btn-ghost"><FiArrowLeft /> Back</Link>
            <h1 className="text-3xl font-bold tracking-tight">{plan.name}</h1>
            <div className={`badge ${badge.color} gap-1`}>{badge.icon}{badge.label}</div>
          </div>
          <p className="text-sm opacity-70">Plan Type: {plan.parentPlanType}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-outline btn-sm"><FiRefreshCw className="text-info"/> Renew</button>
          <Link to="/plans" className="btn btn-primary btn-sm">Upgrade</Link>
          {instError && <div className="text-error text-xs">Institution load failed</div>}
          {(() => {
            const published = institutions.find(i=>i.status==='published');
            if (published) {
              return <div className="flex flex-col gap-1 items-start">
                <div className="flex gap-2">
                  <Link to={published.publicUrl.replace(/^.*\/public-site/, '/public-site')} className="btn btn-accent btn-sm" target="_blank">View Website</Link>
                  <Link to={`/my-plan/${planId}/update-website`} className="btn btn-outline btn-sm">Update</Link>
                </div>
                <SiteIdDisplay id={published._id} label="Site ID" />
              </div>;
            }
            const draft = institutions.find(i=>i.status==='draft');
            if (draft) {
              return <div className="flex flex-col gap-1 items-start">
                <Link to={`/my-plan/${planId}/update-website`} className="btn btn-secondary btn-sm">Update Draft</Link>
                <SiteIdDisplay id={draft._id} label="Draft ID" />
              </div>;
            }
            return <Link to={`/my-plan/${planId}/update-website`} className="btn btn-secondary btn-sm">Build Website</Link>;
          })()}
        </div>
      </div>

      {/* Top cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="card bg-base-100 shadow-lg border border-base-300">
          <div className="card-body">
            <h3 className="card-title text-sm font-semibold">Subscription</h3>
            <div className="text-xs opacity-70">Started {new Date(sub.subscriptionStart).toLocaleDateString()}</div>
            <div className="text-xs opacity-70 mb-2">Ends {new Date(sub.subscriptionEnd).toLocaleDateString()}</div>
            <progress className="progress progress-primary w-full" value={progress} max="100"></progress>
            <div className="text-xs flex justify-between mt-1 opacity-70"><span>{Math.floor(progress)}% used</span><span>{totalDays} days</span></div>
            {institutions.length > 0 && (
              <div className="mt-3 text-xs space-y-2">
                {institutions.map(inst => (
                  <div key={inst._id} className="border rounded p-2 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{inst.name}</span>
                      <span className={`badge badge-${inst.status==='published'?'success':'warning'} badge-sm`}>{inst.status}</span>
                    </div>
                    <SiteIdDisplay id={inst._id} compact label={inst.status==='published' ? 'Site ID' : 'Draft ID'} />
                    {inst.publicUrl && inst.status==='published' && (
                      <div className="flex items-center gap-2">
                        <Link to={inst.publicUrl.replace(/^.*\/public-site/, '/public-site')} className="link link-primary" target="_blank">Open</Link>
                        <code className="truncate text-[10px] opacity-70">{inst.publicUrl}</code>
                      </div>
                    )}
                    {inst.status!=='published' && (
                      <Link to={`/my-plan/${planId}/update-website`} className="link">Continue Draft</Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg border border-base-300">
          <div className="card-body">
            <h3 className="card-title text-sm font-semibold">Tier</h3>
            <div className="text-2xl font-bold">{sub.tier?.duration}m</div>
            <div className="text-xs opacity-70">Duration</div>
            <div className="divider my-2" />
            <div className="font-semibold">₹{sub.amount}</div>
            <div className="text-xs opacity-70">Paid</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg border border-base-300">
          <div className="card-body">
            <h3 className="card-title text-sm font-semibold">Feature Summary</h3>
            <div className="text-3xl font-bold">{plan.features.length}</div>
            <div className="text-xs opacity-70 mb-2">Included Features</div>
            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
              {categories.filter(c=>c!=='All').slice(0,6).map(c => <span key={c} className="badge badge-outline text-xs">{c}</span>)}
              {categories.length > 7 && <span className="badge badge-neutral badge-outline text-xs">+{categories.length-7}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
        <div className="form-control w-full md:max-w-xs">
          <label className="label"><span className="label-text text-sm font-semibold">Search Features</span></label>
          <label className="input input-bordered flex items-center gap-2">
            <FiSearch className="opacity-70" />
            <input value={query} onChange={e=>setQuery(e.target.value)} type="text" className="grow" placeholder="Title / key / text" />
            {query && <button onClick={()=>setQuery('')} className="btn btn-ghost btn-xs">Clear</button>}
          </label>
        </div>
        <div className="form-control w-full md:max-w-xs">
          <label className="label"><span className="label-text text-sm font-semibold">Category</span></label>
          <select className="select select-bordered" value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <div className="btn-group">
            <button className={`btn btn-sm ${view==='grid'?'btn-active':''}`} onClick={()=>setView('grid')}><FiGrid/></button>
            <button className={`btn btn-sm ${view==='list'?'btn-active':''}`} onClick={()=>setView('list')}><FiList/></button>
          </div>
        </div>
      </div>

      {/* Feature list */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Features ({filtered.length})</h2>
        {filtered.length === 0 && (
          <div className="alert alert-info">No features match your filters.</div>
        )}
        {view === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(f => <FeatureCard key={f.key} f={f} />)}
          </div>
        ) : (
          <div className="card bg-base-100 shadow-sm">
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(f => (
                    <tr key={f.key} className="hover">
                      <td className="font-medium">{f.title}</td>
                      <td><span className="badge badge-outline text-xs">{f.category || 'General'}</span></td>
                      <td className="max-w-xs whitespace-normal text-xs opacity-80">{f.description}</td>
                      <td><LaunchButton feature={f} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Card for grid view
const FeatureCard = ({ f }) => (
  <div className="card bg-base-100 border border-base-300 hover:shadow-xl transition relative group">
    <div className="card-body p-5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold leading-tight text-base line-clamp-2">{f.title}</h3>
        <span className="badge badge-outline text-xs shrink-0">{f.category || 'General'}</span>
      </div>
      <p className="text-xs opacity-70 line-clamp-3 mb-4">{f.description}</p>
      <div className="card-actions justify-end">
        <LaunchButton feature={f} />
      </div>
    </div>
  </div>
);

// Placeholder launch button (wire real routes later)
const LaunchButton = ({ feature }) => (
  <button className="btn btn-xs btn-primary">Open</button>
);

// Displays site/draft id with copy button
const SiteIdDisplay = ({ id, label='Site ID', compact=false }) => {
  if(!id) return null;
  const short = id.slice(-6);
  const copy = () => navigator.clipboard.writeText(id).catch(()=>{});
  if (compact) {
    return (
      <div className="flex items-center gap-1 text-[10px] opacity-70">
        <span>{label}:</span>
        <code className="px-1 bg-base-200 rounded">…{short}</code>
        <button onClick={copy} className="btn btn-ghost btn-[6px] btn-xs" title="Copy ID">✂</button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] opacity-70">{label}:</span>
      <code className="text-[11px] bg-base-200 px-2 py-1 rounded break-all">{id}</code>
      <button onClick={copy} className="btn btn-xs" title="Copy full ID">Copy</button>
    </div>
  );
};

export default ManagePurchasedPlan;
