import express, { Router } from 'express';
import { authentication, authorizeRoles } from '../middleware/auth.middleware';
import { createReservation } from '../controllers/reservation.controller';

const reservationRouter: Router = express.Router();

reservationRouter.post('/', authentication, authorizeRoles(['admin', 'user']), createReservation);

export default reservationRouter;
