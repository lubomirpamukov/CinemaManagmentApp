import { Request, Response } from 'express';

import { getUsersService, getUserByIdService, updateUserService, deleteUserService, createUserService } from '../services/adminUserService';
import mongoose from 'mongoose';
import { userSchema } from '../utils';

/**
 *
 * @route GET /api/admin/users
 * @desc Get all users with pagination and search
 * @access Private (Admin)
 */
export const getUsers = async (req: Request, res: Response) => {
    try {
        const result = await getUsersService(req.query);
        res.status(200).json(result);
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: 'Invalud query parameters', details: err.errors });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 * @route GET /api/admin/users/:id
 * @desc Get a single user by their ID
 * @access Private (Admin)
 */
export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }
        const user = await getUserByIdService(req.params.id);
        res.status(200).json(user);
    } catch (err: any) {
        if (err.message.includes('User not found')) {
            return res.status(404).json({ error: err.message });
        }

        res.status(500).json({ error: err.message });
    }
};

/**
 * @route POST /api/admin/users
 * @desc Create a new user
 * @access Private (Admin)
 */
export const createUser = async (req: Request, res: Response) => {
    try {
        const validUserData = userSchema.parse(req.body);
        const newUser = await createUserService(validUserData);
        res.status(201).json(newUser);
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: 'Invalid user data provided.', details: err.errors });
        }

        // Handle MongoDB unique constraint errors (e.g., duplicate email or username)
        if (err.code === 11000) {
            return res.status(409).json({ error: 'A user with this email or username already exists.' });
        }

        // Fallback for any other unexpected errors
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
};

/**
 * @route PATCH /api/admin/users/:id
 * @desc Update an existing user
 * @access Private (Admin)
 */
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }

        const validatedUpdates = userSchema.partial().parse(req.body);

        const updatedUser = await updateUserService(id, validatedUpdates);
        res.status(201).json(updatedUser);
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: err.errors });
        }
        // Handle MongoDB unique constraint errors (e.g., duplicate email or username)
        if (err.code === 11000) {
            return res.status(409).json({ error: 'A user with this email or username already exists.' });
        }

        res.status(500).json({ error: err.message });
    }
};

/**
 * 
 * @route DELETE /api/admin/users/:id
 * @desc Delete a user by their ID
 * @access Private (Admin) 
 */
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID format.'})
        }
        const user = await deleteUserService(req.params.id);
        res.status(204).send();
    } catch (err: any) {
        if (err.message.includes('User not found')) {
            return res.status(404).json({ error: err.message});
        }
        res.status(500).json({ error: err.message });
    }
};
