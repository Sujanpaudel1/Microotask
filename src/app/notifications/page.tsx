'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Bell,
    Check,
    CheckCheck,
    FileText,
    MessageSquare,
    UserPlus,
    DollarSign,
    AlertCircle,
    Clock
} from 'lucide-react';

interface Notification {
    id: number;
    user_id: number;
    type: string;
    payload: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationPayload {
    message: string;
    taskId?: number;
    taskTitle?: string;
    proposalId?: number;
    conversationId?: number;
    [key: string]: any;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const router = useRouter();

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const authRes = await fetch('/api/auth/verify', { credentials: 'include' });
            if (!authRes.ok) {
                router.push('/login');
                return;
            }

            const res = await fetch('/api/notifications', {
                credentials: 'include',
                cache: 'no-store'
            });

            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: number) => {
        try {
            const res = await fetch(`/api/notifications/${notificationId}`, {
                method: 'PATCH',
                credentials: 'include'
            });

            if (res.ok) {
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notificationId ? { ...n, is_read: true } : n
                    )
                );
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const res = await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                credentials: 'include'
            });

            if (res.ok) {
                setNotifications(prev =>
                    prev.map(n => ({ ...n, is_read: true }))
                );
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read if not already
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        // Parse payload and navigate based on type
        try {
            const payload: NotificationPayload = JSON.parse(notification.payload);

            if (payload.taskId) {
                router.push(`/tasks/${payload.taskId}`);
            } else if (payload.conversationId) {
                router.push(`/messages?conversation=${payload.conversationId}`);
            }
        } catch (error) {
            console.error('Failed to parse notification payload:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'proposal_submitted':
            case 'proposal_accepted':
            case 'proposal_rejected':
                return <FileText className="w-5 h-5" />;
            case 'task_completed':
            case 'task_assigned':
                return <CheckCheck className="w-5 h-5" />;
            case 'new_message':
                return <MessageSquare className="w-5 h-5" />;
            case 'payment_received':
            case 'payment_sent':
                return <DollarSign className="w-5 h-5" />;
            case 'review_received':
                return <UserPlus className="w-5 h-5" />;
            default:
                return <Bell className="w-5 h-5" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'proposal_accepted':
            case 'task_completed':
            case 'payment_received':
                return 'text-green-600 bg-green-50';
            case 'proposal_rejected':
                return 'text-red-600 bg-red-50';
            case 'new_message':
                return 'text-blue-600 bg-blue-50';
            case 'task_assigned':
            case 'proposal_submitted':
                return 'text-orange-600 bg-orange-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const filteredNotifications = notifications.filter(n =>
        filter === 'all' ? true : !n.is_read
    );

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="bg-white rounded-lg p-6 h-24"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                    <p className="text-gray-600">
                        {unreadCount > 0 ? (
                            <>You have <span className="font-semibold text-blue-600">{unreadCount}</span> unread notification{unreadCount > 1 ? 's' : ''}</>
                        ) : (
                            'All caught up! No unread notifications'
                        )}
                    </p>
                </div>

                {/* Filters and Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'unread'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center">
                        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </h3>
                        <p className="text-gray-600">
                            {filter === 'unread'
                                ? "You're all caught up! Check back later for updates."
                                : "When you receive notifications, they'll appear here."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => {
                            let payload: NotificationPayload;
                            try {
                                payload = JSON.parse(notification.payload);
                            } catch {
                                payload = { message: 'Notification received' };
                            }

                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`bg-white rounded-lg p-5 cursor-pointer transition-all hover:shadow-md ${!notification.is_read ? 'border-l-4 border-blue-600 bg-blue-50/30' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`p-3 rounded-full ${getNotificationColor(notification.type)}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-gray-900 mb-1 ${!notification.is_read ? 'font-semibold' : ''}`}>
                                                {payload.message}
                                            </p>
                                            {payload.taskTitle && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Task: {payload.taskTitle}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                {getRelativeTime(notification.created_at)}
                                            </div>
                                        </div>

                                        {/* Mark as read button */}
                                        {!notification.is_read && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notification.id);
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
