import mongoose from 'mongoose';
import { z } from 'zod';

// --- Schema for Creating a New Session (API Input) ---
// This schema validates the raw JSON body from the client.
// It uses z.coerce.date() to convert incoming date strings into true Date objects.
export const createSessionSchema = z
    .object({
        cinemaId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: 'Invalid Cinema ID format'
        }),
        hallId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: 'Invalid Hall ID format'
        }),
        movieId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: 'Invalid Movie ID format'
        }),
        startTime: z.coerce.date({
            required_error: 'Start time is required',
            invalid_type_error: 'Start time must be a valid date string (ISO 8601 format)'
        }),
        endTime: z.coerce.date({
            required_error: 'End time is required',
            invalid_type_error: 'End time must be a valid date string (ISO 8601 format)'
        })
    })
    .refine((data) => data.endTime > data.startTime, {
        message: 'End time must be after start time',
        path: ['endTime'] // Attach the error to the endTime field for better client-side handling
    });

// This type is now correctly inferred with `startTime` and `endTime` as `Date` objects.
export type TSession = z.infer<typeof createSessionSchema>;

// --- Schema for Displaying a Session (API Output) ---
// This schema validates the data being sent from the server to the client.
// Date objects are serialized to strings in JSON, so we validate them as datetime strings.
export const sessionDisplaySchema = z.object({
    _id: z.string(),
    cinemaId: z.string(),
    cinemaName: z.string(),
    hallId: z.string(),
    hallName: z.string(),
    movieId: z.string(),
    movieName: z.string(),
    startTime: z.string().datetime(), // Validates the ISO string format
    endTime: z.string().datetime(), // Validates the ISO string format
    availableSeats: z.number()
});

export type TSessionDisplay = z.infer<typeof sessionDisplaySchema>;

// --- Schema for Paginated Session Responses ---
export const sessionDisplayPaginatedSchema = z.object({
    data: z.array(sessionDisplaySchema),
    totalPages: z.number(),
    currentPage: z.number()
});

export type SessionPaginatedResponse = z.infer<typeof sessionDisplayPaginatedSchema>;

// --- Schema for Filtering Sessions (URL Query Params) ---
export const sessionFiltersSchema = z.object({
    cinemaId: z
        .string()
        .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: 'Invalid Cinema ID format' })
        .optional(),
    hallId: z
        .string()
        .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: 'Invalid Hall ID format' })
        .optional(),
    movieId: z
        .string()
        .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: 'Invalid Movie ID format' })
        .optional(),
    date: z.string().date().optional(), // Validates a 'YYYY-MM-DD' date string
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    minSeatsRequired: z.preprocess(
        (val) => (typeof val !== 'string' || val === '' ? undefined : Number(val)),
        z.number({ invalid_type_error: 'minSeatsRequired must be a number' }).int().min(0).optional()
    )
});

export type SessionFilters = z.infer<typeof sessionFiltersSchema>;
