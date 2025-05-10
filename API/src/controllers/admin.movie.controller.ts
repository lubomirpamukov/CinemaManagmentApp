import { Request, Response } from 'express';
import { getMoviesService, deleteMovieService } from '../services/adminMovieService';
import { updateMovieService } from '../services/adminMovieService';

export const getMovies = async (req: Request, res: Response) => {
    try {
        const result = await getMoviesService(req.query);
        if (!result) return res.status(404).json({ message: 'Movie not found' });
        res.status(200).json(result);
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: err.errors });
        }
        res.status(500).json({ error: err.message });
    }
};

export const updateMovie = async (req: Request, res: Response) => {
    try {
        const updatedMovie = await updateMovieService(req.params.id, req.body);
        if (!updatedMovie) return res.status(404).json({ message: 'Movie not found' });
        res.status(201).json(updatedMovie);
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: err.errors });
        }
        res.status(500).json({ error: err.message });
    }
};

export const deleteMovie = async (req: Request, res: Response) => {
    try {
        const deletedMovie = await deleteMovieService(req.params.id);
        if (!deletedMovie) return res.status(404).json({ message: 'Movie not found' });
        res.status(204).send();
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
