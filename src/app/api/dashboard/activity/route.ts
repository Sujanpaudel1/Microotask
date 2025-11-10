import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        let userId: number;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
            userId = decoded.userId;
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        // Get recent activities
        const activities: any[] = [];

        // Recent tasks posted (as client)
        const recentTasks = db.prepare(`
            SELECT id, title, status, created_at, 'task_posted' as activity_type
            FROM tasks
            WHERE client_id = ?
            ORDER BY created_at DESC
            LIMIT 5
        `).all(userId);

        // Recent proposals submitted (as freelancer)
        const recentProposals = db.prepare(`
            SELECT p.id, p.created_at, p.status, t.title as task_title, 'proposal_submitted' as activity_type
            FROM proposals p
            JOIN tasks t ON p.task_id = t.id
            WHERE p.freelancer_id = ?
            ORDER BY p.created_at DESC
            LIMIT 5
        `).all(userId);

        // Recent notifications
        const recentNotifications = db.prepare(`
            SELECT id, type, payload, created_at, 'notification' as activity_type
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 5
        `).all(userId);

        // Combine and sort all activities
        activities.push(...recentTasks.map((t: any) => ({
            id: `task-${t.id}`,
            type: 'task_posted',
            title: `Posted task: ${t.title}`,
            status: t.status,
            timestamp: t.created_at
        })));

        activities.push(...recentProposals.map((p: any) => ({
            id: `proposal-${p.id}`,
            type: 'proposal_submitted',
            title: `Submitted proposal for: ${p.task_title}`,
            status: p.status,
            timestamp: p.created_at
        })));

        activities.push(...recentNotifications.map((n: any) => {
            const payload = JSON.parse(n.payload);
            return {
                id: `notification-${n.id}`,
                type: n.type,
                title: payload.message || 'Notification',
                timestamp: n.created_at
            };
        }));

        // Sort by timestamp descending
        activities.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return NextResponse.json({
            success: true,
            activities: activities.slice(0, 10) // Return top 10 most recent
        });

    } catch (error: any) {
        console.error('Error fetching activity:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activity' },
            { status: 500 }
        );
    }
}
