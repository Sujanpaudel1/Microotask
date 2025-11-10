'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Send, ArrowLeft, User as UserIcon, Clock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface Message {
    id: number;
    conversation_id: number;
    sender: {
        id: number;
        name: string;
        avatar: string | null;
    };
    content: string;
    is_mine: boolean;
    is_read: boolean;
    created_at: string;
}

interface Conversation {
    id: number;
    task_id: number | null;
    task_title: string | null;
    other_user: {
        id: number;
        name: string;
        avatar: string | null;
    };
    last_message: {
        content: string;
        is_mine: boolean;
        created_at: string;
    } | null;
    unread_count: number;
    created_at: string;
}

function MessagesContent() {
    const searchParams = useSearchParams();
    const conversationParam = searchParams?.get('conversation');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<number | null>(
        conversationParam ? parseInt(conversationParam) : null
    );
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch conversations
    useEffect(() => {
        fetchConversations();
    }, []);

    // Fetch messages when conversation is selected
    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation);
        }
    }, [selectedConversation]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Poll for new messages every 3 seconds
    useEffect(() => {
        if (!selectedConversation) return;

        const interval = setInterval(() => {
            fetchMessages(selectedConversation, true);
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedConversation]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/messages/conversations', {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId: number, silent = false) => {
        try {
            const res = await fetch(`/api/messages?conversationId=${conversationId}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);

                // Refresh conversations list to update unread counts
                if (!silent) {
                    fetchConversations();
                }
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !selectedConversation || sending) return;

        setSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    conversationId: selectedConversation,
                    content: newMessage.trim()
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, data.message]);
                setNewMessage('');
                fetchConversations(); // Update conversation list
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const selectedConv = conversations.find(c => c.id === selectedConversation);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading messages...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-20 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

                    <div className="bg-white rounded-lg shadow-sm border h-[calc(100vh-200px)] flex">
                        {/* Conversations List */}
                        <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r overflow-y-auto`}>
                            {conversations.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <p>No conversations yet</p>
                                    <p className="text-sm mt-2">Start messaging by submitting a proposal on a task</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {conversations.map(conv => (
                                        <div
                                            key={conv.id}
                                            onClick={() => setSelectedConversation(conv.id)}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation === conv.id ? 'bg-blue-50' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                    {conv.other_user.avatar ? (
                                                        <img
                                                            src={conv.other_user.avatar}
                                                            alt={conv.other_user.name}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <UserIcon className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {conv.other_user.name}
                                                        </h3>
                                                        {conv.last_message && (
                                                            <span className="text-xs text-gray-500 ml-2">
                                                                {formatTime(conv.last_message.created_at)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {conv.task_title && (
                                                        <p className="text-xs text-gray-500 truncate">
                                                            Re: {conv.task_title}
                                                        </p>
                                                    )}
                                                    {conv.last_message && (
                                                        <p className="text-sm text-gray-600 truncate mt-1">
                                                            {conv.last_message.is_mine ? 'You: ' : ''}
                                                            {conv.last_message.content}
                                                        </p>
                                                    )}
                                                    {conv.unread_count > 0 && (
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                                                            {conv.unread_count} new
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Messages Area */}
                        <div className={`${selectedConversation ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
                            {selectedConversation && selectedConv ? (
                                <>
                                    {/* Header */}
                                    <div className="p-4 border-b flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedConversation(null)}
                                            className="md:hidden"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                            {selectedConv.other_user.avatar ? (
                                                <img
                                                    src={selectedConv.other_user.avatar}
                                                    alt={selectedConv.other_user.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <UserIcon className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-gray-900">
                                                {selectedConv.other_user.name}
                                            </h2>
                                            {selectedConv.task_title && (
                                                <p className="text-sm text-gray-500">
                                                    Re: {selectedConv.task_title}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {messages.length === 0 ? (
                                            <div className="text-center text-gray-500 mt-8">
                                                <p>No messages yet</p>
                                                <p className="text-sm mt-2">Start the conversation!</p>
                                            </div>
                                        ) : (
                                            messages.map(msg => (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[70%] px-4 py-2 rounded-lg ${msg.is_mine
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-gray-100 text-gray-900'
                                                            }`}
                                                    >
                                                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                        <p
                                                            className={`text-xs mt-1 flex items-center gap-1 ${msg.is_mine ? 'text-blue-100' : 'text-gray-500'
                                                                }`}
                                                        >
                                                            <Clock className="w-3 h-3" />
                                                            {formatTime(msg.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input */}
                                    <form onSubmit={sendMessage} className="p-4 border-t">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type a message..."
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                disabled={sending}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim() || sending}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                <Send className="w-4 h-4" />
                                                {sending ? 'Sending...' : 'Send'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <p className="text-lg">Select a conversation to start messaging</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading messages...</p>
                    </div>
                </div>
                <Footer />
            </>
        }>
            <MessagesContent />
        </Suspense>
    );
}
