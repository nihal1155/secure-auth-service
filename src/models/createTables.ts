import pool from '../config/database.js';

export const createTables = async (): Promise<void> => {
    const client = await pool.connect();

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                name VARCHAR(100) NOT NULL,
                provider VARCHAR(50) DEFAULT 'local' ,
                provider_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `)

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        `)

        console.log('✅ Database tables created/verified');
    } catch (error) {
        console.error('❌ Error creating tables:', error);
        throw error;
    }
}