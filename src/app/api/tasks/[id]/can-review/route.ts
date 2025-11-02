import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - Check if user can review this task
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const taskId = parseInt(id);

        // Verify authentication
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({
                canReview: false,
                reason: 'Not authenticated'
            });
        }

        let userId: number;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
            userId = decoded.userId;
        } catch (error) {
            return NextResponse.json({
                canReview: false,
                reason: 'Invalid token'
            });
        }

        // Get task details
        const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;

        if (!task) {
            return NextResponse.json({
                canReview: false,
                reason: 'Task not found'
            }, { status: 404 });
        }

        // Check if task is completed
        if (task.status !== 'Completed') {
            return NextResponse.json({
                canReview: false,
                reason: 'Task not completed yet'
            });
        }

        // Find the accepted proposal to get the freelancer
        const acceptedProposal = db.prepare(
            'SELECT freelancer_id FROM proposals WHERE task_id = ? AND status = ?'
        ).get(taskId, 'Accepted') as any;

        if (!acceptedProposal) {
            return NextResponse.json({
                canReview: false,
                reason: 'No accepted proposal found'
            });
        }

        // Check if user is part of the task
        const isClient = task.client_id === userId;
        const isFreelancer = acceptedProposal.freelancer_id === userId;

        if (!isClient && !isFreelancer) {
            return NextResponse.json({
                canReview: false,
                reason: 'Not involved in this task'
            });
        }

        // Check if already reviewed
        const existingReview = db.prepare(
            'SELECT id FROM reviews WHERE task_id = ? AND reviewer_id = ?'
        ).get(taskId, userId);

        if (existingReview) {
            return NextResponse.json({
                canReview: false,
                reason: 'Already reviewed'
            });
        }

        // Determine who to review
        const revieweeId = isClient ? acceptedProposal.freelancer_id : task.client_id;
        const reviewee = db.prepare('SELECT name FROM users WHERE id = ?').get(revieweeId) as any;

        return NextResponse.json({
            canReview: true,
            revieweeId,
            revieweeName: reviewee?.name || 'Unknown',
            taskTitle: task.title
        });

    } catch (error: any) {
        console.error('Error checking review eligibility:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
