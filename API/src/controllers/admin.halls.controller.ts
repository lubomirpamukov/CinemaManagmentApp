import { NextFunction, Request, Response } from 'express';
import {
    getCinemaHallsService,
    createHallService,
    deleteHallByIdService,
    removeHallFromCinemaService,
    deleteSessionsByHallIdService,
    getHallByIdService
} from '../services';
import { addHallToCinemaService } from '../services';
import { hallSchema, THall } from '../utils/HallValidation';
import mongoose from 'mongoose';
import { CustomError } from '../middleware/errorHandler';
import Cinema from '../models/cinema.model';

/**
 *
 * @route GET api/admin/cinemas/:id/halls
 * @desc Get all halls for a specific cinema
 * @access Private (Admin)
 */
export const getCinemaHalls = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: cinemaId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(cinemaId)) {
            throw new CustomError('Invalid Cinema Id format.', 404);
        }

        const halls = await getCinemaHallsService(cinemaId);
        res.status(200).json(halls);
    } catch (err: any) {
        next(err);
    }
};

/**
 * @route POST /api/admin/cinemas/:id/halls
 * @desc Create a new hall and link it to a cinema in a transaction
 * @access Private (Admin)
 */
export const createHall = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();

    try {
        const { id: cinemaId } = req.params;
        const hallDataFromRequest = req.body;

        // Validate cinemaId
        if (!mongoose.Types.ObjectId.isValid(cinemaId)) {
            throw new CustomError('Invalid Cinema Id format.', 400);
        }

        //Validate that cinema exists in the database
        let cinema = await Cinema.findById(cinemaId);
        if (!cinema) {
            throw new CustomError('Cinema not found.', 404);
        }

        // Validate hall data
        const validatedHallData: THall = hallSchema.parse(hallDataFromRequest);

        let createdHallObject;

        // Start transaction
        await session.withTransaction(async (ses) => {
            const hallDataForService = { ...validatedHallData, cinemaId };

            // Create hall document
            const newHallDocument = await createHallService(hallDataForService, ses);

            // Add hall ID to cinema
            await addHallToCinemaService(cinemaId, newHallDocument.id!, ses);

            createdHallObject = newHallDocument;
        });

        res.status(201).json({ data: createdHallObject });
    } catch (err: any) {
        // Pass all errors to the error handler
        next(err);
    } finally {
        await session.endSession();
    }
};

/**
 * @route GET /api/admin/halls/:id
 * @desc Get a single hall by its ID
 * @access Private (Admin)
 */
export const getHallById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Hall ID format.' });
        }
        const hall = await getHallByIdService(id);
        res.status(200).json({ data: hall });
    } catch (err: any) {
        // Handle Zod validation errors from the service layer
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: err.errors });
        }

        // Handle the specific "not found" error from the service
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 * @route DELETE /api/admin/halls/:hallId
 * @desc Deletes a hall with the given ID, and removes it from cinema and deletes all sessions in a transaction
 * @access Private (Admin)
 */
export const deleteHall = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    try {
        const { hallId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(hallId)) throw new CustomError('Invalid Hall Id format.', 400);

        await session.withTransaction(async (ses) => {
            const hall = await getHallByIdService(hallId, ses);
            if (!hall) {
                throw new CustomError('Hall not found.', 404)
            }
            
            if (!mongoose.Types.ObjectId.isValid(hall.cinemaId)) throw new CustomError('Invalid Cinema Id format.', 400);
            const cinema = await Cinema.findById(hall.cinemaId);
            if (!cinema) throw new CustomError('Cinema not found', 404);
            
            await removeHallFromCinemaService(hall.cinemaId, hallId, ses);
            await deleteSessionsByHallIdService(hallId, ses);

            const deletedHall = await deleteHallByIdService(hallId, ses);

            if (!deletedHall) {
                throw new CustomError('Hall not found.', 404)
            }
        });

        res.status(204).send();
    } catch (err: any) {
        next(err);
    } finally {
        await session.endSession();
    }
};
