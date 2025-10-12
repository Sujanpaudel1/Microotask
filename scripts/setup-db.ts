import { initDatabase } from '../src/lib/database-sqlite';

function setupDatabase() {
    try {
        console.log('Setting up SQLite database...');
        const success = initDatabase();
        if (success) {
            console.log('Database setup completed successfully!');
            process.exit(0);
        } else {
            console.error('Database setup failed');
            process.exit(1);
        }
    } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    }
}

setupDatabase();