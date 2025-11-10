import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// POST - Submit a review
export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        let reviewerId: number;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
            reviewerId = decoded.userId;
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        // Parse request body
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            );
        }

        const { taskId, revieweeId, rating, comment } = body;

        // Validate required fields
        if (!taskId || !revieweeId || !rating) {
            return NextResponse.json(
                { error: 'Missing required fields: taskId, revieweeId, and rating are required' },
                { status: 400 }
            );
        }

        // Validate rating
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be a number between 1 and 5' },
                { status: 400 }
            );
        }

        // Check if task exists and is completed
        const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;

        if (!task) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        if (task.status !== 'Completed') {
            return NextResponse.json(
                { error: 'Can only review completed tasks' },
                { status: 400 }
            );
        }

        // Find the accepted proposal to get the freelancer
        const acceptedProposal = db.prepare(
            'SELECT freelancer_id FROM proposals WHERE task_id = ? AND status = ?'
        ).get(taskId, 'Accepted') as any;

        if (!acceptedProposal) {
            return NextResponse.json(
                { error: 'No accepted proposal found for this task' },
                { status: 400 }
            );
        }

        // Verify reviewer is part of the task (either client or assigned freelancer)
        const isClient = task.client_id === reviewerId;
        const isFreelancer = acceptedProposal.freelancer_id === reviewerId;

        if (!isClient && !isFreelancer) {
            return NextResponse.json(
                { error: 'You can only review tasks you were involved in' },
                { status: 403 }
            );
        }

        // Verify reviewee is the other party
        const expectedRevieweeId = isClient ? acceptedProposal.freelancer_id : task.client_id;
        if (revieweeId !== expectedRevieweeId) {
            return NextResponse.json(
                { error: 'Invalid reviewee for this task' },
                { status: 400 }
            );
        }

        // Check if review already exists
        const existingReview = db.prepare(
            'SELECT id FROM reviews WHERE task_id = ? AND reviewer_id = ?'
        ).get(taskId, reviewerId);

        if (existingReview) {
            return NextResponse.json(
                { error: 'You have already reviewed this task' },
                { status: 400 }
            );
        }

        // Insert review
        const result = db.prepare(`
            INSERT INTO reviews (task_id, reviewer_id, reviewee_id, rating, comment, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        `).run(taskId, reviewerId, revieweeId, rating, comment || null);

        // Update reviewee's rating
        const reviews = db.prepare(
            'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE reviewee_id = ?'
        ).get(revieweeId) as any;

        db.prepare(
            'UPDATE users SET rating = ?, review_count = ? WHERE id = ?'
        ).run(
            Math.round(reviews.avg_rating * 10) / 10, // Round to 1 decimal
            reviews.review_count,
            revieweeId
        );

        // Create notification for reviewee
        const reviewer = db.prepare('SELECT name FROM users WHERE id = ?').get(reviewerId) as any;
        const notificationPayload = JSON.stringify({
            message: `${reviewer?.name || 'Someone'} left you a ${rating}-star review`,
            taskId,
            taskTitle: task.title,
            rating,
            reviewId: result.lastInsertRowid
        });

        db.prepare(`
            INSERT INTO notifications (user_id, type, payload, is_read, created_at)
            VALUES (?, 'review_received', ?, 0, datetime('now'))
        `).run(revieweeId, notificationPayload);

        return NextResponse.json({
            success: true,
            message: 'Review submitted successfully',
            reviewId: result.lastInsertRowid
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error submitting review:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET - Fetch reviews (with optional userId filter)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        let query = `
            SELECT r.*,
                   reviewer.name as reviewer_name,
                   reviewer.profile_image as reviewer_image,
                   reviewee.name as reviewee_name,
                   t.title as task_title
            FROM reviews r
            LEFT JOIN users reviewer ON r.reviewer_id = reviewer.id
            LEFT JOIN users reviewee ON r.reviewee_id = reviewee.id
            LEFT JOIN tasks t ON r.task_id = t.id
        `;

        let params: any[] = [];

        if (userId) {
            query += ' WHERE r.reviewee_id = ?';
            params.push(parseInt(userId));
        }

        query += ' ORDER BY r.created_at DESC';

        const reviews = db.prepare(query).all(...params);

        return NextResponse.json({
            success: true,
            reviews
        });

    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}
