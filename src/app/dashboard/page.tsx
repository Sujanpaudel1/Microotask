'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    const [stats, setStats] = useState<any>(null);
    const [userTasks, setUserTasks] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [loadingActivities, setLoadingActivities] = useState(true);
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

    // Fetch dashboard stats
    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;

            try {
                setLoadingStats(true);
                const response = await fetch('/api/dashboard/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data.stats);
                } else {
                    console.error('Failed to fetch stats');
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, [user]);

    // Fetch user's tasks
    useEffect(() => {
        const fetchTasks = async () => {
            if (!user) return;

            try {
                setLoadingTasks(true);
                const response = await fetch('/api/dashboard/my-tasks');
                if (response.ok) {
                    const data = await response.json();
                    setUserTasks(data.tasks);
                } else {
                    console.error('Failed to fetch tasks');
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setLoadingTasks(false);
            }
        };

        fetchTasks();
    }, [user]);

    // Fetch recent activities
    useEffect(() => {
        const fetchActivities = async () => {
            if (!user) return;

            try {
                setLoadingActivities(true);
                const response = await fetch('/api/dashboard/activity');
                if (response.ok) {
                    const data = await response.json();
                    setActivities(data.activities || []);
                } else {
                    console.error('Failed to fetch activities');
                }
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoadingActivities(false);
            }
        };

        fetchActivities();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    // Create stats array from fetched data
    const statsArray = stats ? [
        {
            title: 'Tasks Posted',
            value: stats.tasksPosted || 0,
            icon: <Plus className="w-6 h-6" />,
            color: 'bg-blue-500',
            change: '+2 this month'
        },
        {
            title: 'Tasks Completed',
            value: stats.tasksCompleted || 0,
            icon: <CheckCircle className="w-6 h-6" />,
            color: 'bg-green-500',
            change: '+1 this week'
        },
        {
            title: 'Total Spent',
            value: formatCurrency(stats.totalSpent || 0),
            icon: <DollarSign className="w-6 h-6" />,
            color: 'bg-purple-500',
            change: `NPR ${formatCurrency(stats.totalSpent || 0)}`
        },
        {
            title: 'Active Proposals',
            value: stats.activeProposals || 0,
            icon: <MessageSquare className="w-6 h-6" />,
            color: 'bg-orange-500',
            change: 'On your tasks'
        }
    ] : [];

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
                    {loadingStats ? (
                        <div className="col-span-4 text-center py-8">
                            <div className="text-gray-600">Loading statistics...</div>
                        </div>
                    ) : (
                        statsArray.map((stat: any, index: number) => (
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
                        ))
                    )}
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
                                    {loadingActivities ? (
                                        <div className="text-center py-8 text-gray-600">Loading activities...</div>
                                    ) : activities.length > 0 ? (
                                        <div className="space-y-4">
                                            {activities.slice(0, 5).map((activity: any, index: number) => {
                                                const getActivityIcon = (type: string) => {
                                                    switch (type) {
                                                        case 'task_posted':
                                                            return { icon: <Plus className="w-4 h-4 text-white" />, color: 'bg-blue-500', bgColor: 'bg-blue-50' };
                                                        case 'proposal_submitted':
                                                            return { icon: <MessageSquare className="w-4 h-4 text-white" />, color: 'bg-orange-500', bgColor: 'bg-orange-50' };
                                                        case 'proposal_accepted':
                                                        case 'task_completed':
                                                            return { icon: <CheckCircle className="w-4 h-4 text-white" />, color: 'bg-green-500', bgColor: 'bg-green-50' };
                                                        case 'review_received':
                                                            return { icon: <Star className="w-4 h-4 text-white" />, color: 'bg-yellow-500', bgColor: 'bg-yellow-50' };
                                                        default:
                                                            return { icon: <MessageSquare className="w-4 h-4 text-white" />, color: 'bg-gray-500', bgColor: 'bg-gray-50' };
                                                    }
                                                };

                                                const { icon, color, bgColor } = getActivityIcon(activity.type);

                                                return (
                                                    <div key={activity.id} className={`flex items-center space-x-3 p-3 ${bgColor} rounded-lg`}>
                                                        <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center`}>
                                                            {icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                                            {activity.status && (
                                                                <p className="text-sm text-gray-600">{activity.status}</p>
                                                            )}
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(activity.timestamp).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No recent activity
                                        </div>
                                    )}
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
                                    {loadingTasks ? (
                                        <div className="text-center py-8">
                                            <div className="text-gray-600">Loading tasks...</div>
                                        </div>
                                    ) : userTasks.length === 0 ? (
                                        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                                            <div className="text-gray-500 mb-2">No tasks posted yet</div>
                                            <p className="text-sm text-gray-400">
                                                Post your first task to get started!
                                            </p>
                                        </div>
                                    ) : (
                                        userTasks.map((task: any) => (
                                            <div key={task.id} className="bg-white rounded-lg shadow-sm border p-6">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                                                        task.status === 'In Progress' ? 'bg-orange-100 text-orange-800' :
                                                            task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {task.status || 'Open'}
                                                    </span>
                                                </div>

                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>

                                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                                    <span className="font-medium">{formatCurrency(task.budget_min)} - {formatCurrency(task.budget_max)}</span>
                                                    <span>•</span>
                                                    <span>{task.proposals_count || 0} proposals</span>
                                                    <span>•</span>
                                                    <span className="text-xs">{task.category}</span>
                                                </div>

                                                <div className="flex justify-between items-center pt-3 border-t">
                                                    <div className="text-sm text-gray-500">
                                                        Posted {formatDate(task.created_at)}
                                                    </div>

                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={`/tasks/${task.id}`}
                                                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                                                            title="View Task"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                                                            title="Edit Task"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
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

                                <Link
                                    href="/profile"
                                    className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center block"
                                >
                                    Edit Profile
                                </Link>
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