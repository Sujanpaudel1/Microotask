import db from '../src/lib/database-sqlite';

try {
    console.log('Checking existing users in database...');

    // Get all users
    const users = db.prepare('SELECT id, name, email, created_at FROM users').all();
    console.log('Users in database:');
    users.forEach((user: any) => {
        console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Created: ${user.created_at}`);
    });

    if (users.length === 0) {
        console.log('No users found in database');
    }

} catch (error) {
    console.error('Error checking users:', error);
}