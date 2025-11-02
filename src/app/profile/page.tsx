'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    User,
    Mail,
    MapPin,
    Phone,
    Briefcase,
    DollarSign,
    Calendar,
    Edit2,
    Save,
    X,
    Upload,
    CheckCircle,
    Star
} from 'lucide-react';

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        skills: '',
        hourly_rate: '',
        location: '',
        phone: '',
        profile_image: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/profile');

            if (response.status === 401) {
                router.push('/login');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setProfile(data.profile);

                // Initialize form data
                setFormData({
                    name: data.profile.name || '',
                    bio: data.profile.bio || '',
                    skills: data.profile.skills || '',
                    hourly_rate: data.profile.hourly_rate || '',
                    location: data.profile.location || '',
                    phone: data.profile.phone || '',
                    profile_image: data.profile.profile_image || ''
                });
            } else {
                console.error('Failed to fetch profile');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image must be under 5MB' });
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = async () => {
            const dataUrl = reader.result as string;

            try {
                setSaving(true);
                const res = await fetch('/api/profile/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: file.name, data: dataUrl }),
                });

                const result = await res.json();
                if (res.ok && result.url) {
                    setFormData((prev: any) => ({ ...prev, profile_image: result.url }));
                    setProfile((prev: any) => ({ ...prev, profile_image: result.url }));
                    setMessage({ type: 'success', text: 'Image uploaded successfully' });
                    setTimeout(() => setMessage(null), 2500);
                } else {
                    setMessage({ type: 'error', text: result.error || 'Image upload failed' });
                }
            } catch (err) {
                console.error('Upload error', err);
                setMessage({ type: 'error', text: 'Upload failed' });
            } finally {
                setSaving(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage(null);

            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data.profile);
                setIsEditing(false);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });

                // Clear message after 3 seconds
                setTimeout(() => setMessage(null), 3000);
            } else {
                const errorData = await response.json();
                setMessage({ type: 'error', text: errorData.error || 'Failed to update profile' });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'An error occurred while updating profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form data to original profile data
        setFormData({
            name: profile.name || '',
            bio: profile.bio || '',
            skills: profile.skills || '',
            hourly_rate: profile.hourly_rate || '',
            location: profile.location || '',
            phone: profile.phone || '',
            profile_image: profile.profile_image || ''
        });
        setIsEditing(false);
        setMessage(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Profile not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success/Error Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        <div className="flex items-center">
                            {message.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 mr-2" />
                            ) : (
                                <X className="w-5 h-5 mr-2" />
                            )}
                            <span>{message.text}</span>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border mb-6">
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                                {/* Profile Image */}
                                <div className="relative">
                                    <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                                        {formData.profile_image ? (
                                            <img
                                                src={formData.profile_image}
                                                alt={profile.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-12 h-12 text-gray-600" />
                                        )}
                                    </div>
                                    {isEditing && (
                                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                                            <Upload className="w-4 h-4" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>

                                <div>
                                    {!isEditing ? (
                                        <>
                                            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                                            <p className="text-gray-600 capitalize mt-1">{profile.type}</p>
                                            <div className="flex items-center space-x-1 mt-2">
                                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                                <span className="font-medium">4.8</span>
                                                <span className="text-gray-500">(12 reviews)</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Your Name"
                                                className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none px-2 py-1"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Edit/Save Buttons */}
                            <div className="flex space-x-2">
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        <span>Edit Profile</span>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>{saving ? 'Saving...' : 'Save'}</span>
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={saving}
                                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Cancel</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio Section */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                            {!isEditing ? (
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {profile.bio || 'No bio added yet. Click "Edit Profile" to add one.'}
                                </p>
                            ) : (
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={6}
                                    placeholder="Tell us about yourself, your experience, and what you're looking for..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                            )}
                        </div>

                        {/* Skills Section */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                            {!isEditing ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills ? (
                                        (typeof profile.skills === 'string' ? profile.skills.split(',') : profile.skills).map((skill: string, index: number) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                            >
                                                {skill.trim()}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No skills added yet</p>
                                    )}
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleInputChange}
                                    placeholder="Enter skills separated by commas (e.g., React, Node.js, Python)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                            )}
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                            <div className="space-y-4">
                                {/* Email */}
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-gray-900">{profile.email}</p>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-center space-x-3">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Phone</p>
                                        {!isEditing ? (
                                            <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                                        ) : (
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="Your phone number"
                                                className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 w-full"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-center space-x-3">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Location</p>
                                        {!isEditing ? (
                                            <p className="text-gray-900">{profile.location || 'Not provided'}</p>
                                        ) : (
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                placeholder="City, Country"
                                                className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 w-full"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats & Info */}
                    <div className="space-y-6">
                        {/* Stats Card */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistics</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Completed Tasks</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {profile.stats?.completedTasks || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Tasks</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {profile.stats?.totalTasks || 0}
                                    </p>
                                </div>
                                {profile.type === 'freelancer' && (
                                    <>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Proposals</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {profile.stats?.totalProposals || 0}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Accepted</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {profile.stats?.acceptedProposals || 0}
                                            </p>
                                        </div>
                                    </>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500">Total Earned</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(profile.stats?.totalEarned || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Hourly Rate */}
                        {profile.type === 'freelancer' && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Hourly Rate</h2>
                                {!isEditing ? (
                                    <div className="flex items-center space-x-2">
                                        <DollarSign className="w-6 h-6 text-green-600" />
                                        <span className="text-3xl font-bold text-gray-900">
                                            {profile.hourly_rate ? formatCurrency(profile.hourly_rate) : 'Not set'}
                                        </span>
                                        <span className="text-gray-500">/hr</span>
                                    </div>
                                ) : (
                                    <input
                                        type="number"
                                        name="hourly_rate"
                                        value={formData.hourly_rate}
                                        onChange={handleInputChange}
                                        placeholder="Your hourly rate (NPR)"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                    />
                                )}
                            </div>
                        )}

                        {/* Member Since */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Member Since</h2>
                            <div className="flex items-center space-x-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-900">
                                    {formatDate(profile.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
