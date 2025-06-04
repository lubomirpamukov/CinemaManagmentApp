import { Request, Response } from 'express';
import z from 'zod';
import { seatSchema } from '../utils';
import { getReservedSessionSeatsService } from "../services/sessionService";


export const getReservedSessionSeats = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId) return res.status(400).json({ message: 'Session id not found' });

        const reservedSeats = await getReservedSessionSeatsService(sessionId);
        const validatedResult = z.array(seatSchema).safeParse(reservedSeats);

        if(!validatedResult.success) {
            console.error('Validation failed for reserved seats:', validatedResult.error.errors)
            return res.status(500).json({
                message: "Internal server Error: Data validation failed.",
                errors: validatedResult.error.errors
            })
        }

        res.status(200).json({ reservedSeats: validatedResult.data})
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: err.errors });
        }
        res.status(500).json({ error: err.message });
    }
};