import { Request, Response } from 'express';
import { createReservationService } from '../services/reservationService';

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


