import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'microtask.db');
const db = new Database(dbPath);

console.log('Adding missing columns to users table...\n');

try {
    // Add type column (client or freelancer)
    try {
        db.prepare('ALTER TABLE users ADD COLUMN type TEXT DEFAULT "client"').run();
        console.log('✅ Added type column');
    } catch (e: any) {
        if (e.message.includes('duplicate column name')) {
            console.log('⏭️  type column already exists');
        } else {
            throw e;
        }
    }

    // Add bio column
    try {
        db.prepare('ALTER TABLE users ADD COLUMN bio TEXT').run();
        console.log('✅ Added bio column');
    } catch (e: any) {
        if (e.message.includes('duplicate column name')) {
            console.log('⏭️  bio column already exists');
        } else {
            throw e;
        }
    }

    // Add hourly_rate column
    try {
        db.prepare('ALTER TABLE users ADD COLUMN hourly_rate INTEGER').run();
        console.log('✅ Added hourly_rate column');
    } catch (e: any) {
        if (e.message.includes('duplicate column name')) {
            console.log('⏭️  hourly_rate column already exists');
        } else {
            throw e;
        }
    }

    // Add location column
    try {
        db.prepare('ALTER TABLE users ADD COLUMN location TEXT').run();
        console.log('✅ Added location column');
    } catch (e: any) {
        if (e.message.includes('duplicate column name')) {
            console.log('⏭️  location column already exists');
        } else {
            throw e;
        }
    }

    // Add phone column
    try {
        db.prepare('ALTER TABLE users ADD COLUMN phone TEXT').run();
        console.log('✅ Added phone column');
    } catch (e: any) {
        if (e.message.includes('duplicate column name')) {
            console.log('⏭️  phone column already exists');
        } else {
            throw e;
        }
    }

    // Add profile_image column
    try {
        db.prepare('ALTER TABLE users ADD COLUMN profile_image TEXT').run();
        console.log('✅ Added profile_image column');
    } catch (e: any) {
        if (e.message.includes('duplicate column name')) {
            console.log('⏭️  profile_image column already exists');
        } else {
            throw e;
        }
    }

    console.log('\n✅ Database migration completed successfully!');

    // Verify columns were added
    console.log('\nVerifying users table schema:');
    const tableInfo = db.prepare('PRAGMA table_info(users)').all();
    tableInfo.forEach((col: any) => {
        console.log(`  - ${col.name} (${col.type})`);
    });

} catch (error: any) {
    console.error('❌ Migration error:', error.message);
} finally {
    db.close();
}
