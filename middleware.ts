// middleware.ts
import { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  // Protege /perfil e /planos (opcional: ajuste conforme sua necessidade)
  const protectedPaths = ['/perfil', '/planos'];
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isProtected && !token) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return Response.redirect(redirectUrl);
  }

  return;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};