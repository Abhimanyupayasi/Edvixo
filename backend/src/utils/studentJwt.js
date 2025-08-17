import jwt from 'jsonwebtoken';

const ACCESS_TTL = process.env.STUDENT_ACCESS_TTL || '15m';
const REFRESH_TTL = process.env.STUDENT_REFRESH_TTL || '7d';
const ACCESS_SECRET = process.env.STUDENT_ACCESS_SECRET || (process.env.JWT_SECRET || 'dev-access');
const REFRESH_SECRET = process.env.STUDENT_REFRESH_SECRET || (process.env.JWT_REFRESH_SECRET || 'dev-refresh');

export function signAccessToken(payload){
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}
export function signRefreshToken(payload){
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}
export function verifyAccess(token){
  try { return jwt.verify(token, ACCESS_SECRET); } catch { return null; }
}
export function verifyRefresh(token){
  try { return jwt.verify(token, REFRESH_SECRET); } catch { return null; }
}
