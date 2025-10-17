import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';

// GET all proposals for a task
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const taskId = Number(id);

        const proposals = db.prepare(`
            SELECT p.*, u.name as freelancer_name, u.email as freelancer_email, 
                   u.rating, u.review_count, u.completed_tasks, u.profile_image
            FROM proposals p
            LEFT JOIN users u ON p.freelancer_id = u.id
            WHERE p.task_id = ?
            ORDER BY p.created_at DESC
        `).all(taskId);

        return NextResponse.json({ proposals });
    } catch (error) {
        console.error('Failed to fetch proposals:', error);
        return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
    }
}

// POST a new proposal
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
