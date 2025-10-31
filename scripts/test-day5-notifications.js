// Test script for Day 5 - Notifications System
const Database = require('better-sqlite3');
const db = new Database('./microtask.db');

console.log('=== DAY 5: NOTIFICATIONS SYSTEM TEST ===\n');

// 1. Check notifications table structure
console.log('1. Notifications Table Structure:');
const tableInfo = db.pragma('table_info(notifications)');
console.log(tableInfo);
console.log('');

// 2. Count total notifications
const totalCount = db.prepare('SELECT COUNT(*) as count FROM notifications').get();
console.log('2. Total Notifications:', totalCount.count);
console.log('');

// 3. Count unread notifications by user
console.log('3. Unread Notifications by User:');
const unreadByUser = db.prepare(`
    SELECT user_id, COUNT(*) as unread_count 
    FROM notifications 
    WHERE is_read = 0 
    GROUP BY user_id
`).all();
console.log(unreadByUser);
console.log('');

// 4. Check notification types
console.log('4. Notifications by Type:');
const byType = db.prepare(`
    SELECT type, COUNT(*) as count 
    FROM notifications 
    GROUP BY type
`).all();
console.log(byType);
console.log('');

// 5. Show latest 5 notifications
console.log('5. Latest 5 Notifications:');
const latest = db.prepare(`
    SELECT n.*, u.name as user_name 
    FROM notifications n
    LEFT JOIN users u ON n.user_id = u.id
    ORDER BY n.created_at DESC
    LIMIT 5
`).all();
latest.forEach(notif => {
    const payload = JSON.parse(notif.payload);
    console.log(`- [${notif.is_read ? 'READ' : 'UNREAD'}] ${notif.type} for ${notif.user_name}:`);
    console.log(`  Message: ${payload.message || payload.title || 'N/A'}`);
    console.log(`  Created: ${notif.created_at}`);
    console.log('');
});

// 6. Test marking notification as read
console.log('6. Testing Mark as Read:');
const unreadNotif = db.prepare('SELECT * FROM notifications WHERE is_read = 0 LIMIT 1').get();
if (unreadNotif) {
    console.log(`Before: Notification ${unreadNotif.id} is_read = ${unreadNotif.is_read}`);
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(unreadNotif.id);
    const updated = db.prepare('SELECT * FROM notifications WHERE id = ?').get(unreadNotif.id);
    console.log(`After: Notification ${updated.id} is_read = ${updated.is_read}`);
    // Revert for testing
    db.prepare('UPDATE notifications SET is_read = 0 WHERE id = ?').run(unreadNotif.id);
    console.log('Reverted for testing purposes');
} else {
    console.log('No unread notifications to test with');
}
console.log('');

// 7. Check users with notifications
console.log('7. Users with Notifications:');
const usersWithNotifs = db.prepare(`
    SELECT u.id, u.name, u.email, COUNT(n.id) as notif_count,
           SUM(CASE WHEN n.is_read = 0 THEN 1 ELSE 0 END) as unread_count
    FROM users u
    LEFT JOIN notifications n ON u.id = n.user_id
    GROUP BY u.id
    HAVING notif_count > 0
    ORDER BY unread_count DESC
`).all();
console.log(usersWithNotifs);
console.log('');

console.log('=== TEST COMPLETE ===');
console.log('✅ All notification system components checked');
console.log('');
console.log('Next Steps:');
console.log('1. Visit http://localhost:3001/notifications');
console.log('2. Login with a user that has notifications (user_id 4 or 9)');
console.log('3. Test marking notifications as read');
console.log('4. Check navbar badge updates');

db.close();
