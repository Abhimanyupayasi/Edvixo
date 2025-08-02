import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import { serverURL } from '../../utils/envExport'

const PaymentButton = ({ plan }) => {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(window.Razorpay)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    setLoading(true)
    setPaymentStatus(null)

    try {
      // 1. Get Clerk token
      const token = await getToken()

      // 2. Initiate payment with backend
      const { data } = await axios.post(
        `${serverURL}/payment/initiate`,
        { planId: plan._id },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // 3. Load Razorpay SDK dynamically
      const Razorpay = await loadRazorpay()

      // 4. Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount * 100,
        currency: data.currency,
        name: 'Your App Name',
        description: `Payment for ${plan.name}`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            // 5. Verify payment with backend
            await axios.post(
              `${serverURL}/payment/verify`,
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                planId: plan._id
              },
              { headers: { Authorization: `Bearer ${token}` } }
            )
            setPaymentStatus('success')
          } catch (error) {
            console.error('Verification failed:', error)
            setPaymentStatus('failed')
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#6366f1'
        }
      }

      // 6. Open Razorpay checkout
      new Razorpay(options).open()
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentStatus('failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md font-medium ${
          loading
            ? 'bg-indigo-300 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        {loading ? 'Processing...' : `Pay ₹${plan.price.amount}`}
      </button>

      {paymentStatus === 'success' && (
        <div className="mt-2 p-2 bg-green-100 text-green-700 rounded-md">
          Payment successful! Your subscription is now active.
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md">
          Payment failed. Please try again.
        </div>
      )}
    </div>
  )
}

export default PaymentButton