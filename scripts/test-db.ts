import db from '../src/lib/database-sqlite';

try {
    console.log('Testing database connection...');

    // Test if we can query the users table
    const users = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    console.log(`Users table exists. Current user count: ${users.count}`);

    // Test if we can query other tables
    const tasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };
    console.log(`Tasks table exists. Current task count: ${tasks.count}`);

    console.log('Database test completed successfully!');
} catch (error) {
    console.error('Database test failed:', error);
}