// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const isLoggedIn = request.cookies.get('admin-auth')?.value;

    const url = request.nextUrl.clone();

    // If not logged in and trying to access /admin (but not /admin/login)
    if (!isLoggedIn && url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login')) {
        url.pathname = '/admin/login';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
