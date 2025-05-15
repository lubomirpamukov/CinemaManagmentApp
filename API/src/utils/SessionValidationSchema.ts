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
    endTime: z.string()
    .min(1, SessionConstants.time),
})

export type SessionZod = z.infer<typeof sessionSchema>;

export type SessionWithIdZod = SessionZod & { _id: string | undefined };