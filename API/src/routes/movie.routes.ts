import express, { Router } from 'express';
import { authentication, authorizeRoles } from '../middleware/auth.middleware';
import { getMovieById, getMovies, getShowcaseMovies } from '../controllers/movie.controller';

const moviesRouter: Router = express.Router();

moviesRouter.get('/', authentication, authorizeRoles(['user']), getMovies);
moviesRouter.get('/showcase', authentication, authorizeRoles(['user']), getShowcaseMovies)
moviesRouter.get('/:movieId', authentication, authorizeRoles(['user']), getMovieById);

export default moviesRouter;
