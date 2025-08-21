import { Request, Response } from 'express';
import { getCinemasService, getCinemaByIdService, updateCinemaByIdService, createCinemaService } from '../services/adminCinemaService';
import mongoose from 'mongoose';
import { cinemaSchema } from '../utils';
import { type } from 'node:os';
import { ZodError } from 'zod';
import { error } from '../config/logging';

/**
 * @route GET /api/admin/cinemas
 * @desc Get all cinemas
 * @access Private (Admin)
 */
export const getCinemas = async (req: Request, res: Response) => {
    try {
        const cinemas = await getCinemasService();
        res.status(200).json({ cinemas });
    } catch (err: any) {
        if (err instanceof ZodError) {
            return res.status(400).json({ error: 'Data validation failed', details: err.errors });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 * @route GET /api/admin/cinemas/:id
 * @desc Get cinema by ID
 * @access Private (Admin)
 */
export const getCinemaById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid cinema ID format.' });
        }

        const cinema = await getCinemaByIdService(id);

        res.status(200).json({ cinema });
    } catch (err: any) {
        if (err instanceof ZodError) {
            return res.status(400).json({ error: 'Cinema data validation failed.', details: err.errors });
        }

        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }

        res.status(500).json({ error: err.message });
    }
};

/**
 * @route PATCH /api/admin/cinemas/:id
 * @desc Updates the data of a cinema object
 * @access Private (Admin)
 */
export const updateCinema = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid cinema ID format.' });
        }

        const validUpdates = cinemaSchema.partial().parse(req.body);

        const updatedCinema = await updateCinemaByIdService(id, validUpdates);

        res.status(200).json({ cinema: updatedCinema });
    } catch (err: any) {
        if (err instanceof ZodError) {
            return res.status(400).json({ error: 'Updates validation failed', details: err.errors });
        }

        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/admin/cinemas
 * @description Create a new cinema document
 * @access Private (Admin)
 */
export const createCinema = async (req: Request, res: Response) => {
    try {
        const validCinema = cinemaSchema.parse(req.body)

        const createdCinema = await createCinemaService(validCinema);

        res.status(201).json(createdCinema);
    } catch (err: any) {

        console.error('Create cinema error:', err);
        
        if (err instanceof ZodError) {
            return res.status(400).json ({ error: 'Validation failed', details: err.errors})
        }

        res.status(500).json({error: 'Failed to create cinema'});
    }
}
