import bcrypt from 'bcrypt';
import { getPaginationQuerySchema } from '../utils/PaginationQuerySchema';
import { userPaginatedSchema, userExportDTOSchema, userImportDTOSchema } from '../utils/UserValidation';
import { paginate } from '../utils/PaginationUtils';
import User, { IUser } from '../models/user.model';

export const getUsersService = async (query: any) => {
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
    const result = await paginate(User, {
        page,
        limit,
        searchQuery,
        selectFields: '-password'
    });

    // Validate the response data using Zod
    const validatedResult = userPaginatedSchema.parse({
        data: result.data,
        totalPages: result.totalPages,
        currentPage: result.currentPage
    });

    return validatedResult;
};


// Get user by id (READ)
export const getUserByIdService = async (id: string) => {
    const user = await User.findById(id).select('-password') as IUser;
    if (!user) throw new Error('User not found');

    const userExportDto = {
        id: user._id.toString(),
        userName: user.userName,
        name: user.name,
        email: user.email,
        contact: user.contact,
    };

    // Validate the transformed object with Zod
    const validatedUser = userExportDTOSchema.parse(userExportDto);
    console.log(validatedUser);
    return validatedUser;
};

export const createUserService = async (userData: typeof userExportDTOSchema) => {
    // Validate the incoming data
    const validatedUserData = userImportDTOSchema.parse(userData);

    // Hash the password before saving
    if (validatedUserData.password) {
        validatedUserData.password = await bcrypt.hash(validatedUserData.password, 10);
    }

    // Create a new user
    const newUser = await User.create(validatedUserData);

    // Transform the user object to DTO
    const userExportDto = {
        id: newUser._id.toString(),
        userName: newUser.userName,
        name: newUser.name,
        email: newUser.email,
        contact: newUser.contact,
    };

    return userExportDto;
}

export const updateUserService = async (id: string, updates: any) => {
    if (!id) {
        throw new Error('User ID is required');
    }

    if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
        new: true, 
        runValidators: true,
    }).select('-password');

    if (!updatedUser) {
        throw new Error('User not found');
    }

    const userExportDto = {
        id: updatedUser._id.toString(),
        userName: updatedUser.userName,
        name: updatedUser.name,
        email: updatedUser.email,
        contact: updatedUser.contact,
    };

    return userExportDto;
};


export const deleteUserService = async(id:string) =>{
    if (!id) {
        throw new Error('User ID is required');
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
        throw new Error('User not found');
    }

    return deletedUser;
}