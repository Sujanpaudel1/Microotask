import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'microtask',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
});

export default pool;

// Initialize database tables
export async function initDatabase() {
    const client = await pool.connect();

    try {
        // Create users table
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        rating DECIMAL(2,1) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        skills TEXT[],
        joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_tasks INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create tasks table
        await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        budget_min DECIMAL(10,2) NOT NULL,
        budget_max DECIMAL(10,2) NOT NULL,
        deadline TIMESTAMP NOT NULL,
        skills_required TEXT[],
        difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
        status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed', 'Cancelled')),
        client_id INTEGER REFERENCES users(id),
        tags TEXT[],
        attachments TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create proposals table
        await client.query(`
      CREATE TABLE IF NOT EXISTS proposals (
        id SERIAL PRIMARY KEY,
        task_id INTEGER REFERENCES tasks(id),
        freelancer_id INTEGER REFERENCES users(id),
        message TEXT NOT NULL,
        proposed_price DECIMAL(10,2) NOT NULL,
        estimated_duration VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create reviews table
        await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        task_id INTEGER REFERENCES tasks(id),
        reviewer_id INTEGER REFERENCES users(id),
        reviewee_id INTEGER REFERENCES users(id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log('Database tables created successfully');
    } catch (error) {
        console.error('Error creating database tables:', error);
    } finally {
        client.release();
    }
}