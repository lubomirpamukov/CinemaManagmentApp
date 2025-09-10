import express, { Router } from 'express';
import { authentication, authorizeRoles } from '../middleware/auth.middleware';
import { getHallById } from '../controllers/admin.halls.controller';

const hallsRouter: Router = express.Router();

hallsRouter.get('/:id', authentication, authorizeRoles(['admin']), getHallById);

export default hallsRouter;
