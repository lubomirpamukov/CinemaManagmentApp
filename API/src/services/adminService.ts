import bcrypt from 'bcrypt';
import { getPaginationQuerySchema } from '../utils/PaginationQuerySchema';
import { userPaginatedSchema, userExportDTOSchema } from '../utils/UserValidation';
import { paginate } from '../utils/PaginationUtils';
import User, { IUser } from '../models/user.model';

export const getUsersService = async (query: any) => {
    const { page, limit, search } = getPaginationQuerySchema.parse(query);
    console.log(page,limit,search)

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
        users: result.data,
        totalUsers: result.totalItems,
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