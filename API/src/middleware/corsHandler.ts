import { Request, Response, NextFunction } from 'express';

/**
 * Express middleware to handle Corss-Origin Resource Sharing (CORS) requests.
 * It dynamically sets the `Access-Control-Allow-Origin` header to the origin of the incoming request.
 * This allows a frontend running on a different domain to make API calls to this backend
 * It also handles preflight `OPTIONS` requests.
 * @param {Request} req The Express request object. 
 * @param {Response} res The Express response object. 
 * @param {NextFunction} next The next middleware function in the stack. 
 * @returns 
 */
export function corsHandler(req: Request, res: Response, next: NextFunction) {
    res.header('Access-Control-Allow-Origin', req.header('origin'));
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
}
