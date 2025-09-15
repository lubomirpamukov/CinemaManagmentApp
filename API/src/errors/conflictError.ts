import { CustomError } from './customError';

export class ConflictError extends CustomError {
    constructor(message: string) {
        super(message, 409);
        this.name = 'ConflictError';
    }
}
