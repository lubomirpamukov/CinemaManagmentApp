import mongoose from 'mongoose';
import Movie from '../../../src/models/movie.model';
import Reservation from '../../../src/models/reservation.model';
import { getMovieByIdService, getPopularMoviesService } from '../../../src/services';
import { useCache } from '../../../src/cache/useCache';
import { movieSchema, TMovie } from '../../../src/utils';
import { describe } from 'node:test';
import { mapMovieToTMovie } from '../../../src/utils/mapping-functions';

jest.mock('../../../src/models/movie.model');
jest.mock('../../../src/models/reservation.model');
jest.mock('../../../src/cache/useCache');
/**
 * Creates a mock Mongoose document for unit testing.
 * @param {Partial<any>} overrides Optional fields to override default values.
 * @returns {any} a mock movie document shaped like IMovie model.
 */
export const createMockMovieDocument = (overrides: Partial<any> = {}) => {
    return {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Movie',
        duration: 120,
        genre: 'Action',
        pgRating: 'PG-13',
        year: 2025,
        director: 'Jane Doe',
        cast: ['Actor One', 'Actor Two'],
        description: 'A test movie description.',
        imgURL: 'https://example.com/movie.jpg',
        ...overrides
    };
};

/**
 * Unit tests for getMovieByIdService
 *
 * This test suite verifies the service logic for retrieving a single movie by its ID.
 * It ensures that:
 * - The service evalidates the move ID format and throws error for invalud ID.
 * - The Movie model's findById function is called with the correct parameters.
 * - Database errors are properly cought and re-thrown as user-firendly errors.
 * - The service returns null if the movie does not exist.
 * - The service maps and validates the movie document to a TMovie DTO when found.
 * - The movieSchema.parse method is called only when a valid movie is returned.
 *
 * Mocks are used for the Movie model and the movieSchema to isolate service logic from dependencies.
 */
describe('getMovieByIdService', () => {
    it('should throw `Invalid Movie Id format` if Id format is invalid', async () => {
        // Arrange
        jest.clearAllMocks();
        const invalidMovieId = 'invalid-objectId';

        // Act & Assert
        await expect(getMovieByIdService(invalidMovieId)).rejects.toThrow('Invalid Movie Id format.');
        expect(Movie.findById).not.toHaveBeenCalled();
    });

    it('should throw generic error if database operation failed', async () => {
        // Arrange
        jest.clearAllMocks();
        const movieId = new mongoose.Types.ObjectId();
        const dbError = new mongoose.Error('Database connection lost.');
        (Movie.findById as jest.Mock).mockRejectedValue(dbError);

        // Act & Assert
        await expect(getMovieByIdService(movieId)).rejects.toThrow('Failed to retrieve movie due to a database error.');
        expect(Movie.findById).toHaveBeenCalledWith(movieId);
    });

    it('should return null if movie dont exist', async () => {
        // Arrange
        jest.clearAllMocks();
        const nonExistentId = new mongoose.Types.ObjectId();
        (Movie.findById as jest.Mock).mockResolvedValue(null);
        jest.spyOn(movieSchema, 'parse').mockImplementation((data) => data as any);

        // Act
        const actualResult = await getMovieByIdService(nonExistentId);

        // Assert
        expect(actualResult).toBe(null);
        expect(Movie.findById).toHaveBeenCalledWith(nonExistentId);
        expect(movieSchema.parse).not.toHaveBeenCalled();
    });

    it('should return validated TMovie DTO if movie exist', async () => {
        // Arrange
        const mockMovie = createMockMovieDocument();
        (Movie.findById as jest.Mock).mockResolvedValue(mockMovie);
        jest.spyOn(movieSchema, 'parse').mockImplementation((data) => data as any);

        // Act
        const actualResult = await getMovieByIdService(mockMovie._id);

        // Assert
        const expectedResult = mapMovieToTMovie(mockMovie as any);
        expect(actualResult).toEqual(expectedResult);
        expect(Movie.findById).toHaveBeenCalledWith(mockMovie._id);
        expect(movieSchema.parse).toHaveBeenCalledTimes(1);
    });
});

/**
 * Unit tests for getPopularMoviesService
 *
 * This test suite verifies the logic for retriving a list of popular movies.
 * It ensures that:
 * - The service correctly utilizes the cache, returning cached data on a hit and executing the DB logic on a miss.
 * - The `Reservation.aggregate` and `Movie.find` functions are called with correct parameters.
 * - The final list of movies is correctly sorted by popularity, not by the default database order.
 * - The service returns a validated array of `TMovie` DTOs.
 * - The service handles cases where no popular movies are found.
 * - Errors from the database or validation are properly propagated.
 *
 * Mocks are used for the `useCache` helper, `Reservation` and `Movie` models, and movieSchema to isolate the service from external dependencies.
 */
describe('getPopularMoviesService', () => {
    const useCacheMock = useCache as jest.Mock;
    const aggregateMock = Reservation.aggregate as jest.Mock;
    const findMock = Movie.find as jest.Mock;

    it('should return cached data on cache hit', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockCachedMovies = [mapMovieToTMovie(createMockMovieDocument() as any)];
        // Simulate cache hit
        useCacheMock.mockResolvedValue(mockCachedMovies);

        // Act
        const actualResult = await getPopularMoviesService();

        // Assert
        expect(actualResult).toEqual(mockCachedMovies);
        expect(useCacheMock).toHaveBeenCalledWith('popularMovies', expect.any(Number), expect.any(Function));

        // Ensure no database calls were made
        expect(aggregateMock).not.toHaveBeenCalled();
        expect(findMock).not.toHaveBeenCalled();
    });

    it('should fetch, sort, and return popular movies on a cache miss', async () => {
        // Arrange
        jest.clearAllMocks();
        const limit = 2;
        const movie1 = createMockMovieDocument({ title: 'Popular Movie 1' });
        const movie2 = createMockMovieDocument({ title: 'Unpopular Movie 2' });

        // 1. Simulate a cache miss: useCache will execute the factory function it's given.
        useCacheMock.mockImplementation((key, ttl, factory) => factory());

        // 2. Mock the aggragation result (movie1 is more popular)
        const popularIds = [{ _id: movie1._id }, { _id: movie2._id }];
        aggregateMock.mockResolvedValue(popularIds);

        // 3. Mock the Movie.find result (Db returns them in a different order)
        const leanMock = { lean: jest.fn().mockResolvedValue([movie2, movie1]) };
        findMock.mockReturnValue(leanMock);

        // 4. Mock the final validation step
        const mockArraySchema = { parse: jest.fn((data) => data) };
        jest.spyOn(movieSchema, 'array').mockReturnValue(mockArraySchema as any);

        // Act
        const actualResult = await getPopularMoviesService(limit);

        // Assert
        // 1. Check that final result is sorted correctly by popularity
        expect(actualResult[0].title).toBe('Popular Movie 1');
        expect(actualResult[1].title).toBe('Unpopular Movie 2');

        // 2. Verify the database calls
        expect(aggregateMock).toHaveBeenCalledWith(expect.any(Array));
        expect(findMock).toHaveBeenCalledWith({ _id: { $in: [movie1._id, movie2._id] } });
        expect(leanMock.lean).toHaveBeenCalledTimes(1);

        expect(mockArraySchema.parse).toHaveBeenCalledTimes(1);
    });

    it('shoud return an empty array if no popular movies are found', async () => {
        // Arrange
        jest.clearAllMocks();
        useCacheMock.mockImplementation((key, ttl, factory) => factory());
        aggregateMock.mockResolvedValue([]);
        const mockArraySchema = { parse: jest.fn((data) => data) };
        jest.spyOn(movieSchema, 'array').mockReturnValue(mockArraySchema as any);

        // Act
        const actualResult = await getPopularMoviesService();

        // Assert
        expect(actualResult).toEqual([]);
        expect(aggregateMock).toHaveBeenCalledTimes(1);
        expect(findMock).not.toHaveBeenCalled();
        expect(mockArraySchema.parse).not.toHaveBeenCalled();
    });

    it('should propagate errors from the Reservation.aggregate call', async () => {
        // Arrange
        const dbError = new Error('Aggregation failed');
        useCacheMock.mockImplementation((key, ttl, factory) => factory());
        aggregateMock.mockRejectedValue(dbError);

        // Act & Assert
        await expect(getPopularMoviesService()).rejects.toThrow(dbError);
        expect(findMock).not.toHaveBeenCalled();
    });
});
