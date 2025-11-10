import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';
import { verifyToken } from '@/lib/auth';

// GET - Get unread message count
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const userId = decoded.userId;

        const result = db.prepare(`
            SELECT COUNT(*) as count 
            FROM messages 
            WHERE receiver_id = ? AND is_read = 0
        `).get(userId) as any;

        return NextResponse.json({
            success: true,
            unread_count: result.count
        });

    } catch (error: any) {
        console.error('Error fetching unread count:', error);
        return NextResponse.json(
            { error: 'Failed to fetch unread count' },
            { status: 500 }
        );
    }
}
