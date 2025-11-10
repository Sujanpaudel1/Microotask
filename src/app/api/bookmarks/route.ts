import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - Get all saved tasks for user
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

        // Get all saved tasks with task details
        const savedTasks = db.prepare(`
            SELECT 
                st.id as saved_id,
                st.created_at as saved_at,
                t.*,
                u.name as client_name,
                u.rating as client_rating,
                (SELECT COUNT(*) FROM proposals WHERE task_id = t.id) as proposal_count
            FROM saved_tasks st
            JOIN tasks t ON st.task_id = t.id
            JOIN users u ON t.client_id = u.id
            WHERE st.user_id = ?
            ORDER BY st.created_at DESC
        `).all(userId);

        return NextResponse.json({
            success: true,
            savedTasks,
            count: savedTasks.length
        });

    } catch (error: any) {
        console.error('Error fetching saved tasks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch saved tasks' },
            { status: 500 }
        );
    }
}

// POST - Save a task
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { taskId } = body;

        if (!taskId) {
            return NextResponse.json(
                { error: 'Task ID is required' },
                { status: 400 }
            );
        }

        // Check if task exists
        const task = db.prepare('SELECT id, status FROM tasks WHERE id = ?').get(taskId);
        if (!task) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        // Check if already saved
        const existing = db.prepare(
            'SELECT id FROM saved_tasks WHERE user_id = ? AND task_id = ?'
        ).get(userId, taskId);

        if (existing) {
            return NextResponse.json(
                { error: 'Task already saved' },
                { status: 400 }
            );
        }

        // Save the task
        const result = db.prepare(`
            INSERT INTO saved_tasks (user_id, task_id)
            VALUES (?, ?)
        `).run(userId, taskId);

        return NextResponse.json({
            success: true,
            message: 'Task saved successfully',
            savedId: result.lastInsertRowid
        });

    } catch (error: any) {
        console.error('Error saving task:', error);
        return NextResponse.json(
            { error: 'Failed to save task' },
            { status: 500 }
        );
    }
}

// DELETE - Remove a saved task
export async function DELETE(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get('taskId');

        if (!taskId) {
            return NextResponse.json(
                { error: 'Task ID is required' },
                { status: 400 }
            );
        }

        // Delete the saved task
        const result = db.prepare(`
            DELETE FROM saved_tasks 
            WHERE user_id = ? AND task_id = ?
        `).run(userId, parseInt(taskId));

        if (result.changes === 0) {
            return NextResponse.json(
                { error: 'Saved task not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Task removed from saved'
        });

    } catch (error: any) {
        console.error('Error removing saved task:', error);
        return NextResponse.json(
            { error: 'Failed to remove saved task' },
            { status: 500 }
        );
    }
}
