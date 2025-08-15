import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

export default function BulkFileImport({ apiBase, getToken, instType, scopeId, onConfirmed }){
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [step, setStep] = useState('pick'); // pick | review

  const accept = '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel';

  const scopeType = useMemo(()=>{
    const t = String(instType||'').toLowerCase();
    if (t==='school') return 'class'; if (t==='coaching') return 'batch'; if (t==='college') return 'course';
    return 'class';
  },[instType]);

  const upload = async ()=>{
    if(!file || !scopeId) return;
    setLoading(true); setErr('');
    try{
      const token = await getToken();
      const form = new FormData(); form.append('file', file);
      const res = await axios.post(`${apiBase}/students/upload/${scopeType}/${scopeId}`, form, { headers:{ Authorization:`Bearer ${token}` } });
      const rows = res.data?.data?.preview || [];
      setPreview(rows);
      setStep('review');
    }catch(e){ setErr(e?.response?.data?.message || e.message || 'Upload failed'); }
    finally{ setLoading(false); }
  };

  const headers = ['name','rollNo','admissionNo','gender','dob','email','phone','address','city','state','pincode','fatherName','motherName','guardianName','fatherPhone','motherPhone','guardianPhone','parentEmail','feeTotal','feePaid','status'];

  const downloadTemplateCSV = () => {
    const csv = headers.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'students_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplateXLSX = () => {
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'students_template.xlsx');
  };

  const confirm = async ()=>{
    setLoading(true); setErr('');
    try{
      const token = await getToken();
      await axios.post(`${apiBase}/students/confirm/${scopeType}/${scopeId}`, preview, { headers:{ Authorization:`Bearer ${token}` } });
      onConfirmed && onConfirmed();
      setFile(null); setPreview([]); setStep('pick');
    }catch(e){ setErr(e?.response?.data?.message || e.message || 'Confirm failed'); }
    finally{ setLoading(false); }
  };

  const onCell = (idx, key, val)=>{
    setPreview(p=>p.map((row,i)=> i===idx ? { ...row, [key]: val } : row));
  };

  const editHeaders = ['name','rollNo','admissionNo','gender','dob','email','phone','address','city','state','pincode','fee.total','fee.paid','status'];
  const readOnlyColumns = new Set(['rollNo']);

  const serialToISO = (n) => {
    if (typeof n !== 'number') return '';
    if (n > 20000 && n < 60000) {
      const ms = (n - 25569) * 86400 * 1000;
      const d = new Date(ms);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0,10);
    }
    const d = new Date(n);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0,10);
    return '';
  };
  const normalizeDateString = (s) => {
    if (!s) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    if (/^\d{5}$/.test(s)) return serialToISO(Number(s));
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(s)){
      const parts = s.split(/[\/\-]/).map(x=>parseInt(x,10));
      let d = parts[0], m = parts[1];
      let y = parts[2] < 100 ? 2000 + parts[2] : parts[2];
      const dt = new Date(y, m-1, d);
      if (!isNaN(dt.getTime())) return dt.toISOString().slice(0,10);
    }
    const d2 = new Date(s);
    if (!isNaN(d2.getTime())) return d2.toISOString().slice(0,10);
    return '';
  };

  const getVal = (row, key)=>{
    if (key==='fee.total') return row?.fee?.total ?? '';
    if (key==='fee.paid') return row?.fee?.paid ?? '';
    if (key==='dob') {
      const v = row?.dob;
      if (typeof v === 'number') return serialToISO(v);
      if (!v) return '';
      return normalizeDateString(String(v));
    }
    return row[key] ?? '';
  };
  const setVal = (idx, key, value)=>{
    if (readOnlyColumns.has(key)) return; // rollNo is auto-generated
    if (key==='fee.total') return onCell(idx, 'fee', { ...(preview[idx]?.fee||{}), total: Number(value)||0 });
    if (key==='fee.paid') return onCell(idx, 'fee', { ...(preview[idx]?.fee||{}), paid: Number(value)||0 });
    return onCell(idx, key, value);
  };

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h3 className="card-title text-base">Bulk Import (CSV/Excel)</h3>
        {err && <div className="alert alert-error mb-2">{err}</div>}
        {step==='pick' && (
          <div className="flex items-center gap-3 flex-wrap">
            <input type="file" accept={accept} className="file-input file-input-bordered file-input-sm" onChange={e=>setFile(e.target.files?.[0]||null)} />
            <button className="btn btn-primary btn-sm" onClick={upload} disabled={!file || loading}>{loading?'Processing...':'Upload & Preview'}</button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={downloadTemplateCSV}>Download CSV template</button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={downloadTemplateXLSX}>Download XLSX template</button>
            <div className="text-xs opacity-70">Headers supported: name, rollNo, admissionNo, gender, dob, email, phone, address, city, state, pincode, fatherName, motherName, guardianName, fatherPhone, motherPhone, guardianPhone, parentEmail, feeTotal, feePaid, status</div>
          </div>
        )}
        {step==='review' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs opacity-70">Showing {preview.length} rows. Roll No is auto-generated on Confirm.</span>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-xs" onClick={()=>setStep('pick')}>Back</button>
                <button className="btn btn-success btn-sm" onClick={confirm} disabled={loading}>{loading?'Saving...':'Confirm & Import'}</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-xs">
                <thead>
                  <tr>
                    {editHeaders.map(h=> <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx)=> (
                    <tr key={idx}>
                      {editHeaders.map(h=> (
                        <td key={h}>
                          {readOnlyColumns.has(h) ? (
                            <input
                              className="input input-bordered input-xs w-40 opacity-70"
                              value={getVal(row,h)}
                              readOnly
                              disabled
                            />
                          ) : h === 'dob' ? (
                            <input
                              type="date"
                              className="input input-bordered input-xs w-40"
                              value={getVal(row,h)}
                              onChange={e=>setVal(idx,h,e.target.value)}
                            />
                          ) : (
                            <input
                              className="input input-bordered input-xs w-40"
                              value={getVal(row,h)}
                              onChange={e=>setVal(idx,h,e.target.value)}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {preview.length===0 && <tr><td className="text-center" colSpan={editHeaders.length}>No rows</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
