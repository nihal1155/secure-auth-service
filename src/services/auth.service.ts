import bcrypt from 'bcrypt';
import { query } from '../config/database.js';

interface RegisterUserData {
    email: string;
    password: string;
    name: string;
}

export const registerUser = async (userData: RegisterUserData) => {
    const { email, password, name } = userData;

    const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    )

    // console.log("Existing User :: ", existingUser);

    if(existingUser.rows.length > 0) {
        throw Error("User with this email already exists!");
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await query(
        `INSERT INTO users (email, password_hash, name, provider)
        VALUES ($1, $2, $3, 'local')
        RETURNING id, email, name, created_at`,
        [email, passwordHash, name]
    );

    // console.log("Result of Insert query :: ", result);

    return result.rows[0];
}