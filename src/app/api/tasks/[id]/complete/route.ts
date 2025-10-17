import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/database-sqlite';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params
        const { id } = await params;
        const taskId = parseInt(id);
        
        // Verify authentication
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const userId = decoded.userId;

        // Get task
        const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Verify user owns the task
        if (task.client_id !== userId) {
            return NextResponse.json({ error: 'Unauthorized - not task owner' }, { status: 403 });
        }

        // Verify task is in progress
        if (task.status !== 'In Progress') {
            return NextResponse.json({ error: 'Task must be in progress to complete' }, { status: 400 });
        }

        // Update task status to Completed
        db.prepare('UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('Completed', taskId);

        // Get the accepted proposal to find the freelancer
        const acceptedProposal = db.prepare(
            'SELECT * FROM proposals WHERE task_id = ? AND status = ?'
        ).get(taskId, 'Accepted') as any;

        if (acceptedProposal) {
            // Update freelancer's completed tasks count
            db.prepare(
                'UPDATE users SET completed_tasks = completed_tasks + 1 WHERE id = ?'
            ).run(acceptedProposal.freelancer_id);

            // Create notification for freelancer
            const notificationPayload = JSON.stringify({
                title: 'Task Completed!',
                message: `The task "${task.title}" has been marked as completed`,
                taskId: taskId,
                type: 'task_completed'
            });

            db.prepare(
                'INSERT INTO notifications (user_id, type, payload, is_read) VALUES (?, ?, ?, ?)'
            ).run(acceptedProposal.freelancer_id, 'task_completed', notificationPayload, 0);
        }

        return NextResponse.json({
            success: true,
            message: 'Task marked as completed successfully',
            task: { ...task, status: 'Completed' }
        });

    } catch (error) {
        console.error('Error completing task:', error);
        return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 });
    }
}
