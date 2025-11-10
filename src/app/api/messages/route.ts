import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database-sqlite';
import { verifyToken } from '@/lib/auth';

// GET - Fetch messages in a conversation
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
        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get('conversationId');

        if (!conversationId) {
            return NextResponse.json(
                { error: 'Conversation ID is required' },
                { status: 400 }
            );
        }

        // Verify user is part of the conversation
        const conversation = db.prepare(`
            SELECT * FROM conversations 
            WHERE id = ? AND (participant_1_id = ? OR participant_2_id = ?)
        `).get(conversationId, userId, userId);

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found or access denied' },
                { status: 404 }
            );
        }

        // Fetch messages
        const messages = db.prepare(`
            SELECT 
                m.*,
                u.name as sender_name,
                u.avatar as sender_avatar
            FROM messages m
            LEFT JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = ?
            ORDER BY m.created_at ASC
        `).all(conversationId) as any[];

        // Mark messages as read
        db.prepare(`
            UPDATE messages 
            SET is_read = 1, read_at = CURRENT_TIMESTAMP
            WHERE conversation_id = ? AND receiver_id = ? AND is_read = 0
        `).run(conversationId, userId);

        return NextResponse.json({
            success: true,
            messages: messages.map(msg => ({
                id: msg.id,
                conversation_id: msg.conversation_id,
                sender: {
                    id: msg.sender_id,
                    name: msg.sender_name,
                    avatar: msg.sender_avatar
                },
                content: msg.content,
                is_mine: msg.sender_id === userId,
                is_read: msg.is_read === 1,
                created_at: msg.created_at,
                read_at: msg.read_at
            }))
        });

    } catch (error: any) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

// POST - Send a new message
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
        const { conversationId, content } = await request.json();

        if (!conversationId || !content) {
            return NextResponse.json(
                { error: 'Conversation ID and content are required' },
                { status: 400 }
            );
        }

        if (content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Message cannot be empty' },
                { status: 400 }
            );
        }

        if (content.length > 5000) {
            return NextResponse.json(
                { error: 'Message too long (max 5000 characters)' },
                { status: 400 }
            );
        }

        // Verify user is part of the conversation and get receiver
        const conversation = db.prepare(`
            SELECT 
                participant_1_id,
                participant_2_id,
                task_id
            FROM conversations 
            WHERE id = ? AND (participant_1_id = ? OR participant_2_id = ?)
        `).get(conversationId, userId, userId) as any;

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found or access denied' },
                { status: 404 }
            );
        }

        // Determine receiver
        const receiverId = conversation.participant_1_id === userId
            ? conversation.participant_2_id
            : conversation.participant_1_id;

        // Insert message
        const result = db.prepare(`
            INSERT INTO messages (conversation_id, sender_id, receiver_id, content)
            VALUES (?, ?, ?, ?)
        `).run(conversationId, userId, receiverId, content.trim());

        // Update conversation last_message_at
        db.prepare(`
            UPDATE conversations 
            SET last_message_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(conversationId);

        // Create notification for receiver
        const sender = db.prepare('SELECT name FROM users WHERE id = ?').get(userId) as any;
        db.prepare(`
            INSERT INTO notifications (user_id, type, title, message, link)
            VALUES (?, 'message', ?, ?, ?)
        `).run(
            receiverId,
            `New message from ${sender.name}`,
            content.substring(0, 100),
            `/messages?conversation=${conversationId}`
        );

        // Get the created message
        const message = db.prepare(`
            SELECT 
                m.*,
                u.name as sender_name,
                u.avatar as sender_avatar
            FROM messages m
            LEFT JOIN users u ON m.sender_id = u.id
            WHERE m.id = ?
        `).get(result.lastInsertRowid) as any;

        return NextResponse.json({
            success: true,
            message: {
                id: message.id,
                conversation_id: message.conversation_id,
                sender: {
                    id: message.sender_id,
                    name: message.sender_name,
                    avatar: message.sender_avatar
                },
                content: message.content,
                is_mine: true,
                is_read: false,
                created_at: message.created_at
            }
        });

    } catch (error: any) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
