import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';
import { verifyToken } from '@/lib/auth';

// GET - Fetch all conversations for the authenticated user
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const userId = decoded.userId;

        // Get all conversations with last message and other participant details
        const conversations = db.prepare(`
            SELECT 
                c.id,
                c.task_id,
                c.last_message_at,
                c.created_at,
                CASE 
                    WHEN c.participant_1_id = ? THEN c.participant_2_id
                    ELSE c.participant_1_id
                END as other_user_id,
                CASE 
                    WHEN c.participant_1_id = ? THEN u2.name
                    ELSE u1.name
                END as other_user_name,
                CASE 
                    WHEN c.participant_1_id = ? THEN u2.avatar
                    ELSE u1.avatar
                END as other_user_avatar,
                t.title as task_title,
                (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT sender_id FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_sender_id,
                (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
                (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND receiver_id = ? AND is_read = 0) as unread_count
            FROM conversations c
            LEFT JOIN users u1 ON c.participant_1_id = u1.id
            LEFT JOIN users u2 ON c.participant_2_id = u2.id
            LEFT JOIN tasks t ON c.task_id = t.id
            WHERE c.participant_1_id = ? OR c.participant_2_id = ?
            ORDER BY c.last_message_at DESC, c.created_at DESC
        `).all(userId, userId, userId, userId, userId, userId) as any[];

        return NextResponse.json({
            success: true,
            conversations: conversations.map(conv => ({
                id: conv.id,
                task_id: conv.task_id,
                task_title: conv.task_title,
                other_user: {
                    id: conv.other_user_id,
                    name: conv.other_user_name,
                    avatar: conv.other_user_avatar
                },
                last_message: {
                    content: conv.last_message,
                    is_mine: conv.last_message_sender_id === userId,
                    created_at: conv.last_message_time
                },
                unread_count: conv.unread_count,
                created_at: conv.created_at
            }))
        });

    } catch (error: any) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}

// POST - Create a new conversation
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const userId = decoded.userId;
        const { otherUserId, taskId } = await request.json();

        if (!otherUserId) {
            return NextResponse.json(
                { error: 'Other user ID is required' },
                { status: 400 }
            );
        }

        if (otherUserId === userId) {
            return NextResponse.json(
                { error: 'Cannot create conversation with yourself' },
                { status: 400 }
            );
        }

        // Check if conversation already exists
        const existing = db.prepare(`
            SELECT id FROM conversations 
            WHERE (participant_1_id = ? AND participant_2_id = ?) 
               OR (participant_1_id = ? AND participant_2_id = ?)
        `).get(userId, otherUserId, otherUserId, userId) as any;

        if (existing) {
            return NextResponse.json({
                success: true,
                conversation_id: existing.id,
                message: 'Conversation already exists'
            });
        }

        // Create new conversation
        const result = db.prepare(`
            INSERT INTO conversations (participant_1_id, participant_2_id, task_id)
            VALUES (?, ?, ?)
        `).run(userId, otherUserId, taskId || null);

        return NextResponse.json({
            success: true,
            conversation_id: result.lastInsertRowid,
            message: 'Conversation created'
        });

    } catch (error: any) {
        console.error('Error creating conversation:', error);
        return NextResponse.json(
            { error: 'Failed to create conversation' },
            { status: 500 }
        );
    }
}
