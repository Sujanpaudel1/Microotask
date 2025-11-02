'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Menu, X, Plus, LogOut, Clock, Check, ChevronRight } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface Notification {
    id: number;
    user_id: number;
    type: string;
    payload: string;
    is_read: boolean;
    created_at: string;
}

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [notifyCount, setNotifyCount] = useState<number>(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifDropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }

        if (showUserMenu || showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showUserMenu, showNotifications]);

    // Load notification count
    const loadNotificationCount = async () => {
        try {
            const res = await fetch('/api/notifications/unread-count', {
                credentials: 'include',
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                setNotifyCount(data.count || 0);
            }
        } catch (error) {
            console.log('Failed to load notification count:', error);
        }
    };

    // Load notifications for dropdown
    const loadNotifications = async () => {
        try {
            const res = await fetch('/api/notifications', {
                credentials: 'include',
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                // Get only the latest 5 notifications for dropdown
                setNotifications((data.notifications || []).slice(0, 5));
            }
        } catch (error) {
            console.log('Failed to load notifications:', error);
        }
    };

    // Check authentication on mount and route changes
    useEffect(() => {
        let mounted = true;
        async function loadUserData() {
            try {
                console.log('Navbar: Checking authentication...');
                const verifyRes = await fetch('/api/auth/verify', {
                    credentials: 'include',
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache'
                    }
                });
                console.log('Navbar: Auth response status:', verifyRes.status);

                if (!verifyRes.ok) {
                    console.log('Navbar: Not authenticated');
                    if (mounted) {
                        setIsAuthenticated(false);
                        setUser(null);
                        setNotifyCount(0);
                    }
                    return;
                }
                const verifyData = await verifyRes.json();
                console.log('Navbar: User data received:', verifyData?.user);

                if (mounted && verifyData?.user) {
                    setUser(verifyData.user);
                    setIsAuthenticated(true);

                    // Load unread notification count
                    loadNotificationCount();
                    // Load notifications for dropdown
                    loadNotifications();
                }
            } catch (err) {
                console.error('Navbar: Failed to load user data:', err);
                if (mounted) {
                    setIsAuthenticated(false);
                    setUser(null);
                    setNotifyCount(0);
                }
            }
        }

        loadUserData();
        return () => { mounted = false; };
    }, [pathname]); // Re-check auth when route changes

    // Poll for notification count updates every 30 seconds
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            loadNotificationCount();
            loadNotifications();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    // Helper functions for notifications
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type: string) => {
        // Return emoji or icon based on type
        switch (type) {
            case 'proposal_submitted': return '📝';
            case 'proposal_accepted': return '✅';
            case 'proposal_rejected': return '❌';
            case 'task_completed': return '🎉';
            case 'task_assigned': return '📋';
            case 'new_message': return '💬';
            case 'payment_received': return '💰';
            default: return '🔔';
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        setShowNotifications(false);

        // Mark as read if not already
        if (!notification.is_read) {
            try {
                await fetch(`/api/notifications/${notification.id}`, {
                    method: 'PATCH',
                    credentials: 'include'
                });
                loadNotificationCount();
                loadNotifications();
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }

        // Navigate based on payload
        try {
            const payload = JSON.parse(notification.payload);
            if (payload.taskId) {
                router.push(`/tasks/${payload.taskId}`);
            }
        } catch (error) {
            console.error('Failed to parse notification:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            setUser(null);
            setIsAuthenticated(false);
            setNotifyCount(0);
            router.push('/');
            // Force reload to clear any cached state
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="bg-white shadow-lg border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">M</span>
                            </div>
                            <span className="font-bold text-xl text-gray-900">MicroTask</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block flex-1 max-w-2xl mx-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for tasks..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                            />
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/tasks" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Find Tasks
                        </Link>
                        <Link href="/freelancers" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Find Talent
                        </Link>
                        <Link
                            href="/post-task"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Post Task</span>
                        </Link>

                        {/* Notifications */}
                        {isAuthenticated && (
                            <div className="relative" ref={notifDropdownRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none"
                                >
                                    <Bell className="w-5 h-5" />
                                    {notifyCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                                            {notifyCount > 9 ? '9+' : notifyCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50 max-h-[32rem] overflow-hidden flex flex-col">
                                        {/* Header */}
                                        <div className="px-4 py-3 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                                                {notifyCount > 0 && (
                                                    <span className="text-sm text-blue-600 font-medium">
                                                        {notifyCount} unread
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Notifications List */}
                                        <div className="overflow-y-auto flex-1">
                                            {notifications.length === 0 ? (
                                                <div className="px-4 py-8 text-center">
                                                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-gray-500 text-sm">No notifications yet</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-100">
                                                    {notifications.map((notif) => {
                                                        let message = 'New notification';
                                                        try {
                                                            const payload = JSON.parse(notif.payload);
                                                            message = payload.message || payload.title || message;
                                                        } catch (e) {
                                                            // Ignore parse errors
                                                        }

                                                        return (
                                                            <button
                                                                key={notif.id}
                                                                onClick={() => handleNotificationClick(notif)}
                                                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50/50' : ''
                                                                    }`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    {/* Icon */}
                                                                    <div className="text-2xl flex-shrink-0 mt-0.5">
                                                                        {getNotificationIcon(notif.type)}
                                                                    </div>

                                                                    {/* Content */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className={`text-sm text-gray-900 line-clamp-2 ${!notif.is_read ? 'font-semibold' : ''
                                                                            }`}>
                                                                            {message}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                                            <span className="text-xs text-gray-500">
                                                                                {getRelativeTime(notif.created_at)}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Unread Indicator */}
                                                                    {!notif.is_read && (
                                                                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        {notifications.length > 0 && (
                                            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                                                <Link
                                                    href="/notifications"
                                                    onClick={() => setShowNotifications(false)}
                                                    className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                                >
                                                    See all notifications
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Auth Links or User Menu */}
                        {isAuthenticated && user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none"
                                >
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                                        {user?.profile_image ? (
                                            <img src={user.profile_image} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-gray-600" />
                                        )}
                                    </div>
                                    <span className="font-medium">{user?.name || 'User'}</span>
                                </button>

                                {/* Dropdown Menu */}
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                                        <Link
                                            href="/dashboard"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/my-tasks"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            My Tasks
                                        </Link>
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            My Profile
                                        </Link>
                                        <hr className="my-2" />
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                handleLogout();
                                            }}
                                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search for tasks..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                />
                            </div>
                            <Link href="/tasks" className="block text-gray-700 hover:text-blue-600 transition-colors py-2">
                                Find Tasks
                            </Link>
                            <Link href="/freelancers" className="block text-gray-700 hover:text-blue-600 transition-colors py-2">
                                Find Talent
                            </Link>
                            <Link
                                href="/post-task"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 w-fit"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Post Task</span>
                            </Link>

                            {/* Mobile Auth Section */}
                            {isAuthenticated && user ? (
                                <div className="space-y-2 pt-4 border-t">
                                    <div className="flex items-center space-x-3 px-2">
                                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                                            {user?.profile_image ? (
                                                <img src={user.profile_image} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-gray-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                                            <p className="text-sm text-gray-500 capitalize">{user?.type || 'Member'}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        className="block text-gray-700 hover:text-blue-600 transition-colors py-2 px-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/my-tasks"
                                        className="block text-gray-700 hover:text-blue-600 transition-colors py-2 px-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        My Tasks
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="block text-gray-700 hover:text-blue-600 transition-colors py-2 px-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        My Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full text-left text-red-600 hover:text-red-700 transition-colors py-2 px-2 flex items-center space-x-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex space-x-4 pt-4 border-t">
                                    <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}