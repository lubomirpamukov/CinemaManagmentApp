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

export const sessionDisplayPaginatedSchema = z.object({
    data: z.array(sessionDisplaySchema),
    totalPages: z.number(),
    currentPage: z.number()
});

export type SessionPaginatedResponse = z.infer<typeof sessionDisplayPaginatedSchema>;

export type SessionDisplay = z.infer<typeof sessionDisplaySchema>;

export type Session = z.infer<typeof sessionSchema>;

export type SessionWithId = Session & { _id: string | undefined };