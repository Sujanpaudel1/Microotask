import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if the request is for protected routes
    const protectedPaths = ['/dashboard', '/post-task', '/profile'];
    const isProtected = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtected) {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            // Redirect to login if no token
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // For now, just check if token exists
        // JWT verification will be handled in API routes or client-side
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};