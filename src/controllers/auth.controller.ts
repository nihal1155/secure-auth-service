import type { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/validation';
import { registerUser, loginUser, refreshAccessToken} from '../services/auth.service';
import {verifyRefreshToken} from "../services/token.service";
import { query } from '../config/database';
import crypto from 'crypto';
import passport from 'passport';
import { generateAccessToken, generateRefreshToken } from '../services/token.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        
        if(error) {
            console.log("Schema Validation Error :: ", error);
            return res.status(400).json({
                error: "Validation Failed",
                message: error.details.map((d) => d.message)
            });
        }

        console.log("Validation successful :: ", value);

        const user = await registerUser(value);
        
        console.log("User registered successfully in controller ::", user);
        return res.status(201).json({
            message : "User registered successfully !",
            user : {
                user: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.created_at
            }
        })
    } catch (error: any) {
        console.log("Error occured in controller :: ", error);
        if(error.message == "User with this email already exists") {
            return res.status(409).json({message: error.message});
        }
        return next(error);
    }
}

export const login = async (
    req: Request, res: Response, next: NextFunction
) => {
    try {
        //Validation of request body

        const {error, value} = loginSchema.validate(req.body);

        if(error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details.map((d: { message: string }) => d.message)
            });           
        }

        const result = await loginUser(value);

        res.status(200).json({
            message: "Login Succesful",
            user : result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        })

    } catch (error: any) {
        console.log(error.message);
        if (error.message === "Invalid Credentials") {
            console.log(error.message);
            return res.status(401).json({ error: "Invalid credentials" });
        }
        return next(error);
    }
}

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {error, value} = refreshTokenSchema.validate(req.body);

        if(error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details.map(d => d.message)
            });
        }

        const tokens = await refreshAccessToken(value.refreshToken);

        return res.status(200).json({
            message: "Token refresh Successfully",
            accessToken : tokens.accessToken,
            refreshToken: tokens.refreshToken
        });

        
    } catch (error: any) {
        if(error.message.includes("Invalid or expired")) {
            return res.status(401).json({error: error.message});
        }

        return next(error);
    }
}

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.userId;

        if(!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const result = await query(
            'SELECT id, email, name, provider, created_at FROM users WHERE id = $1',
            [userId]
        )

        if(result.rows.length === 0) {
            return res.status(404).json({
                error: "User not found"
            })
        }

        const user = result.rows[0];

        console.log("User profile accessed");
        return res.status(200).json({
            user : {
                id:user.id,
                email: user.email,
                name: user.name,
                provider : user.provider,
                createdAt: user.created_at
            }
        })
    } catch (error) {
        return next(error);
    }
}

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = refreshTokenSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    // Verify refresh token first
    await verifyRefreshToken(value.refreshToken);

    // Hash and delete refresh token from database
    const tokenHash = crypto.createHash('sha256').update(value.refreshToken).digest('hex');
    
    const result = await query(
      'DELETE FROM refresh_tokens WHERE token_hash = $1',
      [tokenHash]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    return res.status(200).json({
      message: 'Logged out successfully'
    });
  } catch (error: any) {
     // Handle verification errors
    if (error.message && error.message.includes('Invalid or expired')) {
      return res.status(401).json({ error: error.message });
    }
    return next(error);
  }
};

export const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
    session : false
});

export const googleCallback = [
    passport.authenticate('google', { session: false, failureRedirect : '/login'}),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as any;

            // Generate tokens
            const accessToken = generateAccessToken({
                userId: user.id,
                email: user.email
            });

            const refreshToken = await generateRefreshToken(user.id);

            // Send tokens (in real app, redirect to frontend with tokens)
            res.json({
                message: 'Google login successful',
                user: {
                id: user.id,
                email: user.email,
                name: user.name,
                provider: user.provider
                },
                accessToken,
                refreshToken
            });
        } catch (error) {
            next(error);
        }
    }
]