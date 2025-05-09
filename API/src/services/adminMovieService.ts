import { paginate } from '../utils';
import Movie from '../models/movie.model';
import { getPaginationQuerySchema } from '../utils/PaginationQuerySchema';
import { moviePaginatedSchema } from '../utils/MovieValidation';

export const getMoviesService = async(query: any) => {

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
            searchQuery,
        });
    
        // Validate the response data using Zod
        const validatedResult = moviePaginatedSchema.parse({
            data: result.data,
            totalPages: result.totalPages,
            currentPage: result.currentPage
        });
    
        return validatedResult;
}

export const deleteMovieService = async(id:string) =>{
    if (!id) {
        throw new Error('Movie ID is required');
    }

    const deletedMovie = await Movie.findByIdAndDelete(id);

    if (!deletedMovie) {
        throw new Error('Movie not found');
    }

    return deletedMovie;
}