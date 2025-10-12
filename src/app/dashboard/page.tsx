'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockTasks } from '@/lib/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    BarChart3,
    DollarSign,
    CheckCircle,
    Plus,
    Eye,
    Edit,
    MessageSquare,
    Star
} from 'lucide-react';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check authentication on component mount
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/verify');
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    // Not authenticated, redirect to login
                    router.push('/login');
                    return;
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/login');
                return;
            }
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    // Mock additional user data (extend the authenticated user data)
    const mockUserStats = {
        type: 'client', // or 'freelancer'
        tasksPosted: 5,
        tasksCompleted: 3,
        totalSpent: 125000,
        activeProposals: 12,
        rating: 4.8,
        reviewCount: 15
    };

    // Mock user's tasks
    const userTasks = mockTasks.slice(0, 3);

    const stats = [
        {
            title: 'Tasks Posted',
            value: user.tasksPosted,
            icon: <Plus className="w-6 h-6" />,
            color: 'bg-blue-500',
            change: '+2 this month'
        },
        {
            title: 'Tasks Completed',
            value: user.tasksCompleted,
            icon: <CheckCircle className="w-6 h-6" />,
            color: 'bg-green-500',
            change: '+1 this week'
        },
        {
            title: 'Total Spent',
            value: formatCurrency(user.totalSpent),
            icon: <DollarSign className="w-6 h-6" />,
            color: 'bg-purple-500',
            change: '+NPR 20000 this month'
        },
        {
            title: 'Active Proposals',
            value: user.activeProposals,
            icon: <MessageSquare className="w-6 h-6" />,
            color: 'bg-orange-500',
            change: '3 new today'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.name || 'User'}!
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Here&apos;s an overview of your MicroTask activity
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                    <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                                </div>
                                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'tasks'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                My Tasks
                            </button>
                            <button
                                onClick={() => setActiveTab('proposals')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'proposals'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Proposals
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Recent Activity */}
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                <Plus className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">New task posted</p>
                                                <p className="text-sm text-gray-600">Design a Modern Logo for Tech Startup</p>
                                                <p className="text-xs text-gray-500">2 hours ago</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Task completed</p>
                                                <p className="text-sm text-gray-600">Write SEO-Optimized Blog Posts</p>
                                                <p className="text-xs text-gray-500">1 day ago</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                                <MessageSquare className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">3 new proposals received</p>
                                                <p className="text-sm text-gray-600">Build a React Dashboard Component</p>
                                                <p className="text-xs text-gray-500">3 days ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Chart Placeholder */}
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
                                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <div className="text-center">
                                            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500">Chart coming soon</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-900">My Posted Tasks</h2>
                                    <Link
                                        href="/post-task"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Post New Task</span>
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    {userTasks.map((task) => (
                                        <div key={task.id} className="bg-white rounded-lg shadow-sm border p-6">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                                                    task.status === 'In Progress' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                    {task.status}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>

                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>{formatCurrency(task.budget.min)} - {formatCurrency(task.budget.max)}</span>
                                                    <span>•</span>
                                                    <span>Due {formatDate(task.deadline)}</span>
                                                </div>

                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={`/tasks/${task.id}`}
                                                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'proposals' && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Proposals</h2>
                                <div className="text-center py-8">
                                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No proposals yet</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Proposals will appear here when freelancers apply to your tasks
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile</h3>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3"></div>
                                <h4 className="font-medium text-gray-900">{user?.name || 'User'}</h4>
                                <p className="text-sm text-gray-600 capitalize">{user.type}</p>

                                <div className="flex items-center justify-center space-x-1 mt-2">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm font-medium">{user.rating}</span>
                                    <span className="text-sm text-gray-500">({user.reviewCount} reviews)</span>
                                </div>

                                <button className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    href="/post-task"
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                                >
                                    Post New Task
                                </Link>
                                <Link
                                    href="/tasks"
                                    className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-center block"
                                >
                                    Browse Tasks
                                </Link>
                                <Link
                                    href="/freelancers"
                                    className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-center block"
                                >
                                    Find Freelancers
                                </Link>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Pro Tip</h3>
                            <p className="text-sm text-gray-700">
                                Tasks with detailed descriptions and clear requirements receive 3x more quality proposals.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}