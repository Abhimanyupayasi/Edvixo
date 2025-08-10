import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { serverURL } from '../utils/envExport';

const usePlanDetails = (planId) => {
  const { getToken } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!planId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const res = await axios.get(`${serverURL || 'http://localhost:8000'}/billing/my/plan/${planId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPlan(res.data.plan || null);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [planId, getToken]);

  return { plan, loading, error };
};

export default usePlanDetails;
