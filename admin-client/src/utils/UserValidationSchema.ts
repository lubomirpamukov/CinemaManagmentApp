import { z } from "zod";

import { UserValidation } from "./constants/userConstants";

export const userSchema = z.object({
  role: z.enum(["admin", "user"]).default("user"),
  id: z.string(),
  userName: z
    .string()
    .min(4, UserValidation.name)
    .max(100, UserValidation.name),
  name: z
    .string()
    .min(4, UserValidation.name)
    .max(100, UserValidation.name)
    .optional(),
  email: z.string().email(UserValidation.email).max(100, UserValidation.email),
  password: z
    .string()
    .min(8, UserValidation.password)
    .max(100, UserValidation.password)
    .optional(),
  contact: z.string().max(15, UserValidation.contact).optional(),
});

export type User = z.infer<typeof userSchema>;
