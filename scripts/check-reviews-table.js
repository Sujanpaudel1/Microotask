// Check if reviews table exists and its schema
const Database = require('better-sqlite3');
const db = new Database('./microtask.db');

console.log('=== CHECKING REVIEWS TABLE ===\n');

try {
    // Check if table exists
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='reviews'").all();
    
    if (tables.length === 0) {
        console.log('❌ Reviews table does NOT exist. Creating it...\n');
        
        // Create reviews table
        db.exec(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER NOT NULL,
                reviewer_id INTEGER NOT NULL,
                reviewee_id INTEGER NOT NULL,
                rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks(id),
                FOREIGN KEY (reviewer_id) REFERENCES users(id),
                FOREIGN KEY (reviewee_id) REFERENCES users(id)
            )
        `);
        
        console.log('✅ Reviews table created successfully!\n');
    } else {
        console.log('✅ Reviews table already exists\n');
    }
    
    // Show table schema
    const schema = db.prepare("PRAGMA table_info(reviews)").all();
    console.log('Table Schema:');
    schema.forEach(col => {
        console.log(`  - ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}`);
    });
    
    // Count reviews
    const count = db.prepare('SELECT COUNT(*) as count FROM reviews').get();
    console.log(`\n📊 Total reviews in database: ${count.count}`);
    
    if (count.count > 0) {
        console.log('\n=== SAMPLE REVIEWS ===');
        const samples = db.prepare(`
            SELECT r.*, 
                   reviewer.name as reviewer_name,
                   reviewee.name as reviewee_name,
                   t.title as task_title
            FROM reviews r
            LEFT JOIN users reviewer ON r.reviewer_id = reviewer.id
            LEFT JOIN users reviewee ON r.reviewee_id = reviewee.id
            LEFT JOIN tasks t ON r.task_id = t.id
            LIMIT 3
        `).all();
        samples.forEach(r => {
            console.log(`\nReview #${r.id}:`);
            console.log(`  Task: ${r.task_title}`);
            console.log(`  ${r.reviewer_name} → ${r.reviewee_name}`);
            console.log(`  Rating: ${'⭐'.repeat(r.rating)} (${r.rating}/5)`);
            console.log(`  Comment: ${r.comment || 'No comment'}`);
        });
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
} finally {
    db.close();
}
