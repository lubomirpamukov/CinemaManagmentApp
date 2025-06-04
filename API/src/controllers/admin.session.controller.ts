import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { createSessionService, getSessionSeatLayoutService, getSessionsWithFiltersService } from '../services/sessionService';

export const createSession = async (req: Request, res: Response) => {
    try {
        const newSession = await createSessionService(req.body);
        if (!newSession) return res.status(400).json({ message: 'Session not created' });
        res.status(201).json(newSession);
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: err.errors });
        }
        res.status(500).json({ error: err.message });
    }
};

export const getSessionsWithFilters = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cinemaId, hallId, movieId, date } = req.query;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        
        if (cinemaId && !mongoose.Types.ObjectId.isValid(cinemaId as string)) {
            res.status(400).json({ error: 'Invalid cinema ID format' });
            return;
        }
        
        if (hallId && !mongoose.Types.ObjectId.isValid(hallId as string)) {
            res.status(400).json({ error: 'Invalid hall ID format' });
        }
        
        if (movieId && !mongoose.Types.ObjectId.isValid(movieId as string)) {
            res.status(400).json({ Error: 'Invalid movieId format' });
        }
        
        //call service with filters
        const sessionsData = await getSessionsWithFiltersService({
            cinemaId: cinemaId as string,
            hallId: hallId as string,
            movieId: movieId as string,
            date: date as string,
            page,
            limit
        });
        
        //return paginated result
        res.status(200).json(sessionsData);
    } catch (err: any) {
        console.error('error in getSessionsWithFilters', err);
        if (err.name === 'ZodError') {
            res.status(400).json({ error: err.errors });
            return;
        }

        res.status(500).json({ error: err.message });
    }
};

export const getSessionSeatLayout = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const seatLayout = await getSessionSeatLayoutService(sessionId);
        if (!seatLayout) {
            return res.status(404).json({ message: 'Session or Hall not found' });
        }
        res.status(200).json(seatLayout);
    } catch (err: any) {
        console.error('error in getSessionSeatLayout', err);
        if (err.name === 'ZodError') {
            res.status(400).json({ error: err.errors });
            return;
        }

        res.status(500).json({ error: err.message });
    }
};
