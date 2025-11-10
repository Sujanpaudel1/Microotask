'use client';

import { useState, useEffect } from 'react';
import { TaskCard } from '@/components/TaskCard';
import { TASK_CATEGORIES } from '@/lib/constants';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function TasksPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        fetch('/api/tasks')
            .then(res => res.json())
            .then(data => {
                if (mounted && data.tasks) setTasks(data.tasks);
            })
            .catch(err => console.error('Failed to load tasks', err))
            .finally(() => setLoading(false));

        return () => { mounted = false; };
    }, []);

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (Array.isArray(task.skills_required) ? task.skills_required : JSON.parse(task.skills_required || '[]')).some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === 'All Categories' || task.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case 'oldest':
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            case 'budget-high':
                return (b.budget_max || b.budget?.max || 0) - (a.budget_max || a.budget?.max || 0);
            case 'budget-low':
                return (a.budget_min || a.budget?.min || 0) - (b.budget_min || b.budget?.min || 0);
            default:
                return 0;
        }
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Tasks</h1>
                    <p className="text-gray-600">
                        Discover opportunities that match your skills and interests
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search tasks by title, description, or skills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                            >
                                {TASK_CATEGORIES.map((category: string) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="budget-high">Highest Budget</option>
                                <option value="budget-low">Lowest Budget</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>More Filters</span>
                        </button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Budget Range (NPR)
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            placeholder="Min NPR"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max NPR"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Difficulty
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                                        <option value="">All Levels</option>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                                        <option value="">All Status</option>
                                        <option value="open">Open</option>
                                        <option value="in-progress">In Progress</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Info */}
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">
                        Showing {sortedTasks.length} of {tasks.length} tasks
                    </p>
                </div>

                {/* Tasks Grid */}
                {sortedTasks.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedTasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your search terms or filters to find more tasks.
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('All Categories');
                                setSortBy('newest');
                            }}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}