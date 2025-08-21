import { Request, Response, NextFunction } from 'express';

/**
 * Handles requests for routes that do not exist.
 * This middleware should be placed at the end of the middleware stack.
 * before any global error handlers. It sends a 404 Not Found response.
 * @param {Request} req The Express request object. 
 * @param {Response} res The Express response object. 
 * @param {NextFunction} next The next middleware (not used here). 
 * @returns 
 */
export function routeNotFound(req: Request, res: Response, next: NextFunction) {
    const error = new Error('Not found');
    logging.warning(error);

    return res.status(404).json({
        error: {
            message: error.message
        }
    });
}
