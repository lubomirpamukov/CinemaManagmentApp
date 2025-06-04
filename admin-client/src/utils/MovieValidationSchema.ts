import { z } from "zod";

import { MovieValidation } from "./constants/movieConstants";

export const movieSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(3, { message: MovieValidation.titleLength })
    .max(60, { message: MovieValidation.titleLength }),
  duration: z
    .number()
    .min(15, { message: MovieValidation.duration })
    .max(500, { message: MovieValidation.duration }),
  pgRating: z.string().min(1, { message: MovieValidation.pgRating }),
  genre: z
    .string()
    .min(2, { message: MovieValidation.genre })
    .max(25, { message: MovieValidation.genre }),
  year: z
    .number()
    .min(1850, { message: "Year must be at least 1850." })
    .max(new Date().getFullYear(), { message: MovieValidation.year() }),
  director: z
    .string()
    .min(2, { message: MovieValidation.director })
    .max(100, { message: MovieValidation.director }),
  cast: z
    .array(
      z.object({
        name: z
          .string()
          .min(2, { message: MovieValidation.actorName })
          .max(100, { message: MovieValidation.actorName }),
        role: z
          .string()
          .min(2, { message: MovieValidation.actorRole })
          .max(100, { message: MovieValidation.actorRole }),
      })
    )
    .min(1, { message: MovieValidation.actorRequired }),
  description: z
    .string()
    .min(10, { message: MovieValidation.description })
    .max(700, { message: MovieValidation.description }),
  imgURL: z
    .string()
    .url({ message: MovieValidation.url })
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type Movie = Zod.infer<typeof movieSchema>;
