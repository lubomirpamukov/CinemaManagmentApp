import express, { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser, createUser } from '../controllers/admin.user.controller';
import { authentication, authorizeRoles } from '../middleware/auth.middleware';
import { getMovies, deleteMovie, updateMovie, createMovie } from '../controllers/admin.movie.controller';
import { getCinemas, getCinemaById, updateCinema } from '../controllers/admin.cinema.controller';
import { getCinemaHalls, createHall, deleteHall } from '../controllers/admin.halls.controller';
const adminRouter: Router = express.Router();

adminRouter.get('/users', authentication, authorizeRoles(['admin']), getUsers);
adminRouter.post('/users', authentication, authorizeRoles(['admin']), createUser);
adminRouter.get('/users/:id', authentication, authorizeRoles(['admin']), getUserById);
adminRouter.patch('/users/:id', authentication, authorizeRoles(['admin']), updateUser);
adminRouter.delete('/users/:id', authentication, authorizeRoles(['admin']), deleteUser);

adminRouter.get('/movies', authentication, authorizeRoles(['admin']), getMovies);
adminRouter.post('/movies', authentication, authorizeRoles(['admin']), createMovie);
adminRouter.patch('/movies/:id', authentication, authorizeRoles(['admin']), updateMovie);
adminRouter.delete('/movies/:id', authentication, authorizeRoles(['admin']), deleteMovie);

adminRouter.get('/cinemas', authentication, authorizeRoles(['admin']), getCinemas);
adminRouter.get('/cinemas/:id', authentication, authorizeRoles(['admin']), getCinemaById)
adminRouter.patch('/cinemas/:id', authentication, authorizeRoles(['admin']), updateCinema)
adminRouter.get('/cinemas/:id/halls', authentication, authorizeRoles(['admin']), getCinemaHalls);
adminRouter.post('/cinemas/:id/halls', authentication, authorizeRoles(['admin']), createHall);
adminRouter.delete('/cinemas/:id/halls', authentication, authorizeRoles(['admin']), deleteHall);

export default adminRouter;
