import { Request, Response } from 'express';

import { getUsersService, getUserByIdService, updateUserService, deleteUserService } from '../services/adminService'

//Get all users
export const getUsers = async (req: Request, res: Response) => {
    try {
        const result = await getUsersService(req.query);
        if (!result) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(result);
    } catch (err: any) {
        if (err.name === "ZodError") {
            return res.status(400).json({ error: err.errors });
        }
        res.status(500).json({ error: err.message });
    }
};

// Get user by id (READ)
export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await getUserByIdService(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Update user   (UPDATE)
export const updateUser = async (req: Request, res: Response) => {
    try {
       const updatedUser = await(updateUserService(req.params.id, req.body));
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.status(201).json(updatedUser);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Delete user   (DELETE)
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await deleteUserService(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(204).send();
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
