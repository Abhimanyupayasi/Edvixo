import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { serverURL } from '../utils/envExport';

export default function useMyInstitutions(planId){
  const { getToken } = useAuth();
  const [data,setData] = useState([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);

  useEffect(()=>{
    (async()=>{
      setLoading(true); setError(null);
      try {
        const token = await getToken();
        const res = await axios.get(`${serverURL || 'http://localhost:8000'}/institutions/mine${planId ? `?planId=${planId}`:''}`, { headers:{ Authorization:`Bearer ${token}` }});
        setData(res.data.data || []);
      } catch(e){ setError(e); }
      finally { setLoading(false); }
    })();
  },[planId, getToken]);

  return { institutions:data, loading, error };
}
