'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
    count?: number;
}

export default function StarRating({
    rating,
    onRatingChange,
    readonly = false,
    size = 'md',
    showCount = false,
    count
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const handleClick = (value: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(value);
        }
    };

    const handleMouseEnter = (value: number) => {
        if (!readonly) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverRating(0);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => handleClick(value)}
                    onMouseEnter={() => handleMouseEnter(value)}
                    onMouseLeave={handleMouseLeave}
                    disabled={readonly}
                    className={`
                        ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
                        transition-transform duration-150
                        ${!readonly && 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded'}
                    `}
                    aria-label={`${value} star${value !== 1 ? 's' : ''}`}
                >
                    <Star
                        className={`
                            ${sizeClasses[size]}
                            ${value <= displayRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-none text-gray-300'
                            }
                            transition-colors duration-150
                        `}
                    />
                </button>
            ))}
            {showCount && count !== undefined && (
                <span className="ml-1 text-sm text-gray-600">
                    ({count})
                </span>
            )}
        </div>
    );
}
