const Database = require('better-sqlite3');
const db = new Database('./microtask.db');

console.log('=== TASKS TABLE SCHEMA ===\n');
const schema = db.prepare('PRAGMA table_info(tasks)').all();
schema.forEach(col => {
    console.log(`${col.name}: ${col.type}`);
});

db.close();
