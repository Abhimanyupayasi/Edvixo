import { verifyAccess } from '../utils/studentJwt.js';

// Extract access token from Authorization: Bearer <token> or cookie 'student_access'
export function requireStudentAuth(req, res, next){
  const header = req.headers['authorization'] || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
  const cookieTok = req.cookies?.student_access || null;
  const token = bearer || cookieTok;
  if (!token) return res.status(401).json({ success:false, message:'Unauthorized' });
  const payload = verifyAccess(token);
  if (!payload) return res.status(401).json({ success:false, message:'Invalid token' });
  req.student = payload; // { sid, iid }
  next();
}
