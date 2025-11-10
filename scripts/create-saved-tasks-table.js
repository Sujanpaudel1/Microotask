const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'microtask.db');
const db = new Database(dbPath);

console.log('Creating saved_tasks table...');

try {
    // Create saved_tasks table
    db.exec(`
        CREATE TABLE IF NOT EXISTS saved_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            task_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
            UNIQUE(user_id, task_id)
        );
    `);

    // Create index for faster lookups
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_saved_tasks_user ON saved_tasks(user_id);
        CREATE INDEX IF NOT EXISTS idx_saved_tasks_task ON saved_tasks(task_id);
    `);

    console.log('✅ saved_tasks table created successfully');
    console.log('✅ Indexes created successfully');

    // Verify table creation
    const tableInfo = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='saved_tasks'
    `).get();

    if (tableInfo) {
        console.log('✅ Table verified in database');

        // Show table schema
        const schema = db.prepare('PRAGMA table_info(saved_tasks)').all();
        console.log('\nTable Schema:');
        schema.forEach(col => {
            console.log(`  - ${col.name}: ${col.type}`);
        });
    }

} catch (error) {
    console.error('❌ Error creating table:', error.message);
    process.exit(1);
}

db.close();
console.log('\n✅ Database setup complete!');
