import bcrypt from 'bcrypt';
import { getPaginationQuerySchema } from '../utils/PaginationQuerySchema';
import { userPaginatedSchema, userExportDTOSchema, userSchema, TUserExportDTO, TUserPaginated, TUser } from '../utils/UserValidation';
import { paginate } from '../utils/PaginationUtils';
import User, { IUser } from '../models/user.model';

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
    const userDTOs: TUserExportDTO[] = paginatedResult.data.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        contact: user.contact,
        address: user.address,
        role: user.role // Assuming role should be in the DTO
    }));

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
 * @param {string} id The user ID.
 * @throws {Error} Throws error if user is not found or database connection failed.
 * @returns {Promise<TUserExportDTO>} Resloves to user object with specified ID.
 */
export const getUserByIdService = async (id: string): Promise<TUserExportDTO> => {
    const user = await User.findById(id).lean().select('-password');
    if (!user) throw new Error('User not found');

    const userExportDto = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        contact: user.contact,
        address: user.address
    };

    // Validate the transformed object with Zod
    const validatedUser = userExportDTOSchema.parse(userExportDto);
    return validatedUser;
};

/**
 *Creates a new user document in the database after hashing the password.
 *Assumes the user data has been validated by the controller.
 * @param {TUser} validatedUserData The validated data for the new user.
 * @throws {Error} Throws an error if the database operation fails
 * @returns {Promise<TUserExportDTO>} Resolves to a newly created User DTO
 */
export const createUserService = async (validatedUserData: TUser): Promise<TUserExportDTO> => {
    // Validate the incoming data

    // Hash the password before saving
    if (validatedUserData.password) {
        validatedUserData.password = await bcrypt.hash(validatedUserData.password, 10);
    }

    // Create a new user
    const newUser = await User.create(validatedUserData);

    // Transform the user object to DTO
    const userExportDto = {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        contact: newUser.contact,
        address: newUser.address,
        role: newUser.role
    };

    return userExportDTOSchema.parse(userExportDto);
};

/**
 * Updates a user's information in the database.
 * Assumes the controller has validated the ID and update data.
 * @param {string} id The unique identifier of the user to update.
 * @param {Partial<TUser>} updates The validated user data to apply.
 * @throws {Error} Throws "User not found" if the ID does not exist.
 * @throws {MongoError} Throws a duplicate key error if the update violates a unique index (e.g., email).
 * @returns {Promise<TUserExportDTO>} A promise that resolves to the updated and validated user DTO.
 */
export const updateUserService = async (id: string, updates: Partial<TUser>): Promise<TUserExportDTO> => {
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
    const userExportDto = {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        role: updatedUser.role,
        email: updatedUser.email,
        contact: updatedUser.contact,
        address: updatedUser.address
    };

    // 5. Validate the final DTO before returning to guarantee its shape.
    return userExportDTOSchema.parse(userExportDto);
};

/**
 * Deletes a user from the database by their unique identifier.
 * Assumes the controller has validated the ID format.
 * @param {string} id The unique identifier of the user to delete.
 * @throws {Error} Throws an error with the message "User not found" if no user matches the provided ID 
 * @returns {Promise<TUserExportDTO>} A promise that resolves to the DTO of the deleted user.
 */
export const deleteUserService = async (id: string): Promise<TUserExportDTO> => {
    const deletedUser = await User.findByIdAndDelete(id).select('-password');

    if (!deletedUser) {
        throw new Error('User not found');
    }

    // 3. Transform the deleted Mongoose document into a safe DTO for export.
    const userExportDto = {
        id: deletedUser._id.toString(),
        name: deletedUser.name,
        role: deletedUser.role,
        email: deletedUser.email,
        contact: deletedUser.contact,
        address: deletedUser.address
    };

    return userExportDTOSchema.parse(userExportDto);
};
