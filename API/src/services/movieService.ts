import Movie from '../models/movie.model';
import Reservation from '../models/reservation.model';
import mongoose from 'mongoose';
import { TMovie, movieSchema, ShowcaseMovies } from '../utils';
import Session from '../models/session.model';
import { useCache } from '../cache/useCache';
import { mapMovieToTMovie } from '../utils/mapping-functions';

/**
 * Fetches a single movie by its MongoDB ObjectId.
 *
 * @param {string | mongoose.Types.ObjectId } movieId The ID of the movie to retrieve.
 * @throws {Error} Thows an error if the moveId is not a valid MongoDB OBjectId format.
 * @throws {Error} Throws a generic error if the database operation fails.
 * @returns {Promise<TMovie | null>} A promise that resolves to the validated movie DTO, or null.
 */
export const getMovieByIdService = async (movieId: string | mongoose.Types.ObjectId): Promise<TMovie | null> => {
    if (!mongoose.Types.ObjectId.isValid(movieId)) throw new Error('Invalid Movie Id format.');

    try {
        const movie = await Movie.findById(movieId);
        if (!movie) return null;
        const movieDTO = mapMovieToTMovie(movie);
        return movieSchema.parse(movieDTO);
    } catch (error) {
        if (error instanceof mongoose.Error) {
            console.error(`Database error fetching movie ${movieId}:`, error);
            throw new Error('Failed to retrieve movie due to a database error.');
        }
        throw error;
    }
};

const POPULAR_MOVIES_TTL = 24 * 60 * 60 * 1000; // cache movies for 1 day
export const getPopularMoviesService = async (limit = 3): Promise<TMovie[]> => {
    const cacheKey = `popularMovies${limit}`;
    return useCache('popularMovies', POPULAR_MOVIES_TTL, async () => {
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

        if(movieIds.length === 0) return [];

        //get popular movies
        const movies = await Movie.find({ _id: { $in: movieIds } }).lean();

        // create map for O(1) lookups
        const moviesById = new Map(movies.map((movie) => [movie._id.toString(), movie]));

        const sortedMovies = movieIds
            .map((id) => {
                const movieDoc = moviesById.get(id.toString());
                return movieDoc ? mapMovieToTMovie(movieDoc) : null;
            })
            .filter(Boolean);

        return movieSchema.array().parse(sortedMovies);
    });
};

const NEW_MOVIES_TTL = 60 * 60 * 1000; // Cache new movies for 1 hour
/**
 * Returns the newest movie by the date add in the data base
 * @param {number}[limit=3] limit the number of movies it return. Defaults to 3.
 * @returns {Promise<TMovie[]>} containing newest movies
 */
export const getNewMoviesService = async (limit = 3): Promise<TMovie[]> => {
    const cacheKey = `newMovies${limit}`;
    return useCache(cacheKey, NEW_MOVIES_TTL, async () => {
        const newMovies = await Movie.find().sort({ createdAt: -1 }).limit(limit).lean();
        const movies = newMovies
            .map((movie) => {
                if (!movie) return null;
                const { _id, ...rest } = movie;
                return { ...rest, id: _id.toString() };
            })
            .filter(Boolean) as TMovie[];
        return movies;
    });
};

const RECOMMENDED_MOVIES_TTL = 60 * 60 * 1000; // cache recomended movies for 1 hour
export const getRecommendedMoviesService = async (userId: string, limit: number): Promise<TMovie[]> => {
    if (!userId) return [];
    const cacheKey = `recomendedMoviesUserId=${userId}`;
    return useCache(cacheKey, RECOMMENDED_MOVIES_TTL, async () => {
        const reservations = await Reservation.find({ userId }).select('sessionId').lean();

        if (!reservations || reservations.length === 0) return [];

        const sessionIds = reservations.map((reservation) => reservation.sessionId);
        const sessions = await Session.find({ _id: { $in: sessionIds } })
            .select('movieId')
            .lean();
        const watchedMoviesIds = [...new Set(sessions.map((session) => session.movieId))]; // get unique ids

        // find user most watched genre
        const watchedMovies = await Movie.find({ _id: { $in: watchedMoviesIds } })
            .select('genre')
            .lean();

        if (!watchedMovies || watchedMovies.length === 0) return [];

        //count occurance of each genre
        const genreCounts = watchedMovies.reduce((acc, movie) => {
            acc[movie.genre] = (acc[movie.genre] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // find top genre
        const topGenre = Object.keys(genreCounts).reduce((a, b) => (genreCounts[a] > genreCounts[b] ? a : b));

        const recommendedMovies = await Movie.find({
            genre: topGenre,
            _id: { $nin: watchedMoviesIds }
        })
            .sort({ year: -1 })
            .limit(limit)
            .lean();

        //Format movies
        const movies = recommendedMovies
            .map((movie) => {
                if (!movie) return null;
                const { _id, ...rest } = movie;
                return { ...rest, id: _id.toString() };
            })
            .filter(Boolean) as TMovie[];

        return movies;
    });
};

/**
 * Orchestrator service to get a showcase of movies for the landing page.
 * It fetches new, popular, and (if a user is logged in) recommended movies.
 * @param {string} [userId] - The optional ID of the logged-in user for personalized recommendations.
 * @returns {Promise<ShowcaseMovies>} An object containing new, popular, and recommended movies.
 */
export const getShowcaseMoviesService = async (userId?: string): Promise<ShowcaseMovies> => {
    const [newMovies, popularMovies] = await Promise.all([getNewMoviesService(3), getPopularMoviesService(3)]);

    let recommendedMovies: TMovie[] = [];
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        recommendedMovies = await getRecommendedMoviesService(userId, 3);
    }

    return {
        newMovies,
        popularMovies,
        recommendedMovies
    };
};
