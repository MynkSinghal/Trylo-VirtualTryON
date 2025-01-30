import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
    const supabase = createMiddlewareClient({ req, res });
    
    // Refresh session if expired
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log('Middleware - Current path:', req.nextUrl.pathname);
    console.log('Middleware - Session:', session ? {
      user: session.user.email,
      expires_at: session.expires_at
    } : null);

    // Protected routes
    if (['/studio', '/dashboard'].includes(req.nextUrl.pathname)) {
      if (!session) {
        console.log('Middleware - Redirecting to login (no session)');
        const redirectUrl = new URL('/login', req.url);
        redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
      console.log('Middleware - Allowing access to protected route');
    }

    // Auth routes - redirect to dashboard if already logged in
    if (['/login', '/signup'].includes(req.nextUrl.pathname)) {
      if (session) {
        console.log('Middleware - Redirecting to dashboard (session exists)');
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      console.log('Middleware - Allowing access to auth route');
    }

    // Update response headers to set cookie
    const response = NextResponse.next();
    if (session) {
      response.cookies.set('supabase-auth-token', session.access_token, {
        path: '/',
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return res;
  }
}

export const config = {
  matcher: ['/studio', '/dashboard', '/login', '/signup', '/auth/callback'],
}; 