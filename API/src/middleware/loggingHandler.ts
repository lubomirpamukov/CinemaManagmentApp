import { Request, Response, NextFunction } from 'express';

/**
 * Custom console logger that logs the lifecycle of each incoming request.
 * It records the method, URL, status code, and processing duration.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware in the stack.
 */
export function loggingHandler(req: Request, res: Response, next: NextFunction) {
    const { method, url } = req;
    const ip = req.socket.remoteAddress;
    const start = process.hrtime(); // Record the start time

    res.on('finish', () => {
        const { statusCode } = res;
        const diff = process.hrtime(start); // Calculate the difference
        const durationInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2); // Convert to milliseconds

        // Log a single, comprehensive line
        logging.log(`[${method}] ${url} | STATUS: [${statusCode}] | DURATION: [${durationInMs}ms] | IP: [${ip}]`);
    });

    next();
}
