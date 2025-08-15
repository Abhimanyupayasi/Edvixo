import React, { useState } from 'react';
import axios from 'axios';

const AddStudent = ({ institutionId, classId, batchId, courseId, apiBase, getToken, onAdded }) => {
  const [stuForm, setStuForm] = useState({
    name:'', rollNo:'', admissionNo:'', gender:'', dob:'', email:'', phone:'',
    address:'', city:'', state:'', pincode:'', fatherName:'', motherName:'',
    guardianName:'', fatherPhone:'', motherPhone:'', guardianPhone:'', parentEmail:'',
    feeTotal:'', feePaid:''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  if (!institutionId) return;
    setSubmitting(true); setError('');
    try {
      const token = await getToken();
      const payload = {
        name: stuForm.name,
        rollNo: stuForm.rollNo || undefined,
        admissionNo: stuForm.admissionNo || undefined,
        gender: stuForm.gender || undefined,
        dob: stuForm.dob || undefined,
        email: stuForm.email || undefined,
        phone: stuForm.phone || undefined,
        address: stuForm.address || undefined,
        city: stuForm.city || undefined,
        state: stuForm.state || undefined,
        pincode: stuForm.pincode || undefined,
        parent: {
          fatherName: stuForm.fatherName || undefined,
          motherName: stuForm.motherName || undefined,
          guardianName: stuForm.guardianName || undefined,
          fatherPhone: stuForm.fatherPhone || undefined,
          motherPhone: stuForm.motherPhone || undefined,
          guardianPhone: stuForm.guardianPhone || undefined,
          email: stuForm.parentEmail || undefined
        },
        fee: {
          total: Number(stuForm.feeTotal) || 0,
          paid: Number(stuForm.feePaid) || 0,
          currency: 'INR'
        }
    };
    let url;
    if (classId) url = `${apiBase}/institutions/classes/${classId}/students`;
    else if (batchId) url = `${apiBase}/institutions/batches/${batchId}/students`;
    else if (courseId) url = `${apiBase}/institutions/courses/${courseId}/students`;
    else throw new Error('Please select Class/Batch/Course');
  await axios.post(url, payload, { headers:{ Authorization:`Bearer ${token}` }});
      setStuForm({ name:'', rollNo:'', admissionNo:'', gender:'', dob:'', email:'', phone:'', address:'', city:'', state:'', pincode:'', fatherName:'', motherName:'', guardianName:'', fatherPhone:'', motherPhone:'', guardianPhone:'', parentEmail:'', feeTotal:'', feePaid:'' });
      onAdded && onAdded();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to add student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error && <div className="alert alert-error mb-3">{error}</div>}
      <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-3 items-end mb-4">
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Name</span></label>
          <input className="input input-bordered input-sm" value={stuForm.name} onChange={e=>setStuForm(s=>({...s, name:e.target.value}))} required />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Roll No</span></label>
          <input className="input input-bordered input-sm" value={stuForm.rollNo} onChange={e=>setStuForm(s=>({...s, rollNo:e.target.value}))} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Admission No</span></label>
          <input className="input input-bordered input-sm" value={stuForm.admissionNo} onChange={e=>setStuForm(s=>({...s, admissionNo:e.target.value}))} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Gender</span></label>
          <select className="select select-bordered select-sm" value={stuForm.gender} onChange={e=>setStuForm(s=>({...s, gender:e.target.value}))}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">DOB</span></label>
          <input type="date" className="input input-bordered input-sm" value={stuForm.dob} onChange={e=>setStuForm(s=>({...s, dob:e.target.value}))} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Email</span></label>
          <input className="input input-bordered input-sm" value={stuForm.email} onChange={e=>setStuForm(s=>({...s, email:e.target.value}))} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Phone</span></label>
          <input className="input input-bordered input-sm" value={stuForm.phone} onChange={e=>setStuForm(s=>({...s, phone:e.target.value}))} />
        </div>
        <div className="form-control md:col-span-2">
          <label className="label"><span className="label-text text-xs">Address</span></label>
          <input className="input input-bordered input-sm" value={stuForm.address} onChange={e=>setStuForm(s=>({...s, address:e.target.value}))} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">City</span></label>
          <input className="input input-bordered input-sm" value={stuForm.city} onChange={e=>setStuForm(s=>({...s, city:e.target.value}))} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">State</span></label>
          <input className="input input-bordered input-sm" value={stuForm.state} onChange={e=>setStuForm(s=>({...s, state:e.target.value}))} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Pincode</span></label>
          <input className="input input-bordered input-sm" value={stuForm.pincode} onChange={e=>setStuForm(s=>({...s, pincode:e.target.value}))} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Father</span></label>
          <input className="input input-bordered input-sm" value={stuForm.fatherName} onChange={e=>setStuForm(s=>({...s, fatherName:e.target.value}))} placeholder="Father Name" />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Mother</span></label>
          <input className="input input-bordered input-sm" value={stuForm.motherName} onChange={e=>setStuForm(s=>({...s, motherName:e.target.value}))} placeholder="Mother Name" />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Guardian</span></label>
          <input className="input input-bordered input-sm" value={stuForm.guardianName} onChange={e=>setStuForm(s=>({...s, guardianName:e.target.value}))} placeholder="Guardian Name" />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Father Phone</span></label>
          <input className="input input-bordered input-sm" value={stuForm.fatherPhone} onChange={e=>setStuForm(s=>({...s, fatherPhone:e.target.value}))} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Mother Phone</span></label>
          <input className="input input-bordered input-sm" value={stuForm.motherPhone} onChange={e=>setStuForm(s=>({...s, motherPhone:e.target.value}))} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Guardian Phone</span></label>
          <input className="input input-bordered input-sm" value={stuForm.guardianPhone} onChange={e=>setStuForm(s=>({...s, guardianPhone:e.target.value}))} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Parent Email</span></label>
          <input className="input input-bordered input-sm" value={stuForm.parentEmail} onChange={e=>setStuForm(s=>({...s, parentEmail:e.target.value}))} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Fee Total</span></label>
          <input type="number" className="input input-bordered input-sm" value={stuForm.feeTotal} onChange={e=>setStuForm(s=>({...s, feeTotal:e.target.value}))} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text text-xs">Fee Paid</span></label>
          <input type="number" className="input input-bordered input-sm" value={stuForm.feePaid} onChange={e=>setStuForm(s=>({...s, feePaid:e.target.value}))} />
        </div>
        <button className={`btn btn-primary btn-sm ${submitting?'loading':''}`} disabled={submitting}>Add Student</button>
      </form>
    </>
  );
};

export default AddStudent;
