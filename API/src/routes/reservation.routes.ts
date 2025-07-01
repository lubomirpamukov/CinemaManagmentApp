import express, { Router } from 'express';
import { authentication, authorizeRoles } from '../middleware/auth.middleware';
import { createReservation, deleteReservation, getUserReservations } from '../controllers/reservation.controller';

const reservationRouter: Router = express.Router();

reservationRouter.post('/', authentication, authorizeRoles(['admin', 'user']), createReservation);
reservationRouter.get('/', authentication, authorizeRoles(['user']), getUserReservations);
reservationRouter.delete('/:reservationId', authentication, authorizeRoles(['user']), deleteReservation);

export default reservationRouter;
