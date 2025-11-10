import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Verify authentication
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json(
                { isSaved: false },
                { status: 200 }
            );
        }

        let userId: number;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
            userId = decoded.userId;
        } catch (error) {
            return NextResponse.json(
                { isSaved: false },
                { status: 200 }
            );
        }

        const taskId = parseInt(id);

        // Check if task is saved
        const saved = db.prepare(`
            SELECT id FROM saved_tasks 
            WHERE user_id = ? AND task_id = ?
        `).get(userId, taskId);

        return NextResponse.json({
            isSaved: !!saved
        });

    } catch (error: any) {
        console.error('Error checking saved status:', error);
        return NextResponse.json(
            { isSaved: false },
            { status: 200 }
        );
    }
}
