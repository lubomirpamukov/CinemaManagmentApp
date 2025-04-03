import { z } from "zod";
import { CinemaValidation } from "./constants/cinemaConstants";


export const cinemaSchema = z.object({
    id: z.string(),
    city: z.string().min(3, CinemaValidation.city).max(150, CinemaValidation.city),
    name: z.string().min(4, CinemaValidation.name).max(100, CinemaValidation.name),
    halls: z.array(z.string()),
    snacks: z.array(z.object({
        name: z.string().min(1, CinemaValidation.snackName).max(100, CinemaValidation.snackName),
        description: z.string().min(1, CinemaValidation.snackDescription).max(300, CinemaValidation.snackDescription),
        price: z.number().min(0.10, CinemaValidation.snackPrice).max(1000, CinemaValidation.snackPrice)
    })),
    imgURL: z.string().url({ message: CinemaValidation.url }).optional().or(z.literal("").transform(() => undefined)),
})

export type Cinema = z.infer<typeof cinemaSchema>;