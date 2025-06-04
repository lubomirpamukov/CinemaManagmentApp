import { z } from "zod";

import { HallValidation } from "./constants/hallConstants";

export type Hall = z.infer<typeof hallSchema>;

export const seatsSchema = z.object({
  originalSeatId: z.string().optional(),
  row: z.number(),
  column: z.number(),
  seatNumber: z
    .string()
    .min(1, HallValidation.seatName)
    .max(10, HallValidation.seatName),
  isAvailable: z.boolean().optional(),
  type: z.enum(["regular", "vip", "couple"]),
  price: z.number().min(0, HallValidation.price),
});

export type SeatZod = z.infer<typeof seatsSchema>;

export const movieProgramSchema = z.object({
  movieId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export const hallSchema = z
  .object({
    id: z.string().optional(),
    cinemaId: z.string(),
    name: z.string().min(3, HallValidation.name).max(100, HallValidation.name),
    layout: z.object({
      rows: z
        .number()
        .min(1, HallValidation.layoutRows)
        .max(50, HallValidation.layoutRows),
      columns: z
        .number()
        .min(1, HallValidation.layoutColumns)
        .max(50, HallValidation.layoutColumns),
    }),
    movieProgram: z.array(movieProgramSchema),
    seats: z.array(seatsSchema),
  })
  .refine(
    (hall) =>
      hall.seats.every(
        (seat) =>
          seat.row >= 1 &&
          seat.row <= hall.layout.rows &&
          seat.column >= 1 &&
          seat.column <= hall.layout.columns
      ),
    {
      message: HallValidation.seats,
      path: ["seats"], // This helps associate the error message with the seats field
    }
  );
