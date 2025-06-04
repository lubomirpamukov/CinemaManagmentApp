import { z } from "zod";

import { SnackValidation } from "./constants/snackConstants";

export const snackSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, SnackValidation.snackName)
    .max(100, SnackValidation.snackName),
  description: z
    .string()
    .min(1, SnackValidation.snackDescription)
    .max(300, SnackValidation.snackDescription)
    .optional(),
  price: z
    .number()
    .min(0.1, SnackValidation.snackPrice)
    .max(1000, SnackValidation.snackPrice),
});

export const snackFormSchema = z.object({
  snacks: z.array(snackSchema).min(1, SnackValidation.snackRequired),
});
