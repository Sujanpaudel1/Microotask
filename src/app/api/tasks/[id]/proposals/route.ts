import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const taskId = Number(id);
        const body = await request.json();
        const { freelancerId, message, proposedPrice, estimatedDuration } = body;

        if (!freelancerId || !message || !proposedPrice || !estimatedDuration) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const stmt = db.prepare('INSERT INTO proposals (task_id, freelancer_id, message, proposed_price, estimated_duration) VALUES (?, ?, ?, ?, ?)');
        const result = stmt.run(taskId, freelancerId, message, Number(proposedPrice), estimatedDuration);

        // Create notification for the task owner
        const task = db.prepare('SELECT client_id, title FROM tasks WHERE id = ?').get(taskId) as any;
        if (task && task.client_id) {
            const payload = JSON.stringify({ taskId, title: task.title, freelancerId, proposedPrice });
            db.prepare('INSERT INTO notifications (user_id, type, payload) VALUES (?, ?, ?)').run(task.client_id, 'proposal', payload);
        }

        const newProposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(result.lastInsertRowid);
        return NextResponse.json({ proposal: newProposal }, { status: 201 });
    } catch (error) {
        console.error('Failed to submit proposal:', error);
        return NextResponse.json({ error: 'Failed to submit proposal' }, { status: 500 });
    }
}
