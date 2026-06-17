import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect GM panel — presence check only; actual validity is verified per-request by Better Auth
  if (pathname.startsWith('/admin/panel')) {
    const session = request.cookies.get('better-auth.session_token');
    if (!session) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/panel', '/admin/panel/:path*'],
};
