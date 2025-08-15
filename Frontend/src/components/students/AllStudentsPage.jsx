import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { serverURL } from '../../utils/envExport';

export default function AllStudentsPage(){
  const { planId } = useParams();
  const { getToken } = useAuth();
  const apiBase = serverURL || 'http://localhost:8000';

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // all|school|coaching|college
  const [groupFilter, setGroupFilter] = useState('');   // class/batch/course name contains
  const [sectionFilter, setSectionFilter] = useState(''); // only for school
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelDraft, setPanelDraft] = useState(null);

  const load = async (p=page)=>{
    setLoading(true); setErr('');
    try{
      const token = await getToken();
      // If q looks like a Mongo ObjectId, try direct fetch by ID first
      const idLike = (q || '').trim();
      if (/^[a-fA-F0-9]{24}$/.test(idLike)) {
        try {
          const sres = await axios.get(`${apiBase}/students/${idLike}`,{ headers:{ Authorization:`Bearer ${token}` }});
          const item = sres.data?.data || sres.data || null;
          if (item) {
            setRows([item]);
            setTotal(1);
            setPage(1);
            setLoading(false);
            return;
          }
        } catch(_e) {
          // ignore and fall back to by-plan search
        }
      }
      const res = await axios.get(`${apiBase}/students/by-plan/${planId}?page=${p}&limit=${limit}&q=${encodeURIComponent(q)}`, { headers:{ Authorization:`Bearer ${token}` }});
      const data = res.data?.data || { items:[], total:0, page:p, limit };
      setRows(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || p);
    }catch(e){ setErr(e?.response?.data?.message || e.message || 'Failed to load'); }
    finally{ setLoading(false); }
  };

  // initial & limit changes
  useEffect(()=>{ load(1); /* eslint-disable-next-line */ }, [limit]);
  // debounced search
  useEffect(()=>{
    const t = setTimeout(()=> load(1), 400);
    return ()=> clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const pages = Math.max(1, Math.ceil(total / limit));

  // client-side filters: status, type, group name, and section (for school)
  const filteredRows = useMemo(()=>{
    return rows.filter(r => {
      if (statusFilter !== 'all' && (r.status||'').toLowerCase() !== statusFilter) return false;
      if (typeFilter !== 'all' && (r.institution?.type||'') !== typeFilter) return false;
      if (groupFilter && !(r.scope?.name||'').toLowerCase().includes(groupFilter.toLowerCase())) return false;
      if (typeFilter === 'school' && sectionFilter && !(String(r.scope?.extra||'').toLowerCase().includes(sectionFilter.toLowerCase()))) return false;
      return true;
    });
  }, [rows, statusFilter, typeFilter, groupFilter, sectionFilter]);

  const startEditPanel = (r) => {
    setPanelDraft({
      _id: r._id,
      name: r.name || '',
      gender: r.gender || '',
      dob: r.dob || '',
      rollNo: r.rollNo || '',
      admissionNo: r.admissionNo || '',
      email: r.email || '',
      phone: r.phone || '',
      address: r.address || '',
      city: r.city || '',
      state: r.state || '',
      pincode: r.pincode || '',
      status: r.status || 'active',
      admissionDate: r.admissionDate || '',
      parent: {
        fatherName: r.parent?.fatherName || '',
        motherName: r.parent?.motherName || '',
        guardianName: r.parent?.guardianName || '',
        fatherPhone: r.parent?.fatherPhone || '',
        motherPhone: r.parent?.motherPhone || '',
        guardianPhone: r.parent?.guardianPhone || '',
        email: r.parent?.email || ''
      },
      fee: {
        total: r.fee?.total || 0,
        paid: r.fee?.paid || 0,
        currency: r.fee?.currency || 'INR'
      }
    });
    setPanelOpen(true);
  };

  const savePanel = async ()=>{
    if (!panelDraft?._id) return;
    try{
      const token = await getToken();
      await axios.patch(`${apiBase}/students/${panelDraft._id}`, panelDraft, { headers:{ Authorization:`Bearer ${token}` }});
      // update in-place
      setRows(prev => prev.map(r => r._id === panelDraft._id ? { ...r, ...panelDraft } : r));
      setPanelOpen(false); setPanelDraft(null);
    }catch(e){ setErr(e?.response?.data?.message || e.message || 'Update failed'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">All Students</h1>
        <Link to={`/my-plan/${planId}`} className="btn btn-ghost btn-sm">Back to Plan</Link>
      </div>
      {err && <div className="alert alert-error mb-4">{err}</div>}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="form-control">
          <label className="label"><span className="label-text text-sm">Search</span></label>
          <div className="join">
            <input className="input input-bordered input-sm join-item" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') load(1); }} placeholder="name, email, phone, admission/roll" />
            <button className="btn btn-sm join-item" onClick={()=>load(1)} disabled={loading}>Search</button>
    {q && <button className="btn btn-sm join-item" onClick={()=>{ setQ(''); load(1); }} disabled={loading}>Clear</button>}
          </div>
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-sm">Type</span></label>
          <select className="select select-bordered select-sm" value={typeFilter} onChange={e=>{ setTypeFilter(e.target.value); setGroupFilter(''); setSectionFilter(''); }}>
            <option value="all">All</option>
            <option value="school">School</option>
            <option value="coaching">Coaching</option>
            <option value="college">College</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-sm">{typeFilter==='school'?'Class':'Batch/Course'}</span></label>
          <input className="input input-bordered input-sm" value={groupFilter} onChange={e=>setGroupFilter(e.target.value)} placeholder={typeFilter==='school'?'Class name':'Batch or Course name'} />
        </div>
        {typeFilter==='school' && (
          <div className="form-control">
            <label className="label"><span className="label-text text-sm">Section</span></label>
            <input className="input input-bordered input-sm" value={sectionFilter} onChange={e=>setSectionFilter(e.target.value)} placeholder="A / B / C" />
          </div>
        )}
        <div className="form-control">
          <label className="label"><span className="label-text text-sm">Per Page</span></label>
          <select className="select select-bordered select-sm" value={limit} onChange={e=>setLimit(parseInt(e.target.value)||50)}>
            {[25,50,100,200].map(n=> <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-sm">Status</span></label>
          <select className="select select-bordered select-sm" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
  <div className="ml-auto text-sm opacity-70">Showing {filteredRows.length} of {total}</div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Name & Address</th>
              <th className="hidden sm:table-cell">Roll/Admission</th>
              <th>Phone</th>
              <th className="hidden md:table-cell">Email</th>
              <th className="hidden lg:table-cell">Institution</th>
              <th className="hidden md:table-cell">Scope</th>
              <th>Fee</th>
              <th>Status</th>
              <th className="hidden sm:table-cell">Admitted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(r => {
              const isEdit = editId === r._id;
              const val = isEdit ? draft : r;
              return (
                <tr key={r._id} className="hover">
                  <td>
                    {isEdit ? (
                      <input className="input input-bordered input-xs w-44" value={val.name||''} onChange={e=>setDraft(d=>({...d, name:e.target.value}))} />
                    ) : (
                      <div className="font-medium">{r.name}</div>
                    )}
                    {/* Always-visible details for small screens */}
                    <div className="sm:hidden text-xs">Roll: {r.rollNo || '-'}</div>
                    <div className="text-xs opacity-70">{[val.address, val.city, val.state, val.pincode].filter(Boolean).join(', ')}</div>
                  </td>
                  <td className="hidden sm:table-cell">
                    {isEdit ? (
                      <div className="flex flex-col gap-1">
                        <input className="input input-bordered input-xs" placeholder="Roll" value={val.rollNo||''} onChange={e=>setDraft(d=>({...d, rollNo:e.target.value}))} />
                        <input className="input input-bordered input-xs" placeholder="Admission" value={val.admissionNo||''} onChange={e=>setDraft(d=>({...d, admissionNo:e.target.value}))} />
                      </div>
                    ) : (
                      <>
                        <div className="text-xs">Roll: {r.rollNo || '-'}</div>
                        <div className="text-xs">Adm: {r.admissionNo || '-'}</div>
                      </>
                    )}
                  </td>
                  <td>
                    {isEdit ? (
                      <input className="input input-bordered input-xs w-36" value={val.phone||''} onChange={e=>setDraft(d=>({...d, phone:e.target.value}))} />
                    ) : (r.phone || '-')}
                  </td>
                  <td className="hidden md:table-cell">
                    {isEdit ? (
                      <input className="input input-bordered input-xs w-44" value={val.email||''} onChange={e=>setDraft(d=>({...d, email:e.target.value}))} />
                    ) : (r.email || '-')}
                  </td>
                  <td className="hidden lg:table-cell">
                    <div className="font-medium text-xs">{r.institution?.name || '-'}</div>
                    <div className="badge badge-outline badge-xs capitalize">{r.institution?.type || '-'}</div>
                  </td>
                  <td className="hidden md:table-cell">
                    <div className="text-xs capitalize">{r.scope?.type || '-'}</div>
                    <div className="text-xs opacity-70">{r.scope?.name}{r.scope?.extra?` (${r.scope.extra})`:''}</div>
                  </td>
                  <td>
                    {isEdit ? (
                      <div className="flex items-center gap-1">
                        <input type="number" className="input input-bordered input-xs w-16" value={val.fee?.paid ?? 0} onChange={e=>setDraft(d=>({...d, fee:{...(d.fee||{}), paid:Number(e.target.value)||0}}))} />
                        /
                        <input type="number" className="input input-bordered input-xs w-16" value={val.fee?.total ?? 0} onChange={e=>setDraft(d=>({...d, fee:{...(d.fee||{}), total:Number(e.target.value)||0}}))} />
                      </div>
                    ) : (
                      <>₹{(r.fee?.paid||0)}/{(r.fee?.total||0)}</>
                    )}
                  </td>
                  <td>
                    {isEdit ? (
                      <select className="select select-bordered select-xs" value={val.status||'active'} onChange={e=>setDraft(d=>({...d, status:e.target.value}))}>
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                      </select>
                    ) : (
                      <span className={`badge badge-${r.status==='active'?'success':'neutral'} badge-xs`}>{r.status}</span>
                    )}
                  </td>
                  <td className="hidden sm:table-cell text-xs">{val.admissionDate ? new Date(val.admissionDate).toLocaleDateString() : '-'}</td>
                  <td className="text-right">
                    {isEdit ? (
                      <div className="join">
                        <button className="btn btn-xs btn-success join-item" onClick={async ()=>{
                          try{
                            const token = await getToken();
                            await axios.patch(`${apiBase}/students/${r._id}`, draft, { headers:{ Authorization:`Bearer ${token}` }});
                            // Update in-place
                            setRows(prev => prev.map(x => x._id === r._id ? { ...x, ...draft } : x));
                            setEditId(null); setDraft({});
                          }catch(e){ setErr(e?.response?.data?.message || e.message || 'Update failed'); }
                        }}>Save</button>
                        <button className="btn btn-xs join-item" onClick={()=>{ setEditId(null); setDraft({}); }}>Cancel</button>
                      </div>
                    ) : (
                      <div className="join">
                        <button className="btn btn-xs join-item" onClick={()=>{ setEditId(r._id); setDraft({ name:r.name, rollNo:r.rollNo, admissionNo:r.admissionNo, phone:r.phone, email:r.email, address:r.address, city:r.city, state:r.state, pincode:r.pincode, status:r.status, admissionDate:r.admissionDate, fee:{ total:r.fee?.total||0, paid:r.fee?.paid||0, currency:r.fee?.currency||'INR' } }); }}>Quick Edit</button>
                        <button className="btn btn-xs join-item" onClick={()=> startEditPanel(r)}>Edit</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredRows.length===0 && (<tr><td colSpan={10} className="text-center py-10 opacity-70">No students found.</td></tr>)}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="join mt-4">
          <button className="btn btn-sm join-item" onClick={()=>load(Math.max(1, page-1))} disabled={page<=1 || loading}>Prev</button>
          <button className="btn btn-sm join-item" disabled>{page} / {pages}</button>
          <button className="btn btn-sm join-item" onClick={()=>load(Math.min(pages, page+1))} disabled={page>=pages || loading}>Next</button>
        </div>
      )}

      {/* Edit Drawer */}
      {panelOpen && panelDraft && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={()=>{ setPanelOpen(false); setPanelDraft(null); }} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-base-100 shadow-xl overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Edit Student</h3>
              <button className="btn btn-sm" onClick={()=>{ setPanelOpen(false); setPanelDraft(null); }}>Close</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label"><span className="label-text">Name</span></label>
                  <input className="input input-bordered" value={panelDraft.name} onChange={e=>setPanelDraft(d=>({...d, name:e.target.value}))} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Gender</span></label>
                  <select className="select select-bordered" value={panelDraft.gender||''} onChange={e=>setPanelDraft(d=>({...d, gender:e.target.value}))}>
                    <option value="">—</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">DOB</span></label>
                  <input type="date" className="input input-bordered" value={panelDraft.dob? String(panelDraft.dob).slice(0,10): ''} onChange={e=>setPanelDraft(d=>({...d, dob:e.target.value}))} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Admission Date</span></label>
                  <input type="date" className="input input-bordered" value={panelDraft.admissionDate? String(panelDraft.admissionDate).slice(0,10): ''} onChange={e=>setPanelDraft(d=>({...d, admissionDate:e.target.value}))} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Roll No</span></label>
                  <input className="input input-bordered" value={panelDraft.rollNo||''} onChange={e=>setPanelDraft(d=>({...d, rollNo:e.target.value}))} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Admission No</span></label>
                  <input className="input input-bordered" value={panelDraft.admissionNo||''} onChange={e=>setPanelDraft(d=>({...d, admissionNo:e.target.value}))} />
                </div>
                <div className="form-control sm:col-span-2">
                  <label className="label"><span className="label-text">Email</span></label>
                  <input className="input input-bordered" value={panelDraft.email||''} onChange={e=>setPanelDraft(d=>({...d, email:e.target.value}))} />
                </div>
                <div className="form-control sm:col-span-2">
                  <label className="label"><span className="label-text">Phone</span></label>
                  <input className="input input-bordered" value={panelDraft.phone||''} onChange={e=>setPanelDraft(d=>({...d, phone:e.target.value}))} />
                </div>
              </div>

              <div className="divider">Address</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control sm:col-span-2">
                  <label className="label"><span className="label-text">Address</span></label>
                  <input className="input input-bordered" value={panelDraft.address||''} onChange={e=>setPanelDraft(d=>({...d, address:e.target.value}))} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">City</span></label>
                  <input className="input input-bordered" value={panelDraft.city||''} onChange={e=>setPanelDraft(d=>({...d, city:e.target.value}))} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">State</span></label>
                  <input className="input input-bordered" value={panelDraft.state||''} onChange={e=>setPanelDraft(d=>({...d, state:e.target.value}))} />
                </div>
                <div className="form-control sm:col-span-2">
                  <label className="label"><span className="label-text">Pincode</span></label>
                  <input className="input input-bordered" value={panelDraft.pincode||''} onChange={e=>setPanelDraft(d=>({...d, pincode:e.target.value}))} />
                </div>
              </div>

              <div className="divider">Parent</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label"><span className="label-text">Father Name</span></label>
                  <input className="input input-bordered" value={panelDraft.parent?.fatherName||''} onChange={e=>setPanelDraft(d=>({ ...d, parent:{ ...(d.parent||{}), fatherName:e.target.value } }))} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Mother Name</span></label>
                  <input className="input input-bordered" value={panelDraft.parent?.motherName||''} onChange={e=>setPanelDraft(d=>({ ...d, parent:{ ...(d.parent||{}), motherName:e.target.value } }))} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Guardian Name</span></label>
                  <input className="input input-bordered" value={panelDraft.parent?.guardianName||''} onChange={e=>setPanelDraft(d=>({ ...d, parent:{ ...(d.parent||{}), guardianName:e.target.value } }))} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Parent Email</span></label>
                  <input className="input input-bordered" value={panelDraft.parent?.email||''} onChange={e=>setPanelDraft(d=>({ ...d, parent:{ ...(d.parent||{}), email:e.target.value } }))} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Father Phone</span></label>
                  <input className="input input-bordered" value={panelDraft.parent?.fatherPhone||''} onChange={e=>setPanelDraft(d=>({ ...d, parent:{ ...(d.parent||{}), fatherPhone:e.target.value } }))} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Mother Phone</span></label>
                  <input className="input input-bordered" value={panelDraft.parent?.motherPhone||''} onChange={e=>setPanelDraft(d=>({ ...d, parent:{ ...(d.parent||{}), motherPhone:e.target.value } }))} />
                </div>
                <div className="form-control sm:col-span-2">
                  <label className="label"><span className="label-text">Guardian Phone</span></label>
                  <input className="input input-bordered" value={panelDraft.parent?.guardianPhone||''} onChange={e=>setPanelDraft(d=>({ ...d, parent:{ ...(d.parent||{}), guardianPhone:e.target.value } }))} />
                </div>
              </div>

              <div className="divider">Fee & Status</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div className="form-control">
                  <label className="label"><span className="label-text">Paid</span></label>
                  <input type="number" className="input input-bordered" value={panelDraft.fee?.paid ?? 0} onChange={e=>setPanelDraft(d=>({ ...d, fee:{ ...(d.fee||{}), paid:Number(e.target.value)||0 } }))} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Total</span></label>
                  <input type="number" className="input input-bordered" value={panelDraft.fee?.total ?? 0} onChange={e=>setPanelDraft(d=>({ ...d, fee:{ ...(d.fee||{}), total:Number(e.target.value)||0 } }))} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Currency</span></label>
                  <input className="input input-bordered" value={panelDraft.fee?.currency || 'INR'} onChange={e=>setPanelDraft(d=>({ ...d, fee:{ ...(d.fee||{}), currency:e.target.value } }))} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Status</span></label>
                  <select className="select select-bordered" value={panelDraft.status||'active'} onChange={e=>setPanelDraft(d=>({...d, status:e.target.value}))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button className="btn" onClick={()=>{ setPanelOpen(false); setPanelDraft(null); }}>Cancel</button>
                <button className="btn btn-primary" onClick={savePanel} disabled={loading}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
