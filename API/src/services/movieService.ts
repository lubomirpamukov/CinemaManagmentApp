import Movie from '../models/movie.model';
import mongoose from 'mongoose';
import { MovieZod, movieSchema } from '../utils';

export const getMovieByIdService = async (movieId: string): Promise<MovieZod> => {
    if (!movieId) throw new Error('MovieId is required.');
    if (!mongoose.Types.ObjectId.isValid(movieId)) throw new Error('Invalid Movie Id format.');

    try {
        const movie = await Movie.findById(new mongoose.Types.ObjectId(movieId));
        if (!movie) throw new Error('Movie not found')
        const validatedMovie = movieSchema.parse(movie);
        return validatedMovie;
    } catch (err) {
        console.error('Error fetching movie:', err);
        throw err;
    }
};
