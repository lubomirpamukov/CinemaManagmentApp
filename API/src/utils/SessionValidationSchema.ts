import { z } from "zod";

export const SessionConstants = {
    cinemaId: "Cinema is required.",
    hallId: "Hall is required.",
    movieId: "Movie is required.",
    date: "Date is required.",
    time: "Time is required.",
}

export const sessionSchema = z.object({
    cinemaId: z.string().min(1, SessionConstants.cinemaId),
    hallId: z.string().min(1, SessionConstants.hallId),
    movieId: z.string().min(1, SessionConstants.movieId),
    date: z.string().min(1, SessionConstants.date),
    startTime: z.string().min(1, SessionConstants.time),
    endTime: z.string().min(1, SessionConstants.time),
})

// Create specific schema for session display objects
export const sessionDisplaySchema = z.object({
    _id: z.string(),
    cinemaId: z.string(),
    cinemaName: z.string(),
    hallId: z.string(),
    hallName: z.string(),
    movieId: z.string(),
    movieName: z.string(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string()
});

export type SessionDisplay = z.infer<typeof sessionDisplaySchema>;
export type SessionZod = z.infer<typeof sessionSchema>;
export type SessionWithIdZod = SessionZod & { _id: string | undefined };

// Update paginated schema to use sessionDisplaySchema
export const sessionDisplayPaginatedSchema = z.object({
    data: z.array(sessionDisplaySchema),
    totalPages: z.number(),
    currentPage: z.number()
});

export type SessionPaginatedResponse = z.infer<typeof sessionDisplayPaginatedSchema>;