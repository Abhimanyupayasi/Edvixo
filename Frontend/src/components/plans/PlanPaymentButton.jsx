// components/plans/PlanPaymentButton.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiLoader } from "react-icons/fi";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import usePayment from "../../hooks/usePayment";
import useRazorpay from "../../hooks/useRazorpay";

const PlanPaymentButton = ({ plan, tier, durationText, onPaymentSuccess }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { createOrder, verifyPayment, loading, error: paymentError } = usePayment();
  const isRazorpayLoaded = useRazorpay();
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    if (!isRazorpayLoaded) {
      // You could show a subtle loader or disable the button until the script is loaded.
      console.log("Razorpay script is loading...");
    }
  }, [isRazorpayLoaded]);

  const handlePayment = async () => {
    setPaymentStatus(null);

    if (!user) {
      navigate('/sign-in');
      return;
    }

    if (!isRazorpayLoaded) {
      console.error('Razorpay script not loaded yet.');
      // Optionally, set a status to inform the user
      setPaymentStatus('error'); 
      return;
    }

    const organizationType = (tier?.name || 'other').toLowerCase();
    const orderDetails = {
      amount: tier.discountPrice || tier.basePrice,
      currency: 'INR',
      plan: plan, // Send the whole plan object
      tier: tier, // Send the whole tier object
      organizationName: user.publicMetadata?.organizationName || 'Default Org',
      organizationType: organizationType,
    };

    const razorpayOrder = await createOrder(orderDetails);

    if (razorpayOrder) {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "EduConnect Pro",
        description: `${plan.name} - ${durationText}`,
        order_id: razorpayOrder.id,
        image: "https://your-app-logo.png",
        handler: async (response) => {
          const verificationData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          };
          const result = await verifyPayment(verificationData);
          if (result) {
            setPaymentStatus('success');
            if (onPaymentSuccess) onPaymentSuccess();
            setTimeout(() => {
              navigate('/payment-success', { state: { plan, tier, payment: result.payment } });
            }, 2000);
          } else {
            setPaymentStatus('failed');
          }
        },
        prefill: {
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          contact: user.primaryPhoneNumber?.phoneNumber,
        },
        notes: {
          planId: plan._id,
          userId: user.id,
          organizationId: user.publicMetadata?.organizationId,
        },
        theme: { color: "#4f46e5" },
        modal: {
          ondismiss: () => {
            setPaymentStatus('cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on('payment.failed', () => {
        setPaymentStatus('failed');
      });
    } else {
      setPaymentStatus('failed');
    }
  };

  const getButtonText = () => {
    if (!isRazorpayLoaded) return 'Initializing Payment...';
    if (loading) return 'Processing...';
    if (!plan.isActive) return 'Currently unavailable';
    return 'Subscribe Now';
  };

  return (
    <div className="w-full">
      <button
        onClick={handlePayment}
        disabled={loading || !plan.isActive || !isRazorpayLoaded}
        className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
          loading || !isRazorpayLoaded
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : plan.isActive
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {(loading || !isRazorpayLoaded) && <FiLoader className="animate-spin" />}
        {getButtonText()}
      </button>

      <PaymentStatus status={paymentStatus} error={paymentError} />
    </div>
  );
};

const PaymentStatus = ({ status, error }) => {
  const messages = {
    success: {
      text: 'Payment successful! Redirecting...',
      icon: <FiCheckCircle />,
      color: 'green'
    },
    failed: {
      text: error || 'Payment failed. Please try again.',
      icon: <FiXCircle />,
      color: 'red'
    },
    cancelled: {
      text: 'Payment cancelled. You can try again anytime.',
      icon: <FiAlertCircle />,
      color: 'yellow'
    },
    error: {
      text: 'Could not initialize payment. Please refresh and try again.',
      icon: <FiXCircle />,
      color: 'red'
    }
  };

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`mt-3 p-3 bg-${messages[status].color}-50 text-${messages[status].color}-700 rounded-lg text-sm flex items-center gap-2 border border-${messages[status].color}-100`}
        >
          {messages[status].icon}
          <span>{messages[status].text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlanPaymentButton;
