// Platform constants and configuration

// Task categories for the platform
export const TASK_CATEGORIES = [
    'All Categories',
    'Web Development',
    'Mobile Development',
    'Design & Creative',
    'Writing & Translation',
    'Digital Marketing',
    'Video & Animation',
    'Music & Audio',
    'Programming & Tech',
    'Business & Finance',
    'Data Entry & Admin',
    'Customer Service',
    'Sales & Marketing',
    'Legal Services',
    'Education & Training',
    'Virtual Assistant',
    'Photography',
    'AI & Machine Learning',
    'Blockchain & Crypto',
    'Game Development',
    'Other'
] as const;

// Task difficulty levels
export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'] as const;

// Task status options
export const TASK_STATUS = ['Open', 'In Progress', 'Completed', 'Cancelled'] as const;

// Proposal status options
export const PROPOSAL_STATUS = ['Pending', 'Accepted', 'Rejected'] as const;
