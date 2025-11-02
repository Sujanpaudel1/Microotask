'use client';

import { useState } from 'react';
import { Search, Star, User, CheckCircle, Filter } from 'lucide-react';

export default function FreelancersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkill, setSelectedSkill] = useState('');
    const [minRating, setMinRating] = useState('');

    // No mock users - will be fetched from database in future implementation
    const mockUsers: any[] = [];

    // Get all unique skills
    const allSkills = Array.from(new Set(mockUsers.flatMap(user => user.skills)));

    const filteredFreelancers = mockUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesSkill = !selectedSkill || user.skills.includes(selectedSkill);
        const matchesRating = !minRating || user.rating >= parseFloat(minRating);

        return matchesSearch && matchesSkill && matchesRating;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Talented Freelancers</h1>
                    <p className="text-gray-600">
                        Connect with skilled professionals ready to help with your projects
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name or skills..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <select
                                value={selectedSkill}
                                onChange={(e) => setSelectedSkill(e.target.value)}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                            >
                                <option value="">All Skills</option>
                                {allSkills.map((skill) => (
                                    <option key={skill} value={skill}>
                                        {skill}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={minRating}
                                onChange={(e) => setMinRating(e.target.value)}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                            >
                                <option value="">Any Rating</option>
                                <option value="4.5">4.5+ Stars</option>
                                <option value="4.0">4.0+ Stars</option>
                                <option value="3.5">3.5+ Stars</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Info */}
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">
                        Showing {filteredFreelancers.length} freelancers
                    </p>
                </div>

                {/* Freelancers Grid */}
                {filteredFreelancers.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFreelancers.map((freelancer) => (
                            <div key={freelancer.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    {/* Profile Header */}
                                    <div className="flex items-start space-x-4 mb-4">
                                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                                            <User className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="text-lg font-semibold text-gray-900">{freelancer.name}</h3>
                                                {freelancer.isVerified && (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-1 mb-2">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {freelancer.rating}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    ({freelancer.reviewCount} reviews)
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            {freelancer.skills.slice(0, 3).map((skill: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {freelancer.skills.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                                                    +{freelancer.skills.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Completed Tasks</p>
                                            <p className="font-semibold text-gray-900">{freelancer.completedTasks}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Success Rate</p>
                                            <p className="font-semibold text-gray-900">
                                                {Math.round((freelancer.completedTasks / (freelancer.completedTasks + 5)) * 100)}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Member Since */}
                                    <div className="text-sm text-gray-500 mb-4">
                                        Member since {new Date(freelancer.joinedDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short'
                                        })}
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-2">
                                        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                            View Profile
                                        </button>
                                        <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                                            Send Message
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No freelancers found</h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your search terms or filters to find more freelancers.
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedSkill('');
                                setMinRating('');
                            }}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}

                {/* Why Choose Our Freelancers */}
                <section className="mt-16 bg-white rounded-lg shadow-sm border p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Our Freelancers?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            All our freelancers are carefully vetted to ensure you get the best quality tasks completed for your projects.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Professionals</h3>
                            <p className="text-gray-600">
                                All freelancers go through identity verification and skill assessment.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Star className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Top-Rated Talent</h3>
                            <p className="text-gray-600">
                                Only freelancers with excellent ratings and reviews are featured.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Filter className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
                            <p className="text-gray-600">
                                Money-back guarantee if you&apos;re not satisfied with the delivered task.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}