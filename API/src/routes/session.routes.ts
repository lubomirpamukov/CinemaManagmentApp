import express, { Router } from 'express';
import { authentication, authorizeRoles } from '../middleware/auth.middleware';
import { getReservedSessionSeats } from '../controllers/session.controller'

const sessionRouter: Router = express.Router();

sessionRouter.get('/:sessionId/reserved-seats', authentication, authorizeRoles(['admin', 'user']), getReservedSessionSeats);

export default sessionRouter;