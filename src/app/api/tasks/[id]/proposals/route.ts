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
        
        // Parse request body
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const { freelancerId, message, proposedPrice, estimatedDuration } = body;

        // Validate required fields
        if (!freelancerId || !message || !proposedPrice || !estimatedDuration) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate data types
        if (typeof proposedPrice !== 'number' || proposedPrice <= 0) {
            return NextResponse.json({ error: 'Proposed price must be a positive number' }, { status: 400 });
        }

        // Check if task exists and is open
        const task = db.prepare('SELECT client_id, title, status FROM tasks WHERE id = ?').get(taskId) as any;
        
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        if (task.status !== 'Open') {
            return NextResponse.json({ error: 'This task is no longer accepting proposals' }, { status: 400 });
        }

        // Prevent task owner from submitting proposal
        if (task.client_id === freelancerId) {
            return NextResponse.json({ error: 'You cannot submit a proposal for your own task' }, { status: 400 });
        }

        // Check if user already submitted a proposal
        const existingProposal = db.prepare('SELECT id FROM proposals WHERE task_id = ? AND freelancer_id = ?').get(taskId, freelancerId);
        
        if (existingProposal) {
            return NextResponse.json({ error: 'You have already submitted a proposal for this task' }, { status: 400 });
        }

        // Insert proposal
        const stmt = db.prepare('INSERT INTO proposals (task_id, freelancer_id, message, proposed_price, estimated_duration) VALUES (?, ?, ?, ?, ?)');
        const result = stmt.run(taskId, freelancerId, message, Number(proposedPrice), estimatedDuration);

        // Create notification for the task owner
        if (task.client_id) {
            const freelancer = db.prepare('SELECT name FROM users WHERE id = ?').get(freelancerId) as any;
            const payload = JSON.stringify({ 
                message: `${freelancer?.name || 'A freelancer'} submitted a proposal for "${task.title}"`,
                taskId, 
                taskTitle: task.title, 
                freelancerId, 
                proposedPrice 
            });
            db.prepare('INSERT INTO notifications (user_id, type, payload) VALUES (?, ?, ?)').run(task.client_id, 'proposal_submitted', payload);
        }

        const newProposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(result.lastInsertRowid);
        return NextResponse.json({ 
            success: true,
            message: 'Proposal submitted successfully',
            proposal: newProposal 
        }, { status: 201 });
        
    } catch (error) {
        console.error('Failed to submit proposal:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
