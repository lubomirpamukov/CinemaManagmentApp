import { Request, Response } from 'express';
import { getCinemasService, getCinemaByIdService, updateCinemaByIdService } from '../services/adminCinemaService';

export const getCinemas = async (req: Request, res: Response) => {
    try {
        const cinemas = await getCinemasService();
        if (!cinemas) return res.status(404).json({ message: 'Cinema not found' });
        res.status(200).json(cinemas);
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: err.errors });
        }
        res.status(500).json({ error: err.message });
    }
};

export const getCinemaById = async (req: Request, res: Response) => {
    try {
        const cinema = await getCinemaByIdService(req.params.id);
        console.log('cinema', cinema);
        console.log('req.params.id', req.params.id);
        if (!cinema) return res.status(404).json({ message: 'Cinema not found' });
        res.status(200).json(cinema);
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: err.errors });
        }
        res.status(500).json({ error: err.message });
    }
};

export const updateCinema = async (req: Request, res: Response) => {
    try {
        const updatedCinema = await updateCinemaByIdService(req.params.id, req.body);
        if (!updatedCinema) return res.status(404).json({ message: 'Cinema not found' });
        res.status(201).json(updatedCinema);
    } catch (err: any) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: err.errors });
        }
        res.status(500).json({ error: err.message });
    }
};
