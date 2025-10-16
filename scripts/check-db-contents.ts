import db from '../src/lib/database-sqlite';

try {
    console.log('Checking database contents...\n');

    // Check users
    const users = db.prepare('SELECT id, name, email FROM users').all();
    console.log(`Users in database: ${users.length}`);
    if (users.length > 0) {
        console.log('Users:', JSON.stringify(users, null, 2));
    }

    // Check tasks
    const tasks = db.prepare('SELECT id, title, client_id, status FROM tasks').all();
    console.log(`\nTasks in database: ${tasks.length}`);
    if (tasks.length > 0) {
        console.log('Tasks:', JSON.stringify(tasks, null, 2));
    }

    // Check proposals
    const proposals = db.prepare('SELECT id, task_id, freelancer_id, status FROM proposals').all();
    console.log(`\nProposals in database: ${proposals.length}`);
    if (proposals.length > 0) {
        console.log('Proposals:', JSON.stringify(proposals, null, 2));
    }

} catch (error) {
    console.error('Error:', error);
}
