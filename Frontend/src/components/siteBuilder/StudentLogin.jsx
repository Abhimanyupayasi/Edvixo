import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setToken as setStudentToken, clearToken as clearStudentToken, setProfile as setStudentProfile, clearProfile as clearStudentProfile } from '../../store/studentSlice';
import { serverURL } from '../../utils/envExport';

export default function StudentLogin({ site }){
  const [rollNo,setRollNo] = useState('');
  const [dob,setDob] = useState('');
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [profile,setProfile] = useState(null);
  const dispatch = useDispatch();
  const token = useSelector(state => state.student.token);
  const profileState = useSelector(state => state.student.profile);

  const base = serverURL || '';

  async function login(e){
    e.preventDefault();
    setError(''); setLoading(true);
    try{
      const res = await fetch(`${base}/public/auth/login`,{
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        credentials:'include',
        body: JSON.stringify({ rollNo, dob, subdomain: site?.subdomain })
      });
      const json = await res.json();
      if(!res.ok || !json.success){ throw new Error(json.message || 'Login failed'); }
      if (json.access) {
        dispatch(setStudentToken(json.access));
        try { localStorage.setItem('student_access', json.access); } catch {}
      }
      // fetch profile
      await fetchProfile(json.access);
    }catch(e){ setError(e.message); }
    finally{ setLoading(false); }
  }

  async function fetchProfile(accessOverride){
    setError('');
  const headers = {};
  const tok = accessOverride || token || (()=>{ try { return localStorage.getItem('student_access') || ''; } catch { return ''; } })();
    if (tok) headers['x-student-access'] = tok;
    let res = await fetch(`${base}/public/student/me`,{ credentials:'include', headers });
    if (res.status === 401){
      // try refresh
      const r = await fetch(`${base}/public/auth/refresh`,{ method:'POST', credentials:'include' });
      try {
        const jr = await r.json().catch(()=>({}));
        if (jr?.access) {
          dispatch(setStudentToken(jr.access));
          try { localStorage.setItem('student_access', jr.access); } catch {}
          headers['x-student-access'] = jr.access;
        }
      } catch {}
      res = await fetch(`${base}/public/student/me`,{ credentials:'include', headers });
    }
    const json = await res.json();
    if(res.ok && json.success){
      dispatch(setStudentProfile(json.data));
      setProfile(json.data);
    }
    else { setError(json.message || 'Failed to load profile'); }
  }

  function logout(){
    fetch(`${base}/public/auth/logout`,{ method:'POST', credentials:'include' })
      .finally(()=> {
        dispatch(clearStudentProfile());
        dispatch(clearStudentToken());
        try { localStorage.removeItem('student_access'); } catch {}
        setProfile(null);
      });
  }

  // Try to restore session on mount
  useEffect(()=>{
    // Restore persisted token
    try {
      const t = localStorage.getItem('student_access');
      if (t) dispatch(setStudentToken(t));
    } catch {}
    fetchProfile(); // ignore error silently on first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  if(profile || profileState){
    const p = profile || profileState;
    const s = p.student; const inst = p.institution; const scope = p.scope;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {inst?.logoUrl && <img src={inst.logoUrl} alt="logo" className="h-10 w-10 rounded" />}
          <div>
            <div className="font-semibold">{inst?.name}</div>
            <div className="text-xs opacity-70 uppercase tracking-wide">{inst?.type}</div>
          </div>
          <div className="ml-auto"><button onClick={logout} className="btn btn-sm">Logout</button></div>
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
    );
  }

  return (
    <form onSubmit={login} className="grid gap-3 max-w-md">
      <div>
        <label className="text-sm opacity-80">Roll Number</label>
        <input value={rollNo} onChange={e=>setRollNo(e.target.value)} className="input input-bordered w-full" placeholder="e.g., 0001AB250001" />
      </div>
      <div>
        <label className="text-sm opacity-80">Date of Birth</label>
        <input value={dob} onChange={e=>setDob(e.target.value)} className="input input-bordered w-full" placeholder="YYYY-MM-DD or DD-MM-YYYY" />
      </div>
      {error && <div className="text-error text-sm">{error}</div>}
      <button className="btn btn-primary" disabled={loading}>{loading? 'Signing in...':'Sign In'}</button>
      <div className="text-xs opacity-70">Tip: Use the exact DOB saved in records.</div>
    </form>
  );
}
