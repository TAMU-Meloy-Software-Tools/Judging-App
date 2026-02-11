import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  // Intercept Auth0 callback errors and redirect to custom error page
  if (request.nextUrl.pathname === '/api/auth/callback') {
    const error = request.nextUrl.searchParams.get('error');
    
    if (error) {
      const errorDescription = request.nextUrl.searchParams.get('error_description');
      const redirectUrl = new URL('/error-auth', request.url);
      redirectUrl.searchParams.set('error', error);
      if (errorDescription) {
        redirectUrl.searchParams.set('error_description', errorDescription);
      }
      
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
