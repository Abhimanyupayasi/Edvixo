import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { serverURL } from '../utils/envExport';

const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const createOrder = async (planDetails) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await axios.post(
        `${serverURL}/payments/orders`,
        planDetails,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.order;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await axios.post(
        `${serverURL}/payments/verify`,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Payment verification failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, verifyPayment, loading, error };
};

export default usePayment;
