import Cinema from '../models/cinema.model';
import Session from '../models/session.model';
import mongoose from 'mongoose';
import { CinemaZod } from '../utils';

export const getCinemaCityByMovieIdService = async (movieId: string): Promise<string[]> => {
    if (!movieId) {
        throw new Error('MovieId is required.');
    }

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
        throw new Error('Invalid MovieId');
    }

    try {
        // 1. Find all sessions with the given movieId
        const sessions = await Session.find({ movieId: new mongoose.Types.ObjectId(movieId) }).select('cinemaId');

        // 2. Extract unique cinemaIds
        const cinemaIds = [...new Set(sessions.map((session) => session.cinemaId.toString()))];

        // 3. Find all cinemas with those IDs
        const cinemas = await Cinema.find({ _id: { $in: cinemaIds } }).select('city -_id');

        // 4. Extract and return the cities
        const cities = cinemas.map((cinema) => cinema.city);
        console.log(cities);
        return cities;
    } catch (error) {
        console.error('Error fetching cinema cities:', error);
        throw new Error('Failed to fetch cinema cities');
    }
};


export const getCinemasByCityAndMovieService = async (city?: string, movieId?: string): Promise<CinemaZod[]> => { // Or a specific DTO
    if (!city || !movieId) {
        throw new Error('City and MovieId are required.');
    }
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
        throw new Error('Invalid Movie ID format');
    }

    try {
        
        const movieSessions = await Session.find({ movieId: new mongoose.Types.ObjectId(movieId) })
            .select('cinemaId')
            .lean();

        if (!movieSessions || movieSessions.length === 0) {
            return [];
        }

        const cinemaIdsFromSessions = [
            ...new Set(movieSessions.map(session => session.cinemaId?.toString()).filter(id => id))
        ];

        if (cinemaIdsFromSessions.length === 0) {
            return [];
        }

        const cinemas = await Cinema.find({
            city: { $regex: `^${city}$`, $options: 'i' },
            _id: { $in: cinemaIdsFromSessions.map(id => new mongoose.Types.ObjectId(id)) }
        }).lean();
        
        return cinemas.map(c => {
            const { _id, ...restOfCinema } = c;
            return { ...restOfCinema, id: _id.toString() };
        });

    } catch (error) {
        console.error(`Error fetching cinemas for city ${city} and movie ${movieId}:`, error);
        throw new Error(`Failed to retrieve cinemas for city ${city} and movie ${movieId}.`);
    }
};
