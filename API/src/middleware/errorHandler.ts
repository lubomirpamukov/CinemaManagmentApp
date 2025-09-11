import { NextFunction, Request, Response } from 'express';
import { Error } from 'mongoose';
import { ZodError } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

export class CustomError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
    }
    formatError() {
        console.log(process.env.DEBUG);
        return {
            error: this.message,
            stack: process.env.DEBUG === 'true' ? this.stack : 'No stack for you bad boy'
        };
    }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    // Handle custom errors
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json(err.formatError());
    }

    //Handle zod errors
    if (err instanceof ZodError) {
        // Format the Zod issues into a more readable format
        const errors = err.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message
        }));

        return res.status(400).json({
            error: 'Validation Error',
            details: errors
        });
    }

    //Handle generic errors
    const isDebugMode = process.env.DEBUG === 'true';
    return res.status(500).json({
        error: 'An unexpected error occured.',
        ...(isDebugMode && { stack: err.stack })
    });
}
