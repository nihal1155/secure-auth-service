import { Router } from "express";
import { register, login, refresh, getCurrentUser, logout } from "../controllers/auth.controller";
import { authenticateToken } from '../middleware/auth.middleware';
import { loginLimiter, registerLimiter, refreshLimiter } from '../middleware/rateLimiter';

const router = Router();

//public routes
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshLimiter,refresh);
router.post('/logout', logout);


//Protected routes (auth required)
router.get('/me', authenticateToken, getCurrentUser);



export default router;