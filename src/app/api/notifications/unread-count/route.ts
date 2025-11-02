import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/database-sqlite';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Get unread notification count for the current user
export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const userId = decoded.userId;

        // Count unread notifications
        const result = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0')
            .get(userId) as { count: number };

        return NextResponse.json({
            count: result.count
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching unread count:', error);
        return NextResponse.json({
            error: 'Failed to fetch unread count'
        }, { status: 500 });
    }
}
