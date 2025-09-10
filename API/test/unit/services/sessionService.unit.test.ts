import mongoose from 'mongoose';
import { createSessionService, getSessionSeatLayoutService, getSessionsWithFiltersService } from '../../../src/services';
import Session from '../../../src/models/session.model';
import Hall, { IHall } from '../../../src/models/hall.model';
import Movie from '../../../src/models/movie.model';
import Cinema from '../../../src/models/cinema.model';
import * as mappingFunctions from '../../../src/utils/mapping-functions';
import * as paginationHelper from '../../../src/utils/PaginationUtils';
import * as reservationHelpers from '../../../src/utils/reservation.helpers';
import { IHallSeatLayoutResponse, ISeatWithAvailability, sessionDisplayPaginatedSchema, TSessionDisplay } from '../../../src/utils';
import { describe } from 'node:test';
import { populate } from 'dotenv';
import { getSessionSeatLayout } from '../../../src/controllers/session.controller';
import { SeatType } from '../../../src/models';

// Mock all external model dependencies
jest.mock('../../../src/models/session.model');
jest.mock('../../../src/models/hall.model');
jest.mock('../../../src/models/movie.model');
jest.mock('../../../src/models/cinema.model');
jest.mock('../../../src/utils/reservation.helpers');
jest.mock('../../../src/utils/SessionValidationSchema', () => ({
    sessionDisplayPaginatedSchema: {
        parse: jest.fn((data) => data) // Mock parse to return the input data
    }
}));

jest.spyOn(mappingFunctions, 'mapSessionToDisplayDTO');
jest.spyOn(paginationHelper, 'paginate');

describe('Session Service unit tests', () => {
    /**
     * Unit tests for createSessionService
     *
     * This test suite verifies the logic for creating session
     * It ensures that:
     * - That the service creates session if providet with valid and available data.
     * - That the service throws error if hall, movie or cinema dont exist.
     * - That the service propagate error thrown by the database
     * - That throws error if there is overlapse of session in  the hall.
     */

    describe('createSessionService', () => {
        // Define common test data to be reused across tests.
        const sessionData = {
            hallId: new mongoose.Types.ObjectId().toString(),
            movieId: new mongoose.Types.ObjectId().toString(),
            cinemaId: new mongoose.Types.ObjectId().toString(),
            startTime: new Date('2025-12-01T10:00:00.000Z'),
            endTime: new Date('2025-12-01T12:00:00.000Z')
        };

        const mockHall = { _id: sessionData.hallId, name: 'Hall 1', seats: new Array(50) };
        const mockMovie = { _id: sessionData.movieId, title: 'Test Movie' };
        const mockCinema = { _id: sessionData.cinemaId, name: 'Test Cinema', city: 'Test city' };

        /**
         * @description Verifies that a session is successfully created and a DTO is returned
         * when all prerequsite documents exist and there are no scheduling conflicts.
         */
        it('should create session if all data is valid', async () => {
            // Arrange
            jest.clearAllMocks();
            (Hall.findById as jest.Mock).mockResolvedValue(mockHall);
            (Movie.findById as jest.Mock).mockResolvedValue(mockMovie);
            (Cinema.findById as jest.Mock).mockResolvedValue(mockCinema);
            (Session.findOne as jest.Mock).mockResolvedValue(null);

            const mockSavedSession = {
                ...sessionData,
                availableSeats: mockHall.seats.length,
                save: jest.fn().mockResolvedValue(this)
            };

            (Session as unknown as jest.Mock).mockImplementation(() => mockSavedSession);

            const expectedDto: TSessionDisplay = {
                _id: new mongoose.Types.ObjectId().toString(),
                movieName: mockMovie.title,
                hallName: mockHall.name,
                cinemaName: mockCinema.name,
                startTime: sessionData.startTime.toISOString(),
                endTime: sessionData.endTime.toISOString(),
                availableSeats: mockHall.seats.length,
                cinemaId: sessionData.cinemaId,
                hallId: sessionData.hallId,
                movieId: sessionData.movieId
            };
            (mappingFunctions.mapSessionToDisplayDTO as jest.Mock).mockReturnValue(expectedDto);

            // Act
            const result = await createSessionService(sessionData as any);

            // Assert
            expect(Hall.findById).toHaveBeenCalledWith(sessionData.hallId);
            expect(Movie.findById).toHaveBeenCalledWith(sessionData.movieId);
            expect(Cinema.findById).toHaveBeenCalledWith(sessionData.cinemaId);
            expect(Session.findOne).toHaveBeenCalledTimes(1);
            expect(mockSavedSession.save).toHaveBeenCalledTimes(1);
            expect(mappingFunctions.mapSessionToDisplayDTO).toHaveBeenCalledWith(mockSavedSession, mockMovie, mockHall, mockCinema);
            expect(result).toEqual(expectedDto);
        });

        /**
         * @description Ensures the service throws a `Hall not found` error if the provided hall id dont exist.
         */
        it('should throw Hall not found if hall dosnt exist', async () => {
            // Arrange
            jest.clearAllMocks();
            (Hall.findById as jest.Mock).mockResolvedValue(null);
            (Movie.findById as jest.Mock).mockResolvedValue(mockMovie);
            (Cinema.findById as jest.Mock).mockResolvedValue(mockCinema);

            // Act & Assert
            await expect(createSessionService(sessionData as any)).rejects.toThrow('Hall not found');
        });

        /**
         * @description Ensures the service throws a `Movie not found` error if the provided hall id dont exist.
         */
        it('should throw Movie not found if movie dosnt exist', async () => {
            // Arrange
            jest.clearAllMocks();
            (Hall.findById as jest.Mock).mockResolvedValue(mockHall);
            (Movie.findById as jest.Mock).mockResolvedValue(null);
            (Cinema.findById as jest.Mock).mockResolvedValue(mockCinema);

            // Act & Assert
            await expect(createSessionService(sessionData as any)).rejects.toThrow('Movie not found');
        });

        /**
         * @description Ensures the service throws a `Cinema not found` error if the provided hall id dont exist.
         */
        it('should throw Cinema not found if cinema dont exist', async () => {
            // Arrange
            jest.clearAllMocks();
            (Hall.findById as jest.Mock).mockResolvedValue(mockHall);
            (Movie.findById as jest.Mock).mockResolvedValue(mockMovie);
            (Cinema.findById as jest.Mock).mockResolvedValue(null);

            // Act & Assert
            await expect(createSessionService(sessionData as any)).rejects.toThrow('Cinema not found');
        });

        /**
         *@description Verifies that the service prevents booking a hall if an overlapping session exist.
         */
        it('should throw Hall is alredy booked for this time slot. If there is another session that exists', async () => {
            // Arrange
            jest.clearAllMocks();
            (Hall.findById as jest.Mock).mockResolvedValue(mockHall);
            (Movie.findById as jest.Mock).mockResolvedValue(mockMovie);
            (Cinema.findById as jest.Mock).mockResolvedValue(mockCinema);
            (Session.findOne as jest.Mock).mockResolvedValue({ _id: 'some-existing-sesion' });

            // Act & Assert
            await expect(createSessionService(sessionData as any)).rejects.toThrow('Hall is alredy booked for this time slot.');
        });

        /**
         * @description Checks that any unexpected database errors during prerequisites fetching are properly propagated.
         */
        it('should propagate database error if occures', async () => {
            // Arrange
            jest.clearAllMocks();
            const dbError = new Error('Database error');
            (Hall.findById as jest.Mock).mockRejectedValue(dbError);
            (Movie.findById as jest.Mock).mockResolvedValue(mockMovie);
            (Cinema.findById as jest.Mock).mockResolvedValue(mockCinema);

            // Act & Assert
            await expect(createSessionService(sessionData as any)).rejects.toThrow('Database error');
        });
    });

    /**
     * Unit test for getSessionsWithFiltersService
     *
     * This test suite verifies the logic of getting paginated filtered sessions DTO object
     * It ensures that:
     * - That the service returns paginated list of sessions DTO if no filter is applied.
     * - That the service correctly filters session by specific date
     * - That the service correctly build a query with multible filters.
     * - That the service filters out session where related documents fails to populate.
     * - That the service returns and empty data array if no session are found.
     */

    describe('getSessionsWithFiltersService', async () => {
        // Define mock data to be reused
        const mockSessionId = new mongoose.Types.ObjectId();
        const mockCinema = { _id: new mongoose.Types.ObjectId(), name: 'Test Cinema' };
        const mockHall = { _id: new mongoose.Types.ObjectId(), name: 'Hall 5' };
        const mockMovie = { _id: new mongoose.Types.ObjectId(), title: 'The Big Test' };

        const mockSessionDocument = {
            _id: mockSessionId,
            cinemaId: mockCinema._id,
            hallId: mockHall._id,
            movieId: mockMovie._id,
            startTime: new Date('2025-10-10T14:00:00.000Z'),
            endTime: new Date('2025-10-10T16:00:00.000Z'),
            availableSeats: 50
        };

        const mockPopulatedSession = {
            ...mockSessionDocument,
            cinemaId: mockCinema,
            hallId: mockHall,
            movieId: mockMovie
        };

        /**
         * @description Verifies that the service returns a correctly paginated and formated
         * list of session when no filters are applied.
         */
        it('should return a paginated list of all sessions when no filters are provided', async () => {
            // Arrange
            jest.clearAllMocks();
            const filters = { page: 1, limit: 10 };
            const paginationResult = {
                data: [mockSessionDocument],
                totalPages: 1,
                currentPage: 1
            };

            (paginationHelper.paginate as jest.Mock).mockResolvedValue(paginationResult);
            (Session.populate as jest.Mock).mockResolvedValue([mockPopulatedSession]);

            // Act
            const result = await getSessionsWithFiltersService(filters);

            // Assert
            expect(paginationHelper.paginate).toHaveBeenCalledWith(Session, {
                page: 1,
                limit: 10,
                searchQuery: {}
            });
            expect(Session.populate).toHaveBeenCalledTimes(1);
            expect(result.data[0].movieName).toBe('The Big Test');
            expect(result.data[0].cinemaName).toBe('Test Cinema');
            expect(sessionDisplayPaginatedSchema.parse).toHaveBeenCalledTimes(1);
        });

        /**
         * @description Tests the service's ability to filter sessions by a specific date,
         * ensuring the date range query is constructed correctly
         */
        it('should filter by e specific date', async () => {
            // Arrange
            jest.clearAllMocks();
            const filters = { page: 1, limit: 10, date: '2025-10-10' };
            (paginationHelper.paginate as jest.Mock).mockResolvedValue({ data: {}, totalPages: 0, currentPage: 1 });
            (Session.populate as jest.Mock).mockResolvedValue([]);

            // Act
            await getSessionsWithFiltersService(filters);

            // Assert
            const expectedQuery = {
                startTime: {
                    $gte: new Date('2025-10-10T00:00:00.000Z'),
                    $lte: new Date('2025-10-10T23:59:59.999Z')
                }
            };
            expect(paginationHelper.paginate).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    searchQuery: expectedQuery,
                    page: 1,
                    limit: 10
                })
            );
        });

        /**
         * @description Verifies that multiple filters are comined correctly into a single database query.
         */
        it('should correctly build a query with multiple combined filters', async () => {
            // Arrange
            jest.clearAllMocks();
            const filters = {
                page: 1,
                limit: 10,
                cinemaId: mockCinema._id.toString(),
                movieId: mockMovie._id.toString(),
                minSeatsRequired: 20
            };

            (paginationHelper.paginate as jest.Mock).mockResolvedValue({ data: [], totalPages: 0, currentPage: 1 });
            (Session.populate as jest.Mock).mockResolvedValue([]);

            // Act
            await getSessionsWithFiltersService(filters);

            // Assert
            const expectedQuery = {
                cinemaId: mockCinema._id,
                movieId: mockMovie._id,
                availableSeats: { $gte: 20 }
            };

            expect(paginationHelper.paginate).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    searchQuery: expectedQuery,
                    page: 1,
                    limit: 10
                })
            );
        });

        /**
         * @description Ensures that if a session's related document (e.g., a deleted hall)
         * fails to populate , that session is filtered out and not included in the final DTO array
         */
        it('should filter out sessions where related document fails to populate', async () => {
            // Arrange
            jest.clearAllMocks();
            const filters = { page: 1, limit: 10 };
            const sessionWithMissingHall = { ...mockSessionDocument, hallId: null }; // simulate missing hall
            (paginationHelper.paginate as jest.Mock).mockResolvedValue({ data: [mockSessionDocument], totalPages: 1, currentPage: 1 });
            (Session.populate as jest.Mock).mockResolvedValue([sessionWithMissingHall]);

            // Act
            const result = await getSessionsWithFiltersService(filters);

            // Assert
            expect(result.data.length).toBe(0);
        });

        /**
         * @description Verifies that the service returns a correctly structured empty response
         * when no sessions match the provided filter criteria.
         */
        it('should return an empty data array when no sessions match the filters', async () => {
            // Arrange
            jest.clearAllMocks();
            const filters = {
                page: 1,
                limit: 10,
                movieId: mockMovie._id.toString()
            };

            (paginationHelper.paginate as jest.Mock).mockResolvedValue({ data: [], totalPages: 0, currentPage: 1 });
            (Session.populate as jest.Mock).mockResolvedValue([]);

            // Act
            const result = await getSessionsWithFiltersService(filters);

            // Assert
            expect(result.data).toEqual([]);
            expect(result.totalPages).toBe(0);
            expect(result.currentPage).toBe(1);
        });
    });

    describe('getSessionSeatLayoutService', () => {
        // Mock Data Setup
        const mockSessionId = new mongoose.Types.ObjectId().toString();
        const mockSeat1Id = new mongoose.Types.ObjectId();
        const mockSeat2Id = new mongoose.Types.ObjectId();

        const mockHall = {
            _id: new mongoose.Types.ObjectId(),
            name: 'Grand Hall',
            layout: { rows: 10, columns: 10 },
            seats: [
                { _id: mockSeat1Id, row: 1, column: 1, seatNumber: 'A1', type: 'couple', price: 10 },
                { _id: mockSeat2Id, row: 1, column: 2, seatNumber: 'A2', type: 'vip', price: 20 }
            ] as any[],
            cinemaId: new mongoose.Types.ObjectId()
        };

        const mockSessionWithHall = {
            _id: new mongoose.Types.ObjectId(mockSessionId),
            hallId: mockHall
        };

        const mockLayoutResponse: IHallSeatLayoutResponse = {
            sessionId: mockSessionId,
            hallId: mockHall._id.toString(),
            hallName: 'Grand Hall',
            hallLayout: { rows: 10, columns: 10 },
            seats: [] // This will be populated in the test
        };

        const mapSpy = jest.spyOn(mappingFunctions, 'mapToHallSeatLayoutDTO');

        /**
         * @description Verifies that the service correctly returns a seat layout with availability
         * when the session and hall exist, and some seats are booked.
         */
        it('should return a layout of the seats with availability status', async () => {
            // Arrange
            jest.clearAllMocks();
            (Session.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnValue(mockSessionWithHall)
            });

            // Simulate that seat A2 is booked
            const bookedSeats = new Set([mockSeat2Id.toString()]);
            (reservationHelpers.getBookedSeatIdsForSession as jest.Mock).mockResolvedValue(bookedSeats);
            mapSpy.mockReturnValue(mockLayoutResponse);

            // Act
            const result = await getSessionSeatLayoutService(mockSessionId);

            // Assert
            expect(Session.findById).toHaveBeenCalledWith(mockSessionId);
            expect(reservationHelpers.getBookedSeatIdsForSession).toHaveBeenCalledWith(mockSessionWithHall._id);
            // Verify the logic that determines seat availability before mapping
            const expectedSeatsWithAvailability: ISeatWithAvailability[] = [
                { ...mockHall.seats[0], _id: mockSeat1Id.toString(), isAvailable: true, type: SeatType.COUPLE }, // A1 is available
                { ...mockHall.seats[1], _id: mockSeat2Id.toString(), isAvailable: false, type: SeatType.VIP } // A2 is not available
            ];
            expect(mapSpy).toHaveBeenCalledWith(mockSessionWithHall._id, mockHall, expectedSeatsWithAvailability);
            expect(result).toEqual(mockLayoutResponse);
        });

        /**
         * @description Ensures the service throws a specific error if the session Id is not found.
         */
        it('should throw error if session is not found', async () => {
            // Arrange
            jest.clearAllMocks();
            (Session.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(null) // simulates session not found
            });

            // Act & Assert
            await expect(getSessionSeatLayoutService(mockSessionId)).rejects.toThrow(`Session with ID ${mockSessionId} not found`);
        });

        /**
         * @description Ensures the service throws error if the session exists but its associate hall does not.
         */
        it('should throw error if Hall is not found', async () => {
            // Arrange
            const sessionWithoutHall = { ...mockSessionWithHall, hallId: null };
            jest.clearAllMocks();
            (Session.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnValue(sessionWithoutHall)
            });

            // Act & Assert
            await expect(getSessionSeatLayoutService(mockSessionId)).rejects.toThrow(`Hall for session ${sessionWithoutHall._id} not found`);
        });

        /**
         * @description Verifies that if the primary database quer fails, the error is propagated.
         */
        it('should propagate error from database if database throws error', async () => {
            // Arrange
            jest.clearAllMocks();
            const dbError = new Error('Database Error');
            (Session.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockRejectedValue(dbError) // Simulate db error
            })

            // Act & Assert
            await expect(getSessionSeatLayoutService(mockSessionId)).rejects.toThrow('Database Error');
        });

        /**
         * @description Verifies that if the helper function to getBookedSeats fails, the error is propagated
         */
        it('should propagate an error if getBookedSeatIdsForSession fails', async () => {
            // Arrange
            jest.clearAllMocks();
            const helperError = new Error('Helper Error');
            (Session.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockSessionWithHall)
            });
            (reservationHelpers.getBookedSeatIdsForSession as jest.Mock).mockRejectedValue(helperError);
            
            // Act & Arrange
            await expect(getSessionSeatLayoutService(mockSessionId)).rejects.toThrow('Helper Error');
            expect(Session.findById).toHaveBeenCalledWith(mockSessionId);
        })
    });
});
