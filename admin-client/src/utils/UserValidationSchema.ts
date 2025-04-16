import { z } from "zod";

import { UserValidation } from "./constants/userConstants";

export const userAddressSchema = z.object({
    line1: z.string().min(4,UserValidation.addressLine1).max(100, UserValidation.addressLine1).optional(),
    city: z.string().min(2,UserValidation.city).max(100, UserValidation.city).optional(),
    state: z.string().min(2,UserValidation.city).max(100, UserValidation.city).optional(),
    zipcode: z.string().min(4,UserValidation.zipcode).max(10, UserValidation.zipcode).optional(),
})

export const userGeoLocationSchema = z.object({
    lat: z.number().min(-90).max(90).optional(),
    long: z.number().min(-180).max(180).optional()
  });

export const userSchema = z.object({
    id: z.string(),
    userName: z.string().min(4, UserValidation.name).max(100, UserValidation.name),
    name: z.string().min(4, UserValidation.name).max(100, UserValidation.name).optional(),
    email: z.string().email(UserValidation.email).max(100, UserValidation.email),
    password: z.string().min(8, UserValidation.password).max(100, UserValidation.password),
    contact: z.string().max(15,UserValidation.contact).optional(),
    address: userAddressSchema.optional(),
    geoLocation: userGeoLocationSchema.optional(),
})

export type User = z.infer<typeof userSchema>;