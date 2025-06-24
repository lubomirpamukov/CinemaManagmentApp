import express, { Router } from 'express';
import { authentication, authorizeRoles } from '../middleware/auth.middleware';
import { createReservation, deleteReservation, getUserReservation } from '../controllers/reservation.controller';

const reservationRouter: Router = express.Router();

reservationRouter.post('/', authentication, authorizeRoles(['admin', 'user']), createReservation);
reservationRouter.get('/user/:userId', authentication, authorizeRoles(['user']), getUserReservation)
reservationRouter.delete('/:reservationId', authentication, authorizeRoles(['user']), deleteReservation)

export default reservationRouter;
