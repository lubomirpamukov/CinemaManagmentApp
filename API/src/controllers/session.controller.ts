import { Request, Response } from 'express';
import z from 'zod';
import { seatSchema } from '../utils';
import { getReservedSessionSeatsService, getAvailableDatesForMovieInCinemaService, getSessionSeatLayoutService } from '../services';

export const getReservedSessionSeats = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId) return res.status(400).json({ message: 'Session id not found' });

        const reservedSeats = await getReservedSessionSeatsService(sessionId);
        const validatedResult = z.array(seatSchema).safeParse(reservedSeats);

        if (!validatedResult.success) {
            console.error('Validation failed for reserved seats:', validatedResult.error.errors);
            return res.status(500).json({
                message: 'Internal server Error: Data validation failed.',
                errors: validatedResult.error.errors
            });
        }

        res.status(200).json({ reservedSeats: validatedResult.data });
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: err.errors });
        }
        res.status(500).json({ error: err.message });
    }
};

export const getAvailableDatesForMovieInCinema = async (req: Request, res: Response) => {
    try {
        const movieId = req.query.movieId as string | undefined;
        const cinemaId = req.query.cinemaId as string | undefined;
        if (!movieId || !cinemaId) return res.status(400).json({ message: 'Movie ID or Cinema ID is missing.' });
        const sessions = await getAvailableDatesForMovieInCinemaService(movieId, cinemaId);
        res.status(200).json(sessions);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message });
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
