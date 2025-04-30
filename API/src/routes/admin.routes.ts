import express, { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser} from '../controllers/admin.controller'
import { authentication, authorizeRoles } from '../middleware/auth.middleware';

const adminRouter: Router = express.Router();

adminRouter.get('/users', authentication, authorizeRoles(['admin']), getUsers);
adminRouter.get('/users/:id', authentication, authorizeRoles(['admin']), getUserById);
adminRouter.patch('/users/:id', authentication, authorizeRoles(['admin']), updateUser);
adminRouter.delete('/users/:id', authentication, authorizeRoles(['admin']), deleteUser)

export default adminRouter;