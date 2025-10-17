'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    DollarSign,
    User,
    Star,
    Calendar,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    Award
} from 'lucide-react';

interface Proposal {
    id: number;
    freelancer_id: number;
    freelancer_name: string;
    freelancer_email: string;
    rating: number;
    review_count: number;
    completed_tasks: number;
    profile_image: string;
    message: string;
    proposed_price: number;
    estimated_duration: string;
    status: string;
    created_at: string;
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
    const [task, setTask] = useState<any | null>(null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'details' | 'proposals'>('details');

    useEffect(() => {
        fetchTask();
        fetchProposals();
        checkAuth();
    }, [params.id]);

    async function checkAuth() {
        try {
            const res = await fetch('/api/auth/verify', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setCurrentUser(data.user);
            }
        } catch (err) {
            console.log('Not authenticated');
        }
    }

    async function fetchTask() {
        try {
            const res = await fetch(`/api/tasks/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setTask(data.task);
            }
        } catch (err) {
            console.error('Error fetching task:', err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchProposals() {
        try {
            const res = await fetch(`/api/tasks/${params.id}/proposals`);
            if (res.ok) {
                const data = await res.json();
                setProposals(data.proposals || []);
            }
        } catch (err) {
            console.error('Error fetching proposals:', err);
        }
    }

    async function handleAcceptProposal(proposalId: number) {
        if (!confirm('Accept this proposal? All other proposals will be rejected.')) return;

        try {
            const res = await fetch(`/api/tasks/${params.id}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ proposalId })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to accept proposal');
            }

            alert('Proposal accepted successfully!');
            fetchTask();
            fetchProposals();
        } catch (err: any) {
            alert(err.message);
        }
    }

    async function handleRejectProposal(proposalId: number) {
        if (!confirm('Reject this proposal?')) return;

        try {
            const res = await fetch(`/api/tasks/${params.id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ proposalId })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to reject proposal');
            }

            alert('Proposal rejected');
            fetchProposals();
        } catch (err: any) {
            alert(err.message);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading task...</div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h1>
                    <Link href="/tasks" className="text-blue-600 hover:text-blue-700">
                        ← Back to Tasks
                    </Link>
                </div>
            </div>
        );
    }

    const isOwner = currentUser && task.client_id === currentUser.id;
    const skillsRequired = typeof task.skills_required === 'string' 
        ? JSON.parse(task.skills_required) 
        : (task.skills_required || []);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    href="/tasks"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tasks
                </Link>

                {/* Task Header */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
                            <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    task.status === 'Open' ? 'bg-green-100 text-green-800' :
                                    task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                    task.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {task.status}
                                </span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                    {task.category}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Budget</div>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(task.budget_min)} - {formatCurrency(task.budget_max)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-5 h-5" />
                            <div>
                                <div className="text-xs text-gray-500">Deadline</div>
                                <div className="font-medium">{formatDate(task.deadline)}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-5 h-5" />
                            <div>
                                <div className="text-xs text-gray-500">Client</div>
                                <div className="font-medium">{task.client_name || 'Unknown'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-5 h-5" />
                            <div>
                                <div className="text-xs text-gray-500">Posted</div>
                                <div className="font-medium">{formatDate(task.created_at)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                                    activeTab === 'details'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Task Details
                            </button>
                            <button
                                onClick={() => setActiveTab('proposals')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                                    activeTab === 'proposals'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Proposals ({proposals.length})
                            </button>
                        </nav>
                    </div>

                    {/* Task Details Tab */}
                    {activeTab === 'details' && (
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                            <p className="text-gray-700 whitespace-pre-wrap mb-6">{task.description}</p>

                            {skillsRequired.length > 0 && (
                                <>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Skills Required</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {skillsRequired.map((skill: string, idx: number) => (
                                            <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Proposals Tab */}
                    {activeTab === 'proposals' && (
                        <div className="p-6">
                            {proposals.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    No proposals yet
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {proposals.map(proposal => (
                                        <div key={proposal.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                                        {proposal.profile_image ? (
                                                            <img src={proposal.profile_image} alt={proposal.freelancer_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-6 h-6 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{proposal.freelancer_name}</div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                                                            <span>{proposal.rating?.toFixed(1) || '0.0'} ({proposal.review_count || 0})</span>
                                                            <span>•</span>
                                                            <Award className="w-4 h-4" />
                                                            <span>{proposal.completed_tasks || 0} completed</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-green-600">{formatCurrency(proposal.proposed_price)}</div>
                                                    <div className="text-sm text-gray-500">{formatDate(proposal.created_at)}</div>
                                                </div>
                                            </div>

                                            <p className="text-gray-700 mb-3">{proposal.message}</p>

                                            <div className="flex justify-between items-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    proposal.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                    proposal.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {proposal.status}
                                                </span>

                                                {isOwner && proposal.status === 'Pending' && task.status === 'Open' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAcceptProposal(proposal.id)}
                                                            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectProposal(proposal.id)}
                                                            className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
