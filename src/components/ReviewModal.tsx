'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import StarRating from './StarRating';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskId: number;
    taskTitle: string;
    revieweeId: number;
    revieweeName: string;
    onReviewSubmitted?: () => void;
}

export default function ReviewModal({
    isOpen,
    onClose,
    taskId,
    taskTitle,
    revieweeId,
    revieweeName,
    onReviewSubmitted
}: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        try {
            setSubmitting(true);

            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    taskId,
                    revieweeId,
                    rating,
                    comment: comment.trim() || null
                })
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned an invalid response');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            alert('Review submitted successfully!');

            // Reset form
            setRating(0);
            setComment('');

            if (onReviewSubmitted) {
                onReviewSubmitted();
            }

            onClose();

        } catch (error: any) {
            console.error('Error submitting review:', error);
            alert(error.message || 'Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    disabled={submitting}
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Leave a Review
                </h2>
                <p className="text-gray-600 mb-6">
                    How was your experience with <span className="font-semibold">{revieweeName}</span> on &quot;{taskTitle}&quot;?
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating *
                        </label>
                        <div className="flex items-center gap-2">
                            <StarRating
                                rating={rating}
                                onRatingChange={setRating}
                                size="lg"
                            />
                            {rating > 0 && (
                                <span className="text-sm text-gray-600">
                                    {rating === 1 && 'Poor'}
                                    {rating === 2 && 'Fair'}
                                    {rating === 3 && 'Good'}
                                    {rating === 4 && 'Very Good'}
                                    {rating === 5 && 'Excellent'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comment (Optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {comment.length}/500 characters
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || rating === 0}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
