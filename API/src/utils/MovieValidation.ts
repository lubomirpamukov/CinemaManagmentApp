import { z } from 'zod';

//Movie Schema validation constants
const MovieValidation = {
    titleLength: 'Title must be between 3 and 60 charaters.',
    duration: 'Movie duration must be between 15 and 500 minutes.',
    pgRating: 'PG Rating is required',
    genre: 'Genre must be between 2 and 25 characters long.',
    year() {
        return `Year must be between 1850 and ${new Date().getFullYear()}.`;
    },
    director: 'Director name must be between 2 and 100 characters long.',
    actorName: 'Actor name must be between 2 and 100 characters long.',
    actorRole: 'Actor role must be between 2 and 100 characters long.',
    actorRequired: 'At least 1 actor is required.',
    description: 'Description must be between 10 and 700 characters long.',
    url: 'Image URL must be valid URL.'
};

//Movie validation schema
export const movieSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(3, { message: MovieValidation.titleLength }).max(60, { message: MovieValidation.titleLength }),
    duration: z.number().min(15, { message: MovieValidation.duration }).max(500, { message: MovieValidation.duration }),
    pgRating: z.string().min(1, { message: MovieValidation.pgRating }),
    genre: z.string().min(2, { message: MovieValidation.genre }).max(25, { message: MovieValidation.genre }),
    year: z.number().min(1850, { message: 'Year must be at least 1850.' }).max(new Date().getFullYear(), { message: MovieValidation.year() }),
    director: z.string().min(2, { message: MovieValidation.director }).max(100, { message: MovieValidation.director }),
    cast: z
        .array(
            z.object({
                name: z.string().min(2, { message: MovieValidation.actorName }).max(100, { message: MovieValidation.actorName }),
                role: z.string().min(2, { message: MovieValidation.actorRole }).max(100, { message: MovieValidation.actorRole })
            })
        )
        .min(1, { message: MovieValidation.actorRequired }),
    description: z.string().min(10, { message: MovieValidation.description }).max(700, { message: MovieValidation.description }),
    imgURL: z
        .string()
        .url({ message: MovieValidation.url })
        .optional()
        .or(z.literal('').transform(() => undefined))
});

export type MovieZod = z.infer<typeof movieSchema>;

//Paginated response schema
export const moviePaginatedSchema = z.object({
    data: z.array(movieSchema),
    totalPages: z.number(),
    currentPage: z.number()
});
