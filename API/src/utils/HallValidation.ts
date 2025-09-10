import { z } from 'zod';
import { ISeat } from '../models';

export const HallValidation = {
    name: 'Hall name must be between 3 and 100 characters long',
    layoutRows: 'Rows must be between 1 and 50',
    layoutColumns: 'Columns must be between 1 and 50',
    price: 'Price must be a positive number',
    seats: 'All seats must be within the rows and columns range of the hall layout',
    seatName: 'Seat name must be between 1 and 10 characters long',
    movieOverlap: 'Movie times cannot overlap'
};

export const seatsSchema = z.object({
    originalSeatId: z.string().optional(),
    row: z.number(),
    column: z.number(),
    seatNumber: z.string().min(1, HallValidation.seatName).max(10, HallValidation.seatName),
    isAvailable: z.boolean().optional(),
    type: z.enum(['regular', 'vip', 'couple']),
    price: z.number().min(0, HallValidation.price)
});

export type TSeat = z.infer<typeof seatsSchema>;

export const hallSchema = z
    .object({
        id: z.string().optional(),
        cinemaId: z.string(),
        name: z.string().min(3, HallValidation.name).max(100, HallValidation.name),
        layout: z.object({
            rows: z.number().min(1, HallValidation.layoutRows).max(50, HallValidation.layoutRows),
            columns: z.number().min(1, HallValidation.layoutColumns).max(50, HallValidation.layoutColumns)
        }),
        seats: z.array(seatsSchema)
    })
    .refine(
        (hall) => hall.seats.every((seat) => seat.row >= 1 && seat.row <= hall.layout.rows && seat.column >= 1 && seat.column <= hall.layout.columns),
        {
            message: HallValidation.seats,
            path: ['seats'] // This helps associate the error message with the seats field
        }
    );

export type THall = z.infer<typeof hallSchema>;

export interface ISeatWithAvailability extends Omit<ISeat, '_id'> {
    _id: string;
    isAvailable: boolean;
}

export type IHallSeatLayoutResponse = {
    sessionId: string;
    hallId: string;
    hallName: string;
    hallLayout: {
        rows: number;
        columns: number;
    };
    seats: ISeatWithAvailability[];
};
