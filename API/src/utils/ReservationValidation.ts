import { z } from 'zod';

export const ReservationValidationMessages = {
    userIdRequired: 'User ID is required.',
    userIdInvalidFormat: 'Invalid User ID format.',
    sessionIdRequired: 'Session ID is required.',
    sessionIdInvalidFormat: 'Invalid Session ID format.',
    seatsRequired: 'At least one seat is required.',
    totalPriceRequired: 'Total price is required.',
    totalPriceMin: 'Total price must be a non-negative number.',
    statusRequired: 'Status is required.',
    statusInvalid: 'Invalid status type.',
    // For response schema
    idRequired: 'Reservation ID is required.',
    idInvalidFormat: 'Invalid Reservation ID format.',
    createdAtRequired: 'Creation date is required.',
    createdAtInvalidFormat: 'Invalid creation date format.',
    updatedAtRequired: 'Update date is required.',
    updatedAtInvalidFormat: 'Invalid update date format.'
};

export const ReservedSeatValidationMessages = {
    originalSeatIdRequired: 'Seat ID is required.',
    originalSeatIdInvalidFormat: 'Invalid Seat ID format.',
    rowRequired: 'Seat row is required.',
    rowType: 'Row must be a non-negative integer.',
    columnRequired: 'Seat column is required.',
    columnType: 'Column must be a non-negative integer.',
    seatNumberRequired: 'Seat number is required.',
    typeRequired: 'Seat type is required.',
    typeInvalid: 'Invalid seat type.',
    priceRequired: 'Seat price is required.',
    priceMin: 'Price must be a non-negative number.'
};

const seatTypes = ['regular', 'vip', 'couple'] as const;
export const seatSchema = z.object({
    originalSeatId: z
        .string({ required_error: ReservedSeatValidationMessages.originalSeatIdRequired })
        .nonempty({ message: ReservedSeatValidationMessages.originalSeatIdRequired })
        .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), { message: ReservedSeatValidationMessages.originalSeatIdInvalidFormat }),
    row: z
        .number({ required_error: ReservedSeatValidationMessages.rowRequired })
        .int({ message: ReservedSeatValidationMessages.rowType })
        .min(0, { message: ReservedSeatValidationMessages.rowType }),
    column: z
        .number({ required_error: ReservedSeatValidationMessages.columnRequired })
        .int({ message: ReservedSeatValidationMessages.columnType })
        .min(0, { message: ReservedSeatValidationMessages.columnType }),
    seatNumber: z
        .string({ required_error: ReservedSeatValidationMessages.seatNumberRequired })
        .nonempty({ message: ReservedSeatValidationMessages.seatNumberRequired }),
    type: z.enum(seatTypes, {
        required_error: ReservedSeatValidationMessages.typeRequired,
        invalid_type_error: ReservedSeatValidationMessages.typeInvalid
    }),
    price: z.number({ required_error: ReservedSeatValidationMessages.priceRequired }).min(0, { message: ReservedSeatValidationMessages.priceMin })
});
export type SeatZod = z.infer<typeof seatSchema>;

const statusTypes = ['pending', 'confirmed', 'failed', 'completed'] as const;

export const createReservationValidationSchema = z.object({
    userId: z
        .string({ required_error: ReservationValidationMessages.userIdRequired })
        .nonempty({ message: ReservationValidationMessages.userIdRequired })
        .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), { message: ReservationValidationMessages.userIdInvalidFormat }),
    sessionId: z
        .string({ required_error: ReservationValidationMessages.sessionIdRequired })
        .nonempty({ message: ReservationValidationMessages.sessionIdRequired })
        .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), { message: ReservationValidationMessages.sessionIdInvalidFormat }),
    seats: z.array(seatSchema).nonempty({ message: ReservationValidationMessages.seatsRequired }),
    totalPrice: z
        .number({ required_error: ReservationValidationMessages.totalPriceRequired })
        .min(0, { message: ReservationValidationMessages.totalPriceMin }),
    status: z
        .enum(statusTypes, {
            required_error: ReservationValidationMessages.statusRequired,
            invalid_type_error: ReservationValidationMessages.statusInvalid
        })
        .default('pending'),
    reservationCode: z.string().trim().min(1).optional()
});
export type TReservation = z.infer<typeof createReservationValidationSchema>;

export const reservationResponseSchema = createReservationValidationSchema.extend({
    _id: z
        .string({ required_error: ReservationValidationMessages.idRequired })
        .nonempty({ message: ReservationValidationMessages.idRequired })
        .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), { message: ReservationValidationMessages.idInvalidFormat }),
    createdAt: z
        .string({ required_error: ReservationValidationMessages.createdAtRequired })
        .datetime({ message: ReservationValidationMessages.createdAtInvalidFormat }),
    updatedAt: z
        .string({ required_error: ReservationValidationMessages.updatedAtRequired })
        .datetime({ message: ReservationValidationMessages.updatedAtInvalidFormat }),
    status: z.enum(statusTypes, {
        required_error: ReservationValidationMessages.statusRequired,
        invalid_type_error: ReservationValidationMessages.statusInvalid
    })
});
export type ReservationResponse = z.infer<typeof reservationResponseSchema>;

const mongooseObjectIdRegex = /^[a-fA-F0-9]{24}$/;
const PurchasedSnacksSchema = z.record(z.number());

export const createReservationSchema = z.object({
    userId: z.string().regex(mongooseObjectIdRegex, { message: 'Invalid userId format.' }),
    sessionId: z.string().regex(mongooseObjectIdRegex, { message: 'Invalid sessionId format.' }),
    seats: z.array(
        z.object({
            originalSeatId: z.string().regex(mongooseObjectIdRegex, { message: 'Invalid seatId format.' })
        })
    ),
    status: z.enum(['pending', 'confirmed', 'failed', 'completed']),
    purchasedSnacks: PurchasedSnacksSchema.optional()
});

export type CreateReservationRequest = z.infer<typeof createReservationSchema>;
