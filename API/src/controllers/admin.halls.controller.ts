import { Request, Response } from 'express';
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

/**
 *
 * @route GET api/admin/cinemas/:id/halls
 * @desc Get all halls for a specific cinema
 * @access Private (Admin)
 */
export const getCinemaHalls = async (req: Request, res: Response) => {
    try {
        const { id: cinemaId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(cinemaId)) {
            return res.status(400).json({ error: 'Invalid cinema ID format.' });
        }

        const halls = await getCinemaHallsService(cinemaId);
        res.status(200).json(halls);
    } catch (err: any) {
        //Handle Zod validation errors from the service layer
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: 'Hall data validation failed', details: err.errors });
        }

        //Handle specific " not found " error from the service
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }

        res.status(500).json({ error: err.message });
    }
};

/**
 * @route POST /api/admin/cinemas/:id/halls
 * @desc Create a new hall and link it to a cinema in a transaction
 * @access Private (Admin)
 */
export const createHall = async (req: Request, res: Response) => {
    const { id: cinemaId } = req.params;
    const hallDataFromRequest = req.body;

    //Validate all inputs before starting the transaction
    if (!mongoose.Types.ObjectId.isValid(cinemaId)) {
        return res.status(400).json({ error: 'Invalid cinema ID format.' });
    }

    let validatedHallData: THall;

    try {
        validatedHallData = await hallSchema.parseAsync(hallDataFromRequest);
    } catch (error: any) {
        return res.status(400).json({ error: 'Invalid hall data provided.', details: error.errors });
    }

    //Starting transaction session
    const session = await mongoose.startSession();
    try {
        let createdHallObject;

        await session.withTransaction(async (ses) => {
            const hallDataForService = { ...validatedHallData, cinemaId };

            //Create hall document
            const newHallDocument = await createHallService(hallDataForService, ses);

            //Add hall id to cinema
            await addHallToCinemaService(cinemaId, newHallDocument._id, ses);

            createdHallObject = newHallDocument.toObject();
        });

        res.status(201).json({ data: createdHallObject });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'An unexpected error occurred during the hall creation process.' });
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
export const deleteHall = async (req: Request, res: Response) => {
    const { hallId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hallId)) {
        throw new Error('Invalid Hall ID format.');
    }

    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            await removeHallFromCinemaService(hallId, session);
            await deleteSessionsByHallIdService(hallId, session);

            const deletedHall = await deleteHallByIdService(hallId, session);

            if (!deletedHall) {
                throw new Error('Hall not found.');
            }
        });

        res.status(204).send();
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: err.errors });
        }

        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }

        res.status(500).json({ error: err.message });
    } finally {
        await session.endSession();
    }
};
