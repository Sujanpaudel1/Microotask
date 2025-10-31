import { NextRequest, NextResponse } from 'next/server';
import { use } from 'react';
import jwt from 'jsonwebtoken';
import db from '@/lib/database-sqlite';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mark a single notification as read
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verify authentication
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const userId = decoded.userId;

        const unwrappedParams = use(params);
        const notificationId = parseInt(unwrappedParams.id);

        if (isNaN(notificationId)) {
            return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
        }

        // Verify the notification belongs to the user
        const notification = db.prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?')
            .get(notificationId, userId) as any;

        if (!notification) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        // Mark as read
        db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?')
            .run(notificationId);

        return NextResponse.json({ 
            success: true, 
            message: 'Notification marked as read' 
        }, { status: 200 });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json({ 
            error: 'Failed to mark notification as read' 
        }, { status: 500 });
    }
}
