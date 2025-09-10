import { Request, Response } from 'express';
import { getMoviesService, getMovieByIdService, getShowcaseMoviesService } from '../services';
import { JwtRequest } from '../middleware/auth.middleware';
import {ZodError } from 'zod';
import mongoose from 'mongoose';

/**
 * @route GET /api/movies
 * @description Retrieves a paginated list of movies, with optional search functionality.
 * @param {Request} req  The Express Request objext. Supports `page`, `limit`, and `search` query parameters.
 * @param {Response} res The Express response object.
 *
 * @returns {Promise<Response>}
 * - On success: Returns a 200 status with a paginated movie data object.
 * - On validation error: Retuyrns a 400 status with a detailed error object.
 * - On server error: Returns a 500 status with a detailed error message.
 */
export const getMovies = async (req: Request, res: Response) => {
    try {
        const movies = await getMoviesService(req.query);
        res.status(200).json(movies);
    } catch (error: any) {
        if (error instanceof ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error('Get Movies Error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @route GET /api/movies/:movieId
 * @description Retrives a single movie by its ID.
 * @access Private (user)
 * 
 * @param {Request} req the Express request object, containing the movieId in the URL parameters
 * @param {Response} res The Express response object.
 * 
 * @returns {Promise<Response>}
 * - On success: Returns a 200 status with the movie object.
 * - On validation error (invalid ID format): Returns a 400 status with detailed error object.
 * - If movie is not found: Returns a 404 status with an error message.
 * - On server error: Returns a 500 status with a generic error message.
 */
export const getMovieById = async (req: Request, res: Response) => {
    try {
        const { movieId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return res.status(400).json({ message: 'Invalid movie Id format.' });
        }
        const movie = await getMovieByIdService(movieId);
        res.status(200).json(movie);
    } catch (err: any) {
        if (err instanceof ZodError) {
            return res.status(400).json({ err: err.errors });
        }

        if (err.message === 'Movie not found') {
            return res.status(404).json({ message: 'Movie not found' });
        }

        res.status(500).json({ error: err.message });
    }
};

/**
 * @route GET /api/movies/showcase
 * @description Retrives a curated showcase of movies. This may include categories like
 *              `Most popular`, `Newest movies` etc.., and personalized recommendations if the user is authenticated.
 * @access Public (provides generic content), Private (provide personalized content if authenticated). 
 * @param {JwtRequest} req The Express request object, It may contain an authenticated user payload. 
 * @param {Response} res The Express response Object.
 * @returns {Promise<Response>}
 * - On success: Returns a 200 status with the showcase data object.
 * - On server error: Returnts a 500 status with detailed error message. 
 */
export const getShowcaseMovies = async (req: JwtRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const showcaseData = await getShowcaseMoviesService(userId);
        res.status(200).json(showcaseData);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to get movie showcase', error: error.message });
    }
};
