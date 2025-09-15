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
