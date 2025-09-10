import mongoose from 'mongoose';
import Session from '../../../src/models/session.model';
import { getCinemaCityByMovieIdService, getCinemasByCityAndMovieService } from '../../../src/services';
import { cinemaSchema, TCinema } from '../../../src/utils';
import { describe } from 'node:test';
import { mapCinemaToTCinema } from '../../../src/utils/mapping-functions';

jest.mock('../../../src/models/session.model');

// Helper method that creates Mock Cinema documents
const createMockDbCinemas = () => [
    {
        _id: new mongoose.Types.ObjectId(),
        city: 'Metropolis',
        name: 'Metro Cinema',
        halls: [],
        snacks: [],
        __v: 0
    },
    {
        _id: new mongoose.Types.ObjectId(),
        city: 'Metropolis',
        name: 'Metro Cinema 2',
        halls: [],
        snacks: [],
        __v: 0
    }
];

/**
 * Unit tests for getCinemaCityByMovieIdService
 *
 * This test suite verifies the service's logic for finding a unique, sorted list of cities for given movie.
 * It ensures that:
 * - That the service validates the movie ID format correctly, throwing an error for invalid IDs.
 * - That `Session.aggregate` method is called with the correct, multi-stage pipeline.
 * - That the service correctly maps the raw aggregation result to simple array of strings.
 * - That the city returns an empty array if no cities are found.
 * - Database errors are cought, logged and re-thrown as a user friendly error.
 */
describe('getCinemaCityByMovieIdService', () => {
    it('should throw an "Invalid MovieId" error for an invalid movieId', async () => {
        // Arrange
        jest.clearAllMocks();
        const invalidMovieId = 'not-a-valid-objectId';

        // Act & Assert
        await expect(getCinemaCityByMovieIdService(invalidMovieId)).rejects.toThrow('Invalid MovieId');
        expect(Session.aggregate).not.toHaveBeenCalled();
    });

    it('should return a sorted array of unique city names on successful aggregation', async () => {
        // Arrange
        jest.clearAllMocks();
        const movieId = new mongoose.Types.ObjectId();
        const mockAggregationResult = [{ _id: 'Gotham' }, { _id: 'Sofia' }, { _id: 'Plovdiv' }];
        (Session.aggregate as jest.Mock).mockResolvedValue(mockAggregationResult);

        // Act
        const actualResult = await getCinemaCityByMovieIdService(movieId);

        // Assert
        expect(actualResult).toEqual(['Gotham', 'Sofia', 'Plovdiv']);
        expect(Session.aggregate).toHaveBeenCalledTimes(1);

        // verify the structure of the aggragation pipeline
        const expectedPipeline = [
            { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
            { $lookup: { from: 'cinemas', localField: 'cinemaId', foreignField: '_id', as: 'cinemaDetails' } },
            { $unwind: '$cinemaDetails' },
            { $group: { _id: '$cinemaDetails.city' } },
            { $sort: { _id: 1 } }
        ];
        expect(Session.aggregate).toHaveBeenCalledWith(expectedPipeline);
    });

    it('should return an empty array if the aggregation finds no matching cities', async () => {
        // Arrange
        jest.clearAllMocks();
        const movieId = new mongoose.Types.ObjectId();
        (Session.aggregate as jest.Mock).mockResolvedValue([]);

        // Act
        const actualResult = await getCinemaCityByMovieIdService(movieId);

        // Assert
        expect(actualResult).toEqual([]);
        expect(Session.aggregate).toHaveBeenCalledTimes(1);
    });

    it('should throw a custom error if the database aggregation fails', async () => {
        // Arrange
        const movieId = new mongoose.Types.ObjectId();
        const dbError = new Error('Database connection error');
        (Session.aggregate as jest.Mock).mockRejectedValue(dbError);

        // Act and Assert
        await expect(getCinemaCityByMovieIdService(movieId)).rejects.toThrow('Failed to fetch cinema cities');
    });
});

/**
 * Unit tests for getCinemasByCityAndMovieService
 *
 * This test suite verifies the service's logic for finding cinemas showing a specific movie in a given city.
 * - The service validates the movie ID format correctly.
 * - The `Session.aggregate` function is called with the correct, multi-stage pipeline.
 * - The service correctly returns the data provided by the aggregation.
 * - Database errors are cought and re-thrown as a user-friendly error.
 */
describe('getCinemasByCityAndMovieService', () => {
    it('should throw an "Invalid Movie ID format" error for an invalid movieId', async () => {
        // Arrange
        jest.clearAllMocks();
        const city = 'New York';
        const invalidMovieId = 'not-an-object';

        // Act & Assert
        await expect(getCinemasByCityAndMovieService(city, invalidMovieId)).rejects.toThrow('Invalid Movie ID format');
        expect(Session.aggregate).not.toHaveBeenCalled();
    });

    it('should return an array of cinemas DTOs on successful aggregation', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockCinemas = createMockDbCinemas() as any;
        const movieId = new mongoose.Types.ObjectId();
        const city = 'Metropolis';
        (Session.aggregate as jest.Mock).mockReturnValue(mockCinemas);
        const mockArraySchema = {
            parse: jest.fn((data) => data)
        };
        jest.spyOn(cinemaSchema, 'array').mockReturnValue(mockArraySchema as any);
        // Act
        const actualResult = await getCinemasByCityAndMovieService(city, movieId);
        // Assert
        const expectedResult = mockCinemas.map(mapCinemaToTCinema);
        expect(mockArraySchema.parse).toHaveBeenCalledTimes(1);
        expect(mockArraySchema.parse).toHaveBeenCalledWith(expectedResult);

        // Validate aggregation pipeline workflow
        const expectedPipeline = [
            { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
            {
                $lookup: {
                    from: 'cinemas',
                    localField: 'cinemaId',
                    foreignField: '_id',
                    as: 'cinemaDetails'
                }
            },
            { $unwind: '$cinemaDetails' },
            { $match: { 'cinemaDetails.city': { $regex: `^${city}$`, $options: 'i' } } },
            {
                $group: {
                    _id: '$cinemaDetails._id',
                    doc: { $first: '$cinemaDetails' }
                }
            },
            { $replaceRoot: { newRoot: '$doc' } }
        ];
        expect(Session.aggregate).toHaveBeenCalledTimes(1);
        expect(Session.aggregate).toHaveBeenCalledWith(expectedPipeline);
        expect(actualResult).toEqual(expectedResult);
    });

    it('should throw generic error if database error occures', async () => {
        // Arrange
        jest.clearAllMocks();
        const movieId = new mongoose.Types.ObjectId();
        const city = 'Metropolis';
        const dbError = new Error('Database error');
        (Session.aggregate as jest.Mock).mockRejectedValue(dbError);

        // Act & Assert
        await expect(getCinemasByCityAndMovieService(city, movieId)).rejects.toThrow(
            `Failed to retrieve cinemas for city ${city} and movie ${movieId}.`
        );
        expect(Session.aggregate).toHaveBeenCalledTimes(1);
    });
});
