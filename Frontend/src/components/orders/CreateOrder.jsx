import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

export default function CreateOrderComponent() {
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    amount: 999, // Default amount in rupees
    currency: 'INR',
    planType: 'premium',
    tier: 'college',
    organizationName: '',
    organizationType: 'school'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get fresh token
      const token = await getToken();
      
  const base = import.meta.env.VITE_SERVER_URL || '';
  const response = await fetch(`${base}/payments/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrder(data.order);
      
      // Initialize Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Your Razorpay key
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Your App Name",
        description: `Purchase ${formData.planType} Plan`,
        order_id: data.order.id,
        handler: function(response) {
          // This will be handled by your verifyPayment endpoint
          console.log('Payment successful:', response);
          alert('Payment successful!');
        },
        prefill: {
          name: "Customer Name", // You can get this from Clerk user
          email: "customer@example.com", // Get from Clerk user
          contact: "9000000000"
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (err) {
      setError(err.message);
      console.error('Order creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="create-order-container">
      <h2>Create Payment Order</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Currency</label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Plan Type</label>
          <select
            name="planType"
            value={formData.planType}
            onChange={handleChange}
          >
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Tier</label>
          <select
            name="tier"
            value={formData.tier}
            onChange={handleChange}
          >
            <option value="school">School</option>
            <option value="college">College</option>
            <option value="university">University</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Organization Name</label>
          <input
            type="text"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Order...' : 'Create Order & Pay'}
        </button>
        
        {error && <div className="error-message">{error}</div>}
      </form>
      
      {order && (
        <div className="order-details">
          <h3>Order Created</h3>
          <p>Order ID: {order.id}</p>
          <p>Amount: {order.amount / 100} {order.currency}</p>
        </div>
      )}
    </div>
  );
}