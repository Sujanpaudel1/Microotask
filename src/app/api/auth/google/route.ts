import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';
import { generateToken } from '@/lib/auth';

// Note: For production, verify ID tokens with Google's official library.
// Here we'll use Google's tokeninfo endpoint for simplicity.

export async function POST(request: NextRequest) {
    try {
        const { id_token } = await request.json();

        if (!id_token) {
            return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
        }

        // Verify token with Google
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(id_token)}`);
        if (!verifyRes.ok) {
            const txt = await verifyRes.text();
            console.error('Google token verification failed:', txt);
            return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 });
        }

        const tokenInfo = await verifyRes.json() as {
            iss?: string;
            aud?: string;
            sub?: string;
            email?: string;
            email_verified?: string | boolean;
            name?: string;
            picture?: string;
        };

        // Optionally confirm audience matches expected client ID. If you have NEXT_PUBLIC_GOOGLE_CLIENT_ID or server-side env, check here.
        // For now, skip strict aud checking.

        if (!tokenInfo.email) {
            return NextResponse.json({ error: 'Google account has no email' }, { status: 400 });
        }

        // Check if user exists
        try {
            const existingUser = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(tokenInfo.email) as { id: number; name: string; email: string } | undefined;

            let userId: number;
            let userName: string = tokenInfo.name || 'Google User';

            if (!existingUser) {
                // Create new user with placeholder password
                const stmt = db.prepare(`INSERT INTO users (name, email, password, avatar, is_verified) VALUES (?, ?, ?, ?, ?)`);
                // Since password is required, store a random string — user should login with Google only.
                const randomPass = Math.random().toString(36).slice(2);
                const result = stmt.run(userName, tokenInfo.email, randomPass, tokenInfo.picture || null, 1);
                userId = Number(result.lastInsertRowid);
            } else {
                userId = existingUser.id;
                userName = existingUser.name || userName;
            }

            // Generate JWT
            const token = generateToken({ userId, email: tokenInfo.email, name: userName });

            const response = NextResponse.json({ message: 'Login successful', user: { id: userId, name: userName, email: tokenInfo.email } }, { status: 200 });

            response.cookies.set('auth-token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            });

            return response;
        } catch (dbError) {
            console.error('Database error during Google login:', dbError);
            return NextResponse.json({ error: 'Database error occurred' }, { status: 500 });
        }
    } catch (error) {
        console.error('Google login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
