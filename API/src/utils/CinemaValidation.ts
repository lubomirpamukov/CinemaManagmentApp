import { z } from 'zod';
import { hallSchema } from './HallValidation';
import mongoose from 'mongoose';

export const CinemaValidation = {
    city: 'City must be between 3 and 150 characters long.',
    name: 'Cinema must be between 4 and 100 characters long.',
    snackName: 'Name must be between 2 and 100 character long.',
    snackDescription: 'Description must be between 1 and 300 characters long.',
    snackPrice: 'Price must be between 0.10 and 1000',
    url: 'Image URL must be valid URL.'
};

export const SnackValidation = {
    snackName: 'Snack name must be between 1 and 100 characters',
    snackDescription: 'Snack description must be between 1 and 300 characters',
    snackPrice: 'Snack price must be between 0.10 and 1000',
    snackRequired: 'At least one snack is required'
};

export const snackSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, SnackValidation.snackName).max(100, SnackValidation.snackName),
    description: z.string().min(1, SnackValidation.snackDescription).max(300, SnackValidation.snackDescription).optional(),
    price: z.number().min(0.1, SnackValidation.snackPrice).max(1000, SnackValidation.snackPrice)
});

export type SelectedSnacks = {
    [snackId: string]: number;
};

export type TSnack = z.infer<typeof snackSchema>;

export const cinemaSchema = z.object({
    id: z.string().optional(),
    city: z.string().min(3, CinemaValidation.city).max(150, CinemaValidation.city),
    name: z.string().min(4, CinemaValidation.name).max(100, CinemaValidation.name),
    halls: z.array(z.string()),
    snacks: z.array(snackSchema),
    imgURL: z
        .string()
        .url({ message: CinemaValidation.url })
        .optional()
        .or(z.literal('').transform(() => undefined))
});

export type TCinema = z.infer<typeof cinemaSchema>;

export const cinemaWithHallsSchema = z.object({
    id: z.string().optional(),
    city: z.string().min(3, CinemaValidation.city).max(150, CinemaValidation.city),
    name: z.string().min(4, CinemaValidation.name).max(100, CinemaValidation.name),
    halls: z.array(hallSchema),
    snacks: z.array(snackSchema),
    imgURL: z
        .string()
        .url({ message: CinemaValidation.url })
        .optional()
        .or(z.literal('').transform(() => undefined))
});

export type TCinemaWithHalls = z.infer<typeof cinemaWithHallsSchema>

export const cinemasQuerySchema = z.object({
    city: z.string({ required_error: 'City is required'}).min(1, 'City cannot be empty'),
    movieId: z.string({ required_error: 'Movie ID is required. '}).refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid Movie ID format.'
    })
})