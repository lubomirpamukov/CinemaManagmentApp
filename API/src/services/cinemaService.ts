import Cinema from '../models/cinema.model';
import Session from '../models/session.model';
import mongoose from 'mongoose';

export const getCinemaCityByMovieIdService = async (movieId: string): Promise<string[]> => {
    if (!movieId) {
        throw new Error('MovieId is required.');
    }

    if(!mongoose.Types.ObjectId.isValid(movieId)) {
        throw new Error('Invalid MovieId');
    }

    try {
        // 1. Find all sessions with the given movieId
        const sessions = await Session.find({ movieId: new mongoose.Types.ObjectId(movieId) }).select('cinemaId');

        // 2. Extract unique cinemaIds
        const cinemaIds = [...new Set(sessions.map(session => session.cinemaId.toString()))];

        // 3. Find all cinemas with those IDs
        const cinemas = await Cinema.find({ _id: { $in: cinemaIds } }).select('city -_id');

        // 4. Extract and return the cities
        const cities = cinemas.map(cinema => cinema.city);
        console.log(cities)
        return cities;
    } catch (error) {
        console.error("Error fetching cinema cities:", error);
        throw new Error("Failed to fetch cinema cities");
    }
};
