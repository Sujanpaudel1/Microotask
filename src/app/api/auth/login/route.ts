import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';
import { verifyPassword, generateToken, isValidEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        console.log('Login attempt for email:', email);

        // Validate input
        if (!email || !password) {
            console.log('Missing email or password');
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (!isValidEmail(email)) {
            console.log('Invalid email format:', email);
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        try {
            // Find user by email
            console.log('Searching for user with email:', email);
            const user = db.prepare('SELECT id, name, email, password FROM users WHERE email = ?').get(email) as {
                id: number;
                name: string;
                email: string;
                password: string;
            } | undefined;

            if (!user) {
                console.log('User not found for email:', email);
                return NextResponse.json(
                    { error: 'Invalid email or password' },
                    { status: 401 }
                );
            }

            console.log('User found:', { id: user.id, name: user.name, email: user.email });

            // Verify password
            const isPasswordValid = await verifyPassword(password, user.password);

            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: 'Invalid email or password' },
                    { status: 401 }
                );
            }

            // Generate JWT token
            const token = generateToken({
                userId: user.id,
                email: user.email,
                name: user.name,
            });

            // Create response
            const response = NextResponse.json(
                {
                    message: 'Login successful',
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    },
                },
                { status: 200 }
            );

            // Set HTTP-only cookie with the JWT token
            response.cookies.set('auth-token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });

            return response;
        } catch (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                { error: 'Database error occurred' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}