import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiCheckCircle, FiDownload } from 'react-icons/fi';
import { generateInvoicePdf } from '../utils/pdfGenerator';
import { useUser } from '@clerk/clerk-react';

const PaymentSuccess = () => {
  const location = useLocation();
  const { user } = useUser();
  const { plan, tier, payment } = location.state || {};

  const handleGeneratePdf = () => {
    if (payment && plan && tier && user) {
      generateInvoicePdf({ plan, tier, payment, user });
    } else {
      alert('Could not generate PDF. Payment details are missing.');
    }
  };

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <FiCheckCircle className="text-green-500 text-6xl mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">Your transaction has been completed.</p>
        <Link
          to="/dashboard"
          className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <FiCheckCircle className="text-green-500 text-7xl mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800">Payment Successful!</h1>
          <p className="text-gray-600 mt-2">Thank you for your purchase. Here are your details.</p>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Plan:</span>
              <span className="font-bold text-gray-800">{plan.name} ({tier.name})</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Amount Paid:</span>
              <span className="font-bold text-gray-800">{payment.currency} {payment.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Payment ID:</span>
              <span className="text-gray-700 font-mono text-sm">{payment.razorpayPaymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Subscription:</span>
              <span className="text-gray-700">
                {new Date(payment.subscriptionStart).toLocaleDateString()} - {new Date(payment.subscriptionEnd).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition text-center"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={handleGeneratePdf}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-700 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition"
          >
            <FiDownload />
            <span>Download Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
