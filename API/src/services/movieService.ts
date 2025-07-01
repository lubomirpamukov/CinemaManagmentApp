import Movie from '../models/movie.model';
import Reservation from '../models/reservation.model';
import mongoose from 'mongoose';
import { MovieZod, movieSchema } from '../utils';
import Session from '../models/session.model';

export const getMovieByIdService = async (movieId: string): Promise<MovieZod> => {
    if (!movieId) throw new Error('MovieId is required.');
    if (!mongoose.Types.ObjectId.isValid(movieId)) throw new Error('Invalid Movie Id format.');

    try {
        const movie = await Movie.findById(new mongoose.Types.ObjectId(movieId));
        if (!movie) throw new Error('Movie not found');
        const validatedMovie = movieSchema.parse(movie);
        return validatedMovie;
    } catch (err) {
        console.error('Error fetching movie:', err);
        throw err;
    }
};

export const getPopularMoviesService = async (limit = 3): Promise<MovieZod[]> => {
    // Aggregate reservations to count bookings per movie and order them descending
    const popular = await Reservation.aggregate([
        {
            $lookup: {
                from: 'sessions',
                localField: 'sessionId',
                foreignField: '_id',
                as: 'session'
            }
        },
        { $unwind: '$session' },
        {
            $group: {
                _id: '$session.movieId',
                reservationCount: { $sum: 1 }
            }
        },
        { $sort: { reservationCount: -1 } },
        { $limit: limit }
    ]);

    //Create array of movie ids
    const movieIds = popular.map((p) => p._id);

    //get popular movies
    const movies = await Movie.find({ _id: { $in: movieIds } }).lean();

    // create map for O(1) lookups
    const moviesById = new Map(movies.map((movie) => [movie._id.toString(), movie]));

    const sortedMovies = movieIds.map((id) => {
        const movie = moviesById.get(id.toString());
        if (!movie) return null;
        const { _id, ...rest } = movie;
        return { ...rest, id: _id.toString() };
    });

    return sortedMovies.filter(Boolean) as MovieZod[];
};

export const getNewMoviesService = async (limit = 3): Promise<MovieZod[]> => {
    const newMovies = await Movie.find().sort({ createdAt: -1 }).limit(limit).lean();
    const movies = newMovies
        .map((movie) => {
            if (!movie) return null;
            const { _id, ...rest } = movie;
            return { ...rest, id: _id.toString() };
        })
        .filter(Boolean) as MovieZod[];

    return movies;
};

export const getRecommendedMoviesService = async(userId: string, limit: number): Promise<MovieZod[]> => {

    if (!userId) return []

    const reservations = await Reservation.find({ userId }).select('sessionId').lean();

    if (!reservations || reservations.length === 0) return [];

    const sessionIds = reservations.map(reservation => reservation.sessionId);
    const sessions = await Session.find({ _id: { $in: sessionIds }}).select('movieId').lean();
    const watchedMoviesIds = [... new Set(sessions.map(session => session.movieId))] // get unique ids

    // find user most watched genre
    const watchedMovies = await Movie.find({ _id: { $in: watchedMoviesIds}}).select('genre').lean();

    if (!watchedMovies || watchedMovies.length === 0) return [];

    //count occurance of each genre
    const genreCounts = watchedMovies.reduce((acc, movie) => {
        acc[movie.genre] = (acc[movie.genre] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // find top genre
    const topGenre = Object.keys(genreCounts).reduce((a,b) => (genreCounts[a] > genreCounts[b] ? a : b));

    const recommendedMovies = await Movie.find({
        genre: topGenre,
        _id: { $nin: watchedMoviesIds}
    })
    .sort( {year: - 1})
    .limit(limit)
    .lean()

    //Format movies
    const movies = recommendedMovies.map(movie => {
        if (!movie) return null;
        const { _id, ...rest} = movie;
        return { ...rest, id: _id.toString() };
    }).filter(Boolean) as MovieZod[]

    return movies;
};
