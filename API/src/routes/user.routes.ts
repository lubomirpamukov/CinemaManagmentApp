import express, { Router } from 'express';
import { protectedRoute, deleteUser, getUserById, updateUser } from '../controllers/user.controller';
import { authentication, authorizeRoles } from '../middleware/auth.middleware';
const userRouter: Router = express.Router();

/**
 * @route   GET /users/protected
 * @desc    A protected route
 * @access  Admin/Distributor/Retailer
 */
userRouter.get('/protected', authentication, authorizeRoles(['admin']), protectedRoute);

/**
 * @route   GET /users/:id
 * @desc    Get a user by email
 * @access  Admin
 */
userRouter.get('/:id', authentication, authorizeRoles(['admin']), getUserById);

/**
 * @route   DELETE /users/:id
 * @desc    Delete a user
 * @access  Admin
 */
userRouter.delete('/:id', authentication, authorizeRoles(['admin']), deleteUser);

/**
 * @route   PUT /users/:id
 * @desc    Update user details
 * @access  Admin
 */
userRouter.put('/:id', authentication, authorizeRoles(['admin']), updateUser);

export default userRouter;
