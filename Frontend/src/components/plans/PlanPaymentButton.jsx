// components/plans/PlanPaymentButton.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiLoader } from "react-icons/fi";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const PlanPaymentButton = ({ plan, tier, durationText, onPaymentSuccess }) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Reset payment status when plan or tier changes
  useEffect(() => {
    setPaymentStatus(null);
  }, [plan, tier]);

  const handlePayment = async () => {
    setLoading(true);
    setPaymentStatus(null);
    
    try {
      const token = await getToken();
      
      // Step 1: Initiate payment with backend
      const { data: paymentInit } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/billing/payment/initiate`,
        { 
          planId: plan._id, 
          duration: tier.duration,
          metadata: {
            organizationId: user?.publicMetadata?.organizationId,
            userId: user?.id
          }
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      // Step 2: Ensure Razorpay is loaded
      const razorpayAvailable = await ensureRazorpay();
      if (!razorpayAvailable) {
        throw new Error("Payment service unavailable. Please try again later.");
      }

      // Step 3: Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: (paymentInit?.amount || tier.discountPrice || tier.basePrice) * 100,
        currency: paymentInit?.currency || 'INR',
        name: "EduConnect Pro",
        description: `${plan.name} (${plan.tier}) - ${durationText}`,
        order_id: paymentInit?.orderId,
        image: "https://your-app-logo.png",
        handler: async (response) => {
          try {
            // Step 4: Verify payment with backend
            await axios.post(
              `${import.meta.env.VITE_SERVER_URL}/billing/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan._id,
                duration: tier.duration,
                metadata: paymentInit.metadata
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setPaymentStatus('success');
            if (onPaymentSuccess) onPaymentSuccess();
            
            // Redirect to success page or refresh user data
            setTimeout(() => {
              navigate('/payment-success', { state: { plan, tier } });
            }, 2000);
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
        notes: {
          planId: plan._id,
          userId: user?.id,
          organizationId: user?.publicMetadata?.organizationId
        },
        theme: { color: "#4f46e5" },
        modal: { 
          ondismiss: () => {
            setPaymentStatus('cancelled');
          }
        }
      };

      // Step 5: Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
      
      rzp.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        setPaymentStatus('failed');
      });

    } catch (error) {
      console.error('Payment initiation failed:', error);
      setPaymentStatus('failed');
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    if (!plan.isActive) return 'Currently unavailable';
    if (retryCount > 0) return 'Try again';
    return 'Subscribe Now';
  };

  return (
    <div className="w-full">
      <button
        onClick={handlePayment}
        disabled={loading || !plan.isActive}
        className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
          loading
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : plan.isActive
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {loading && <FiLoader className="animate-spin" />}
        {getButtonText()}
      </button>

      <PaymentStatus status={paymentStatus} retryCount={retryCount} />
    </div>
  );
};

const PaymentStatus = ({ status, retryCount }) => {
  const messages = {
    success: {
      text: 'Payment successful! Redirecting...',
      icon: <FiCheckCircle />,
      color: 'green'
    },
    failed: {
      text: retryCount > 1 ? 
        'Payment failed. Please contact support.' : 
        'Payment failed. Please try again.',
      icon: <FiXCircle />,
      color: 'red'
    },
    cancelled: {
      text: 'Payment cancelled. You can try again anytime.',
      icon: <FiAlertCircle />,
      color: 'yellow'
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

// Razorpay loader with retry logic
let razorpayLoaded = false;
let loadingScript = false;
const ensureRazorpay = () => 
  new Promise((resolve) => {
    if (razorpayLoaded && window.Razorpay) return resolve(true);
    if (loadingScript) return resolve(false);

    loadingScript = true;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      razorpayLoaded = true;
      loadingScript = false;
      resolve(true);
    };
    script.onerror = () => {
      loadingScript = false;
      resolve(false);
    };
    document.body.appendChild(script);
  });

export default PlanPaymentButton;