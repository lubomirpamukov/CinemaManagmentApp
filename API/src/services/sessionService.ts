import mongoose from 'mongoose';
import {
    IHallSeatLayoutResponse,
    ISeatWithAvailability,
    TSeat,
    SessionFilters,
    SessionPaginatedResponse,
    TSession,
    sessionDisplayPaginatedSchema
} from '../utils';
import Session from '../models/session.model';
import Reservation from '../models/reservation.model';
import { TSessionDisplay } from '../utils';
import { paginate } from '../utils';
import Hall, { IHall, ISeat as IHallSeatDefinition } from '../models/hall.model';
import { getBookedSeatIdsForSession } from '../utils/reservation.helpers';
import { SeatType } from '../models';
import Movie from '../models/movie.model';
import Cinema from '../models/cinema.model';
import { mapSessionToDisplayDTO, mapToHallSeatLayoutDTO } from '../utils/mapping-functions';

/**
 * Creates a new session after checking business logic constraints.
 * Assumes the input data has already been validated for shape and type by the controller.
 *
 * @param {TSession} sessionData The validated session data DTO, containing startTime endTime.
 * @throws {Error} `Hall not found`, `Movie not found`, `Hall is alredy booked for this time slot`.
 * @returns {Promise<TSession>} A promise that resolves to the DTO of the newly created session.
 */
export const createSessionService = async (sessionData: TSession): Promise<TSessionDisplay> => {
    const { hallId, movieId, cinemaId, startTime, endTime } = sessionData;

    const [hall, movie, cinema] = await Promise.all([Hall.findById(hallId), Movie.findById(movieId), Cinema.findById(cinemaId)]);

    if (!hall) throw new Error('Hall not found');
    if (!movie) throw new Error('Movie not found');
    if (!cinema) throw new Error('Cinema not found');

    // Checks for overlapping sessions using the provided startTime and endTime
    const existingSession = await Session.findOne({
        hallId,
        $or: [
            // Case 1: An existing session starts during the new session
            { startTime: { $lt: endTime, $gte: startTime } },

            // Case 2: An existing session ends during the new session
            { endTime: { $gt: startTime, $lte: endTime } },

            // Case 3: An existing session completely contains the new session
            { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        ]
    });

    if (existingSession) {
        throw new Error('Hall is alredy booked for this time slot.');
    }

    // Get seats count from hall
    const availableSeats = hall.seats.length;

    const newSession = new Session({
        ...sessionData,
        availableSeats: availableSeats
    });
    await newSession.save();

    return mapSessionToDisplayDTO(newSession, movie, hall, cinema)
};

/**
 * Retrieves a paginated list of sessions based on a set of filters.
 *
 * @param {SessionFilters} filters An object containing validated filter criteria.
 * @returns {Promise<SessionPaginatedResponse>} A promise that resolves to a paginated list of session DTOs or empty arary.
 */
export const getSessionsWithFiltersService = async (filters: SessionFilters): Promise<SessionPaginatedResponse> => {
    const { cinemaId, hallId, movieId, date, page, limit, minSeatsRequired } = filters;
    const query: any = {};

    if (cinemaId) {
        query.cinemaId = new mongoose.Types.ObjectId(cinemaId);
    }
    if (hallId) {
        query.hallId = new mongoose.Types.ObjectId(hallId);
    }
    if (movieId) {
        query.movieId = new mongoose.Types.ObjectId(movieId);
    }

    // If a date is provided, create a range for that entire day.
    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // Query for sessions where the startTime is within the selected day.
        query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    if (typeof minSeatsRequired === 'number' && minSeatsRequired > 0) {
        query.availableSeats = { $gte: minSeatsRequired };
    }

    const paginationResult = await paginate(Session, {
        page,
        limit,
        searchQuery: query
    });

    const populatedSessions = await Session.populate(paginationResult.data, [
        { path: 'cinemaId', select: 'name' },
        { path: 'hallId', select: 'name' },
        { path: 'movieId', select: 'title' }
    ]);

    const formattedSessions: TSessionDisplay[] = populatedSessions
        .filter((session) => session.hallId && session.cinemaId && session.movieId)
        .map((session) => {
            const populatedSession = session as any; // Using 'any' for simplicity with populated fields

            return {
                _id: populatedSession._id.toString(),
                cinemaId: populatedSession.cinemaId?._id?.toString(),
                cinemaName: populatedSession.cinemaId.name,
                hallId: populatedSession.hallId?._id?.toString(),
                hallName: populatedSession.hallId?.name,
                movieId: populatedSession.movieId?._id.toString(),
                movieName: populatedSession.movieId?.title,
                // Convert Date objects to ISO strings for the DTO
                startTime: populatedSession.startTime.toISOString(),
                endTime: populatedSession.endTime.toISOString(),
                availableSeats: populatedSession.availableSeats
            };
        });

    const validatedSessions = sessionDisplayPaginatedSchema.parse({
        data: formattedSessions,
        totalPages: paginationResult.totalPages,
        currentPage: paginationResult.currentPage
    });

    return validatedSessions;
};

/**
 * Retrieves the complete layout for a given session, including the availability status of each seat.
 *
 * @param {string} sessionId The ID of the session to retrieve the seat layout for.
 * @throws {Error} Throws `Session not found` if the session ID is invalid or does not exist.
 * @throws {Error} Throws `Hall for this session not found` if the referenced hall has been deleted.
 * @returns {Promise<IHallSeatLayoutResponse>} A promise that resolves to the complete hall seat layout.
 */
export const getSessionSeatLayoutService = async (sessionId: string): Promise<IHallSeatLayoutResponse | null> => {
    // Fetch session
    const session = await Session.findById(sessionId).populate<{ hallId: IHall }>('hallId').lean();

    if (!session) {
        throw new Error(`Session with ID ${sessionId} not found.`);
    }

    if (!session.hallId) {
        throw new Error(`Hall for session ${session._id} not found`);
    }

    const hall = session.hallId;

    // Get booked seats for this specific session
    const bookedSeats = await getBookedSeatIdsForSession(session._id);

    // Map over halls seats to determine availability
    const seatsWithAvailability: ISeatWithAvailability[] = hall.seats.map((hallSeat: IHallSeatDefinition) => {
        const isAvaliable = !bookedSeats.has(hallSeat._id.toString());
        return {
            ...hallSeat,
            _id: hallSeat._id.toString(),
            type: hallSeat.type as SeatType,
            isAvailable: isAvaliable
        };
    });

    return mapToHallSeatLayoutDTO(session._id, hall, seatsWithAvailability)
};

/**
 * Retrieves a list of all seats that are currently reserved for a specific session.
 * This is done by finding all reservations for the session and flattening their seat arrays.
 *
 * @param {string} sessionId The ID of the session to check for reserved seats.
 * @throws {Error} Throws `Invalid session ID format` if the ID is not a valid MongoDB ObjectId.
 * @throws {Error} Throws `Failed to retrieve reservation for session...` on database errors.
 * @returns {Promise<TSeat[]>} A promise that resolves to an array of reserved seat DTOs.
 */
export const getReservedSessionSeatsService = async (sessionId: string): Promise<TSeat[]> => {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        throw new Error('Invalid session ID format');
    }

    try {
        //Find all reservations for the given session id
        const reservations = await Reservation.find({ sessionId: new mongoose.Types.ObjectId(sessionId) })
            .select('seats')
            .lean();

        const reservedSeats: TSeat[] = reservations.flatMap((reservation) =>
            reservation.seats.map((seat) => ({
                originalSeatId: seat.originalSeatId.toString(),
                row: seat.row,
                column: seat.column,
                seatNumber: seat.seatNumber,
                type: seat.type,
                price: seat.price
            }))
        );

        return reservedSeats;
    } catch (error) {
        console.error(`Error in getReservationsBySessionIdService for session ${sessionId}:`, error);
        throw new Error(`Failed to retrieve reservations for session ${sessionId}.`);
    }
};

/**
 * Retrieves a sorted list of unique future date on wich a specific movie is showing at a specific cinema.
 * This is used to populate a date picker on the frontend, allowing users to see wich days have available sessions.
 * @param {string} movieId The ID of the movie to find available dates for
 * @param {string} cinemaId The ID of the cinema to search within
 * @throws {Error} Throws if the movieId or cinemaId are not valid MongoDB ObjectId formats.
 * @throws {Error} Throws a generic error if the database query fails
 * @returns {Promise<string[]>} A promise that resolves to a sorted array of unique date strings
 */
export const getAvailableDatesForMovieInCinemaService = async (movieId: string, cinemaId: string): Promise<string[]> => {
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(movieId)) throw new Error('Invalid Movie ID format.');
    if (!mongoose.Types.ObjectId.isValid(cinemaId)) throw new Error('Invalid Cinema ID format.');

    try {
        // Defne the start of todat to filter out past sessions.
        const startOfToday = new Date();
        startOfToday.setUTCHours(0, 0, 0, 0);

        // Build the query to find the future sessions for the specific movie and cinema.
        const query = {
            movieId: new mongoose.Types.ObjectId(movieId),
            cinemaId: new mongoose.Types.ObjectId(cinemaId),
            startTime: { $gte: startOfToday } // only include sessions from today onwards
        };

        // Use distinct() to efficiently get unique startTime values from the database.
        const distinctStartTimes: Date[] = await Session.distinct('startTime', query).lean();

        if (!distinctStartTimes || distinctStartTimes.length === 0) {
            return [];
        }

        // Convert date objects to unique YYYY-MM-DD date strings
        const uniqueDateStrings = [
            ...new Set(
                distinctStartTimes.map((date) => date.toISOString().slice(0, 10)) // '2025-07-18T10:00:00.000Z' -> '2025-07-18'
            )
        ];

        return uniqueDateStrings.sort();
    } catch (error: any) {
        console.error('Error fetching available dates:', error);
        throw new Error('Failed to retrieve available dates.');
    }
};
