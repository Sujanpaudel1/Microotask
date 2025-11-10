'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TaskCard } from '@/components/TaskCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Bookmark, Loader2 } from 'lucide-react';

export default function SavedTasksPage() {
    const [savedTasks, setSavedTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchSavedTasks();
    }, []);

    const fetchSavedTasks = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/bookmarks');

            if (!res.ok) {
                if (res.status === 401) {
                    router.push('/login');
                    return;
                }
                throw new Error('Failed to fetch saved tasks');
            }

            const data = await res.json();
            setSavedTasks(data.savedTasks || []);
        } catch (error) {
            console.error('Error fetching saved tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-2">
                            <Bookmark className="w-8 h-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Saved Tasks</h1>
                        </div>
                        <p className="text-gray-600">
                            Tasks you've bookmarked for later
                        </p>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                            <p className="text-gray-600">Loading your saved tasks...</p>
                        </div>
                    ) : savedTasks.length > 0 ? (
                        <>
                            {/* Stats */}
                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-gray-600">
                                    {savedTasks.length} saved {savedTasks.length === 1 ? 'task' : 'tasks'}
                                </p>
                                <button
                                    onClick={fetchSavedTasks}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Refresh
                                </button>
                            </div>

                            {/* Tasks Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bookmark className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No saved tasks yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Start saving tasks you're interested in to come back to them later
                            </p>
                            <button
                                onClick={() => router.push('/tasks')}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Browse Tasks
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
