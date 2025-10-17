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

        const { proposalId } = await request.json();

        if (!proposalId) {
            return NextResponse.json({ error: 'Proposal ID is required' }, { status: 400 });
        }

        // Verify user owns the task
        const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        if (task.client_id !== userId) {
            return NextResponse.json({ error: 'Unauthorized - not task owner' }, { status: 403 });
        }

        // Verify proposal belongs to this task
        const proposal = db.prepare('SELECT * FROM proposals WHERE id = ? AND task_id = ?').get(proposalId, taskId) as any;
        if (!proposal) {
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        // Update proposal status to Rejected
        db.prepare('UPDATE proposals SET status = ? WHERE id = ?').run('Rejected', proposalId);

        // Create notification for rejected freelancer
        const notificationPayload = JSON.stringify({
            title: 'Proposal Rejected',
            message: `Your proposal for "${task.title}" was not selected`,
            taskId: taskId,
            type: 'proposal_rejected'
        });

        db.prepare(
            'INSERT INTO notifications (user_id, type, payload, is_read) VALUES (?, ?, ?, ?)'
        ).run(proposal.freelancer_id, 'proposal_rejected', notificationPayload, 0);

        return NextResponse.json({
            success: true,
            message: 'Proposal rejected successfully'
        });

    } catch (error) {
        console.error('Error rejecting proposal:', error);
        return NextResponse.json({ error: 'Failed to reject proposal' }, { status: 500 });
    }
}
