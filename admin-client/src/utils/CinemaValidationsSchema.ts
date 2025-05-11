import { z } from "zod";

import { CinemaValidation } from "./constants/cinemaConstants";
import { snackSchema } from "./SnackValidationsSchema";


export const cinemaSchema = z.object({
    id: z.string().optional(),
    city: z.string().min(3, CinemaValidation.city).max(150, CinemaValidation.city),
    name: z.string().min(4, CinemaValidation.name).max(100, CinemaValidation.name),
    halls: z.array(z.string()),
    snacks: z.array(snackSchema).optional(),
    imgURL: z.string().url({ message: CinemaValidation.url }).optional().or(z.literal("").transform(() => undefined)),
})

export type Cinema = z.infer<typeof cinemaSchema>;
