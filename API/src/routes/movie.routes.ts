import express, { Router } from 'express';
import { authentication, authorizeRoles } from '../middleware/auth.middleware';
import { getMovies } from '../controllers/movie.controller';

const moviesRouter: Router = express.Router();

moviesRouter.get('/', authentication, authorizeRoles(['user']), getMovies);

export default moviesRouter;
