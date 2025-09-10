import mongoose from 'mongoose';
import { createReservationService, getUserReservationService, deleteReservationService } from '../../../src/services/reservationService';
import * as reservationHelpers from '../../../src/utils/reservation.helpers';
import * as mappingFunctions from '../../../src/utils/mapping-functions';
import Reservation from '../../../src/models/reservation.model';
import Session from '../../../src/models/session.model';
import Movie from '../../../src/models/movie.model';
import Cinema from '../../../src/models/cinema.model';
import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe } from 'node:test';

// Mock all external dependencies

jest.mock('../../../src/models/reservation.model');
jest.mock('../../../src/models/session.model');
jest.mock('../../../src/models/movie.model');
jest.mock('../../../src/models/cinema.model');
jest.mock('../../../src/utils/reservation.helpers');
jest.mock('../../../src/utils/mapping-functions');
jest.mock('uuid');

// Mock Mongoose transaction session
const mockDbSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn()
};

jest.spyOn(mongoose, 'startSession').mockResolvedValue(mockDbSession as any);

/**
 * @file Unit tests for the Reservation Services.
 * @description This suite covers creation, retrieval, and deletion of reservations,
 * with strong focus on mocking database interactions and transactional logic.
 */
describe('Reservation Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Tests for createReservationService
     * This suite verifies:
     * - Successful reservation creation wtihin a transaction.
     * - Correct handling of various failure scenarios (e.g., prerequisites not found, seats unavailable).
     * - Proper transaction managment (commit on success, abort on failure)
     */

    describe('createReservationService', () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const reservationInput = {
            sessionId: new mongoose.Types.ObjectId().toString(),
            seats: [{ originalSeatId: new mongoose.Types.ObjectId().toString() }],
            purchasedSnacks: [],
            status: 'PENDING'
        };

        const mockPrerequisites = {
            user: { _id: userId, reservations: [], save: jest.fn() },
            session: {
                _id: reservationInput.sessionId,
                movieId: new mongoose.Types.ObjectId(),
                cinemaId: new mongoose.Types.ObjectId(),
                availableSeats: 100,
                save: jest.fn()
            },
            hall: { _id: new mongoose.Types.ObjectId(), seats: [] }
        };

        it('should create a reservation successfully and commit the transaction', async () => {
            // Arrange
            (reservationHelpers.fetchAndValidatePrerequisites as jest.Mock).mockResolvedValue(mockPrerequisites);
            (Movie.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                session: jest.fn().mockResolvedValue({ title: 'Test Movie' })
            });
            (Cinema.findById as jest.Mock).mockReturnValue({
                lean: jest.fn().mockReturnThis(),
                session: jest.fn().mockResolvedValue({ _id: mockPrerequisites.session.cinemaId })
            });
            (reservationHelpers.getBookedSeatIdsForSession as jest.Mock).mockResolvedValue(new Set());
            (reservationHelpers.verifyAndPrepareSeatDetails as jest.Mock).mockReturnValue({
                verifiedSeatsData: [{ seatNumber: 'A1' }],
                calculatedTotalPrice: 15
            });
            (reservationHelpers.processSnacks as jest.Mock).mockReturnValue({
                purchasedSnacks: [],
                totalSnackPrice: 0
            });
            (uuidv4 as jest.Mock).mockReturnValue('mock-uuid');
            const mockReservation = { _id: new mongoose.Types.ObjectId(), ...reservationInput };
            (Reservation.create as jest.Mock).mockResolvedValue([mockReservation]);
            const mockDto = { reservationCode: 'MOCK-UUI' };
            (mappingFunctions.mapReservationToDisplayDTO as jest.Mock).mockReturnValue(mockDto);

            // Act
            const result = await createReservationService(userId, reservationInput as any);
            // Assert
            expect(result).toEqual(mockDto);
            expect(mockDbSession.startTransaction).toHaveBeenCalledTimes(1);
            expect(Reservation.create).toHaveBeenCalledTimes(1);
            expect(mockPrerequisites.session.save).toHaveBeenCalledWith({ session: mockDbSession });
            expect(mockPrerequisites.user.save).toHaveBeenCalledWith({ session: mockDbSession });
            expect(mockDbSession.commitTransaction).toHaveBeenCalledTimes(1);
            expect(mockDbSession.abortTransaction).not.toHaveBeenCalled();
            expect(mockDbSession.endSession).toHaveBeenCalledTimes(1);
        });

        it('should abort transaction if prerequisite are not found', async () => {
            // Arrange
            jest.clearAllMocks();
            const error = new Error('User not found');
            (reservationHelpers.fetchAndValidatePrerequisites as jest.Mock).mockRejectedValue(error);

            //Act & Assert
            await expect(createReservationService(userId, reservationInput as any)).rejects.toThrow('User not found');
            expect(mockDbSession.abortTransaction).toHaveBeenCalledTimes(1);
            expect(mockDbSession.commitTransaction).not.toHaveBeenCalled();
            expect(mockDbSession.endSession).toHaveBeenCalledTimes(1);
        });

        it('should abort transaction if seats are already booked', async () => {
            // Arrange
            jest.clearAllMocks();
            (reservationHelpers.fetchAndValidatePrerequisites as jest.Mock).mockResolvedValue(mockPrerequisites);
            (Movie.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                session: jest.fn().mockResolvedValue({ title: 'Test Movie' })
            });
            (Cinema.findById as jest.Mock).mockReturnValue({
                lean: jest.fn().mockReturnThis(),
                session: jest.fn().mockResolvedValue({ _id: mockPrerequisites.session.cinemaId })
            });
            // Mock that the requested seat is already booked
            (reservationHelpers.getBookedSeatIdsForSession as jest.Mock).mockResolvedValue(new Set([reservationInput.seats[0].originalSeatId]));

            // Act & Assert
            await expect(createReservationService(userId, reservationInput as any)).rejects.toThrow('Seats already booked');
            expect(mockDbSession.abortTransaction).toHaveBeenCalledTimes(1);
            expect(mockDbSession.commitTransaction).not.toHaveBeenCalled();
        });

        /**
         * @description Tests for getUserReservationService.
         * This suite verifies:
         * - Correct fetching and mapping of user reservations.
         * - Proper handling of populated fields (session, movie, hall).
         */
        describe('getUserReservationService', () => {
            it('should return a list of reservation DTOs for a user', async () => {
                // Arrange
                const filter = { userId: new mongoose.Types.ObjectId().toString() };
                const mockReservations = [
                    {
                        _id: new mongoose.Types.ObjectId(),
                        reservationCode: 'ABCDE',
                        status: 'CONFIRMED',
                        userId: filter.userId,
                        totalPrice: 50,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        seats: [],
                        purchasedSnacks: [],
                        sessionId: {
                            _id: new mongoose.Types.ObjectId(),
                            startTime: new Date(),
                            date: '2025-08-21',
                            movieId: { title: 'Test Movie' },
                            hallId: { name: 'Hall 1' }
                        }
                    }
                ];

                // Mock the chained Mongoose query
                const leanMock = jest.fn().mockResolvedValue(mockReservations);
                const populateMock = jest.fn().mockReturnValue({ lean: leanMock });
                (Reservation.find as jest.Mock).mockReturnValue({ populate: populateMock });

                // Act
                const result = await getUserReservationService(filter);

                // Assert
                expect(Reservation.find).toHaveBeenCalledWith(filter);
                expect(result).toBeInstanceOf(Array);
                expect(result[0]).toHaveProperty('movieName', 'Test Movie');
                expect(result[0]).toHaveProperty('hallName', 'Hall 1');
            });
        });

        /**
         * @description Tests for deleteReservationService.
         * This suite verifies:
         * - Successful deletion of a reservation if conditions are met.
         * - Rejection if the reservation is not found or user is unauthorized.
         * - Rejection if the deletion window (24 hours) has passed.
         */
        describe('deleteReservationService', () => {
            const reservationId = new mongoose.Types.ObjectId().toString();
            const userId = new mongoose.Types.ObjectId().toString();

            it('should delete a reservation if more than 24 hours before session', async () => {
                // Arrange
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 2); // 48 hours in the future
                const mockReservation = { _id: reservationId, userId, seats: [1, 2], sessionId: new mongoose.Types.ObjectId() };
                const mockSession = { _id: mockReservation.sessionId, startTime: futureDate };

                (Reservation.findById as jest.Mock).mockResolvedValue(mockReservation);
                (Session.findById as jest.Mock).mockResolvedValue(mockSession);
                (Reservation.findByIdAndDelete as jest.Mock).mockResolvedValue(true);
                (Session.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

                // Act
                await deleteReservationService(reservationId, userId, 'user');

                // Assert
                expect(Reservation.findByIdAndDelete).toHaveBeenCalledWith(reservationId);
                expect(Session.findByIdAndUpdate).toHaveBeenCalledWith(mockReservation.sessionId, {
                    $inc: { availableSeats: mockReservation.seats.length }
                });
            });

            it('should throw an error if trying to delete less than 24 hours before session', async () => {
                // Arrange
                const pastDate = new Date();
                pastDate.setHours(pastDate.getHours() + 12); // 12 hours in the future
                const mockReservation = { _id: reservationId, userId, sessionId: new mongoose.Types.ObjectId() };
                const mockSession = { _id: mockReservation.sessionId, startTime: pastDate };

                (Reservation.findById as jest.Mock).mockResolvedValue(mockReservation);
                (Session.findById as jest.Mock).mockResolvedValue(mockSession);

                // Act & Assert
                await expect(deleteReservationService(reservationId, userId, 'user')).rejects.toThrow(
                    'Reservations can only be deleted more than 24 hours before the session.'
                );
            });

            it('should throw an error if user is unauthorized', async () => {
                // Arrange
                const anotherUserId = new mongoose.Types.ObjectId().toString();
                const mockReservation = { _id: reservationId, userId: anotherUserId };
                (Reservation.findById as jest.Mock).mockResolvedValue(mockReservation);

                // Act & Assert
                await expect(deleteReservationService(reservationId, userId, 'user')).rejects.toThrow('Unauthorized');
            });
        });
    });
});
