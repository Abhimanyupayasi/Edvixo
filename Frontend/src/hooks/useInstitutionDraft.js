import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { serverURL } from '../utils/envExport';

export default function useInstitutionDraft(planId){
  const { getToken } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState(null);

  // load existing institution for plan (one-per-plan rule)
  useEffect(()=>{
    (async()=>{
      if(!planId) return;
      try {
        const token = await getToken();
        const res = await axios.get(`${serverURL || 'http://localhost:8000'}/institutions/mine?planId=${planId}`, { headers:{ Authorization:`Bearer ${token}` }});
        if(res.data?.data?.length){
          setDraft(res.data.data[0]);
        }
      } catch(e){ /* silent */ }
    })();
  },[planId, getToken]);

  const saveDraft = useCallback(async (payload) => {
  const { pages, logoUrl } = payload; // Extract pages and logoUrl from payload
  const body = { ...payload, id: draft?._id }; // Prepare body with id
  if (pages) body.pages = pages; // Add pages if provided
  if (logoUrl) body.logoUrl = logoUrl; // Add logoUrl if provided
    setSaving(true); setError(null);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      if(body.sourcePlanId) headers['x-plan-id'] = body.sourcePlanId;
      const res = await axios.post(`${serverURL || 'http://localhost:8000'}/institutions/draft`, body, { headers });
      setDraft(res.data.data);
      return res.data.data;
    } catch(e){
  console.error('saveDraft error', e.response?.data || e.message);
  setError(e);
      throw e;
    } finally {
      setSaving(false);
    }
  },[getToken]);

  const publish = useCallback(async (id) => {
    setSaving(true); setError(null);
    try {
      const token = await getToken();
      const res = await axios.post(`${serverURL || 'http://localhost:8000'}/institutions/publish/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDraft(res.data.data);
      return res.data.data;
    } catch(e){
      setError(e);
      throw e;
    } finally { setSaving(false); }
  },[getToken]);

  // explicit update (works for published too)
  const update = useCallback(async (payload) => {
    if(!draft?._id) throw new Error('No institution to update');
    setSaving(true); setError(null);
    try {
      const token = await getToken();
      const res = await axios.put(`${serverURL || 'http://localhost:8000'}/institutions/update/${draft._id}`, payload, { headers:{ Authorization:`Bearer ${token}` }}).catch(async err => {
        if (err.response?.status === 404) {
          // fallback: attempt create without stale id
          const draftRes = await axios.post(`${serverURL || 'http://localhost:8000'}/institutions/draft`, { ...payload, id: undefined, sourcePlanId: draft.sourcePlanId }, { headers:{ Authorization:`Bearer ${token}` } });
          return draftRes;
        }
        throw err;
      });
      if(res?.data?.data) setDraft(res.data.data);
      return res?.data?.data;
    } catch(e){ setError(e); throw e; }
    finally { setSaving(false); }
  },[draft, getToken]);

  return { draft, saveDraft, publish, update, saving, error };
}
