'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, DollarSign, CheckCircle, XCircle, Edit, Trash2, Users, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

type Task = {
    id: number;
    title: string;
    description: string;
    category: string;
    budget_min: number;
    budget_max: number;
    deadline: string;
    status: string;
    created_at: string;
    proposalCount?: number;
};

export default function MyTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'in-progress' | 'completed' | 'cancelled'>('active');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    async function fetchTasks() {
        try {
            setLoading(true);
            const res = await fetch('/api/dashboard/my-tasks', {
                credentials: 'include'
            });

            if (!res.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const data = await res.json();
            setTasks(data.tasks || []);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }

    const filteredTasks = tasks.filter(task => {
        if (activeTab === 'active') return task.status === 'Open';
        if (activeTab === 'in-progress') return task.status === 'In Progress';
        if (activeTab === 'completed') return task.status === 'Completed';
        if (activeTab === 'cancelled') return task.status === 'Cancelled';
        return true;
    });

    async function handleCancelTask(taskId: number) {
        if (!confirm('Are you sure you want to cancel this task?')) return;

        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to cancel task');
            }

            alert('Task cancelled successfully');
            fetchTasks();
        } catch (err: any) {
            alert(err.message);
        }
    }

    async function handleCompleteTask(taskId: number) {
        if (!confirm('Mark this task as completed?')) return;

        try {
            const res = await fetch(`/api/tasks/${taskId}/complete`, {
                method: 'POST',
                credentials: 'include'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to complete task');
            }

            alert('Task marked as completed!');
            fetchTasks();
        } catch (err: any) {
            alert(err.message);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading your tasks...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
                    <p className="mt-2 text-gray-600">Manage all your posted tasks</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'active'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Active ({tasks.filter(t => t.status === 'Open').length})
                            </button>
                            <button
                                onClick={() => setActiveTab('in-progress')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'in-progress'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                In Progress ({tasks.filter(t => t.status === 'In Progress').length})
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'completed'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Completed ({tasks.filter(t => t.status === 'Completed').length})
                            </button>
                            <button
                                onClick={() => setActiveTab('cancelled')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'cancelled'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Cancelled ({tasks.filter(t => t.status === 'Cancelled').length})
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Task List */}
                {filteredTasks.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500">No {activeTab} tasks found</p>
                        <Link
                            href="/post-task"
                            className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Post a New Task
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTasks.map(task => (
                            <div key={task.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Link href={`/tasks/${task.id}`} className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                                                {task.title}
                                            </Link>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.status === 'Open' ? 'bg-green-100 text-green-800' :
                                                    task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                        task.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-red-100 text-red-800'
                                                }`}>
                                                {task.status}
                                            </span>
                                        </div>

                                        <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                <span>{formatCurrency(task.budget_min)} - {formatCurrency(task.budget_max)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>Due: {formatDate(task.deadline)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                <span>{task.proposalCount || 0} proposals</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>Posted: {formatDate(task.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 ml-4">
                                        {task.status === 'Open' && (
                                            <>
                                                <Link
                                                    href={`/tasks/${task.id}`}
                                                    className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    <Users className="w-4 h-4" />
                                                    View Proposals
                                                </Link>
                                                <Link
                                                    href={`/edit-task/${task.id}`}
                                                    className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleCancelTask(task.id)}
                                                    className="flex items-center gap-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                            </>
                                        )}

                                        {task.status === 'In Progress' && (
                                            <>
                                                <Link
                                                    href={`/tasks/${task.id}`}
                                                    className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                                <button
                                                    onClick={() => handleCompleteTask(task.id)}
                                                    className="flex items-center gap-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Mark Complete
                                                </button>
                                            </>
                                        )}

                                        {(task.status === 'Completed' || task.status === 'Cancelled') && (
                                            <Link
                                                href={`/tasks/${task.id}`}
                                                className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                View Details
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
