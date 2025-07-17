import { TMovie, TMoviePaginated, movieSchema } from '../utils';
import { paginate } from '../utils';
import Movie, { IMovie } from '../models/movie.model';
import Session from '../models/session.model';
import { getPaginationQuerySchema } from '../utils';
import { moviePaginatedSchema } from '../utils';
import mongoose from 'mongoose';

/**
 * Fetches a paginated list of movies, with optional searching across title, director, and genre
 * @param {string} [query.page='1'] The page number for pagination.
 * @param {string} [query.limit='10'] The number of items per page.
 * @param {string} [query.search] A search term to filter movies by title, genre, or director.
 * @throws {ZodError} If the query parameters are invalid.
 * @returns {Promise<TMoviePaginated | []>} Resloves to a validated Paginated collection of Movie objects or empty array
 */
export const getMoviesService = async (query: any): Promise<TMoviePaginated> => {
    const { page, limit, search } = getPaginationQuerySchema.parse(query);

    // Build the search query
    const searchQuery = search
        ? {
              $or: [
                  { title: { $regex: search, $options: 'i' } },
                  { director: { $regex: search, $options: 'i' } },
                  { genre: { $regex: search, $options: 'i' } }
              ]
          }
        : {};

    // Use the pagination utility
    const paginatedResult = await paginate<IMovie>(Movie, {
        page,
        limit,
        searchQuery
    });

    const movieDTOs: TMovie[] = paginatedResult.data.map((movie) => ({
        id: movie._id.toString(),
        title: movie.title,
        duration: movie.duration,
        genre: movie.genre,
        pgRating: movie.pgRating,
        year: movie.year,
        director: movie.director,
        cast: movie.cast,
        description: movie.description,
        imgURL: movie.imgURL
    }));

    // Validate the response data using Zod
    const validatedResult = moviePaginatedSchema.parse({
        data: paginatedResult.data,
        totalPages: paginatedResult.totalPages,
        currentPage: paginatedResult.currentPage
    });

    return validatedResult;
};

/**
 * Updates a movie document in the database.
 * Assumes the ID and update data have been validated by the controller.
 * @param {string} id The ID of the movie to update.
 * @param {Partial<TMovie>} updates The validated movie data to apply.
 * @throws {Error} Throws an error if the movie is not found.
 * @returns {Promise<TMovie>} A promise that resolves to the updated movie DTO
 */
export const updateMovieService = async (id: string, updates: Partial<TMovie>): Promise<TMovie> => {
    const updatedMovie = await Movie.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
    });

    if (!updatedMovie) {
        throw new Error('Movie not found');
    }

    const movieExportDto: TMovie = {
        id: updatedMovie._id.toString(),
        title: updatedMovie.title,
        duration: updatedMovie.duration,
        genre: updatedMovie.genre,
        pgRating: updatedMovie.pgRating,
        year: updatedMovie.year,
        director: updatedMovie.director,
        cast: updatedMovie.cast,
        description: updatedMovie.description,
        imgURL: updatedMovie.imgURL
    };

    return movieSchema.parse(movieExportDto);
};

/**
 * Creates movie document, returns Movie DTO object
 * Assumes the controller validated the movie data.
 * @param {TMovie} movieData The Movie object.
 * @throws {Error} Throws an error if the database opreation fails.
 * @returns {Promise<TMovie>} A promise that resloves to the newly created movie DTO.
 */
export const createMovieService = async (movieData: TMovie): Promise<TMovie> => {
    const newMovie = await Movie.create(movieData);
    const movieExportDto: TMovie = {
        id: newMovie._id.toString(),
        title: newMovie.title,
        duration: newMovie.duration,
        genre: newMovie.genre,
        pgRating: newMovie.pgRating,
        year: newMovie.year,
        director: newMovie.director,
        cast: newMovie.cast,
        description: newMovie.description,
        imgURL: newMovie.imgURL
    };
    return movieSchema.parse(movieExportDto);
};

/**
 * Deletes a movie and all its assosiated sessions within a transaction.
 * Assumes the controller has validated the movie ID.
 * @param {string} id The ID of the movie to delete.
 * @throws {Error} Throws an error if the movie is not found or if the transaction fails.
 * @returns {Promise<TMovie>} A promise that resolves to the DTO of the deleted movie.
 */
export const deleteMovieService = async (id: string): Promise<TMovie> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await Session.deleteMany({ movieId: id }, { session });
        const deletedMovie = await Movie.findByIdAndDelete(id, { session });

        if (!deletedMovie) {
            await session.abortTransaction();
            throw new Error('Movie not found.');
        }

        await session.commitTransaction();

         return movieSchema.parse({
            id: deletedMovie._id.toString(),
            title: deletedMovie.title,
            duration: deletedMovie.duration,
            genre: deletedMovie.genre,
            pgRating: deletedMovie.pgRating,
            year: deletedMovie.year,
            director: deletedMovie.director,
            cast: deletedMovie.cast,
            description: deletedMovie.description,
            imgURL: deletedMovie.imgURL
        });
    } catch (error) {
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }
};
