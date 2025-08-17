import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { serverURL } from '../utils/envExport';

export default function StudentDashboardPage(){
  const { site } = useOutletContext() || { site: null };
  const [data,setData] = useState(null);
  const [error,setError] = useState('');
  const base = serverURL || 'http://localhost:8000';

  async function load(){
    setError('');
    let res = await fetch(`${base}/public/student/me`, { credentials:'include' });
    if (res.status === 401){
      await fetch(`${base}/public/auth/refresh`, { method:'POST', credentials:'include' });
      res = await fetch(`${base}/public/student/me`, { credentials:'include' });
    }
    const json = await res.json();
    if (res.ok && json.success) setData(json.data);
    else setError(json.message || 'Not authenticated');
  }

  useEffect(()=>{ load(); },[]);

  if (error) return <div className="p-6 text-center text-error">{error}</div>;
  if (!data) return <div className="p-6 text-center">Loading...</div>;

  const s = data.student; const inst = data.institution; const scope = data.scope;
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          {inst?.logoUrl && <img src={inst.logoUrl} alt="logo" className="h-10 w-10 rounded" />}
          <div>
            <div className="font-semibold">{inst?.name}</div>
            <div className="text-xs opacity-70 uppercase tracking-wide">{inst?.type}</div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded border">
            <div className="font-semibold mb-2">Student</div>
            <div><span className="opacity-70">Name:</span> {s.name}</div>
            <div><span className="opacity-70">Roll:</span> {s.rollNo}</div>
            {s.admissionNo && <div><span className="opacity-70">Admission:</span> {s.admissionNo}</div>}
            {s.dob && <div><span className="opacity-70">DOB:</span> {new Date(s.dob).toISOString().slice(0,10)}</div>}
            <div><span className="opacity-70">Status:</span> {s.status}</div>
          </div>
          <div className="p-4 rounded border">
            <div className="font-semibold mb-2">Academics</div>
            {scope ? (
              <div>
                <div><span className="opacity-70">Type:</span> {scope.type}</div>
                <div><span className="opacity-70">Name:</span> {scope.name}</div>
                {scope.section && <div><span className="opacity-70">Section:</span> {scope.section}</div>}
                {scope.timing && <div><span className="opacity-70">Timing:</span> {scope.timing}</div>}
                {scope.durationMonths && <div><span className="opacity-70">Duration:</span> {scope.durationMonths} months</div>}
              </div>
            ) : <div className="opacity-70">Not assigned</div>}
          </div>
          <div className="p-4 rounded border md:col-span-2">
            <div className="font-semibold mb-2">Fees</div>
            <div><span className="opacity-70">Total:</span> {s.fee?.total ?? 0}</div>
            <div><span className="opacity-70">Paid:</span> {s.fee?.paid ?? 0}</div>
            <div><span className="opacity-70">Currency:</span> {s.fee?.currency || 'INR'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
