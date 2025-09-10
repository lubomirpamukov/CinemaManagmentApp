import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import User from '../models/user.model';
import { generateToken, JwtRequest } from '../middleware/auth.middleware';
import { userCreationSchema, userLoginSchema } from '../utils';
import z, { ZodError } from 'zod';

/**
 * @route POST /api/auth/register
 * @description Registers a new user with a default 'user' role.
 * @access Public
 * @returns {Promise<Response>}
 * - On success returns a 201 status with user object containing email and id.
 * - On validation error: Returns a 400 status with validation details.
 * - On email alredy exist in the database: Returns 409 status with generic error message.
 * - On server errirL Returns a 500 status with generic error message.
 */
export const registerUser = async (req: Request, res: Response) => {
    try {
        // validate user data
        const { name, email, password, contact, address } = userCreationSchema.parse(req.body);

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Creating new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'user',
            contact,
            address
        });

        await user.save();
        return res.status(201).json({ user: { email: user.email, id: user._id.toString() } });
    } catch (error: any) {
        // Handle Zod validation errors
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }

        // Handle existing user error
        if (error.code === 11000) {
            return res.status(409).json({ error: 'An account with this email alredy exists.' });
        }

        // Generic server error
        console.error('Registration Error:', error);
        return res.status(500).json({ message: 'An unexpected error occurred.' });
    }
};

/**
 * @route POST /api/auth/login
 * @description Authenticates a user and returns a JWT token in a HTTP-only cookie.
 * @acess Public
 *
 * @param {Request} req The Express request object. Expects a JSON body with `email` and `password`.
 * @param {Response} res The Express response object.
 * @returns {Promise<Response>}
 * - On success: Returns a 200 status with a user DTO. Sets a secure HTTP-only cookie with the JWT.
 * - On validation error: Returns a 400 status with validation details.
 * - On authenticatation failure (user not found or wrong password): Returns a 401 status with generic error message.
 * - On server error: Returns a 500 status with a generic error message.
 */
export const loginUser = async (req: Request, res: Response) => {
    try {
        // Validate the incoming request body.
        const { email, password } = userLoginSchema.parse(req.body);

        const user = await User.findOne({ email });

        const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;

        if (!user || !isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = generateToken(user._id, user.role, user.email);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        });

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error: any) {
        if (error instanceof ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error('Login Error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @route POST /api/auth/logout
 * @description Clears the usr's authentication cookie, effectively logging them out.
 * @access Public (or Proviate, depending on whether you want users to be logged in to log out)
 *
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 *
 * @returns {Response}
 * - On success: Returns a 200 status with success message.
 * - On server error: Returns 500 status with generic error message.
 */
export const logoutUser = (req: Request, res: Response) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return res.status(200).json({ message: 'Logout successful' });
    } catch (error: any) {
        console.error('Logout Error:', error);
        return res.status(500).json({ error: 'An unexpected error occurred during logout.' });
    }
};

/**
 * @route GET /api/auth/check
 * @description Checks if the user has a valid authentication cookie.
 *  This is a lightweight endpoint that relies on the auth middleware
 *  to verify the JWT and attach the user payload to the request.
 *  It does not query the database
 *
 * @access Private (requires a valid JWT)
 * @param {Request} req The Express request object, extended by auth middleware to include the user payload.
 * @param {Response} res The Express response object.
 * @returns  {Response}
 * - On success: Returns a 200 status with DTO containing the user's ID, role, email from JWT token.
 * - If not authenticated: Returns a 401 status with an error message.
 * - On server error: Returns a 500 status with a generic error message.
 */
export const checkAuth = (req: JwtRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        return res.status(200).json({
            id: user.id,
            email: user.email,
            role: user.role
        });
    } catch (error: any) {
        console.error('Check Auth Error:', error);
        return res.status(500).json({ error: 'An unexpected error occcurred.' });
    }
};

/**
 * @route GET api/auth/me
 * @description Fetches the complete profile of the currently authenticated user from the database.
 *              This is userd to get up-to-date user information after login.
 * @access Private (requires a valid JWT)
 *
 * @param {JwtRequest} req The Express request object, extended by the auth middleware to include the user payload.
 * @param {Response} res The Express response object.
 *
 * @returns {Promise<Response>}
 * - On success: Returns a 200 status with the full user profile object (excluding the password).
 * - If not authenticated: Returns a 401 status.
 * - If user from token is not in DB: Returns a 404 status.
 * - On server error: Returns a 500 status with generic error message.
 */
export const getMe = async (req: JwtRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Not authenticated ' });
        }

        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userObj = user.toObject();
        userObj.id = userObj._id.toString();
        const { _id, ...userWithStringId } = userObj;
        return res.status(200).json(userWithStringId)
    } catch (error: any) {
        console.error('Get Me Error:', error);
        return res.status(500).json({ error: 'An unexpected error occurred.'})
    }
};
