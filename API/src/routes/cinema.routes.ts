import express, { Router } from 'express';
import { authentication, authorizeRoles } from '../middleware/auth.middleware';
import { getCinemaCityByMovieId } from '../controllers/cinema.controller';

const cinemaRouter: Router = express.Router();

cinemaRouter.get('/movies/:movieId', authentication, authorizeRoles(['user']), getCinemaCityByMovieId);

export default cinemaRouter;