import Database from 'better-sqlite3';
import path from 'path';

function clearDatabase() {
    const dbPath = path.join(process.cwd(), 'microtask.db');
    console.log('Opening database at', dbPath);

    const db = new Database(dbPath);
    try {
        console.log('Disabling foreign keys (temporarily)');
        db.pragma('foreign_keys = OFF');

        console.log('Clearing reviews, proposals, tasks, users...');
        db.exec('DELETE FROM reviews;');
        db.exec('DELETE FROM proposals;');
        db.exec('DELETE FROM tasks;');
        db.exec('DELETE FROM users;');

        console.log('Running VACUUM to reclaim space');
        db.exec('VACUUM;');

        console.log('Database cleared successfully');
        process.exit(0);
    } catch (error) {
        console.error('Failed to clear database:', error);
        process.exit(1);
    } finally {
        try { db.close(); } catch (e) { /* ignore */ }
    }
}

clearDatabase();
