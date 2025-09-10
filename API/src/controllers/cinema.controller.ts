import { Request, Response } from 'express';
import { getCinemaCityByMovieIdService, getCinemasByCityAndMovieService } from '../services';
import mongoose from 'mongoose';
import { cinemasQuerySchema } from '../utils';

/**
 * @route GET /api/cinemas/cities/:movieId
 * @description Retrieves a list of unique cities where a specific movie is being shown.
 * @access Public
 *
 * @param {Request} req The Express request object, containing the movieId in the URL parameters
 * @param {Response} res The Express response object.
 *
 * @returns {Promise<Response>}
 * - On success: Returns a 200 status with an array of city names, The array will be empty if no cities are found.
 * - On validation error (e.g., invalid movieId format): Returns a 400 status with detailed error message.
 * - On server error: Returns a 500 status with generic error message.
 */
export const getCinemaCityByMovieId = async (req: Request, res: Response) => {
    try {
        const movieId = req.params.movieId;
        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return res.status(400).json({ message: 'Invalid movie ID format.' });
        }

        const cities = await getCinemaCityByMovieIdService(movieId);

        res.status(200).json(cities);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Get Cinema Cities Error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @route GET /api/cinemas
 * @description Retrieves a list of cinemas based on a city and movie ID.
 * @access Public
 *
 * @param {Request} req The Express request object, Expects 'city' and 'movieId' as query parameters
 * @param {Response} res The Express response object.
 *
 * @returns {Promise<Response>}
 * - On success: Returns a 200 status with an array of cinema objects. The array will be empty if no cinemas are found.
 * - On validation error: Returns a 400 status with a detailed error object.
 * - On server error: Returns a 500 status with a generic error message.
 */
export const getCinemasByCityAndMovie = async (req: Request, res: Response) => {
    try {
        const { city, movieId } = cinemasQuerySchema.parse(req.query);
        const cinemas = await getCinemasByCityAndMovieService(city, movieId);
        res.status(200).json(cinemas);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error('GetCinemas by City/Movie Error:', error)
        res.status(500).json({ error: error.message });
    }
};
