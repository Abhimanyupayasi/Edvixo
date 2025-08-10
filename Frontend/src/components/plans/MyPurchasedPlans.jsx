import React from 'react';
import { Link } from 'react-router-dom';
import usePurchasedPlans from '../../hooks/usePurchasedPlans';

const MyPurchasedPlans = () => {
  const { plans, loading, error } = usePurchasedPlans();

  if (loading) return <div className="py-8 text-center">Loading your plans...</div>;
  if (error) return <div className="alert alert-error">Failed to load plans.</div>;

  if (!plans.length) return (
    <div className="card bg-base-100 shadow-md p-6 text-center">
      <p>You have no active plans.</p>
      <Link to="/pricing" className="btn btn-primary mt-4">Explore Plans</Link>
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans.map(p => (
        <div key={p.individualPlanId} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">{p.name}</h3>
            <p className="text-sm opacity-70 mb-2">Type: {p.parentPlanType}</p>
            <ul className="text-sm list-disc ml-4 mb-4 max-h-36 overflow-y-auto">
              {p.features.slice(0,6).map(f => <li key={f.key}>{f.title}</li>)}
              {p.features.length > 6 && <li>+{p.features.length - 6} more</li>}
            </ul>
            <div className="card-actions justify-end">
              <Link to={`/my-plan/${p.individualPlanId}`} className="btn btn-outline btn-sm">Manage</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyPurchasedPlans;
