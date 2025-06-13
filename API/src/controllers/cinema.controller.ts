import { Request, Response } from 'express';
import { getCinemaCityByMovieIdService, getCinemasByCityAndMovieService } from '../services';

export const getCinemaCityByMovieId = async (req: Request, res: Response) => {
    try {
        const movieId = req.params.movieId;
        const cities = await getCinemaCityByMovieIdService(movieId);
        if (!cities) return res.status(404).json({ message: 'Cities not found.' });
        res.status(200).json(cities);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message });
    }
};

export const getCinemasByCityAndMovie = async (req: Request, res: Response) => {
    try {
        const movieId = req.query.movieId as string | undefined;
        const city = req.query.city as string | undefined;
        const cinemas = await getCinemasByCityAndMovieService(city, movieId);
        if (!cinemas) return res.status(404).json({ message: 'Cinemas not found.' });
        res.status(200).json(cinemas);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message });
    }
};
