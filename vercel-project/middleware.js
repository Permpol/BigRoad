import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'dev-fallback-secret-change-me');

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    await jwtVerify(token, secret());
    return NextResponse.next();
  } catch {
    // token invalid / expired
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL('/', request.url));
    res.cookies.delete('token');
    return res;
  }
}

// Only protect these routes  (/ and /api/auth are public)
export const config = {
  matcher: ['/game', '/api/data'],
};
