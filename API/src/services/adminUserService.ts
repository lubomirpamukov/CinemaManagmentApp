import bcrypt from 'bcrypt';
import { getPaginationQuerySchema } from '../utils/PaginationQuerySchema';
import { userPaginatedSchema,  userDTOSchema,TUserDTO, TUserPaginated, TUserCreation } from '../utils/UserValidation';
import { paginate } from '../utils/PaginationUtils';
import User, { IUser } from '../models/user.model';
import { mapUserToTUserDTO } from '../utils/mapping-functions';
import mongoose from 'mongoose';

/**
 * Fetches a paginated list of users, with optional searching.
 * @param {z.input<typeof getPaginationQuerySchema>} query - The query parameters from the HTTP request.
 * @param {string} [query.page='1'] - The page number for pagination.
 * @param {string} [query.limit='10'] - The number of items per page.
 * @param {string} [query.search] - A search term to filter users by userName, name, or email.
 * @throws {ZodError} If the query parameters are invalid.
 * @returns {Promise<TUserPaginated>} A promise that resolves to a validated, paginated object containing user DTOs.
 */
export const getUsersService = async (query: any): Promise<TUserPaginated> => {
    const { page, limit, search } = getPaginationQuerySchema.parse(query);

    // Build the search query
    const searchQuery = search
        ? {
              $or: [
                  { userName: { $regex: search, $options: 'i' } },
                  { name: { $regex: search, $options: 'i' } },
                  { email: { $regex: search, $options: 'i' } }
              ]
          }
        : {};

    // Use the pagination utility
    const paginatedResult = await paginate<IUser>(User, {
        page,
        limit,
        searchQuery,
        selectFields: '-password'
    });

    //Map the raw mongoose documents to clean DTOs
    const userDTOs: TUserDTO[] = paginatedResult.data.map(mapUserToTUserDTO);

    // Validate the response data using Zod
    return userPaginatedSchema.parse({
        data: userDTOs,
        totalPages: paginatedResult.totalPages,
        currentPage: paginatedResult.currentPage
    });
};

/**
 * Fetches a user by their ID and transforms the document into a valid DTO.
 * Assumes the controller has validated the ID format.
 * @param {string | mongoose.Types.OnjectId} id The user ID.
 * @throws {Error} Throws error if user is not found or database connection failed.
 * @returns {Promise<TUserDTO>} Resloves to user object with specified ID.
 */
export const getUserByIdService = async (id: string | mongoose.Types.ObjectId): Promise<TUserDTO> => {
    const user = await User.findById(id).lean().select('-password');
    if (!user) throw new Error('User not found');

    const userExportDto = mapUserToTUserDTO(user)

    // Validate the transformed object with Zod
    const validatedUser = userDTOSchema.parse(userExportDto);
    return validatedUser;
};

/**
 *Creates a new user document in the database after hashing the password.
 *Assumes the user data has been validated by the controller.
 * @param {TUser} validatedUserData The validated data for the new user.
 * @throws {Error} Throws an error if the database operation fails
 * @returns {Promise<TUserDTO>} Resolves to a newly created User DTO
 */
export const createUserService = async (validatedUserData: TUserCreation): Promise<TUserDTO> => {
    // Validate the incoming data

    // Hash the password before saving
    if (validatedUserData.password) {
        validatedUserData.password = await bcrypt.hash(validatedUserData.password, 10);
    }

    // Create a new user
    const newUser = await User.create(validatedUserData);

    // Transform the user object to DTO
    const userExportDto = mapUserToTUserDTO(newUser)

    return userDTOSchema.parse(userExportDto);
};

/**
 * Updates a user's information in the database.
 * Assumes the controller has validated the ID and update data.
 * @param {string | mongoose.Types.ObjectId} id The unique identifier of the user to update.
 * @param {Partial<TUser>} updates The validated user data to apply.
 * @throws {Error} Throws "User not found" if the ID does not exist.
 * @throws {MongoError} Throws a duplicate key error if the update violates a unique index (e.g., email).
 * @returns {Promise<TUserDTO>} A promise that resolves to the updated and validated user DTO.
 */
export const updateUserService = async (id: string | mongoose.Types.ObjectId, updates: Partial<TUserCreation>): Promise<TUserDTO> => {
    // 1. If a new password is provided in the updates, hash it before saving.
    if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
    }

    // 2. Find the user by ID and apply the updates.
    // `new: true` returns the modified document. `runValidators: true` ensures schema validation.
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
    }).select('-password'); // Ensure the password is not returned.

    // 3. If no user was found with that ID, throw an error.
    if (!updatedUser) {
        throw new Error('User not found');
    }

    // 4. Transform the updated Mongoose document into a safe DTO for export.
    const userExportDto = mapUserToTUserDTO(updatedUser)

    // 5. Validate the final DTO before returning to guarantee its shape.
    return userDTOSchema.parse(userExportDto);
};

/**
 * Deletes a user from the database by their unique identifier.
 * Assumes the controller has validated the ID format.
 * @param {string | mongoose.Types.ObjectId} id The unique identifier of the user to delete.
 * @throws {Error} Throws an error with the message "User not found" if no user matches the provided ID 
 * @returns {Promise<TUserDTO>} A promise that resolves to the DTO of the deleted user.
 */
export const deleteUserService = async (id: string | mongoose.Types.ObjectId): Promise<TUserDTO> => {
    const deletedUser = await User.findByIdAndDelete(id).select('-password');

    if (!deletedUser) {
        throw new Error('User not found');
    }

    // 3. Transform the deleted Mongoose document into a safe DTO for export.
    const userExportDto = mapUserToTUserDTO(deletedUser)

    return userDTOSchema.parse(userExportDto);
};
