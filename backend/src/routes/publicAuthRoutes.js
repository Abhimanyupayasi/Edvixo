import express from 'express';
import Student from '../models/Student.js';
import Institution from '../models/Institution.js';
import { signAccessToken, signRefreshToken, verifyRefresh } from '../utils/studentJwt.js';

const router = express.Router();

// Helper to parse dd-mm-yyyy or yyyy-mm-dd
function parseDOBToISO(val){
  if (!val) return null;
  if (typeof val === 'string'){
    const s = val.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(s)){
      const parts = s.split(/[\/\-]/).map(x=>parseInt(x,10));
      let d=parts[0], m=parts[1], y=parts[2];
      if (y < 100) y = 2000 + y;
      const dt = new Date(y, m-1, d);
      if (!isNaN(dt.getTime())) return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
    }
  }
  try {
    const dt = new Date(val);
    if (!isNaN(dt.getTime())) return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
  } catch {}
  return null;
}

function setAuthCookies(res, access, refresh){
  const isProd = process.env.NODE_ENV === 'production';
  // Cross-site cookies require SameSite=None and Secure when frontend and backend are on different domains
  const base = { secure: isProd, sameSite: 'none' };
  res.cookie('student_access', access, { ...base, httpOnly: false, maxAge: 15*60*1000 });
  res.cookie('student_refresh', refresh, { ...base, httpOnly: true,  maxAge: 7*24*60*60*1000 });
}

router.post('/login', async (req,res)=>{
  try {
    const { rollNo, dob, subdomain } = req.body || {};
    if (!rollNo || !dob) return res.status(400).json({ success:false, message:'rollNo and dob required' });
    let instId = null;
    if (subdomain){
      const inst = await Institution.findOne({ subdomain: subdomain }).select('_id');
      instId = inst?._id || null;
    }
    const student = await Student.findOne(instId ? { rollNo, institutionId: instId } : { rollNo }).lean();
    if (!student) return res.status(401).json({ success:false, message:'Invalid credentials' });
    const dobISO = parseDOBToISO(dob);
    if (!dobISO) return res.status(400).json({ success:false, message:'Invalid DOB format' });
    const d1 = new Date(dobISO).toISOString().slice(0,10);
    const d2 = student.dob ? new Date(student.dob).toISOString().slice(0,10) : null;
    if (!d2 || d1 !== d2) return res.status(401).json({ success:false, message:'Invalid credentials' });
    const access = signAccessToken({ sid: student._id.toString(), iid: student.institutionId.toString() });
    const refresh = signRefreshToken({ sid: student._id.toString(), iid: student.institutionId.toString() });
    setAuthCookies(res, access, refresh);
    res.json({ success:true, access });
  } catch (e){ res.status(500).json({ success:false, message:e.message }); }
});

router.post('/refresh', async (req,res)=>{
  try {
    const token = req.cookies?.student_refresh || req.body?.refreshToken;
    if (!token) return res.status(401).json({ success:false, message:'No refresh token' });
    const payload = verifyRefresh(token);
    if (!payload) return res.status(401).json({ success:false, message:'Invalid refresh token' });
    const access = signAccessToken({ sid: payload.sid, iid: payload.iid });
  res.cookie('student_access', access, { httpOnly: false, secure: process.env.NODE_ENV==='production', sameSite:'none', maxAge: 15*60*1000 });
    res.json({ success:true, access });
  } catch (e){ res.status(500).json({ success:false, message:e.message }); }
});

router.post('/logout', async (req,res)=>{
  try {
  const isProd = process.env.NODE_ENV === 'production';
  const base = { secure: isProd, sameSite: 'none' };
  res.clearCookie('student_access', base);
  res.clearCookie('student_refresh', { ...base, httpOnly: true });
    res.json({ success:true });
  } catch (e){ res.status(500).json({ success:false, message:e.message }); }
});

export default router;
