'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { TASK_CATEGORIES, DIFFICULTY_LEVELS, TASK_STATUS } from '@/lib/constants';

interface TaskFiltersProps {
    filters: {
        category: string;
        minBudget: string;
        maxBudget: string;
        difficulty: string;
        status: string;
        skills: string;
    };
    onFilterChange: (filters: any) => void;
    onClearFilters: () => void;
}

const COMMON_SKILLS = [
    'JavaScript',
    'Python',
    'React',
    'Node.js',
    'PHP',
    'HTML/CSS',
    'UI/UX Design',
    'Graphic Design',
    'Content Writing',
    'SEO',
    'Social Media'
];

export default function TaskFilters({ filters, onFilterChange, onClearFilters }: TaskFiltersProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<string[]>(
        filters.skills ? filters.skills.split(',') : []
    );

    const handleFilterChange = (key: string, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const handleSkillToggle = (skill: string) => {
        const newSkills = selectedSkills.includes(skill)
            ? selectedSkills.filter(s => s !== skill)
            : [...selectedSkills, skill];

        setSelectedSkills(newSkills);
        onFilterChange({ ...filters, skills: newSkills.join(',') });
    };

    const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

    return (
        <div className="space-y-4">
            {/* Filter Toggle Button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <Filter className="w-5 h-5" />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {activeFilterCount > 0 && (
                    <button
                        onClick={onClearFilters}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <X className="w-4 h-4" />
                        <span className="text-sm">Clear All</span>
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            {TASK_CATEGORIES.slice(1).map((cat: string) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Budget Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Budget Range (NPR)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="number"
                                placeholder="Min"
                                value={filters.minBudget}
                                onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                value={filters.maxBudget}
                                onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Difficulty Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Difficulty
                        </label>
                        <div className="flex gap-2">
                            {DIFFICULTY_LEVELS.map((diff: string) => (
                                <button
                                    key={diff}
                                    onClick={() => handleFilterChange('difficulty', filters.difficulty === diff ? '' : diff)}
                                    className={`px-4 py-2 rounded-lg border transition-colors ${filters.difficulty === diff
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {diff}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Statuses</option>
                            {TASK_STATUS.map((stat: string) => (
                                <option key={stat} value={stat}>{stat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Skills Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Required Skills
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_SKILLS.map(skill => (
                                <button
                                    key={skill}
                                    onClick={() => handleSkillToggle(skill)}
                                    className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedSkills.includes(skill)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
