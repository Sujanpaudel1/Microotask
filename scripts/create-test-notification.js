// Create a test notification to verify the system
const Database = require('better-sqlite3');
const db = new Database('./microtask.db');

console.log('Creating test notification...\n');

// Get a user to send notification to
const user = db.prepare('SELECT * FROM users LIMIT 1').get();

if (user) {
    const payload = JSON.stringify({
        message: `System test notification - Day 5 implementation complete!`,
        taskId: 1,
        taskTitle: 'Test Task',
        type: 'system_test'
    });

    const result = db.prepare(
        'INSERT INTO notifications (user_id, type, payload, is_read) VALUES (?, ?, ?, ?)'
    ).run(user.id, 'system_test', payload, 0);

    console.log(`✓ Created test notification ID: ${result.lastInsertRowid}`);
    console.log(`  For user: ${user.name} (ID: ${user.id})`);
    console.log(`  Message: System test notification - Day 5 implementation complete!`);
    console.log('');

    // Show current unread count for this user
    const unreadCount = db.prepare(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0'
    ).get(user.id);

    console.log(`User ${user.name} now has ${unreadCount.count} unread notifications`);
} else {
    console.log('No users found in database');
}

db.close();
