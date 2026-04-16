import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-dev-secret');

const PUBLIC_PATHS = ['/', '/api/auth', '/_next', '/favicon.ico'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Check JWT token from cookie
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // API routes return 401, pages redirect to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    // Invalid/expired token
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: ['/game', '/api/data'],
};
