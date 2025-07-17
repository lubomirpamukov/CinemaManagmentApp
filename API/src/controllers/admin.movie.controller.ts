import { Request, Response } from 'express';
import { getMoviesService, deleteMovieService, updateMovieService, createMovieService } from '../services/adminMovieService';
import mongoose from 'mongoose';
import { movieSchema } from '../utils';

/**
 * @route GET /api/admin/movies
 * @desc Get all movies
 * @access Private (Admin)
 */
export const getMovies = async (req: Request, res: Response) => {
    try {
        const paginatedMovies = await getMoviesService(req.query);
        res.status(200).json(paginatedMovies);
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: err.errors });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 * @route PATCH /api/admin/movies/:id
 * @desc Updates a Movie's details
 * @access Private (Admin)
 */
export const updateMovie = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid movie ID format.' });
        }

        const validatedUpdates = movieSchema.partial().parse(req.body);
        const updatedMovie = await updateMovieService(id, validatedUpdates);
        res.status(201).json({ movie: updatedMovie });
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: `Invalid update data`, details: err.errors });
        }

        if (err.message === 'Movie not found') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 *@route POST/ api/admin/movies
 *@desc Create new Movie.
 *@access Private (Admin)
 */
export const createMovie = async (req: Request, res: Response) => {
    try {
        const validMovieData = movieSchema.parse(req.body);
        const newMovie = await createMovieService(validMovieData);
        res.status(201).json(newMovie);
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: err.errors });
        }

        //Handle mongoDb unique constraint errors
        if (err.code === 11000) {
            return res.status(409).json({ error: 'A movie with the provided title already exists.' });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 * @route DELETE /api/admin/movies/:id
 * @desc Deletes a movie by its ID
 * @access Private (Admin)
 */
export const deleteMovie = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid movie ID format.' });
        }
        await deleteMovieService(id);
        res.status(204).send();
    } catch (err: any) {
        if (err.message.includes('Movie not found')) {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};
