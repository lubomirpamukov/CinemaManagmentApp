import Cinema from '../models/cinema.model';
import Session from '../models/session.model';
import mongoose from 'mongoose';
import { TCinema } from '../utils';

/**
 * Retrives a sorted list of unique city names where a specific movie is being shown.
 * This is achived using a single, efficient database aggregation pipeline that finds all
 * sessions for the movie, looks up their assosiated cinemas,
 * and then extracts and sorts the unique cities from those cinemas.
 * @param {string} movieId The MongoDB ObjectId of the movie to search for.
 * @throws {Error} Throws an error if the movieId is not a valid MongoDB ObjectId format.
 * @throws {Error} Throws generic error if the database query fails.
 * @returns {Promise<string[]>} A promise that resolves to a sorted array of unique city names.
 */
export const getCinemaCityByMovieIdService = async (movieId: string): Promise<string[]> => {
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
        throw new Error('Invalid MovieId');
    }

    try {
        // 2. Use a single, efficient aggregation pipeline to get the data.
        const citiesAggregation = await Session.aggregate([
            // Stage 1: Find all sessions matching the movie ID.
            { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
            // Stage 2: Join with the 'cinemas' collection to get cinema details.
            { $lookup: { from: 'cinemas', localField: 'cinemaId', foreignField: '_id', as: 'cinemaDetails' } },
            // Stage 3: Deconstruct the cinemaDetails array created by $lookup.
            { $unwind: '$cinemaDetails' },
            // Stage 4: Group by city to get a list of unique cities.
            { $group: { _id: '$cinemaDetails.city' } },
            // Stage 5: Sort the cities alphabetically.
            { $sort: { _id: 1 } }
        ]);

        return citiesAggregation.map((item) => item._id);
    } catch (error) {
        console.error('Error fetching cinema cities:', error);
        throw new Error('Failed to fetch cinema cities');
    }
};

/**
 * Retrieves a list of cinemas that are showing a specific movie in a gfiven city.
 * This is achived using a single, efficient database aggregation pipeline.
 *
 * @param {string} city The city to serach for cinemas in (case-insensitive).
 * @param {string} movieId The MongoDB ObjectId for the movie.
 * @throws {Error} Throws an error if the movieId is not a valid MongoDb ObjectId format.
 * @throws {Error} Throws generic error if the database query fails.
 * @returns {Promise<Tcinema[]>} A promise that resolves to an array of cinema DTOs. Returns an empty array if no matches are found.
 */
export const getCinemasByCityAndMovieService = async (city: string, movieId: string): Promise<TCinema[]> => {
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
        throw new Error('Invalid Movie ID format');
    }

    try {
        const cinemas = await Session.aggregate([
            //Stage 1: Find all sessions for a given movie.
            { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
            // Stage 2: Join with the 'cinemas' collection
            {
                $lookup: {
                    from: 'cinemas',
                    localField: 'cinemaId',
                    foreignField: '_id',
                    as: 'cinemaDetails'
                }
            },
            // Stage 3: Deconstruct the resulting array
            { $unwind: '$cinemaDetails' },
            // Stage 4: Filter the joined documents by the specified city (case-insensitive).
            { $match: { 'cinemaDetails.city': { $regex: `^${city}$`, $options: 'i' } } },
            // Stage 5: Group by cinema ID to get unique cinemas.
            {
                $group: {
                    _id: '$cinemaDetails._id',
                    doc: { $first: '$cinemaDetails' }
                }
            },
            // Stage 6 Promote the cinema document to the root level.
            { $replaceRoot: { newRoot: '$doc' } },
            // Stage 7 Add a client-friendly 'id' field.
            { $addFields: { id: { $toString: '$_id' } } },
            // Stage 8 : Remove the original '_id; field and other unwanted fields.
            { $project: { _id: 0, __v: 0 } }
        ]);
        return cinemas
    } catch (error) {
        console.error(`Error fetching cinemas for city ${city} and movie ${movieId}:`, error);
        throw new Error(`Failed to retrieve cinemas for city ${city} and movie ${movieId}.`);
    }
};
