import { Router } from "express";
import { register, login, refresh, getCurrentUser, logout, googleAuth, googleCallback } from "../controllers/auth.controller";
import { authenticateToken } from '../middleware/auth.middleware';
import { loginLimiter, registerLimiter, refreshLimiter } from '../middleware/rateLimiter';

const router = Router();

//public routes
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshLimiter,refresh);
router.post('/logout', logout);

// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

//Protected routes (auth required)
router.get('/me', authenticateToken, getCurrentUser);



export default router;