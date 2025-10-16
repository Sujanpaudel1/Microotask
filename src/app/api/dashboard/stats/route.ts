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

        // Fetch dashboard statistics
        
        // 1. Tasks Posted Count
        const tasksPostedResult = db.prepare(
            'SELECT COUNT(*) as count FROM tasks WHERE client_id = ?'
        ).get(userId) as { count: number };
        const tasksPosted = tasksPostedResult.count;

        // 2. Tasks Completed Count
        const tasksCompletedResult = db.prepare(
            'SELECT COUNT(*) as count FROM tasks WHERE client_id = ? AND status = ?'
        ).get(userId, 'Completed') as { count: number };
        const tasksCompleted = tasksCompletedResult.count;

        // 3. Total Spent (sum of budget_max from completed tasks)
        const totalSpentResult = db.prepare(
            'SELECT COALESCE(SUM(budget_max), 0) as total FROM tasks WHERE client_id = ? AND status = ?'
        ).get(userId, 'Completed') as { total: number };
        const totalSpent = totalSpentResult.total;

        // 4. Active Proposals Count (proposals on user's tasks that are pending)
        const activeProposalsResult = db.prepare(`
            SELECT COUNT(*) as count 
            FROM proposals p
            INNER JOIN tasks t ON p.task_id = t.id
            WHERE t.client_id = ? AND p.status = ?
        `).get(userId, 'Pending') as { count: number };
        const activeProposals = activeProposalsResult.count;

        // 5. My Proposals Submitted (as a freelancer)
        const myProposalsResult = db.prepare(
            'SELECT COUNT(*) as count FROM proposals WHERE freelancer_id = ?'
        ).get(userId) as { count: number };
        const myProposalsSubmitted = myProposalsResult.count;

        // 6. My Accepted Proposals
        const myAcceptedProposalsResult = db.prepare(
            'SELECT COUNT(*) as count FROM proposals WHERE freelancer_id = ? AND status = ?'
        ).get(userId, 'Accepted') as { count: number };
        const myAcceptedProposals = myAcceptedProposalsResult.count;

        // 7. User rating and review count
        const userResult = db.prepare(
            'SELECT rating, review_count FROM users WHERE id = ?'
        ).get(userId) as { rating: number; review_count: number } | undefined;

        const stats = {
            tasksPosted,
            tasksCompleted,
            totalSpent,
            activeProposals,
            myProposalsSubmitted,
            myAcceptedProposals,
            rating: userResult?.rating || 0,
            reviewCount: userResult?.review_count || 0
        };

        return NextResponse.json({ success: true, stats }, { status: 200 });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics' },
            { status: 500 }
        );
    }
}
