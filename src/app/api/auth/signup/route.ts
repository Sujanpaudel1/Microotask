import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';
import { hashPassword, isValidEmail, isValidPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const passwordValidation = isValidPassword(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { error: passwordValidation.message },
                { status: 400 }
            );
        }

        try {
            // Check if user already exists
            const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

            if (existingUser) {
                return NextResponse.json(
                    { error: 'User with this email already exists' },
                    { status: 409 }
                );
            }

            // Hash password
            const hashedPassword = await hashPassword(password);

            // Create new user
            const stmt = db.prepare(`
        INSERT INTO users (name, email, password) 
        VALUES (?, ?, ?)
      `);

            const result = stmt.run(name, email, hashedPassword);

            // Get the created user
            const newUser = db.prepare('SELECT id, name, email, joined_date FROM users WHERE id = ?').get(result.lastInsertRowid) as {
                id: number;
                name: string;
                email: string;
                joined_date: string;
            };

            return NextResponse.json(
                {
                    message: 'User created successfully',
                    user: {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        joinedDate: newUser.joined_date,
                    },
                },
                { status: 201 }
            );
        } catch (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                { error: 'Database error occurred' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}