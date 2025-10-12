import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';

export async function GET() {
    try {
        const rows = db.prepare('SELECT t.*, u.name as client_name, u.email as client_email FROM tasks t LEFT JOIN users u ON t.client_id = u.id ORDER BY t.created_at DESC').all();

        // For each task, compute total bids and number of proposals
        const tasks = rows.map((r: any) => {
            const totalBidsRow = db.prepare('SELECT COUNT(*) as count, COALESCE(SUM(proposed_price),0) as total FROM proposals WHERE task_id = ?').get(r.id) as any;
            return {
                ...r,
                proposals_count: totalBidsRow?.count || 0,
                proposals_total: totalBidsRow?.total || 0,
            };
        });

        return NextResponse.json({ tasks }, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, category, budgetMin, budgetMax, deadline, skillsRequired, difficulty, tags, clientId } = body;

        if (!title || !description || !category || !budgetMin || !budgetMax || !deadline) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const stmt = db.prepare(`INSERT INTO tasks (title, description, category, budget_min, budget_max, deadline, skills_required, difficulty, tags, client_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        const result = stmt.run(title, description, category, Number(budgetMin), Number(budgetMax), deadline, JSON.stringify(skillsRequired || []), difficulty || 'Medium', JSON.stringify(tags || []), clientId || null);

        const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
        return NextResponse.json({ task: newTask }, { status: 201 });
    } catch (error) {
        console.error('Failed to create task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
