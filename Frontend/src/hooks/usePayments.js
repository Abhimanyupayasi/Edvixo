import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { serverURL } from '../utils/envExport';

const usePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const response = await axios.get(`${serverURL}/payments/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPayments(response.data.payments);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch payment history.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [getToken]);

  return { payments, loading, error };
};

export default usePayments;
