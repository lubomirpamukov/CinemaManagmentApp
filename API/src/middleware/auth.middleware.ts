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

//Checks for authorization headers
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

//checks if user has the needed role to acess from the given roles
export function authorizeRoles(allowedRoles: UserRole[]) {
    return (req: JwtRequest, res: Response, next: NextFunction) => {
        const user = req.user;

        if (user && !allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: `Forbidden, you are a ${user.role} and this service is only available for ${allowedRoles}` });
        }

        next();
    };
}

export const generateToken = (_id: mongoose.Types.ObjectId, role: string, email: string) => {
    return jwt.sign({ _id, role, email }, JWT_SECRET, { expiresIn: '99h' });
};
