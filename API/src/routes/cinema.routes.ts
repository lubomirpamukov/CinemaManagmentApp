import express, { Router } from 'express';
import { authentication, authorizeRoles } from '../middleware/auth.middleware';
import { getCinemaCityByMovieId, getCinemasByCityAndMovie } from '../controllers/cinema.controller';

const cinemaRouter: Router = express.Router();

/**
 * @route   GET /api/cinemas/movies/:movieId
 * @desc    Returns string with the city of the cinema that projects the specific movie
 * @access  (Public)
 */
cinemaRouter.get('/movies/:movieId', authentication, authorizeRoles(['user']), getCinemaCityByMovieId);

/**
 * @route   GET /api/cinemas/by-city-and-movie?city={cityName}&movieId={movieId}
 * @desc    Returns collection of cinema dto objects
 * @access  (Public)
 */
cinemaRouter.get('/by-city-and-movie', authentication, authorizeRoles(['user']),getCinemasByCityAndMovie);
export default cinemaRouter;
