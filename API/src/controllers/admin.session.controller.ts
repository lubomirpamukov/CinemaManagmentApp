import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { createSessionService, getSessionSeatLayoutService, getSessionsWithFiltersService } from '../services/sessionService';
import { sessionFiltersSchema, createSessionSchema } from '../utils';

/**
 * @route POST /api/admin/cinemas/:id/halls/:hallId/sessions
 * @desc Create a new movie session
 * @access Private (Admin)
 */
export const createSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = createSessionSchema.parse(req.body);
        const newSession = await createSessionService(validatedData);
        res.status(201).json({ session: newSession });
    } catch (err: any) {
        next(err)
    }
};

/**
 * @route GET /api/admin/sessions
 * @desc Get sessions with optional filters for cinema, hall, movie, date, with pagination
 * @access Private (Admin)
 */
export const getSessionsWithFilters = async (req: Request, res: Response, next:NextFunction) => {
    try {
        const filters = sessionFiltersSchema.parse(req.query);
        const sessionsData = await getSessionsWithFiltersService(filters);
        res.status(200).json(sessionsData);
    } catch (err: any) {
       next(err)
    }
};

/**
 * @route GET /api/session/:sessionId/seat-layout'
 * @desc Gets the session seatlayout
 * @access Private (user)
 */
export const getSessionSeatLayout = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ message: 'Invalid Session ID format.' });
        }
        const seatLayout = await getSessionSeatLayoutService(sessionId);
        res.status(200).json(seatLayout);
    } catch (err: any) {
        if (err.name === 'ZodError') {
            res.status(400).json({ error: err.errors });
            return;
        }

        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }

        res.status(500).json({ error: err.message });
    }
};
