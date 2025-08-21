import { beforeEach, describe, expect } from '@jest/globals';
import mongoose, { Error } from 'mongoose';
import { createMovieService, getMoviesService, updateMovieService, deleteMovieService } from '../../../src/services';
import { movieSchema, paginate } from '../../../src/utils';
import { getPaginationQuerySchema } from '../../../src/utils/';
import Movie from '../../../src/models/movie.model';
import { TMovie } from '../../../src/utils';
import Session from '../../../src/models/session.model';
import { mapMovieToTMovie } from '../../../src/utils/mapping-functions';

jest.mock('../../../src/models/movie.model');
jest.mock('../../../src/models/session.model');
jest.mock('../../../src/utils');
jest.mock('../../../src/utils/MovieValidation', () => ({
    getPaginationQuerySchema: {
        parse: jest.fn()
    },
    moviePaginatedSchema: {
        parse: jest.fn((data) => data) // Pass-through mock
    },
    movieSchema: {
        parse: jest.fn((data) => data)
    }
}));

// Helper to create mock movie data (from DB)
const createMockMovies = () => [
    {
        _id: new mongoose.Types.ObjectId(),
        title: 'Inception',
        director: 'Christopher Nolan',
        genre: 'Sci-Fi',
        duration: 148,
        pgRating: 'PG-13',
        year: 2010,
        cast: [{ name: 'Leonardo DiCaprio', role: 'Jon' }],
        description: 'A mind-bending thriller',
        imgURL: 'hhtp://example.com/inception.jpg'
    },
    {
        _id: new mongoose.Types.ObjectId(),
        title: 'The Matrix',
        director: 'Wachowskis',
        genre: 'Sci-Fi',
        duration: 136,
        pgRating: 'R',
        year: 1999,
        cast: [{ name: 'Keanu Reeves', role: 'Jack Sparrow' }],
        description: 'A hacker learns a shocking truth.',
        imgURL: 'http://example.com/matrix.jpg'
    }
];

// Helper to create the expected DTO result
const createExpectedMovieDTOs = (mockMovies: any[]): TMovie[] =>
    mockMovies.map((movie) => ({
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

/**
 * Unit tests for getMoviesService
 *
 * This test suite verifies:
 * - That the service fetches and returns paginated movies correctly when no search query is provided.
 * - That the service guild and applies search query when a search term is present.
 * - That the service maps movie documents to DTOs as expected.
 * - That the service throws an error if the pagination query is invalid.
 * - That errors from the pagination utility (such as database failures) are properly propagated.
 *
 * Mock are used for the Movie model, pagination utility, and validation schemas to isolate service logic from external dependencies.
 */
describe('getMoviesService', () => {

    it('should fetch paginated movies without a search query', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockMovies = createMockMovies();
        const query = { page: 1, limit: 10 };

        //Mock parsed query
        (getPaginationQuerySchema.parse as jest.Mock).mockReturnValue({
            page: 1,
            limit: 10,
            search: undefined
        });

        // Mock the result from the paginate utility
        const paginatedResult = {
            data: mockMovies,
            totalPages: 1,
            currentPage: 1
        };
        (paginate as jest.Mock).mockResolvedValue(paginatedResult);

        // Act
        const actualResult = await getMoviesService(query);

        // Assert
        // 1.Check if the paginate utility was called correctly
        expect(paginate).toHaveBeenCalledWith(Movie, {
            page: 1,
            limit: 10,
            searchQuery: {}
        });

        // 2. Check if final result is correctly structured.
        const expectedResult = createExpectedMovieDTOs(mockMovies);
        expect(actualResult.data).toEqual(expectedResult);
        expect(actualResult.currentPage).toBe(1);
        expect(actualResult.totalPages).toBe(1);
    });

    it('should fetch paginated movies with a search query', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockMovie = createMockMovies()[0];
        const query = { page: 1, limit: 10, searchQuery: 'Nolan' };

        // Mock parsed query
        (getPaginationQuerySchema.parse as jest.Mock).mockReturnValue({
            page: 1,
            limit: 10,
            search: 'Nolan'
        });

        // Mock the result from the paginate utility
        const paginatedResult = {
            data: [mockMovie], // expects array
            totalPages: 1,
            currentPage: 1
        };
        (paginate as jest.Mock).mockResolvedValue(paginatedResult);

        // Act
        const actualResult = await getMoviesService(query);

        //Assert
        // 1. Check if the paginate utility was called correctly
        const expectedSearchQuery = {
            $or: [
                { title: { $regex: 'Nolan', $options: 'i' } },
                { director: { $regex: 'Nolan', $options: 'i' } },
                { genre: { $regex: 'Nolan', $options: 'i' } }
            ]
        };

        expect(paginate).toHaveBeenCalledWith(Movie, {
            page: 1,
            limit: 10,
            searchQuery: expectedSearchQuery
        });

        // 2. Check if final result is correctly structured.
        const expectedResult = createExpectedMovieDTOs([mockMovie]);
        expect(actualResult.data).toEqual(expectedResult);
        expect(actualResult.currentPage).toBe(1);
        expect(actualResult.totalPages).toBe(1);
        expect(actualResult.data).toHaveLength(1);
        expect(actualResult.data[0].director).toBe('Christopher Nolan');
    });

    it('should throw an error if the pagination query is invalid', async () => {
        // Arrange
        jest.clearAllMocks();
        const invalidQuery = { page: 'one' }; // invalid page type
        const validationError = new Error('Invalid page number');

        // Mock the schema parser to throw an error
        (getPaginationQuerySchema.parse as jest.Mock).mockImplementation(() => {
            throw validationError;
        });

        // Act & Assert
        await expect(getMoviesService(invalidQuery)).rejects.toThrow(validationError);
    });

    it('should propage errors from the paginate utility', async () => {
        // Arrange
        jest.clearAllMocks();
        const query = { page: 1, limit: 10 };
        const dbError = new Error('Database connection lost');

        (getPaginationQuerySchema.parse as jest.Mock).mockReturnValue(query);

        // Mock the paginate utility to reject promise
        (paginate as jest.Mock).mockRejectedValue(dbError);

        // Act & Assert
        await expect(getMoviesService(query)).rejects.toThrow(dbError);
    });
});

/**
 * Unit tests for updateMovieService
 *
 * This suite verifies:
 * - That a movie is updated and the correct DTO is returned when valid data is provided.
 * - That the service correctly calls the database model with the right parameters.
 * - That the service throws a 'Movie not found' error for non existent Ids.
 * - That database errors (like validation failures) are propagated correctly.
 *
 * Mock are used for the Movie model and validation schemas to isolate server logic from external dependencies.
 */
describe('updateMovieService', () => {

    it('should update movie and return the updated DTO if found', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockMovie = createMockMovies()[0];
        const updatedMockMovie = {
            ...mockMovie,
            title: 'Inception updated',
            duration: 150
        };
        const updatePayload = {
            title: 'Inception updated',
            duration: 150
        };

        (Movie.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedMockMovie);

        // Act
        const actualResult = await updateMovieService(mockMovie._id, updatePayload);

        // Assert
        expect(Movie.findByIdAndUpdate).toHaveBeenCalledWith(mockMovie._id, updatePayload, { new: true, runValidators: true });
        const expectedResult = createExpectedMovieDTOs([updatedMockMovie]); // array
        expect(actualResult).toEqual(expectedResult[0]);
        expect(movieSchema.parse).toHaveBeenCalledWith(expectedResult[0]);
    });

    it('should throw an error if the movie is not found', async () => {
        // Arrange
        jest.clearAllMocks();
        const nonExistentId = new mongoose.Types.ObjectId();
        const updatePayload = {
            duration: 160
        };
        (Movie.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(updateMovieService(nonExistentId, updatePayload)).rejects.toThrow('Movie not found');
        expect(Movie.findByIdAndUpdate).toHaveBeenCalledWith(nonExistentId, updatePayload, { new: true, runValidators: true });
    });

    it('should propagate mongoose error', async () => {
        // Arrange
        jest.clearAllMocks();
        const movieId = new mongoose.Types.ObjectId();
        const uploadPayload = {
            duration: 160
        };
        const dbError = new Error('Validation failed: title is required.');

        (Movie.findByIdAndUpdate as jest.Mock).mockRejectedValue(dbError);

        //Act & Assert
        await expect(updateMovieService(movieId, uploadPayload)).rejects.toThrow(dbError);
        expect(Movie.findByIdAndUpdate).toHaveBeenCalledWith(movieId, uploadPayload, { new: true, runValidators: true });
    });
});

/**
 * Unit tests for createMovieService
 *
 * This test suite verifies:
 * - That the service creates a movie document and returns the correct DTO when valid input data is provided.
 * - That the service calls the Movie model's create method with the correct parameters.
 * - That the service validates the returned DTO using the movie schema.
 * - That the service properly propagates errors thrown by the Movie model's create method.
 *
 * Mocks are used for the Movie model and validation schemas to isolate service logic from external dependencies.
 */
describe('createMovieService', () => {

    it('should create a movie document if input data is valid', async () => {
        // Arrange
        jest.clearAllMocks();
        const newMovieDocument = createMockMovies()[0];
        const inputMovieData = {
            title: 'Inception',
            director: 'Christopher Nolan',
            genre: 'Sci-Fi',
            duration: 148,
            pgRating: 'PG-13',
            year: 2010,
            cast: [{ name: 'Leonardo DiCaprio', role: 'Jon' }],
            description: 'A mind-bending thriller',
            imgURL: 'hhtp://example.com/inception.jpg'
        };

        (Movie.create as jest.Mock).mockResolvedValue(newMovieDocument);

        // Act
        const actualResult = await createMovieService(inputMovieData);

        // Assert
        const expectedResult = createExpectedMovieDTOs([newMovieDocument])[0];
        expect(actualResult).toEqual(expectedResult);
        expect(Movie.create).toHaveBeenCalledWith(inputMovieData);
        expect(movieSchema.parse).toHaveBeenCalledWith(expectedResult);
    });

    it('should propagate an error if Movie.create fails', async () => {
        // Arrange
        jest.clearAllMocks();
        const inputMovieData = {
            title: 'Inception',
            director: 'Christopher Nolan',
            genre: 'Sci-Fi',
            duration: 148,
            pgRating: 'PG-13',
            year: 2010,
            cast: [{ name: 'Leonardo DiCaprio', role: 'Jon' }],
            description: 'A mind-bending thriller',
            imgURL: 'hhtp://example.com/inception.jpg'
        };
        const dbError = new Error('Connection lost.');

        (Movie.create as jest.Mock).mockRejectedValue(dbError);

        // Act & Assert
        await expect(createMovieService(inputMovieData)).rejects.toThrow(dbError);
        expect(Movie.create).toHaveBeenCalledWith(inputMovieData);
        expect(movieSchema.parse).not.toHaveBeenCalled();
    });
});

/**
 * Unti test for deleteMovieService
 *
 * This test suite verifies the transactional behavior of deleting a movie.
 *
 * - That on success, both the movie and its assosicated sessions are deleted, and the transaction is completed.
 * - That if movie is not found the transaction is aborted and specific error is thrown.
 * - That if any database operation fails, the transaction is aborted , and the error is propagated.
 * - That the session is aways closd regardless of the outcome to prevent resource leaks.
 * - The correct DTO of the deleted movie is returned on success.
 *
 * Mock are user for Mongoose models (Movie, Session) and the transaction session itself,
 *  to isolate the logic of the service from external dependencies.
 */
describe('deleteMovieService', () => {
    // Create reusable mockSession object for all the tests in this suite.
    const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn()
    } as unknown as mongoose.ClientSession;

    beforeEach(() => {
        // Mock mongoose.startSession to return our mock session object for each test.
        jest.spyOn(mongoose, 'startSession').mockResolvedValue(mockSession);
    });

    it('should delete a movie and its sessions and commit the transaction on success', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockMovie = createMockMovies()[0];
        const movieId = mockMovie._id;

        // Simulate successful database operations
        (Movie.findByIdAndDelete as jest.Mock).mockResolvedValue(mockMovie);
        (Session.deleteMany as jest.Mock).mockResolvedValue({ acknowledged: true, deletedCount: 3 });

        // Act
        const actualResult = await deleteMovieService(movieId);

        // Assert
        // 1. Verify transaction flow
        expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
        expect(Session.deleteMany).toHaveBeenCalledWith({ movieId }, { session: mockSession });
        expect(Movie.findByIdAndDelete).toHaveBeenCalledWith(movieId, { session: mockSession });
        expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1),
        expect(mockSession.abortTransaction).not.toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);

        // 2. Verify that the returned data is correct
        const expectedResult = createExpectedMovieDTOs([mockMovie])[0];
        expect(actualResult).toEqual(expectedResult);
        expect(movieSchema.parse).toHaveBeenCalledWith(expectedResult)
    });

    it('should thow an error and abort the transaction if the movie is not found', async () => {
        // Arrange
        jest.clearAllMocks();
        const nonExistentId = new mongoose.Types.ObjectId();
        (Session.deleteMany as jest.Mock).mockResolvedValue({ acknowledged: true, deletedCount: 3 });
        (Movie.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(deleteMovieService(nonExistentId)).rejects.toThrow('Movie not found.')
        expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
        expect(Session.deleteMany).toHaveBeenCalledWith({movieId: nonExistentId}, {session: mockSession})
        expect(mockSession.abortTransaction).toHaveBeenCalledTimes(1);
        expect(mockSession.commitTransaction).not.toBeCalled();
        expect(mockSession.endSession).toHaveBeenCalled();
    })

    it('should abort the transaction if deleting sessions fails', async () => {
        // Arrange
        jest.clearAllMocks();
        const nonExistentId = new mongoose.Types.ObjectId();
        const dbError = new Error('Database error.');
        (Session.deleteMany as jest.Mock).mockRejectedValue(dbError);

        // Act & Assert
        await expect(deleteMovieService(nonExistentId)).rejects.toThrow(dbError);
        expect(Session.deleteMany).toHaveBeenCalledWith({movieId: nonExistentId}, { session: mockSession});
        // 1. Verify transaction flow
        expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
        expect(mockSession.commitTransaction).not.toHaveBeenCalled();
        expect(mockSession.abortTransaction).toHaveBeenCalledTimes(1);
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
        // 2. Ensure 2 db operation is was never attempted
        expect(Movie.findByIdAndDelete).not.toHaveBeenCalled();
    })
});
