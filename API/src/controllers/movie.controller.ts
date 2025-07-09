import { Request, Response } from 'express';
import { getMoviesService, getMovieByIdService, getShowcaseMoviesService } from '../services';
import { JwtRequest } from '../middleware/auth.middleware';

export const getMovies = async (req: Request, res: Response) => {
    try {
        const movies = await getMoviesService(req.query);
        if (!movies) return res.status(404).json({ message: 'Movies not found.' });
        res.status(200).json(movies);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message });
    }
};

export const getMovieById = async (req: Request, res: Response) => {
    try {
        const {movieId} = req.params
        const movie = await getMovieByIdService(movieId);
        if (!movie) return res.status(404).json({message: 'Movie not found.'});
        res.status(200).json(movie);
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({err: err.errors});
        }
        if (err.message === 'Movie not found') {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(500).json({error: err.message})
    }
} 

export const getShowcaseMovies = async (req: JwtRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const showcaseData = await getShowcaseMoviesService(userId);
        res.status(200).json(showcaseData);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to get movie showcase', error: error.message })
    }
};
