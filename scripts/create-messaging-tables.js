const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'microtask.db');
console.log('📂 Opening database at:', dbPath);

const db = new Database(dbPath);

try {
    console.log('\n🔧 Creating messaging tables...\n');

    // Create conversations table
    db.exec(`
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER,
            participant_1_id INTEGER NOT NULL,
            participant_2_id INTEGER NOT NULL,
            last_message_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
            FOREIGN KEY (participant_1_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (participant_2_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);
    console.log('✅ Created conversations table');

    // Create messages table
    db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            read_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);
    console.log('✅ Created messages table');

    // Create indexes for better performance
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_conversations_participants 
        ON conversations(participant_1_id, participant_2_id);
    `);
    console.log('✅ Created index: idx_conversations_participants');

    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_conversations_task 
        ON conversations(task_id);
    `);
    console.log('✅ Created index: idx_conversations_task');

    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_messages_conversation 
        ON messages(conversation_id);
    `);
    console.log('✅ Created index: idx_messages_conversation');

    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_messages_receiver_read 
        ON messages(receiver_id, is_read);
    `);
    console.log('✅ Created index: idx_messages_receiver_read');

    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_messages_created 
        ON messages(created_at);
    `);
    console.log('✅ Created index: idx_messages_created');

    console.log('\n✅ Database setup complete!');
    console.log('\n📊 Table Schema:');

    const conversationsSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='conversations'").get();
    console.log('\nConversations Table:');
    console.log(conversationsSchema.sql);

    const messagesSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='messages'").get();
    console.log('\nMessages Table:');
    console.log(messagesSchema.sql);

} catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
} finally {
    db.close();
}
