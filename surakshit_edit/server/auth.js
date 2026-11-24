import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// Password hashing with Node's built-in scrypt (no extra dependency).
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, 'hex');
  const b = scryptSync(password, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validateCredentials({ email, password }, { needName = false, name } = {}) {
  if (needName && !String(name || '').trim()) return 'name is required';
  if (!EMAIL_RE.test(String(email || '').trim())) return 'a valid email is required';
  if (String(password || '').length < 6) return 'password must be at least 6 characters';
  return null;
}
