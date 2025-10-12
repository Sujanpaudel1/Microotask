'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Bell, User, Menu, X, Plus } from 'lucide-react';

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [notifyCount, setNotifyCount] = useState<number>(0);

    useEffect(() => {
        let mounted = true;
        async function loadNotifications() {
            try {
                const verifyRes = await fetch('/api/auth/verify');
                if (!verifyRes.ok) return;
                const verifyData = await verifyRes.json();
                const userId = verifyData?.user?.id;
                if (!userId) return;

                const res = await fetch(`/api/notifications?userId=${userId}`);
                if (!res.ok) return;
                const data = await res.json();
                if (mounted && Array.isArray(data.notifications)) {
                    const unread = data.notifications.filter((n: any) => !n.is_read).length;
                    setNotifyCount(unread);
                }
            } catch (err) {
                // ignore
            }
        }

        loadNotifications();
        return () => { mounted = false; };
    }, []);

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
                        <Link href="/notifications" className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            {notifyCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {notifyCount}
                                </span>
                            )}
                        </Link>

                        {/* Auth Links */}
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
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}