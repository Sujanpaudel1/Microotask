import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/database-sqlite';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mark all notifications as read for the current user
export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const userId = decoded.userId;

        // Mark all unread notifications as read
        const result = db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0')
            .run(userId);

        return NextResponse.json({ 
            success: true, 
            message: 'All notifications marked as read',
            updated: result.changes
        }, { status: 200 });

    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json({ 
            error: 'Failed to mark all notifications as read' 
        }, { status: 500 });
    }
}
