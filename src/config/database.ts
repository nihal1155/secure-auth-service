import {Pool} from 'pg';
import { createTables } from '../models/createTables';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL as string | undefined
});

export const connectDB = async (): Promise<void> => {
    try {
        const client = await pool.connect();
        console.log("✅ PostgreSQL connected successfully!");
        client.release();

        //create tables if not exists
        await createTables();
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error);
        throw error;
    }
};

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default pool;