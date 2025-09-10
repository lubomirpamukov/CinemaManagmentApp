import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { getUsersService, getUserByIdService, createUserService, updateUserService, deleteUserService } from '../../../src/services/adminUserService';
import User from '../../../src/models/user.model';
import { paginate, getPaginationQuerySchema, userPaginatedSchema, userDTOSchema } from '../../../src/utils';
import { beforeEach, describe } from 'node:test';
import { mapUserToTUserDTO } from '../../../src/utils/mapping-functions';

// Mocking dependencies
jest.mock('../../../src/models/user.model');
jest.mock('../../../src/utils/PaginationUtils');
jest.mock('bcrypt');
jest.mock('../../../src/utils/PaginationQuerySchema', () => ({
    getPaginationQuerySchema: {
        parse: jest.fn((data) => data)
    }
}));

jest.mock('../../../src/utils/UserValidation', () => ({
    userPaginatedSchema: {
        parse: jest.fn((data) => data)
    },
    userDTOSchema: {
        parse: jest.fn((data) => data)
    }
}));

// Creating helper function that creates users
const createMockUsers = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        _id: new mongoose.Types.ObjectId(),
        name: `Test User ${i + 1}`,
        email: `test${i + 1}@example.com`,
        role: `user`,
        contact: `123-456-789-${i * 100}`,
        address: `${i * 100} Test street.`
    }));
};

/**
 * Unit tests for getUsersService
 *
 * This test suite verifies that the service correctly interacts with the User model and pagination utility.
 * It ensures that:
 * - The `paginate` function is called with the correct parameters, including search queries and selected fields.
 * - The service builds search query properly when a search term is provided.
 * - The result is validated using the userPaginatedSchema.
 * - Any errors from the pagination utility are properly propagated.
 *
 * Mock are used for the User model, pagination utility and validation schemas to isolate service logic from external dependencies.
 */
describe('getUsersService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should fetch paginated users without search query', async () => {
        // Arrange
        const mockUsers = createMockUsers(2);
        const query = { page: 1, limit: 10 };

        const paginatedResult = {
            data: mockUsers,
            totalPages: 1,
            currentPage: 1
        };
        (paginate as jest.Mock).mockResolvedValue(paginatedResult);

        // Act
        const actualResult = await getUsersService(query);

        // Assert
        // 1. Was the paginated utility called with the correct, empty search query
        expect(paginate).toHaveBeenCalledWith(User, {
            page: 1,
            limit: 10,
            searchQuery: {},
            selectFields: '-password'
        });

        // 2. Does the final returned data match our expectations ?
        expect(actualResult.data.length).toBe(2);
        expect(actualResult.data[0].name).toBe('Test User 1');
        expect(userPaginatedSchema.parse).toHaveBeenCalledTimes(1);
    });

    it('should fetch paginated users with a search query', async () => {
        // Arrange
        const query = { page: 1, limit: 10, search: 'test' };
        (paginate as jest.Mock).mockResolvedValue({ data: [], totalPages: 0, currentPage: 1 });

        // Act
        const actualResult = await getUsersService(query);

        // Assert
        const expectedSearchQuery = {
            $or: [
                { userName: { $regex: 'test', $options: 'i' } },
                { name: { $regex: 'test', $options: 'i' } },
                { email: { $regex: 'test', $options: 'i' } }
            ]
        };
        expect(paginate).toHaveBeenCalledWith(User, expect.objectContaining({ searchQuery: expectedSearchQuery }));
    });

    it('should propagate database error', async () => {
        // Arrange
        const dbError = new Error('Database error');
        const query = { page: 1, limit: 10 };
        (paginate as jest.Mock).mockRejectedValue(dbError);

        // Act & Assert
        await expect(getUsersService(query)).rejects.toThrow(dbError);
        expect(paginate).toHaveBeenCalled();
    });
});

/**
 * Unit tests for getUserByIdService
 * 
 * This test suite verifies that the service correctly fetches a single user by their Id.
 * It ensures that:
 * - The `User.findById` method is called with the correct ID and chainable methods (`lean`, `select`)
 * - A validated user DTO is returned on success.
 * - A specific `User not found` error is thrown if the user does not exist.
 * - Any database errors from the query are properly propagated.
 * 
 * Mocks are used for the User model and the User DTO schema to isolate the service logic.
 */
describe('getUserByIdService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should fetch user by userId', async () => {
        // Arrange
        const mockUser = createMockUsers(1)[0];
        const userId = mockUser._id;
        const mockQuery = {
            lean: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue(mockUser)
        };
        (User.findById as jest.Mock).mockReturnValue(mockQuery);

        // Act
        const actualResult = await getUserByIdService(userId);

        // Assert
        expect(User.findById).toHaveBeenCalledWith(userId);
        expect(mockQuery.select).toHaveBeenCalledWith('-password');
        expect(actualResult.id.toString()).toBe(mockUser._id.toString());
        expect(userDTOSchema.parse).toHaveBeenCalledTimes(1);
    });

    it('should throw User not found if user is not found', async () => {
        // Arrange
        const nonExistentId = new mongoose.Types.ObjectId();
        const mockQuery = {
            lean: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue(null)
        };
        (User.findById as jest.Mock).mockReturnValue(mockQuery);

        // Act & Assert
        await expect(getUserByIdService(nonExistentId)).rejects.toThrow('User not found');
        expect(User.findById).toHaveBeenCalledWith(nonExistentId);
        expect(mockQuery.select).toHaveBeenCalledWith('-password');
    });

    it('should propagate database error', async () => {
        // Arrange
        const randomId = new mongoose.Types.ObjectId();
        const dbError = new Error('Database error');
        const mockQuery = {
            lean: jest.fn().mockReturnThis(),
            select: jest.fn().mockRejectedValue(dbError)
        };
        (User.findById as jest.Mock).mockReturnValue(mockQuery);

        // Act & Assert
        await expect(getUserByIdService(randomId)).rejects.toThrow(dbError);
        expect(mockQuery.select).toHaveBeenCalledWith('-password');
    });
});

/**
 * Unit test for createUserService
 * 
 * This test suite verifies the logic for creating a new user.
 * It ensures that:
 * - The user's plain-text password is correctly hashed using bcrypt before database insertion.
 * - The `User.create` method is called with the correct user data, including the hashed password.
 * - A valid user DTO is returned upon successful creation.
 * - Errors from both the bcrypt hashing and the database operation are properly propagated.
 * 
 * Mocks are used for the User model, bcrypt, and the user DTO schema.
 */
describe('createUserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should hash the password and create a new user', async () => {
        // Arrange
        const userData = { name: 'New user', email: 'new@example.com', password: 'plainPassword123' };
        const hashedPassword = 'hashedPasswordValue';
        const createUserDoc = { ...createMockUsers(1)[0], ...userData };

        (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
        (User.create as jest.Mock).mockResolvedValue(createUserDoc);

        // Act
        const actualResult = await createUserService(userData);

        // Assert
        expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword123', 10);
        expect(User.create).toHaveBeenCalledWith(
            expect.objectContaining({
                password: hashedPassword
            })
        );
        expect(actualResult.name).toBe(userData.name);
        expect(userDTOSchema.parse).toHaveBeenCalled();
    });

    it('should propagate db error if occures', async () => {
        // Arrange
        const userData = { name: 'New user', email: 'new@example.com', password: 'plainPassword123' };
        const hashedPassword = 'hashedPassword';
        const createUserDoc = { ...createMockUsers(1)[0], ...userData };
        const dbError = new Error('Db error');

        (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
        (User.create as jest.Mock).mockRejectedValue(dbError);

        // Act & Assert
        await expect(createUserService(userData)).rejects.toThrow(dbError);
        expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword123', 10);
    });

    it('should propagate bcrypt error if occures', async () => {
        // Arrange
        const userData = { name: 'New user', email: 'new@example.com', password: 'plainPassword123' };
        const hashedPassword = 'hashedPasswordValue';
        const createUserDoc = { ...createMockUsers(1)[0], ...userData };
        const hashError = new Error('HashError');

        (bcrypt.hash as jest.Mock).mockRejectedValue(hashError);
        (User.create as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        jest.clearAllMocks();
        await expect(createUserService(userData)).rejects.toThrow(hashError);
        expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword123', 10);
        expect(User.create).not.toHaveBeenCalled();
    });
});

/**
 * Unit tests for updateUserService
 * 
 * This test suite verifies the logic for updating an existing user.
 * It ensures that:
 * - The service correctly updates a user's data.
 * - If a new password is provided, it is hashed before the database update.
 * - The object `bcrypt.hash` function is NOT called if no new password is provided.
 * - A specific `User not found` error is thrown for non-existing Ids.
 * - Errors both from bcrypt and database are properly propagated.
 * 
 * Mock are used for User model, bcrypt and the user DTO schema.
 */
describe('updateUserService', () => {
    it('should update a user and return the updated DTO', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockUser = createMockUsers(1)[0];
        const updates = { name: 'Updated Name' };
        const updatedUserDoc = { ...mockUser, ...updates };

        const mockQuery = { select: jest.fn().mockResolvedValue(updatedUserDoc) };
        (User.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

        // Act
        const actualResult = await updateUserService(mockUser._id, updates);

        // Assert
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, updates, { new: true, runValidators: true });
        expect(actualResult.name).toBe(updates.name);
        expect(userDTOSchema.parse).toHaveBeenCalledTimes(1);
    });

    it('should throw error if user not found', async () => {
        // Arrange
        jest.clearAllMocks();
        const nonExistentId = new mongoose.Types.ObjectId();
        const updates = { name: 'Tester' };
        const mockQuery = { select: jest.fn().mockResolvedValue(null) };
        (User.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

        // Act & Assert
        await expect(updateUserService(nonExistentId, updates)).rejects.toThrow('User not found');
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(nonExistentId, updates, { new: true, runValidators: true });
    });

    it('should hash new password if proviced', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockUser = createMockUsers(1)[0];
        const updates = { name: 'Tester', password: 'newSecurePassword' };
        const updatedUserDoc = { ...mockUser, ...updates };
        const hashedPassword = 'hashedPassword';

        (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
        (User.findByIdAndUpdate as jest.Mock).mockReturnValue({
            select: jest.fn().mockResolvedValue(updatedUserDoc)
        });

        // Act
        const actualResult = await updateUserService(mockUser._id, updates);

        // Assert
        expect(bcrypt.hash).toHaveBeenCalledWith('newSecurePassword', 10);
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, updates, { new: true, runValidators: true });
        expect(actualResult.name).toBe('Tester');
        expect(userDTOSchema.parse).toHaveBeenCalledTimes(1);
    });

    it('should propagate error if db error occures', async () => {
        // Arrange
        jest.clearAllMocks();
        const randomId = new mongoose.Types.ObjectId();
        const updates = { name: 'New User' };
        const dbError = new Error('DB Error');
        (User.findByIdAndUpdate as jest.Mock).mockReturnValue({
            select: jest.fn().mockRejectedValue(dbError)
        });

        // Act & Assert
        await expect(updateUserService(randomId, updates)).rejects.toThrow(dbError);
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(randomId, updates, { new: true, runValidators: true });
    });

    it('should propagate error if bcrypt error occures', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockUser = createMockUsers(1)[0];
        const updates = { name: 'Tester', password: 'newSecurePassword' };
        const updatedUserDoc = { ...mockUser, ...updates };
        const bcryptError = new Error('bCrypt error');

        (bcrypt.hash as jest.Mock).mockRejectedValue(bcryptError);
        (User.findByIdAndUpdate as jest.Mock).mockReturnValue({
            select: jest.fn().mockResolvedValue(updatedUserDoc)
        });

        // Act & Assert
        await expect(updateUserService(mockUser._id, updates)).rejects.toThrow(bcryptError);
        expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });
});

/**
 * Unit tests for deleteUserService
 * 
 * This test suite verifies the logic for deleting a user.
 * It ensured that:
 * - The `User.findByIdAndDelete` method is called with the correct ID.
 * - A validated DTO of the user is returned on success.
 * - A specific `User not found` is thrown if the user does not exist.
 * - Any database or DTO validation errors are properly proipagated.
 * 
 * Mocks are used for the User model and the user DTO schema.
 */
describe('deleteUserService', () => {
    it('should delete user document from the database', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockUser = createMockUsers(1)[0];
        const mockQuery = { select: jest.fn().mockReturnValue(mockUser) };
        (User.findByIdAndDelete as jest.Mock).mockReturnValue(mockQuery);

        // Act
        const actualResult = await deleteUserService(mockUser._id);

        // Assert
        expect(actualResult.name).toBe('Test User 1');
        expect(User.findByIdAndDelete).toHaveBeenCalledWith(mockUser._id);
        expect(userDTOSchema.parse).toHaveBeenCalledTimes(1);
        expect(mockQuery.select).toHaveBeenCalledWith('-password');
    });

    it('should throw error if user not found', async () => {
        // Arrange
        jest.clearAllMocks();
        const nonExistentId = new mongoose.Types.ObjectId();
        const mockQuery = { select: jest.fn().mockResolvedValue(null) };
        (User.findByIdAndDelete as jest.Mock).mockReturnValue(mockQuery);

        // Act and Assert
        await expect(deleteUserService(nonExistentId)).rejects.toThrow('User not found');
        expect(User.findByIdAndDelete).toHaveBeenCalledWith(nonExistentId);
        expect(mockQuery.select).toHaveBeenCalledWith('-password');
        expect(userDTOSchema.parse).not.toHaveBeenCalled();
    });

    it('should propagate db error if occures', async () => {
        // Arrange
        jest.clearAllMocks();
        const randomId = new mongoose.Types.ObjectId();
        const dbError = new Error('Database Error');
        const mockQuery = { select: jest.fn().mockRejectedValue(dbError) };

        (User.findByIdAndDelete as jest.Mock).mockReturnValue(mockQuery);

        // Act & Assert
        await expect(deleteUserService(randomId)).rejects.toThrow(dbError);
        expect(User.findByIdAndDelete).toHaveBeenCalledWith(randomId);
        expect(mockQuery.select).toHaveBeenCalledWith('-password');
        expect(userDTOSchema.parse).not.toHaveBeenCalled();
    });

    it('should throw error if document object does not pass validation criteria', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockUser = createMockUsers(1)[0];
        const mockQuery = { select: jest.fn().mockReturnValue(mockUser) };
        const validationError = new Error('ZodError');
        (User.findByIdAndDelete as jest.Mock).mockReturnValue(mockQuery);
        (userDTOSchema.parse as jest.Mock).mockImplementation(() => {
            throw validationError;
        });

        // Act & Assert
        await expect(deleteUserService(mockUser._id)).rejects.toThrow(validationError);
        expect(User.findByIdAndDelete).toHaveBeenCalledWith(mockUser._id);
        expect(mockQuery.select).toHaveBeenCalledWith('-password');
        expect(userDTOSchema.parse).toHaveBeenCalled();
    });
});
