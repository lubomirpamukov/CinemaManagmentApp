import { z } from 'zod';

//Constants
export const UserValidation = {
    name: 'Name must be between 4 and 100 characters long.',
    email: 'Email must be a valid email address and with maximum 100 chacaters.',
    password: 'Password must be between 8 and 100 characters long.',
    contact: 'Contact number must be a valid phone number.'
};

//User validation schema
export const userImportDTOSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(4, UserValidation.name).max(100, UserValidation.name).optional(),
    email: z.string().email(UserValidation.email).max(100, UserValidation.email),
    password: z.string().min(8, UserValidation.password).max(100, UserValidation.password),
    contact: z.string().max(15, UserValidation.contact).optional()
});

export type UserDTO = z.infer<typeof userImportDTOSchema>;

//User DTO validation schema
export const userExportDTOSchema = z.object({
    id: z.string(),
    name: z.string().min(4, UserValidation.name).max(100, UserValidation.name).optional(),
    email: z.string().email(UserValidation.email).max(100, UserValidation.email),
    contact: z.string().max(15, UserValidation.contact).optional()
});

//Paginated response shema
export const userPaginatedSchema = z.object({
    data: z.array(
        z.object({
            id: z.string(),
            name: z.string().min(4, UserValidation.name).max(100, UserValidation.name).optional(),
            email: z.string().email(UserValidation.email).max(100, UserValidation.email),
            contact: z.string().max(15, UserValidation.contact).optional()
        })
    ),
    totalPages: z.number(),
    currentPage: z.number()
});
