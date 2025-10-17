import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/database-sqlite';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET single task
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const taskId = parseInt(id);
        
        const task = db.prepare(`
            SELECT t.*, u.name as client_name, u.email as client_email
            FROM tasks t
            LEFT JOIN users u ON t.client_id = u.id
            WHERE t.id = ?
        `).get(taskId);

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json({ task });

    } catch (error) {
        console.error('Error fetching task:', error);
        return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
    }
}

// PATCH - Update task
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const taskId = parseInt(id);
        
        // Verify authentication
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const userId = decoded.userId;

        const body = await request.json();

        // Verify user owns the task
        const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        if (task.client_id !== userId) {
            return NextResponse.json({ error: 'Unauthorized - not task owner' }, { status: 403 });
        }

        // Don't allow editing completed or cancelled tasks
        if (task.status === 'Completed' || task.status === 'Cancelled') {
            return NextResponse.json({ error: 'Cannot edit completed or cancelled tasks' }, { status: 400 });
        }

        // Build update query dynamically
        const allowedFields = ['title', 'description', 'category', 'budget_min', 'budget_max', 'deadline', 'skills_required', 'difficulty', 'tags'];
        const updates: string[] = [];
        const values: any[] = [];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates.push(`${field} = ?`);
                // Stringify arrays for JSON storage
                if (field === 'skills_required' || field === 'tags') {
                    values.push(JSON.stringify(body[field]));
                } else {
                    values.push(body[field]);
                }
            }
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(taskId);

        const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
        db.prepare(query).run(...values);

        // Get updated task
        const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

        return NextResponse.json({
            success: true,
            message: 'Task updated successfully',
            task: updatedTask
        });

    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

// DELETE - Cancel task
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const taskId = parseInt(id);
        
        // Verify authentication
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const userId = decoded.userId;

        // Verify user owns the task
        const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        if (task.client_id !== userId) {
            return NextResponse.json({ error: 'Unauthorized - not task owner' }, { status: 403 });
        }

        // Don't allow deleting completed tasks
        if (task.status === 'Completed') {
            return NextResponse.json({ error: 'Cannot delete completed tasks' }, { status: 400 });
        }

        // Update task status to Cancelled instead of deleting
        db.prepare('UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('Cancelled', taskId);

        // Reject all pending proposals
        db.prepare('UPDATE proposals SET status = ? WHERE task_id = ? AND status = ?').run('Rejected', taskId, 'Pending');

        // Get all freelancers who submitted proposals
        const proposals = db.prepare('SELECT freelancer_id FROM proposals WHERE task_id = ?').all(taskId) as any[];

        // Create notifications for all freelancers
        const notificationPayload = JSON.stringify({
            title: 'Task Cancelled',
            message: `The task "${task.title}" has been cancelled by the client`,
            taskId: taskId,
            type: 'task_cancelled'
        });

        for (const proposal of proposals) {
            db.prepare(
                'INSERT INTO notifications (user_id, type, payload, is_read) VALUES (?, ?, ?, ?)'
            ).run(proposal.freelancer_id, 'task_cancelled', notificationPayload, 0);
        }

        return NextResponse.json({
            success: true,
            message: 'Task cancelled successfully'
        });

    } catch (error) {
        console.error('Error cancelling task:', error);
        return NextResponse.json({ error: 'Failed to cancel task' }, { status: 500 });
    }
}
