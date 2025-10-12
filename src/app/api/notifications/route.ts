import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const rows = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(Number(userId));
        return NextResponse.json({ notifications: rows }, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}
