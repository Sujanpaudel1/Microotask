import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Get filter parameters
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const minBudget = searchParams.get('minBudget') || '';
        const maxBudget = searchParams.get('maxBudget') || '';
        const difficulty = searchParams.get('difficulty') || '';
        const status = searchParams.get('status') || '';
        const skills = searchParams.get('skills') || '';

        // Build dynamic query
        let query = 'SELECT t.*, u.name as client_name, u.email as client_email FROM tasks t LEFT JOIN users u ON t.client_id = u.id WHERE 1=1';
        const params: any[] = [];

        // Search in title and description
        if (search) {
            query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Filter by category
        if (category) {
            query += ' AND t.category = ?';
            params.push(category);
        }

        // Filter by budget range
        if (minBudget) {
            query += ' AND t.budget_max >= ?';
            params.push(Number(minBudget));
        }
        if (maxBudget) {
            query += ' AND t.budget_min <= ?';
            params.push(Number(maxBudget));
        }

        // Filter by difficulty
        if (difficulty) {
            query += ' AND t.difficulty = ?';
            params.push(difficulty);
        }

        // Filter by status
        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }

        // Filter by skills (check if any skill in the comma-separated list matches)
        if (skills) {
            const skillList = skills.split(',').map(s => s.trim());
            const skillConditions = skillList.map(() => 't.skills_required LIKE ?').join(' OR ');
            if (skillConditions) {
                query += ` AND (${skillConditions})`;
                skillList.forEach(skill => params.push(`%${skill}%`));
            }
        }

        query += ' ORDER BY t.created_at DESC';

        const rows = db.prepare(query).all(...params);

        // For each task, compute total bids and number of proposals
        const tasks = rows.map((r: any) => {
            const totalBidsRow = db.prepare('SELECT COUNT(*) as count, COALESCE(SUM(proposed_price),0) as total FROM proposals WHERE task_id = ?').get(r.id) as any;
            return {
                ...r,
                proposals_count: totalBidsRow?.count || 0,
                proposals_total: totalBidsRow?.total || 0,
            };
        });

        return NextResponse.json({
            tasks,
            filters: {
                search,
                category,
                minBudget,
                maxBudget,
                difficulty,
                status,
                skills
            },
            total: tasks.length
        }, { status: 200 });
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
