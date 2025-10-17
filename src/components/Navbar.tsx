'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Menu, X, Plus, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [notifyCount, setNotifyCount] = useState<number>(0);
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showUserMenu]);

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
                    const userId = verifyData.user.id;

                    // Load notifications
                    try {
                        const res = await fetch(`/api/notifications?userId=${userId}`, {
                            credentials: 'include',
                            cache: 'no-store'
                        });
                        if (res.ok) {
                            const data = await res.json();
                            if (mounted && Array.isArray(data.notifications)) {
                                const unread = data.notifications.filter((n: any) => !n.is_read).length;
                                setNotifyCount(unread);
                            }
                        }
                    } catch (notifErr) {
                        console.log('Failed to load notifications:', notifErr);
                    }
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
                            <Link href="/notifications" className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
                                <Bell className="w-5 h-5" />
                                {notifyCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {notifyCount}
                                    </span>
                                )}
                            </Link>
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