import { z } from "zod";
import { SessionConstants } from "./constants";

export const sessionSchema = z.object({
    cinemaId: z.string().min(1, SessionConstants.cinemaId),
    hallId: z.string().min(1, SessionConstants.hallId),
    movieId: z.string().min(1, SessionConstants.movieId),
    date: z.string().min(1, SessionConstants.date),
    startTime: z.string().min(1, SessionConstants.time),
    endTime: z.string()
    .min(1, SessionConstants.time),
})

export type Session = z.infer<typeof sessionSchema>;

export type SessionWithId = Session & { _id: string | undefined };