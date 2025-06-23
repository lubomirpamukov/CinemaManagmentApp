import express, { Router } from 'express';
import { authentication, authorizeRoles } from '../middleware/auth.middleware';
import { getReservedSessionSeats, getAvailableDatesForMovieInCinema, getSessionSeatLayout } from '../controllers/session.controller'
import { getSessionsWithFilters } from '../controllers/admin.session.controller';

const sessionRouter: Router = express.Router();

sessionRouter.get('/:sessionId/reserved-seats', authentication, authorizeRoles(['admin', 'user']), getReservedSessionSeats);
sessionRouter.get('/available-dates', authentication, authorizeRoles(['user']), getAvailableDatesForMovieInCinema);
sessionRouter.get('/', authentication, authorizeRoles(['user']), getSessionsWithFilters);
sessionRouter.get('/:sessionId/seat-layout', authentication, authorizeRoles(['user']), getSessionSeatLayout)
export default sessionRouter;