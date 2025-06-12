import { Request, Response } from 'express';
import { getCinemaCityByMovieIdService } from '../services';

export const getCinemaCityByMovieId = async (req:Request, res: Response) => {
    try {
        const movieId = req.params.movieId;
        const cities = await getCinemaCityByMovieIdService(movieId);
        if(!cities) return res.status(404).json({ message: 'Cities not found.'});
        res.status(200).json(cities); 
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message});
    }
}