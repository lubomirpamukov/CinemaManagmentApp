import express, { Router } from 'express';
import { authentication, authorizeRoles } from '../middleware/auth.middleware';
import { getCinemaCityByMovieId, getCinemasByCityAndMovie } from '../controllers/cinema.controller';

const cinemaRouter: Router = express.Router();
// test
cinemaRouter.get('/movies/:movieId', authentication, authorizeRoles(['user']), getCinemaCityByMovieId);
cinemaRouter.get('/by-city-and-movie', authentication, authorizeRoles(['user']),getCinemasByCityAndMovie);
export default cinemaRouter;
