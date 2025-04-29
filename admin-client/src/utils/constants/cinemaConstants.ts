import { cinemaSchema } from "../CinemaValidationsSchema"
import { z } from "zod";

type CinemaFormValues = z.infer<typeof cinemaSchema>;
export const DEFAULT_CINEMA_VALUES: CinemaFormValues = {
    id: "",
    name: "",
    city: "",
    halls: [],
    snacks:[
        {
            id: "default",
            name: "Snickers",
            description: "Chocolate bar",
            price: 4.99,
        }
    ],
    imgURL: "",
}

export const CinemaValidation = {
    city: "City must be between 3 and 150 characters long.",
    name: "Cinema must be between 4 and 100 characters long.",
    snackName: "Name must be between 2 and 100 character long.",
    snackDescription: "Description must be between 1 and 300 characters long.",
    snackPrice: "Price must be between 0.10 and 1000",
    url: "Image URL must be valid URL."
}


