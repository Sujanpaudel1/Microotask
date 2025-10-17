import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'microtask.db');
const db = new Database(dbPath);

console.log('Checking users table schema...\n');

// Get table info
const tableInfo = db.prepare('PRAGMA table_info(users)').all();
console.log('Users table columns:');
tableInfo.forEach((col: any) => {
    console.log(`  - ${col.name} (${col.type})`);
});

// Get sample user
const user = db.prepare('SELECT * FROM users LIMIT 1').get();
console.log('\nSample user data:');
console.log(user);

db.close();
