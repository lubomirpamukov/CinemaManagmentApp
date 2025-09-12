import { NextFunction, Request, Response } from 'express';
import {
    getCinemasService,
    getCinemaByIdService,
    updateCinemaByIdService,
    createCinemaService,
    deleteCinemaService
} from '../services/adminCinemaService';
import mongoose from 'mongoose';
import { cinemaSchema } from '../utils';
import { ZodError } from 'zod';
import { CustomError } from '../middleware/errorHandler';

/**
 * @route GET /api/admin/cinemas
 * @desc Get all cinemas
 * @access Private (Admin)
 */
export const getCinemas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cinemas = await getCinemasService();
        res.status(200).json({ cinemas });
    } catch (err: any) {
        next(err)
    }
};

/**
 * @route GET /api/admin/cinemas/:id
 * @desc Get cinema by ID
 * @access Private (Admin)
 */
export const getCinemaById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            //return res.status(400).json({ message: 'Invalid cinema ID format.' });
            throw new CustomError('Invalid Cinema ID format.', 400)
        }

        const cinema = await getCinemaByIdService(id);


        res.status(200).json({ cinema });
    } catch (err: any) {
        next(err)
    }
};

/**
 * @route PATCH /api/admin/cinemas/:id
 * @desc Updates the data of a cinema object
 * @access Private (Admin)
 */
export const updateCinema = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError('Invalid Cinema Id format.', 400)
        }

        const validUpdates = cinemaSchema.partial().parse(req.body);

        const updatedCinema = await updateCinemaByIdService(id, validUpdates);

        if (updatedCinema === null) {
            throw new CustomError('Cinema not found.', 404)
        }

        res.status(200).json({ cinema: updatedCinema });
    } catch (err: any) {
        next(err)
    }
};

/**
 * POST /api/admin/cinemas
 * @description Create a new cinema document
 * @access Private (Admin)
 */
export const createCinema = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validCinema = cinemaSchema.parse(req.body);

        const createdCinema = await createCinemaService(validCinema);

        res.status(201).json(createdCinema);
    } catch (err: any) {
        next(err)
    }
};

/**
 * DELETE /api/admin/cinemas/:id
 * @description Deletec Cinema document.
 * @access Private (Admin)
 */
export const deleteCinema = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError('Invalid cinema Id format.', 400)
        }
        const deletedCinema = await deleteCinemaService(id);
        if (deletedCinema === null){
            throw new CustomError('Cinema not found.', 404)
        }
        res.status(204).end();
    } catch (err: any) {
        next(err)
    }
};
