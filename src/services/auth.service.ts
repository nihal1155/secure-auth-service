import bcrypt from 'bcrypt';
import { query } from '../config/database';
import {generateAccessToken, generateRefreshToken} from './token.service';

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

interface LoginUserData {
    email: string,
    password: string,
}

export const loginUser = async (userData: LoginUserData) => {
    const { email, password } = userData;

    const result = await query(
        'SELECT id, email, name, password_hash FROM users WHERE email = $1',
        [email]
    );

    if(result.rows.length == 0) {
        throw new Error("Invalid Credentials");
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if(!isPasswordValid) {
        throw new Error("Invalid Password");
    }

    const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email
    });

    const refreshToken = await generateRefreshToken(user.id);

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        },
        accessToken,
        refreshToken
    }
}