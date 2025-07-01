import { z } from "zod";

import { UserValidation } from "./constants/userConstants";

const addressSchema = z.object({
  line1: z.string().min(1, UserValidation.adress).optional(),
  city: z.string().min(1, UserValidation.city).optional(),
  state: z.string().min(1, UserValidation.state).optional(),
  zipcode: z.string().min(1, UserValidation.zipcode).optional(),
});

export const userSchema = z.object({
  role: z.enum(["admin", "user"]).default("user"),
  id: z.string(),
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
  address: addressSchema.optional(),
});

export type TUser = z.infer<typeof userSchema>;
