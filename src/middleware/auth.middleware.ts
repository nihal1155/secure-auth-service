import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/token.service";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        //GET token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; //It will get the Bearer token

        if(!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        //verify token
        const decoded = verifyAccessToken(token);

        req.user = {
            userId: decoded.userId,
            email: decoded.email
        }

        return next();

    } catch (error: any) {
        return res.status(401).json({
            message: "Invalid or expired access token"
        })
    }
}