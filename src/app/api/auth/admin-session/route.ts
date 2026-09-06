import { NextResponse } from 'next/server';
import { requireManager } from '@/lib/auth-server';
import { adminSessionMaxAge, createAdminSession } from '@/lib/admin-session';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const manager = await requireManager(request);
  if (!manager) return NextResponse.json({ error: 'Manager access required.' }, { status: 403 });

  const session = await createAdminSession({ email: manager.email, role: manager.role });
  const response = NextResponse.json({ ok: true, role: manager.role });
  response.cookies.set('smith-standard-admin', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: adminSessionMaxAge,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('smith-standard-admin', '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
