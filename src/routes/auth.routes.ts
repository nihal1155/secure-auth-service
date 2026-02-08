import { Router } from "express";
import { register, login, refresh, getCurrentUser, logout } from "../controllers/auth.controller";
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

//public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);


//Protected routes (auth required)
router.get('/me', authenticateToken, getCurrentUser);


router.post('/logout', logout);

export default router;