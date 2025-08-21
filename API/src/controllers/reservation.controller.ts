import { Request, Response } from 'express';
import {
    createReservationService,
    getUserReservationService as getUserReservationsService,
    deleteReservationService
} from '../services/reservationService';
import { JwtRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';
import { ReservationFilter } from '../utils';
import { ZodError } from 'zod';

/**
 * @route POST /api/reservations
 * @description Creates a new reservation for the authenticated user.
 * @access Private (requires authentication)
 *
 * @param {JwtRequest} req The Express request object, containing the authenticated user's payload.
 *                         The request body should contain `sessionId`, `seats`,  and optional `purchasedSnacks`
 * @param {Response} res The Express response object.
 *
 * @returns {Promise<Response>}
 * - On success: Returns a 201 status with the new reservation's display data.
 * - On validation error: Returns a 400 status with a detailed error object.
 * - If user, session, or hall not found: Returns a 404 status with a specific error message.
 * - If seats are alredy taken: Returns a 409 (Conflict) status with a specific error message.
 * - On authentication failure: Returns 401 status.
 * - On server error: Returns a 500 status with specific error message.
 */
export const createReservation = async (req: JwtRequest, res: Response) => {
    try {
        // 1. Get the user ID from the authenticated token, NOT the request body.
        const userId = req.user?.id;
        if (!userId) {
            return res.status(201).json({ error: 'Authentication required. User not identified.' });
        }

        // 2. Call service with trusted userId
        const reservationDisplayData = await createReservationService(userId, req.body);
        res.status(201).json(reservationDisplayData);
    } catch (err: any) {
        if (err instanceof ZodError) {
            return res.status(400).json({ error: err.errors });
        }

        if (err.message.includes('not found')) {
            return res.status(404).json({error: err.message});
        }

        if (err.message.includes('alredy booked')) {
            return res.status(409).json({error: err.message});
        }
        console.error('Create Reservation Error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getUserReservations = async (req: Request, res: Response) => {
    try {
        const filter: ReservationFilter = { userId: '' };
        if (req.query.userId) filter.userId = req.query.userId as string;
        if (req.query.status) filter.status = req.query.status as string;

        const userId = req.params.userId;
        const userReservations = await getUserReservationsService(filter);
        if (!userReservations) return res.status(404).json({ message: 'No reservations found.' });
        res.status(200).json(userReservations);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message });
    }
};

export const deleteReservation = async (req: JwtRequest, res: Response) => {
    try {
        const reservationId = req.params.reservationId;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        if (!mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).json({ message: 'Invalid reservation ID format.' });
        }

        if (!userId) {
            return res.status(401).json({ message: 'Authentication error: User ID not found.' });
        }

        if (!userRole) {
            return res.status(401).json({ message: 'Authentication error: User Role not found.' });
        }

        await deleteReservationService(reservationId, userId, userRole);
        return res.status(204).send();
    } catch (error: any) {
        if (error.message === 'Reservation not found.') {
            return res.status(404).json({ message: error.message });
        }

        if (error.message === 'Unauthorized') {
            return res.status(403).json({ message: 'Only owner of reservation or admin can delete reservations.' });
        }

        if (error.message === 'Could not find the session associated with this reservation.') {
            return res.status(404).json({ message: error.message });
        }

        if (error.message === 'Reservations can only be deleted more than 24 hours before the session starts.') {
            return res.status(400).json({ message: error.message });
        }

        console.error('Error deleting reservation:', error);
        return res.status(500).json({ message: 'An error occurred while deleting the reservation.' });
    }
};
