import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { serverURL } from '../../utils/envExport';
import AddStudent from './AddStudent';
import BulkFileImport from './BulkFileImport';

const StudentsPage = () => {
  const { planId } = useParams();
  const { getToken } = useAuth();
  const location = useLocation();
  const apiBase = serverURL || 'http://localhost:8000';

  const [institutions, setInstitutions] = useState([]);
  const [instError, setInstError] = useState('');
  const [groups, setGroups] = useState([]); // classes | batches | courses
  const [selectedInstId, setSelectedInstId] = useState('');
  const [selectedInstType, setSelectedInstType] = useState(''); // school|coaching|college
  const [selectedScopeId, setSelectedScopeId] = useState(''); // classId|batchId|courseId
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [capSummary, setCapSummary] = useState({ count: 0, limit: null });

  useEffect(()=>{
    // apply preselected instId/classId from query params
    const qp = new URLSearchParams(location.search);
  const preInst = qp.get('instId');
  const preClass = qp.get('classId');
  const preBatch = qp.get('batchId');
  const preCourse = qp.get('courseId');
  if (preInst) setSelectedInstId(preInst);
  if (preClass) setSelectedScopeId(preClass);
  if (preBatch) setSelectedScopeId(preBatch);
  if (preCourse) setSelectedScopeId(preCourse);
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(()=>{
    const loadInst = async ()=>{
      setInstError('');
      try{
        const token = await getToken();
        const res = await axios.get(`${apiBase}/institutions/mine?planId=${planId}`, { headers:{ Authorization:`Bearer ${token}` }});
        const list = res.data?.data || [];
        setInstitutions(list);
      } catch(e){ setInstError(e?.response?.data?.message || e.message || 'Failed to load institutions'); }
    };
    loadInst();
  }, [planId, getToken, apiBase]);

  useEffect(()=>{
    const loadGroups = async ()=>{
      if (!selectedInstId || !institutions || institutions.length === 0) { setGroups([]); setSelectedInstType(''); return; }
      setError(''); setLoading(true);
      try{
        const token = await getToken();
        // fetch institution again to get its type if missing
        const inst = institutions.find(i => i._id === selectedInstId) || {};
        const type = String(inst.type || inst?.Type || inst?.organizationType || '').toLowerCase();
        setSelectedInstType(type);
        let path = 'classes';
        if (type === 'coaching') path = 'batches';
        else if (type === 'college') path = 'courses';
        const res = await axios.get(`${apiBase}/institutions/${selectedInstId}/${path}`, { headers:{ Authorization:`Bearer ${token}` }});
        setGroups(res.data?.data || []);
        // also load capacity summary
        const cap = await axios.get(`${apiBase}/institutions/${selectedInstId}/students/summary`, { headers:{ Authorization:`Bearer ${token}` }}).catch(()=>({ data:{} }));
        setCapSummary({ count: cap.data?.count ?? 0, limit: cap.data?.limit ?? null });
      } catch(e){ setError(e?.response?.data?.message || e.message || 'Failed to load'); }
      finally { setLoading(false); }
    };
    loadGroups();
  }, [selectedInstId, getToken, apiBase, institutions]);

  useEffect(()=>{
    const loadStudents = async ()=>{
      if (!selectedScopeId || !selectedInstType) { setStudents([]); return; }
      setError(''); setLoading(true);
      try{
        const token = await getToken();
        let url;
        const t = String(selectedInstType).toLowerCase();
        if (t === 'school') url = `${apiBase}/institutions/classes/${selectedScopeId}/students`;
        else if (t === 'coaching') url = `${apiBase}/institutions/batches/${selectedScopeId}/students`;
        else if (t === 'college') url = `${apiBase}/institutions/courses/${selectedScopeId}/students`;
        const res = await axios.get(url, { headers:{ Authorization:`Bearer ${token}` }});
        setStudents(res.data?.data || []);
      } catch(e){ setError(e?.response?.data?.message || e.message || 'Failed to load students'); }
      finally { setLoading(false); }
    };
    loadStudents();
  }, [selectedScopeId, selectedInstType, getToken, apiBase]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Students</h1>
        <Link to={`/my-plan/${planId}`} className="btn btn-ghost btn-sm">Back to Plan</Link>
      </div>

      {instError && <div className="alert alert-error mb-4">{instError}</div>}

      <div className="flex flex-wrap gap-3 items-end mb-6">
        <div className="form-control">
          <label className="label"><span className="label-text text-sm">Institution</span></label>
          <select className="select select-bordered select-sm" value={selectedInstId} onChange={e=>setSelectedInstId(e.target.value)}>
            <option value="">Select</option>
            {institutions.map(i => <option key={i._id} value={i._id}>{i.name} ({i.status})</option>)}
          </select>
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-sm">{(String(selectedInstType).toLowerCase()==='coaching') ? 'Batch' : (String(selectedInstType).toLowerCase()==='college') ? 'Course' : 'Class'}</span></label>
          <select className="select select-bordered select-sm" value={selectedScopeId} onChange={e=>setSelectedScopeId(e.target.value)} disabled={!selectedInstId || groups.length===0}>
            <option value="">Select</option>
            {groups.map(g => <option key={g._id} value={g._id}>{g.name}{g.section?`-${g.section}`:''}</option>)}
          </select>
        </div>
        {selectedInstId && (
          <div className="form-control">
            <label className="label"><span className="label-text text-sm">Capacity</span></label>
            <div className="text-xs opacity-80">
              <span>{capSummary.count} / {capSummary.limit ?? '∞'}</span>
            </div>
          </div>
        )}
      </div>

      {selectedInstId && selectedScopeId && (
        <div className="card bg-base-100 border border-base-300 shadow-sm mb-6">
          <div className="card-body">
            <h2 className="card-title text-base">Add Student</h2>
            <AddStudent
              institutionId={selectedInstId}
              classId={selectedInstType==='school' ? selectedScopeId : undefined}
              batchId={selectedInstType==='coaching' ? selectedScopeId : undefined}
              courseId={selectedInstType==='college' ? selectedScopeId : undefined}
              apiBase={apiBase}
              getToken={getToken}
              onAdded={async ()=>{
                const token = await getToken();
                let url;
                if (selectedInstType === 'school') url = `${apiBase}/institutions/classes/${selectedScopeId}/students`;
                else if (selectedInstType === 'coaching') url = `${apiBase}/institutions/batches/${selectedScopeId}/students`;
                else if (selectedInstType === 'college') url = `${apiBase}/institutions/courses/${selectedScopeId}/students`;
                const res = await axios.get(url, { headers:{ Authorization:`Bearer ${token}` }});
                setStudents(res.data?.data || []);
              }}
            />
            <div className="divider my-2" />
            <BulkImport
              apiBase={apiBase}
              getToken={getToken}
              instType={selectedInstType}
              scopeId={selectedScopeId}
              onImported={async ()=>{
                // refresh students and capacity
                const token = await getToken();
                let url;
                if (selectedInstType === 'school') url = `${apiBase}/institutions/classes/${selectedScopeId}/students`;
                else if (selectedInstType === 'coaching') url = `${apiBase}/institutions/batches/${selectedScopeId}/students`;
                else if (selectedInstType === 'college') url = `${apiBase}/institutions/courses/${selectedScopeId}/students`;
                const res = await axios.get(url, { headers:{ Authorization:`Bearer ${token}` }});
                setStudents(res.data?.data || []);
                const cap = await axios.get(`${apiBase}/institutions/${selectedInstId}/students/summary`, { headers:{ Authorization:`Bearer ${token}` }}).catch(()=>({ data:{} }));
                setCapSummary({ count: cap.data?.count ?? 0, limit: cap.data?.limit ?? null });
              }}
              limit={capSummary.limit}
              currentCount={capSummary.count}
            />
            <div className="divider my-4" />
            <BulkFileImport
              apiBase={apiBase}
              getToken={getToken}
              instType={selectedInstType}
              scopeId={selectedScopeId}
              onConfirmed={async ()=>{
                // refresh students and capacity after confirm
                const token = await getToken();
                let url;
                const t = String(selectedInstType).toLowerCase();
                if (t === 'school') url = `${apiBase}/institutions/classes/${selectedScopeId}/students`;
                else if (t === 'coaching') url = `${apiBase}/institutions/batches/${selectedScopeId}/students`;
                else if (t === 'college') url = `${apiBase}/institutions/courses/${selectedScopeId}/students`;
                const res = await axios.get(url, { headers:{ Authorization:`Bearer ${token}` }});
                setStudents(res.data?.data || []);
                const cap = await axios.get(`${apiBase}/institutions/${selectedInstId}/students/summary`, { headers:{ Authorization:`Bearer ${token}` }}).catch(()=>({ data:{} }));
                setCapSummary({ count: cap.data?.count ?? 0, limit: cap.data?.limit ?? null });
              }}
            />
          </div>
        </div>
      )}

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-base">Students List</h2>
          {error && <div className="alert alert-error mb-3">{error}</div>}
          {loading && <span className="loading loading-spinner" />}
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll</th>
                  <th>Phone</th>
                  <th>Fee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id} className="hover">
                    <td className="font-medium">{s.name}</td>
                    <td>{s.rollNo || '-'}</td>
                    <td>{s.phone || '-'}</td>
                    <td>₹{(s.fee?.paid||0)}/{(s.fee?.total||0)}</td>
                    <td><span className={`badge badge-${s.status==='active'?'success':'neutral'} badge-xs`}>{s.status}</span></td>
                  </tr>
                ))}
                {students.length===0 && (
                  <tr><td colSpan={5} className="text-center opacity-70">No students.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;

function BulkImport({ apiBase, getToken, instType, scopeId, onImported, limit, currentCount }){
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const atCap = typeof limit === 'number' && currentCount >= limit;
  const handleImport = async ()=>{
    setErr(''); setSubmitting(true);
    try{
      let rows;
      try { rows = JSON.parse(text); } catch { throw new Error('Provide JSON array of students'); }
      if (!Array.isArray(rows)) throw new Error('Provide JSON array of students');
      const token = await getToken();
      let url;
      if (instType==='school') url = `${apiBase}/institutions/classes/${scopeId}/students/bulk`;
      else if (instType==='coaching') url = `${apiBase}/institutions/batches/${scopeId}/students/bulk`;
      else if (instType==='college') url = `${apiBase}/institutions/courses/${scopeId}/students/bulk`;
      await axios.post(url, rows, { headers:{ Authorization:`Bearer ${token}` }});
      setText('');
      onImported && onImported();
    } catch(e){ setErr(e?.response?.data?.message || e.message || 'Import failed'); }
    finally{ setSubmitting(false); }
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">Bulk Import</h3>
        {typeof limit==='number' && <span className="text-xs opacity-70">Limit {currentCount}/{limit}</span>}
      </div>
      {err && <div className="alert alert-error mb-2">{err}</div>}
      <textarea className="textarea textarea-bordered w-full h-28 text-xs" placeholder='[ { "name":"John", "phone":"999..." }, ... ]' value={text} onChange={e=>setText(e.target.value)}></textarea>
      <button className="btn btn-outline btn-sm mt-2" onClick={handleImport} disabled={submitting || !scopeId || atCap}>{submitting?'Importing...':'Import JSON'}</button>
      {atCap && <div className="text-xs text-error mt-2">Capacity reached. Remove students or upgrade plan.</div>}
    </div>
  );
}
