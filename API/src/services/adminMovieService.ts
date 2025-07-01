import { MovieZod, movieSchema } from '../utils/MovieValidation';
import { paginate } from '../utils';
import Movie from '../models/movie.model';
import Session from '../models/session.model';
import { getPaginationQuerySchema } from '../utils/PaginationQuerySchema';
import { moviePaginatedSchema } from '../utils/MovieValidation';

export const getMoviesService = async (query: any) => {
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
    const result = await paginate(Movie, {
        page,
        limit,
        searchQuery
    });

    // Validate the response data using Zod
    const validatedResult = moviePaginatedSchema.parse({
        data: result.data,
        totalPages: result.totalPages,
        currentPage: result.currentPage
    });

    return validatedResult;
};

export const updateMovieService = async (id: string, updates: MovieZod) => {
    if (!id) {
        throw new Error('Movie ID is required.');
    }

    const updatedMovie = await Movie.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
    });

    if (!updatedMovie) {
        throw new Error('Movie not found');
    }

    const movieExportDto: MovieZod = {
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

    return movieExportDto;
};

export const createMovieService = async (movieData: MovieZod) => {
    const validatedMovieData = movieSchema.parse(movieData);

    const newMovie = await Movie.create(validatedMovieData);
    const movieExportDto: MovieZod = {
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
    return movieExportDto;
};

export const deleteMovieService = async (id: string) => {
    if (!id) {
        throw new Error('Movie ID is required');
    }

    await Session.deleteMany({ movieId: id });
    const deletedMovie = await Movie.findByIdAndDelete(id);

    if (!deletedMovie) {
        throw new Error('Movie not found');
    }

    return deletedMovie;
};
