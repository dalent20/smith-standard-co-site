const SESSION_TTL_SECONDS = 60 * 60 * 12;

function base64UrlEncode(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function base64UrlDecode(value: string) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function importKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function signatureFor(payload: string, secret: string) {
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  let binary = '';
  for (const byte of new Uint8Array(signature)) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

export async function createAdminSession(input: { email: string; role: 'owner' | 'manager' }) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured.');
  const payload = base64UrlEncode(JSON.stringify({
    email: input.email.toLowerCase(),
    role: input.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  }));
  const signature = await signatureFor(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifyAdminSession(cookie: string | undefined | null) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !cookie) return null;
  const [payload, suppliedSignature] = cookie.split('.');
  if (!payload || !suppliedSignature) return null;
  const expected = await signatureFor(payload, secret);
  if (expected !== suppliedSignature) return null;
  try {
    const data = JSON.parse(base64UrlDecode(payload));
    if (!data?.email || !['owner', 'manager'].includes(data?.role)) return null;
    if (!data.exp || Number(data.exp) < Math.floor(Date.now() / 1000)) return null;
    return data as { email: string; role: 'owner' | 'manager'; exp: number };
  } catch {
    return null;
  }
}

export const adminSessionMaxAge = SESSION_TTL_SECONDS;
