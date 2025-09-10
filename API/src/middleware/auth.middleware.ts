import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { IUser, UserRole } from '../models/user.model';
import { JWT_SECRET } from '../config/config';
import mongoose from 'mongoose';

export interface JwtRequest extends Request {
    user?: {
        id?: string;
        email: string;
        role: UserRole;
    };
}

/**
 * Express middleware to authenticate a user by verifying a JWT from cookies.
 * If the token is valid, it attaches the decoded user payload to `req.user`.
 * If the token is missing or invalid, it sends a 401 Unauthorized response.
 * @param {JwtRequest} req The Express request object, extended with a `user` property. 
 * @param {Response} res The Express response object. 
 * @param {NextFunction} next The next middleware function in the stack.
 * @returns 
 */
export const authentication = (req: JwtRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json('No authorization header found');
    }

    try {
        jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            req.user = {
                email: decoded.email,
                role: decoded.role,
                id: decoded._id
            };

            next();
        });
    } catch (error) {
        return res.status(401).json('Invalid token');
    }
};

/**
 * Middleware factory that creates a role-based authorization check.
 * It should be userd AFTER the authentication middleware.
 * @param {UserRole[]} allowedRoles An array of roles that are permitted to access the route.
 * @returns {Function} An Express middleware function that checks the user's role.
 * If the role is not allowed, it sends 403 Forbidden response.
 */
export function authorizeRoles(allowedRoles: UserRole[]) {
    return (req: JwtRequest, res: Response, next: NextFunction) => {
        const user = req.user;

        if (user && !allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: `Forbidden, you are a ${user.role} and this service is only available for ${allowedRoles}` });
        }

        next();
    };
}

/**
 * Generates a JSON Web Token (JWT) for a user.
 * @param {mongoose.Types.ObjectId} _id The user's ID. 
 * @param {string} role The user's role. 
 * @param {string} email The user's email.
 * @returns 
 */
export const generateToken = (_id: mongoose.Types.ObjectId, role: string, email: string) => {
    return jwt.sign({ _id, role, email }, JWT_SECRET, { expiresIn: '99h' });
};
