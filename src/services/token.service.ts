import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/database';

interface TokenPayload {
    userId: string;
    email:string;
}

// Generate access token (short-lived, 15 min)
export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_ACCESS_SECRET;
  
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
  }
  
  const options = {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
  } as SignOptions;
  
  return jwt.sign(payload, secret, options);
};

// Generate refresh token (long-lived, 7 days)
export const generateRefreshToken = async (userId: string): Promise<string> => {
  const secret = process.env.JWT_REFRESH_SECRET;
  
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }
  
  const payload = { userId, tokenId: crypto.randomUUID() };
  
  const options = {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '15m'
  } as SignOptions;
  
  const token = jwt.sign(payload, secret, options);

  // Hash token before storing in DB
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Store in database with expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  );

  return token;
};

// Verify access token
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

// Verify refresh token
export const verifyRefreshToken = async (token: string): Promise<string> => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
    
    // Check if token exists in database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const result = await query(
      'SELECT user_id FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()',
      [tokenHash]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid or expired refresh token');
    }

    return result.rows[0].user_id;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};