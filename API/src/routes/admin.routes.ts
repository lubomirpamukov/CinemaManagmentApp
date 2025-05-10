import express, { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser, createUser } from '../controllers/admin.user.controller';
import { authentication, authorizeRoles } from '../middleware/auth.middleware';
import { getMovies, deleteMovie, updateMovie } from '../controllers/admin.movie.controller';

const adminRouter: Router = express.Router();

adminRouter.get('/users', authentication, authorizeRoles(['admin']), getUsers);
adminRouter.post('/users', authentication, authorizeRoles(['admin']), createUser);
adminRouter.get('/users/:id', authentication, authorizeRoles(['admin']), getUserById);
adminRouter.patch('/users/:id', authentication, authorizeRoles(['admin']), updateUser);
adminRouter.delete('/users/:id', authentication, authorizeRoles(['admin']), deleteUser);

adminRouter.get('/movies', authentication, authorizeRoles(['admin']), getMovies);
adminRouter.patch('/movies/:id', authentication, authorizeRoles(['admin']), updateMovie);
adminRouter.delete('/movies/:id', authentication, authorizeRoles(['admin']), deleteMovie);

export default adminRouter;
