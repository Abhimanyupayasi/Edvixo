import React, { useState, useEffect } from 'react';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

export default function StudentImport({ instituteId: presetInstituteId, planId, disabled=false, onComplete, maxStudents }) {
  const [institute] = useState(null);
  const [file,setFile] = useState(null);
  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState('');
  const [single,setSingle] = useState({ first_name:'', last_name:'', enrollment_no:'', fee_amount:'', dob:'', gender:'' });
  const [count,setCount] = useState(0);
  const [countLoading,setCountLoading] = useState(false);

  const instituteId = presetInstituteId;

  const fetchCount = () => {
    if(!instituteId) return;
    setCountLoading(true);
    fetch(`${SERVER}/students/count?institute_id=${encodeURIComponent(instituteId)}`, { 
      credentials:'include',
      headers: {
        ...(window.__clerkToken ? { Authorization: `Bearer ${window.__clerkToken}` } : {})
      }
    })
      .then(r=>r.json()).then(j=>{ if(j.success) setCount(j.count||0); })
      .catch(()=>{})
      .finally(()=>setCountLoading(false));
  };

  useEffect(()=>{ fetchCount(); },[instituteId]);

  const atCapacity = maxStudents != null && count >= maxStudents;

  const upload = async () => {
    if(!file) return;
    setLoading(true); setMessage('');
    const form = new FormData();
    form.append('file', file);
    form.append('institute_id', instituteId);
    if(planId) form.append('planId', planId);
    try {
      const res = await fetch(`${SERVER}/students/import`, { 
        method:'POST', 
        body: form, 
        credentials:'include',
        headers: {
          ...(window.__clerkToken ? { Authorization: `Bearer ${window.__clerkToken}` } : {})
        }
      });
      const json = await res.json();
      if(json.success){
        setMessage(`Imported: ${json.data.success} success, ${json.data.failed} failed${json.data.skippedCapacity?`, ${json.data.skippedCapacity} skipped (capacity)`:''}`);
        onComplete && onComplete(json);
        fetchCount();
      } else setMessage(json.message||'Import failed');
    } catch(e){ setMessage(e.message); }
    finally { setLoading(false); }
  };

  const addSingle = async () => {
    if(!single.first_name || !single.last_name || !single.enrollment_no) return setMessage('Missing required fields');
    setLoading(true); setMessage('');
    try {
      const res = await fetch(`${SERVER}/students`, { 
        method:'POST', 
        headers:{ 
          'Content-Type':'application/json',
          ...(window.__clerkToken ? { Authorization: `Bearer ${window.__clerkToken}` } : {})
        }, 
        body: JSON.stringify({ ...single, institute_id: instituteId, planId, fee_amount: Number(single.fee_amount)||0 })
      });
      const json = await res.json();
      if(json.success){ setMessage('Student added'); setSingle({ first_name:'', last_name:'', enrollment_no:'', fee_amount:'', dob:'', gender:'' }); fetchCount(); }
      else setMessage(json.message||'Add failed');
      if(json.success) onComplete && onComplete(json);
    } catch(e){ setMessage(e.message); }
    finally { setLoading(false); }
  };

  const downloadTemplate = () => {
    const headers = ['first_name','last_name','enrollment_no','fee_amount','dob','gender'];
    const csv = headers.join(',') + '\n';
    const blob = new Blob([csv], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'students_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Student & Fees Import</h1>
      {!instituteId && (
        <div className="alert alert-warning">Institute ID is required to import students.</div>
      )}
      {instituteId && !disabled && (
        <>
        {message && <div className="alert alert-info text-sm">{message}</div>}
        <div className="text-xs opacity-75 flex gap-4 items-center">
          <span>Current: {countLoading? '…': count}</span>
          {maxStudents != null && <>
            <span>Limit: {maxStudents}</span>
            <progress className="progress progress-xs w-40" value={count} max={maxStudents}></progress>
            {atCapacity && <span className="text-error font-semibold">Capacity Reached</span>}
          </>}
          <button className="btn btn-xs" onClick={fetchCount}>↻</button>
        </div>
        <section className="space-y-4">
          <h2 className="font-semibold">1. Bulk Import (Excel / CSV)</h2>
          <p className="text-xs opacity-70">Headers: first_name,last_name,enrollment_no,fee_amount,dob,gender</p>
          <div className="flex items-center gap-3 flex-wrap">
            <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={e=>setFile(e.target.files[0])} className="file-input file-input-bordered" disabled={atCapacity} />
            <button className="btn btn-primary" disabled={loading || !file || atCapacity} onClick={upload}>{loading? 'Uploading...': atCapacity? 'Full':'Upload'}</button>
            <button className="btn btn-outline btn-sm" onClick={downloadTemplate}>Download Template</button>
          </div>
        </section>
        <div className="divider" />
        <section className="space-y-4">
          <h2 className="font-semibold">2. Manual Add (Single)</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <input placeholder="First Name" className="input input-bordered" value={single.first_name} onChange={e=>setSingle({...single, first_name:e.target.value})} disabled={atCapacity} />
            <input placeholder="Last Name" className="input input-bordered" value={single.last_name} onChange={e=>setSingle({...single, last_name:e.target.value})} disabled={atCapacity} />
            <input placeholder="Enrollment No" className="input input-bordered" value={single.enrollment_no} onChange={e=>setSingle({...single, enrollment_no:e.target.value})} disabled={atCapacity} />
            <input placeholder="Fee Amount" className="input input-bordered" value={single.fee_amount} onChange={e=>setSingle({...single, fee_amount:e.target.value})} disabled={atCapacity} />
            <input placeholder="DOB (YYYY-MM-DD)" className="input input-bordered" value={single.dob} onChange={e=>setSingle({...single, dob:e.target.value})} disabled={atCapacity} />
            <select className="select select-bordered" value={single.gender} onChange={e=>setSingle({...single, gender:e.target.value})} disabled={atCapacity}>
              <option value="">Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <button className="btn btn-success" disabled={loading || atCapacity} onClick={addSingle}>{loading? 'Saving...': atCapacity? 'Full':'Add Student'}</button>
        </section>
        </>
      )}
      {instituteId && disabled && (
        <div className="alert alert-warning text-sm">Student capacity limit reached for this plan.</div>
      )}
    </div>
  );
}
