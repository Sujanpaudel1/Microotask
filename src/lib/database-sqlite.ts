import Database from 'better-sqlite3';
import path from 'path';

// Create database file in the project root
const dbPath = path.join(process.cwd(), 'microtask.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export default db;

// Initialize database tables
export function initDatabase() {
  try {
    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT,
        rating REAL DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        skills TEXT DEFAULT '[]',
        joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_tasks INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tasks table
    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        budget_min REAL NOT NULL,
        budget_max REAL NOT NULL,
        deadline DATETIME NOT NULL,
        skills_required TEXT DEFAULT '[]',
        difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
        status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed', 'Cancelled')),
        client_id INTEGER,
        tags TEXT DEFAULT '[]',
        attachments TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users(id)
      )
    `);

    // Create proposals table
    db.exec(`
      CREATE TABLE IF NOT EXISTS proposals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER,
        freelancer_id INTEGER,
        message TEXT NOT NULL,
        proposed_price REAL NOT NULL,
        estimated_duration TEXT NOT NULL,
        status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id),
        FOREIGN KEY (freelancer_id) REFERENCES users(id)
      )
    `);

    // Create reviews table
    db.exec(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER,
        reviewer_id INTEGER,
        reviewee_id INTEGER,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id),
        FOREIGN KEY (reviewer_id) REFERENCES users(id),
        FOREIGN KEY (reviewee_id) REFERENCES users(id)
      )
    `);

    // Create notifications table
    db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT NOT NULL,
        payload TEXT,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('SQLite database tables created successfully');
    return true;
  } catch (error) {
    console.error('Error creating database tables:', error);
    return false;
  }
}