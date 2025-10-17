import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET /api/profile - Fetch user profile
export async function GET(request: NextRequest) {
    try {
        // Get token from cookies
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - Please login' },
                { status: 401 }
            );
        }

        // Verify token and get user ID
        let userId: number;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
            userId = decoded.userId;
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Fetch user profile
        const user = db.prepare(`
            SELECT 
                id,
                name,
                email,
                type,
                bio,
                skills,
                hourly_rate,
                location,
                phone,
                profile_image,
                created_at
            FROM users
            WHERE id = ?
        `).get(userId);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get user statistics
        const stats = db.prepare(`
            SELECT 
                COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_tasks,
                COUNT(*) as total_tasks,
                COALESCE(SUM(CASE WHEN status = 'Completed' THEN budget_max ELSE 0 END), 0) as total_earned
            FROM tasks
            WHERE client_id = ?
        `).get(userId) as any;

        // Get proposal statistics for freelancers
        const proposalStats = db.prepare(`
            SELECT 
                COUNT(*) as total_proposals,
                COUNT(CASE WHEN status = 'Accepted' THEN 1 END) as accepted_proposals
            FROM proposals
            WHERE freelancer_id = ?
        `).get(userId) as any;

        return NextResponse.json({
            profile: {
                ...user,
                stats: {
                    completedTasks: stats.completed_tasks || 0,
                    totalTasks: stats.total_tasks || 0,
                    totalEarned: stats.total_earned || 0,
                    totalProposals: proposalStats.total_proposals || 0,
                    acceptedProposals: proposalStats.accepted_proposals || 0,
                }
            }
        });

    } catch (error: any) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile', details: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request: NextRequest) {
    try {
        // Get token from cookies
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - Please login' },
                { status: 401 }
            );
        }

        // Verify token and get user ID
        let userId: number;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
            userId = decoded.userId;
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { name, bio, skills, hourly_rate, location, phone, profile_image } = body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        // Build update query dynamically
        const updates: string[] = [];
        const values: any[] = [];

        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name);
        }
        if (bio !== undefined) {
            updates.push('bio = ?');
            values.push(bio);
        }
        if (skills !== undefined) {
            updates.push('skills = ?');
            values.push(typeof skills === 'string' ? skills : JSON.stringify(skills));
        }
        if (hourly_rate !== undefined) {
            updates.push('hourly_rate = ?');
            values.push(hourly_rate);
        }
        if (location !== undefined) {
            updates.push('location = ?');
            values.push(location);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone);
        }
        if (profile_image !== undefined) {
            updates.push('profile_image = ?');
            values.push(profile_image);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        // Add user ID to values
        values.push(userId);

        // Update user profile
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        db.prepare(query).run(...values);

        // Fetch updated profile
        const updatedUser = db.prepare(`
            SELECT 
                id,
                name,
                email,
                type,
                bio,
                skills,
                hourly_rate,
                location,
                phone,
                profile_image,
                created_at
            FROM users
            WHERE id = ?
        `).get(userId);

        return NextResponse.json({
            message: 'Profile updated successfully',
            profile: updatedUser
        });

    } catch (error: any) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'Failed to update profile', details: error.message },
            { status: 500 }
        );
    }
}
