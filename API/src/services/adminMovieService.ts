import { TMovie, TMoviePaginated, movieSchema } from '../utils';
import { paginate } from '../utils';
import Movie, { IMovie } from '../models/movie.model';
import Session from '../models/session.model';
import { getPaginationQuerySchema } from '../utils';
import { moviePaginatedSchema } from '../utils';
import mongoose from 'mongoose';
import { mapMovieToTMovie } from '../utils/mapping-functions';

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

    const movieDTOs: TMovie[] = paginatedResult.data.map(mapMovieToTMovie);

    // Validate the response data using Zod
    const validatedResult = moviePaginatedSchema.parse({
        data: movieDTOs,
        totalPages: paginatedResult.totalPages,
        currentPage: paginatedResult.currentPage
    });

    return validatedResult;
};

/**
 * Updates a movie document in the database.
 * Assumes the ID and update data have been validated by the controller.
 * @param {string | mongoose.Types.ObjectId} id The ID of the movie to update.
 * @param {Partial<TMovie>} updates The validated movie data to apply.
 * @throws {Error} Throws an error if the movie is not found.
 * @returns {Promise<TMovie>} A promise that resolves to the updated movie DTO
 */
export const updateMovieService = async (id: string | mongoose.Types.ObjectId, updates: Partial<TMovie>): Promise<TMovie> => {
    const updatedMovie = await Movie.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
    });

    if (!updatedMovie) {
        throw new Error('Movie not found');
    }

    const movieExportDto = mapMovieToTMovie(updatedMovie);

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
    const movieDto = mapMovieToTMovie(newMovie);
    return movieSchema.parse(movieDto);
};

/**
 * Deletes a movie and all of its associated sessions within a snigle database transaction.
 *
 * This function ensures atomicity: either both movie and its sessions are deleted,
 * or the entire operation is rolled back on any faliure.
 *
 * @param {string | mongoose.Types.ObjectId} id The Id of the movie to delete.
 * @throws {Error} Throws a `Movie not found.` error if the specified movie does not exist.
 * @throws {Error} Propagates any other database or transaction-related erros.
 * @returns {Promise<TMovie>} A promise that resolves to the DTO of the deleted movie upon Successful transaction
 */
export const deleteMovieService = async (id: string | mongoose.Types.ObjectId): Promise<TMovie> => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        await Session.deleteMany({ movieId: id }, { session }); // delete all session associated with the movie ID
        const deletedMovie = await Movie.findByIdAndDelete(id, { session }); // delete the movie

        if (!deletedMovie) {
            throw new Error('Movie not found.');
        }

        await session.commitTransaction();
        const movieDto = mapMovieToTMovie(deletedMovie); // map to dto
        return movieSchema.parse(movieDto);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};
