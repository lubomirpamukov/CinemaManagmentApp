import { z } from 'zod';

// Default user value
export const DEFAULT_USER_VALUES: User = {
    id: '',
    userName: '',
    name: '',
    email: '',
    password: '',
    contact: ''
};

//Constants
export const UserValidation = {
    name: 'Name must be between 4 and 100 characters long.',
    email: 'Email must be a valid email address and with maximum 100 chacaters.',
    password: 'Password must be between 8 and 100 characters long.',
    contact: 'Contact number must be a valid phone number.'
};

//User validation schema
export const userSchema = z.object({
    id: z.string(),
    userName: z.string().min(4, UserValidation.name).max(100, UserValidation.name),
    name: z.string().min(4, UserValidation.name).max(100, UserValidation.name).optional(),
    email: z.string().email(UserValidation.email).max(100, UserValidation.email),
    password: z.string().min(8, UserValidation.password).max(100, UserValidation.password),
    contact: z.string().max(15, UserValidation.contact).optional()
});

export type User = z.infer<typeof userSchema>;

//User DTO validation schema
export const userExportDTOSchema = z.object({
    id: z.string(),
    userName: z.string().min(4, UserValidation.name).max(100, UserValidation.name),
    name: z.string().min(4, UserValidation.name).max(100, UserValidation.name).optional(),
    email: z.string().email(UserValidation.email).max(100, UserValidation.email),
    contact: z.string().max(15, UserValidation.contact).optional()
});


//Paginated response shema
export const userPaginatedSchema = z.object({
    users: z.array(
        z.object({
            id: z.string(),
            userName: z.string().min(4, UserValidation.name).max(100, UserValidation.name),
            name: z.string().min(4, UserValidation.name).max(100, UserValidation.name).optional(),
            email: z.string().email(UserValidation.email).max(100, UserValidation.email),
            contact: z.string().max(15, UserValidation.contact).optional()
        })
    ),
    totalUsers: z.number(),
    totalPages: z.number(),
    currentPage: z.number()
});
