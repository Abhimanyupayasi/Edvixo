import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { serverURL } from '../utils/envExport';

const usePurchasedPlans = () => {
  const { getToken } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const res = await axios.get(`${serverURL || 'http://localhost:8000'}/billing/my/purchased-plans`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPlans(res.data.plans || []);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getToken]);

  return { plans, loading, error };
};

export default usePurchasedPlans;
