import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const skills = searchParams.get('skills');
        const minRate = searchParams.get('minRate');
        const maxRate = searchParams.get('maxRate');
        const minRating = searchParams.get('minRating');

        let query = `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.bio,
                u.skills,
                u.hourly_rate,
                u.location,
                u.profile_image,
                u.rating,
                u.review_count,
                u.completed_tasks,
                u.created_at,
                COUNT(DISTINCT t.id) as total_tasks_completed
            FROM users u
            LEFT JOIN proposals p ON u.id = p.freelancer_id AND p.status = 'Accepted'
            LEFT JOIN tasks t ON p.task_id = t.id AND t.status = 'Completed'
            WHERE 1=1
        `;

        const params: any[] = [];

        // Search filter
        if (search) {
            query += ` AND (u.name LIKE ? OR u.bio LIKE ? OR u.skills LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        // Skills filter
        if (skills) {
            const skillArray = skills.split(',');
            const skillConditions = skillArray.map(() => `u.skills LIKE ?`).join(' OR ');
            query += ` AND (${skillConditions})`;
            skillArray.forEach(skill => params.push(`%${skill.trim()}%`));
        }

        // Hourly rate filter
        if (minRate) {
            query += ` AND u.hourly_rate >= ?`;
            params.push(parseFloat(minRate));
        }

        if (maxRate) {
            query += ` AND u.hourly_rate <= ?`;
            params.push(parseFloat(maxRate));
        }

        // Rating filter
        if (minRating) {
            query += ` AND u.rating >= ?`;
            params.push(parseFloat(minRating));
        }

        query += ` GROUP BY u.id ORDER BY u.rating DESC, u.review_count DESC`;

        const freelancers = db.prepare(query).all(...params);

        // Parse skills from JSON string to array for each freelancer
        const parsedFreelancers = freelancers.map((freelancer: any) => ({
            ...freelancer,
            skills: freelancer.skills ?
                (typeof freelancer.skills === 'string' ? JSON.parse(freelancer.skills) : freelancer.skills)
                : []
        }));

        return NextResponse.json({
            success: true,
            freelancers: parsedFreelancers,
            count: parsedFreelancers.length
        });

    } catch (error: any) {
        console.error('Error fetching freelancers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch freelancers' },
            { status: 500 }
        );
    }
}
