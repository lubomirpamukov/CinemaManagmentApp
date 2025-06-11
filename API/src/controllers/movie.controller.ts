import { Request, Response } from 'express';
import { getMoviesService } from '../services';

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
