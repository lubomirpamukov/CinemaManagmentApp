import { z } from 'zod';

//Constants
export const UserValidation = {
    name: 'Name must be between 4 and 100 characters long.',
    email: 'Email must be a valid email address and with maximum 100 chacaters.',
    password: 'Password must be between 8 and 100 characters long.',
    contact: 'Contact number must be a valid phone number.',
    adress: 'Address line1 is required.',
    city: 'City is required.',
    state: 'State is required.',
    zipcode: 'Zipcode is required.'
};

const addressSchema = z.object({
    line1: z.string().min(1, UserValidation.adress).optional(),
    city: z.string().min(1, UserValidation.city).optional(),
    state: z.string().min(1, UserValidation.state).optional(),
    zipcode: z.string().min(1, UserValidation.zipcode).optional()
});

// 1. Base schema for creating a new user (includes password)
export const userCreationSchema = z.object({
    name: z.string().min(4, UserValidation.name).max(100, UserValidation.name).optional(),
    email: z.string().email(UserValidation.email).max(100, UserValidation.email),
    password: z.string().min(8, UserValidation.password).max(100, UserValidation.password),
    contact: z.string().max(15, UserValidation.contact).optional(),
    address: addressSchema.optional()
});
export type TUserCreation = z.infer<typeof userCreationSchema>;

// 2. Reusable schema for a user Data Transfer Object (DTO) - NO password
export const userDTOSchema = z.object({
    id: z.string(),
    name: z.string().min(4, UserValidation.name).max(100, UserValidation.name).optional(),
    email: z.string().email(UserValidation.email).max(100, UserValidation.email),
    contact: z.string().max(15, UserValidation.contact).optional(),
    address: addressSchema.optional()
});
export type TUserDTO = z.infer<typeof userDTOSchema>;

// 3. Schema for a paginated list of users (reuses the DTO schema)
export const userPaginatedSchema = z.object({
    data: z.array(userDTOSchema), // <-- Reuses the DTO schema
    totalPages: z.number(),
    currentPage: z.number()
});
export type TUserPaginated = z.infer<typeof userPaginatedSchema>;

// 4. A simple schema to represent a reservation in a user's profile
const simpleReservationSchema = z.object({
    id: z.string(),
    reservationCode: z.string(),
    movieTitle: z.string(),
    sessionDate: z.date(),
    status: z.string()
});

// 5. Schema for a full user profile, including their reservations
export const userProfileSchema = userDTOSchema.extend({
    reservations: z.array(simpleReservationSchema).optional()
});
export type TUserProfile = z.infer<typeof userProfileSchema>;

// 6. Schema for user login
export const userLoginSchema = z.object({
    email: z.string().email('A valid email is required.'),
    password: z.string().min(1, 'Password is required.')
});
export type TUserLogin = z.infer<typeof userLoginSchema>;
