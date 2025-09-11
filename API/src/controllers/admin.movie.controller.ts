import { NextFunction, Request, Response } from 'express';
import { getMoviesService, deleteMovieService, updateMovieService, createMovieService } from '../services/adminMovieService';
import mongoose from 'mongoose';
import { movieSchema } from '../utils';
import { CustomError } from '../middleware/errorHandler';

/**
 * @route GET /api/admin/movies
 * @desc Get all movies
 * @access Private (Admin)
 */
export const getMovies = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paginatedMovies = await getMoviesService(req.query);
        res.status(200).json(paginatedMovies);
    } catch (err: any) {
        next(err)
    }
};

/**
 * @route PATCH /api/admin/movies/:id
 * @desc Updates a Movie's details
 * @access Private (Admin)
 */
export const updateMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError('Invalid movie Id format.', 400)
        }

        const validatedUpdates = movieSchema.partial().parse(req.body);
        const updatedMovie = await updateMovieService(id, validatedUpdates);
        res.status(200).json({ movie: updatedMovie });
    } catch (err: any) {
        next(err)
    }
};

/**
 *@route POST/ api/admin/movies
 *@desc Create new Movie.
 *@access Private (Admin)
 */
export const createMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validMovieData = movieSchema.parse(req.body);
        const newMovie = await createMovieService(validMovieData);
        res.status(201).json(newMovie);
    } catch (err: any) {
        next(err)
    }
};

/**
 * @route DELETE /api/admin/movies/:id
 * @desc Deletes a movie by its ID
 * @access Private (Admin)
 */
export const deleteMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError('Invalid movie Id format.', 400);
        }
        await deleteMovieService(id);
        res.status(204).send();
    } catch (err: any) {
        next(err)
    }
};
