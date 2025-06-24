import { Request, Response } from 'express';
import { createReservationService, getUserReservationService, deleteReservationService } from '../services/reservationService';
import { JwtRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

export const createReservation = async (req: Request, res: Response) => {
    try {
        const newReservation = await createReservationService(req.body);
        if (!newReservation) return res.status(400).json({ message: 'Reservation not created' });

        const reservationForResponse = {
            _id: newReservation._id.toString(),
            userId: newReservation.userId.toString(),
            sessionId: newReservation.sessionId.toString(),
            seats: newReservation.seats.map((seat: any) => ({
                originalSeatId: seat.originalSeatId.toString(),
                row: seat.row,
                column: seat.column,
                seatNumber: seat.seatNumber,
                type: seat.type,
                price: seat.price
            })),
            totalPrice: newReservation.totalPrice,
            status: newReservation.status,
            purchasedSnacks: newReservation.purchasedSnacks,
            reservationCode: newReservation.reservationCode,
            createdAt: newReservation.createdAt.toISOString(),
            updatedAt: newReservation.updatedAt.toISOString()
        };

        res.status(201).json(newReservation);
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: err.errors });
        }
        res.status(500).json({ error: err.message });
    }
};

export const getUserReservation = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const userReservations = await getUserReservationService(userId);
        if (!userReservations) return res.status(404).json({ message: "No reservations found."});
        res.status(200).json(userReservations)
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({error: error.errors})
        }
        res.status(500).json({ error: error.message});
    }
};

export const deleteReservation = async (req: JwtRequest, res: Response) => {
    try {
        const reservationId = req.params.reservationId;
        const userId = req.user?.id
        const userRole = req.user?.role

        if (!mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).json({ message: 'Invalid reservation ID format.' });
        }

        if (!userId) {
            return res.status(401).json({ message: "Authentication error: User ID not found."});
        }

        if (!userRole) {
            return res.status(401).json({ message: "Authentication error: User Role not found."});
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

        if (error.message === 'Could not find the session associated with this reservation.'){
            return res.status(404).json({ message: error.message})
        }

        if (error.message === 'Reservations can only be deleted more than 24 hours before the session starts.') {
            return res.status(400).json({ message: error.message });
        }

        console.error("Error deleting reservation:", error);
        return res.status(500).json({ message: 'An error occurred while deleting the reservation.'})
    }
}
