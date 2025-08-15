import { FiCreditCard, FiCheckCircle, FiClock, FiAlertTriangle, FiDownload, FiTrendingUp, FiPackage } from 'react-icons/fi';
import usePayments from '../hooks/usePayments';
import useFeatures from '../hooks/useFeatures';
import { generateInvoicePdf } from '../utils/pdfGenerator';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import FeatureCard from './utils/FeatureCard'; // Import the new component
import MyPurchasedPlans from './plans/MyPurchasedPlans';

const StatCard = ({ icon, title, value, desc, color }) => (
  <div className={`stat shadow-lg rounded-2xl bg-base-100 border-l-4 ${color} transition-transform transform hover:scale-105`}>
    <div className="stat-figure text-3xl">{icon}</div>
    <div className="stat-title text-base-content/70">{title}</div>
    <div className="stat-value text-2xl font-bold">{value}</div>
    {desc && <div className="stat-desc text-base-content/60">{desc}</div>}
  </div>
);

const SubscriptionCard = ({ payment, onDownloadInvoice }) => {
  const now = new Date();
  const end = new Date(payment.subscriptionEnd);
  const start = new Date(payment.subscriptionStart);
  
  const totalDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  const progress = Math.max(0, Math.min(100, ((totalDuration - daysLeft) / totalDuration) * 100));

  const getProgressColor = () => {
    if (daysLeft <= 0) return 'progress-error';
    if (daysLeft <= 30) return 'progress-warning';
    return 'progress-success';
  };

  return (
    <div className="card bg-base-100 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h2 className="card-title text-lg font-bold">{payment.notes?.planName || 'N/A'}</h2>
          <div className="badge badge-primary badge-outline">{payment.pricingTier?.duration} months</div>
        </div>
        <p className="text-sm text-base-content/60">
          Expires on: {end.toLocaleDateString()}
        </p>
        
        <div className="my-4">
          <div className="flex justify-between text-xs text-base-content/70 mb-1">
            <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</span>
            <span>{totalDuration} days total</span>
          </div>
          <progress 
            className={`progress ${getProgressColor()} w-full`} 
            value={progress} 
            max="100"
          ></progress>
        </div>

        <div className="card-actions justify-end mt-4">
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => onDownloadInvoice(payment)}
          >
            <FiDownload /> Invoice
          </button>
        </div>
      </div>
    </div>
  );
};


const Dashboard = () => {
  const { payments, loading: loadingPayments, error: errorPayments } = usePayments();
  const { features, isLoading: isLoadingFeatures, error: errorFeatures } = useFeatures();
  const paymentsList = Array.isArray(payments) ? payments : [];
  const featuresList = Array.isArray(features) ? features : [];
  const { user } = useUser();

  const now = new Date();
  const activeSubscriptions = paymentsList.filter(p => new Date(p.subscriptionEnd) > now);
  const totalSpent = paymentsList.reduce((acc, p) => acc + (Number(p.amount) || 0), 0).toFixed(2);

  const getStatusBadge = (endDate) => {
    const end = new Date(endDate);
    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      return <div className="badge badge-error gap-2"><FiAlertTriangle />Expired</div>;
    }
    if (daysLeft <= 30) {
      return <div className="badge badge-warning gap-2"><FiClock />Expires Soon</div>;
    }
    return <div className="badge badge-success gap-2"><FiCheckCircle />Active</div>;
  };

  const handleDownloadInvoice = (payment) => {
    const paymentDetails = {
      plan: { name: payment.notes?.planName || 'N/A' },
      tier: payment.pricingTier || { name: '' },
      payment: payment,
      user: { fullName: user?.fullName, email: user?.primaryEmailAddress?.emailAddress }
    };
    generateInvoicePdf(paymentDetails);
  };

  if (loadingPayments) {
    return (
      <div className="flex justify-center items-center h-screen bg-base-200">
        <span className="loading loading-lg loading-spinner text-primary"></span>
      </div>
    );
  }

  const combinedError = errorPayments || errorFeatures;
  if (combinedError) {
    return (
      <div role="alert" className="alert alert-error max-w-2xl mx-auto mt-10">
        <FiAlertTriangle />
        <span><strong>Error:</strong> {combinedError.message || combinedError}</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-base-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Welcome, {user?.firstName || 'User'}!</h1>
        <p className="text-base-content/60 mb-8">Here's a summary of your account and subscriptions.</p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard
            icon={<FiPackage />}
            title="Active Subscriptions"
            value={activeSubscriptions.length}
            color="border-primary"
          />
          <StatCard
            icon={<FiTrendingUp />}
            title="Total Spent"
            value={`₹${totalSpent}`}
            color="border-success"
          />
           <StatCard
            icon={<FiCreditCard />}
            title="Total Transactions"
            value={paymentsList.length}
            color="border-info"
          />
        </div>

        {/* Your Features Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Your Features</h2>
          {isLoadingFeatures ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Skeleton Loader */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-40 w-full"></div>
              ))}
            </div>
      ) : featuresList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuresList.map(feature => (
                <FeatureCard key={feature.key} feature={feature} />
              ))}
            </div>
          ) : (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body items-center text-center">
                <p className="text-base-content/70">You have no active features. Purchase a plan to get started.</p>
                <Link to="/pricing" className="btn btn-primary mt-4">Explore Plans</Link>
              </div>
            </div>
          )}
        </div>

        {/* Purchased Plans */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Your Plans</h2>
          <MyPurchasedPlans />
        </div>

        {/* Active Subscriptions */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Your Active Subscriptions</h2>
          {activeSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSubscriptions.map(sub => (
                <SubscriptionCard 
                  key={sub._id} 
                  payment={sub} 
                  onDownloadInvoice={handleDownloadInvoice}
                />
              ))}
            </div>
          ) : (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body items-center text-center">
                <p className="text-base-content/70">You have no active subscriptions.</p>
                <Link to="/pricing" className="btn btn-primary mt-4">Explore Plans</Link>
              </div>
            </div>
          )}
        </div>


        {/* Billing History */}
        <details className="card bg-base-100 shadow-xl collapse collapse-arrow border border-base-300">
          <summary className="collapse-title text-xl font-medium">
            Full Billing History
          </summary>
          <div className="collapse-content">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Payment Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsList.length > 0 ? (
                    paymentsList.map((payment) => (
                      <tr key={payment._id} className="hover">
                        <td className="font-mono text-xs">{payment.invoiceId}</td>
                        <td>
                          <div className="font-bold">{payment.notes?.planName || 'Plan Name Not Available'}</div>
                          <div className="text-sm opacity-50">{payment.pricingTier?.duration ? `${payment.pricingTier.duration} months` : 'Duration not available'}</div>
                        </td>
                        <td>₹{payment.amount}</td>
                        <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        <td>{getStatusBadge(payment.subscriptionEnd)}</td>
                        <td>
                          <button 
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleDownloadInvoice(payment)}
                          >
                            <FiDownload /> Invoice
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-8">
                        No payment history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default Dashboard;