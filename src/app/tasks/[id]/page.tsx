'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import {
    DollarSign,
    User,
    Star,
    Calendar,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    X
} from 'lucide-react';

interface TaskDetailPageProps {
    params: {
        id: string;
    };
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
    const [proposalText, setProposalText] = useState('');
    const [proposalPrice, setProposalPrice] = useState('');
    const [showProposalForm, setShowProposalForm] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [task, setTask] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        fetch('/api/tasks')
            .then(res => res.json())
            .then(data => {
                if (!mounted) return;
                const found = data.tasks.find((t: any) => String(t.id) === String(params.id));
                if (found) {
                    // Normalize task data
                    const normalized = {
                        ...found,
                        budget: found.budget || { min: found.budget_min || 0, max: found.budget_max || 0 },
                        client: found.client || {
                            name: found.client_name || 'Unknown Client',
                            rating: found.client_rating || 0,
                            reviewCount: found.client_review_count || 0,
                            completedTasks: 0,
                            joinedDate: found.created_at,
                            isVerified: false
                        },
                        skillsRequired: Array.isArray(found.skillsRequired)
                            ? found.skillsRequired
                            : (found.skills_required ? (typeof found.skills_required === 'string' ? JSON.parse(found.skills_required) : found.skills_required) : []),
                        tags: Array.isArray(found.tags)
                            ? found.tags
                            : (found.tags ? (typeof found.tags === 'string' ? JSON.parse(found.tags) : found.tags) : []),
                        createdAt: found.createdAt || found.created_at,
                        updatedAt: found.updatedAt || found.updated_at,
                    };
                    setTask(normalized);
                } else {
                    setTask(null);
                }
            })
            .catch(err => console.error('Failed to load task', err))
            .finally(() => setLoading(false));

        return () => { mounted = false; };
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h1>
                    <p className="text-gray-600 mb-4">The task you&apos;re looking for doesn&apos;t exist.</p>
                    <Link href="/tasks" className="text-blue-600 hover:text-blue-700">
                        ← Back to Tasks
                    </Link>
                </div>
            </div>
        );
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy':
                return 'bg-green-100 text-green-800';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'Hard':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open':
                return 'bg-blue-100 text-blue-800';
            case 'In Progress':
                return 'bg-orange-100 text-orange-800';
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSubmitProposal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Verify user
            const verifyRes = await fetch('/api/auth/verify');
            if (!verifyRes.ok) {
                alert('You must be logged in to submit a proposal.');
                window.location.href = `/login?redirect=/tasks/${params.id}`;
                return;
            }
            const verifyData = await verifyRes.json();
            const freelancerId = verifyData?.user?.id;

            const payload = {
                freelancerId,
                message: proposalText,
                proposedPrice: Number(proposalPrice),
                estimatedDuration: null,
            };

            const res = await fetch(`/api/tasks/${params.id}/proposals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                console.error('Failed to submit proposal', err);
                alert('Failed to submit proposal');
                return;
            }

            // Refresh task data to show updated counts
            const refreshed = await fetch('/api/tasks');
            const refreshedData = await refreshed.json();
            const found = refreshedData.tasks.find((t: any) => String(t.id) === String(params.id));
            setTask(found || task);

            alert('Proposal submitted successfully!');
            setShowProposalForm(false);
            setProposalText('');
            setProposalPrice('');
        } catch (err) {
            console.error('Error submitting proposal', err);
            alert('An error occurred');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => setShowLoginPrompt(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Login Required
                            </h3>
                            <p className="text-gray-600">
                                To apply for this task, please login to your account first.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.href = `/login?redirect=/tasks/${params.id}`}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Go to Login
                            </button>
                            <button
                                onClick={() => setShowLoginPrompt(false)}
                                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href="/tasks"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Tasks
                    </Link>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Task Header */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-3">{task.title}</h1>
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getDifficultyColor(task.difficulty))}>
                                            {task.difficulty}
                                        </span>
                                        <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getStatusColor(task.status))}>
                                            {task.status}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Category: {task.category}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Budget and Deadline */}
                            <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Budget</p>
                                        <p className="text-lg font-semibold text-green-600">
                                            {formatCurrency(task.budget.min)} - {formatCurrency(task.budget.max)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Deadline</p>
                                        <p className="text-lg font-semibold text-blue-600">
                                            {formatDate(task.deadline)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {task.description}
                                </p>
                            </div>
                        </div>

                        {/* Skills Required */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills Required</h2>
                            <div className="flex flex-wrap gap-2">
                                {((task.skillsRequired || []) as any[]).map((skill: any, index: any) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
                                <div className="flex flex-wrap gap-2">
                                    {((task.tags || []) as any[]).map((tag: any, index: any) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Proposals Section */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Proposals ({task.proposals_count || 0})
                            </h2>
                            {task.proposals_count > 0 && task.proposals_total > 0 && (
                                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-900">
                                        <span className="font-semibold">Total Bids:</span> NPR {task.proposals_total.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Average bid: NPR {Math.round(task.proposals_total / task.proposals_count).toLocaleString()}
                                    </p>
                                </div>
                            )}
                            <p className="text-gray-600">
                                Proposals are only visible to the client who posted this task.
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Client Info */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Client</h3>
                            <div className="flex items-start space-x-3">
                                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{task.client.name}</h4>
                                    <div className="flex items-center space-x-1 mt-1">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        <span className="text-sm text-gray-600">
                                            {task.client.rating} ({task.client.reviewCount} reviews)
                                        </span>
                                    </div>
                                    <div className="mt-2 space-y-1">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                            {task.client.completedTasks} tasks completed
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Member since {formatDate(task.client.joinedDate)}
                                        </div>
                                    </div>
                                    {task.client.isVerified && (
                                        <div className="mt-2">
                                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Verified Client
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Apply Section */}
                        {task.status === 'Open' && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply for this Task</h3>

                                {!showProposalForm ? (
                                    <button
                                        onClick={async () => {
                                            // Check authentication before showing form
                                            try {
                                                const res = await fetch('/api/auth/verify');
                                                if (res.ok) {
                                                    setShowProposalForm(true);
                                                } else {
                                                    setShowLoginPrompt(true);
                                                }
                                            } catch (err) {
                                                setShowLoginPrompt(true);
                                            }
                                        }}
                                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        Submit Proposal
                                    </button>
                                ) : (
                                    <form onSubmit={handleSubmitProposal} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Proposal
                                            </label>
                                            <textarea
                                                value={proposalText}
                                                onChange={(e) => setProposalText(e.target.value)}
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                                placeholder="Describe how you'll complete this task..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Price (NPR)
                                            </label>
                                            <input
                                                type="number"
                                                value={proposalPrice}
                                                onChange={(e) => setProposalPrice(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                                placeholder="Enter your price in NPR"
                                                min="1"
                                                required
                                            />
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                type="submit"
                                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                            >
                                                Submit Proposal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowProposalForm(false)}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}

                                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                                    <div className="flex items-start space-x-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-yellow-800 font-medium">
                                                Tips for a winning proposal:
                                            </p>
                                            <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                                                <li>Show relevant experience</li>
                                                <li>Ask clarifying questions</li>
                                                <li>Provide a realistic timeline</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Task Stats */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Posted:</span>
                                    <span className="text-gray-900">{formatDate(task.createdAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Updated:</span>
                                    <span className="text-gray-900">{formatDate(task.updatedAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Category:</span>
                                    <span className="text-gray-900">{task.category}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}