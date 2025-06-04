import express, { Router } from 'express';
import { registerUser, loginUser, logoutUser, checkAuth } from '../controllers/auth.controller';
import { authentication } from '../middleware/auth.middleware';

const authRouter: Router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Create a new user
 * @access  (Public)
 */
authRouter.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login a user and get token
 * @access  (Public)
 */
authRouter.post('/login', loginUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout a user
 * @access  (Public)
 */
authRouter.post('/logout', logoutUser);

/**
 * @route   GET /api/auth/check-auth
 * @desc    Check if the user is authenticated
 * @access  (Protected)
 */
authRouter.get('/check-auth', authentication, checkAuth);

export default authRouter;
