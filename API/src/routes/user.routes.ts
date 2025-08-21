import express, { Router } from 'express';
import { authentication, authorizeRoles } from '../middleware/auth.middleware';
import { createUser, updateUser } from '../controllers/admin.user.controller';
const userRouter: Router = express.Router();

userRouter.patch('/:id', authentication, authorizeRoles(['user']), updateUser)

export default userRouter;
