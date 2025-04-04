import { z } from "zod";
import { HallValidation } from "./constants/hallConstants";

export const seatsSchema = z.object({
  row: z.number(),
  column: z.number(),
  seatNumber: z.string().min(1, HallValidation.seatName).max(10, HallValidation.seatName),
  isAvailable: z.enum(["reserved", "available", "sold"]),
  type: z.enum(["regular", "vip", "couple"]),
  price: z.number().min(0, HallValidation.price),
});

export const movieProgramSchema = z.object({
    movieId: z.string(),
    startTime: z.string().transform((val) => new Date(val)),
    endTime: z.string().transform((val) => new Date(val)),
  })

export const hallSchema = z
  .object({
    id: z.string(),
    cinemaId: z.string(),
    name: z.string().min(3, HallValidation.name).max(100, HallValidation.name),
    layout: z.object({
      rows: z.number().min(1, HallValidation.layoutRows).max(50, HallValidation.layoutRows),
      columns: z.number().min(1, HallValidation.layoutColumns).max(50, HallValidation.layoutColumns),
    }),
    movieProgram: z.array(movieProgramSchema),
    seats: z.array(seatsSchema),
  })
  .refine(
    (hall) =>
      hall.seats.every(
        (seat) => seat.row >= 1 && seat.row <= hall.layout.rows && seat.column >= 1 && seat.column <= hall.layout.columns
      ),
    {
      message: HallValidation.seats,
      path: ["seats"], // This helps associate the error message with the seats field
    }
  )
  .refine(
    (hall) => {
      const { movieProgram } = hall;

      // Check for overlapping movies
      for (let i = 0; i < movieProgram.length; i++) {
        for (let j = i + 1; j < movieProgram.length; j++) {
          const movieA = movieProgram[i];
          const movieB = movieProgram[j];

          // Check if the time ranges overlap
          const overlap =
            movieA.startTime < movieB.endTime && movieA.endTime > movieB.startTime;

          if (overlap) {
            return false; // Overlap detected
          }
        }
      }

      return true; // No overlaps
    },
    {
      message: HallValidation.movieOverlap,
      path: ["movieProgram"], // This helps associate the error message with the movieProgram field
    }
  );

  
