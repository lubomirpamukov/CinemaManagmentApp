import z from 'zod';

export const getPaginationQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => parseInt(val || '1'))
        .refine((val) => val > 0, {
            message: 'Page must be a positive number'
        }),
    limit: z
        .string()
        .optional()
        .transform((val) => parseInt(val || '10'))
        .refine((val) => val > 0, {
            message: 'Limit must be a positive number'
        }),
    search: z.string().optional()
});
