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

        // Update proposal status to Accepted
        db.prepare('UPDATE proposals SET status = ? WHERE id = ?').run('Accepted', proposalId);

        // Reject all other proposals for this task
        db.prepare('UPDATE proposals SET status = ? WHERE task_id = ? AND id != ?').run('Rejected', taskId, proposalId);

        // Update task status to In Progress
        db.prepare('UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('In Progress', taskId);

        // Create notification for accepted freelancer
        const notificationPayload = JSON.stringify({
            title: 'Proposal Accepted!',
            message: `Your proposal for "${task.title}" has been accepted`,
            taskId: taskId,
            type: 'proposal_accepted'
        });

        db.prepare(
            'INSERT INTO notifications (user_id, type, payload, is_read) VALUES (?, ?, ?, ?)'
        ).run(proposal.freelancer_id, 'proposal_accepted', notificationPayload, 0);

        // Create notifications for rejected freelancers
        const rejectedProposals = db.prepare(
            'SELECT freelancer_id FROM proposals WHERE task_id = ? AND id != ?'
        ).all(taskId, proposalId) as any[];

        const rejectionPayload = JSON.stringify({
            title: 'Proposal Not Selected',
            message: `Your proposal for "${task.title}" was not selected`,
            taskId: taskId,
            type: 'proposal_rejected'
        });

        for (const rejected of rejectedProposals) {
            db.prepare(
                'INSERT INTO notifications (user_id, type, payload, is_read) VALUES (?, ?, ?, ?)'
            ).run(rejected.freelancer_id, 'proposal_rejected', rejectionPayload, 0);
        }

        return NextResponse.json({
            success: true,
            message: 'Proposal accepted successfully',
            task: { ...task, status: 'In Progress' }
        });

    } catch (error) {
        console.error('Error accepting proposal:', error);
        return NextResponse.json({ error: 'Failed to accept proposal' }, { status: 500 });
    }
}
