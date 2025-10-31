import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/database-sqlite';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
    try {
        // Try to get userId from query params (for backward compatibility)
        const url = new URL(request.url);
        let userId = url.searchParams.get('userId');
        
        // If no userId in params, get it from auth token
        if (!userId) {
            const token = request.cookies.get('auth-token')?.value;
            if (!token) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
            userId = decoded.userId.toString();
        }

        const rows = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(Number(userId));
        return NextResponse.json({ notifications: rows }, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}
