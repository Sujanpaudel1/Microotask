import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

        // Fetch user's posted tasks with proposal counts
        const tasks = db.prepare(`
            SELECT 
                t.id,
                t.title,
                t.description,
                t.category,
                t.budget_min,
                t.budget_max,
                t.deadline,
                t.status,
                t.created_at,
                COUNT(p.id) as proposals_count,
                COALESCE(SUM(p.proposed_price), 0) as proposals_total
            FROM tasks t
            LEFT JOIN proposals p ON p.task_id = t.id
            WHERE t.client_id = ?
            GROUP BY t.id
            ORDER BY t.created_at DESC
            LIMIT 10
        `).all(userId);

        return NextResponse.json({ 
            success: true, 
            tasks 
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching user tasks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tasks' },
            { status: 500 }
        );
    }
}
