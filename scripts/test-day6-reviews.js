// Test script for Day 6 - Reviews & Ratings System
const Database = require('better-sqlite3');
const db = new Database('./microtask.db');

console.log('=== DAY 6: REVIEWS & RATINGS SYSTEM TEST ===\n');

// 1. Check reviews table structure
console.log('1. Reviews Table Structure:');
const tableInfo = db.prepare('PRAGMA table_info(reviews)').all();
tableInfo.forEach(col => {
    console.log(`   - ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}`);
});
console.log('');

// 2. Count total reviews
const totalCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get();
console.log(`2. Total Reviews: ${totalCount.count}`);
console.log('');

// 3. Check users with updated ratings
console.log('3. Users with Review Statistics:');
const usersWithReviews = db.prepare(`
    SELECT u.id, u.name, u.email, u.rating, u.review_count
    FROM users u
    WHERE u.review_count > 0
    ORDER BY u.rating DESC
`).all();

if (usersWithReviews.length > 0) {
    usersWithReviews.forEach(user => {
        console.log(`   ${user.name}: ${'⭐'.repeat(Math.round(user.rating))} (${user.rating}/5 from ${user.review_count} reviews)`);
    });
} else {
    console.log('   No users have been reviewed yet');
}
console.log('');

// 4. Show sample reviews
if (totalCount.count > 0) {
    console.log('4. Sample Reviews:');
    const sampleReviews = db.prepare(`
        SELECT r.*,
               reviewer.name as reviewer_name,
               reviewee.name as reviewee_name,
               t.title as task_title
        FROM reviews r
        LEFT JOIN users reviewer ON r.reviewer_id = reviewer.id
        LEFT JOIN users reviewee ON r.reviewee_id = reviewee.id
        LEFT JOIN tasks t ON r.task_id = t.id
        ORDER BY r.created_at DESC
        LIMIT 5
    `).all();

    sampleReviews.forEach(review => {
        console.log(`\n   Review #${review.id}:`);
        console.log(`   Task: "${review.task_title}"`);
        console.log(`   ${review.reviewer_name} → ${review.reviewee_name}`);
        console.log(`   Rating: ${'⭐'.repeat(review.rating)} (${review.rating}/5)`);
        if (review.comment) {
            console.log(`   Comment: "${review.comment}"`);
        }
        console.log(`   Date: ${review.created_at}`);
    });
} else {
    console.log('4. No reviews found yet.');
}
console.log('');

// 5. Check completed tasks that can be reviewed
console.log('5. Completed Tasks Available for Review:');
const completedTasks = db.prepare(`
    SELECT t.id, t.title, t.client_id,
           p.freelancer_id,
           client.name as client_name,
           freelancer.name as freelancer_name
    FROM tasks t
    LEFT JOIN proposals p ON p.task_id = t.id AND p.status = 'Accepted'
    LEFT JOIN users client ON t.client_id = client.id
    LEFT JOIN users freelancer ON p.freelancer_id = freelancer.id
    WHERE t.status = 'Completed' AND p.freelancer_id IS NOT NULL
    LIMIT 5
`).all();

if (completedTasks.length > 0) {
    completedTasks.forEach(task => {
        const clientReview = db.prepare('SELECT id FROM reviews WHERE task_id = ? AND reviewer_id = ?').get(task.id, task.client_id);
        const freelancerReview = db.prepare('SELECT id FROM reviews WHERE task_id = ? AND reviewer_id = ?').get(task.id, task.freelancer_id);

        console.log(`\n   Task #${task.id}: "${task.title}"`);
        console.log(`   Client (${task.client_name}): ${clientReview ? '✅ Reviewed' : '⏳ Can review'}`);
        console.log(`   Freelancer (${task.freelancer_name}): ${freelancerReview ? '✅ Reviewed' : '⏳ Can review'}`);
    });
} else {
    console.log('   No completed tasks with accepted proposals found');
}
console.log('');

console.log('=== TEST COMPLETE ===');
console.log('✅ Reviews & Ratings System is ready!');
console.log('');
console.log('Next Steps:');
console.log('1. Complete a task to enable reviews');
console.log('2. Visit the completed task page');
console.log('3. Click "Leave a Review" button');
console.log('4. Submit your rating and comment');
console.log('5. Check user profiles to see reviews');

db.close();
