import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from './src/lib/admin-session';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (url.pathname.startsWith('/admin/login')) return NextResponse.next();

  const session = await verifyAdminSession(request.cookies.get('smith-standard-admin')?.value);
  if (!session) {
    url.pathname = '/admin/login';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
