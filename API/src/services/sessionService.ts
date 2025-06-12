import mongoose from 'mongoose';
import { SeatZod, SessionPaginatedResponse, SessionZod, sessionDisplayPaginatedSchema, sessionSchema } from '../utils';
import Session, { ISession } from '../models/session.model';
import Reservation from '../models/reservation.model';
import { SessionDisplay } from '../utils';
import { paginate } from '../utils';
import Hall, { IHall, ISeat as IHallSeatDefinition } from '../models/hall.model';
import { getBookedSeatIdsForSession } from '../utils/reservation.helpers';
import { SeatType } from '../models';

export const createSessionService = async (sessionData: SessionZod) => {
    const parsed = sessionSchema.parse(sessionData);

    if (parsed.startTime >= parsed.endTime) {
        throw new Error('Start time must be before end time');
    }

    const overlappingSession = await Session.findOne({
        hallId: new mongoose.Types.ObjectId(parsed.hallId),
        date: parsed.date,
        $or: [
            {
                startTime: { $lt: parsed.endTime },
                endTime: { $gt: parsed.startTime }
            }
        ]
    });

    if (overlappingSession) {
        throw new Error('Session overlaps with existing sessions');
    }

    const session = await Session.create({
        ...parsed,
        cinemaId: new mongoose.Types.ObjectId(parsed.cinemaId),
        hallId: new mongoose.Types.ObjectId(parsed.hallId),
        movieId: new mongoose.Types.ObjectId(parsed.movieId)
    });

    const sessionObj = session.toObject();

    return {
        ...sessionObj,
        cinemaId: sessionObj.cinemaId.toString(),
        hallId: sessionObj.hallId.toString(),
        movieId: sessionObj.movieId.toString()
    };
};

type SessionFilters = {
    cinemaId?: string;
    hallId?: string;
    movieId?: string;
    date?: string;
    page?: number;
    limit?: number;
};

export const getSessionsWithFiltersService = async ({
    cinemaId,
    hallId,
    movieId,
    date,
    page = 1,
    limit = 10
}: SessionFilters): Promise<SessionPaginatedResponse> => {
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

    if (date) {
        query.date = date;
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

    const formattedSessions: SessionDisplay[] = populatedSessions
        .filter((session) => session.hallId && session.cinemaId && session.movieId)
        .map((session) => {
            const populatedSession = session as unknown as {
                _id: mongoose.Types.ObjectId;
                cinemaId: { _id: mongoose.Types.ObjectId; name: string };
                hallId: { _id: mongoose.Types.ObjectId; name: string };
                movieId: { _id: mongoose.Types.ObjectId; title: string };
                date: string;
                startTime: string;
                endTime: string;
            };

            return {
                _id: populatedSession._id.toString(),
                cinemaId: populatedSession.cinemaId?._id?.toString(),
                cinemaName: populatedSession.cinemaId.name,
                hallId: populatedSession.hallId?._id?.toString(),
                hallName: populatedSession.hallId?.name,
                movieId: populatedSession.movieId?._id.toString(),
                movieName: populatedSession.movieId?.title,
                date: populatedSession?.date,
                startTime: populatedSession?.startTime,
                endTime: populatedSession?.endTime
            };
        });

    const validatedSessions = sessionDisplayPaginatedSchema.parse({
        data: formattedSessions,
        totalPages: paginationResult.totalPages,
        currentPage: paginationResult.currentPage
    });

    return validatedSessions;
};

export interface ISeatWithAvailability extends Omit<IHallSeatDefinition, '_id'> {
    _id: string;
    isAvailable: boolean;
}

export type IHallSeatLayoutResponse = {
    sessionId: string;
    hallId: string;
    hallName: string;
    hallLayout: {
        rows: number;
        columns: number;
    };
    seats: ISeatWithAvailability[];
};

export const getSessionSeatLayoutService = async (sessionIdString: string): Promise<IHallSeatLayoutResponse | null> => {
    // get session
    const sessionObjectId = new mongoose.Types.ObjectId(sessionIdString);
    const session = await Session.findById(sessionObjectId);
    if (!session) {
        throw new Error(`Can't find session with Id ${sessionIdString}`);
    }

    // get hall associated with the session
    const hall = await Hall.findById(session.hallId).lean();
    if (!hall) {
        throw new Error(`Hall with Id ${session.hallId.toString()} no found!`);
    }

    //get all booked seats
    const bookedSeats = await getBookedSeatIdsForSession(sessionObjectId);

    //get all seats from hall and assign theri availability status
    const seatsWithAvailability: ISeatWithAvailability[] = hall.seats.map((hallSeat: IHallSeatDefinition) => {
        const isAvailable = !bookedSeats.has(hallSeat._id.toString());
        return {
            ...hallSeat,
            _id: hallSeat._id.toString(),
            type: hallSeat.type as SeatType,
            isAvailable: isAvailable
        };
    });

    return {
        sessionId: session._id!.toString(),
        hallId: hall._id.toString(),
        hallName: hall.name,
        hallLayout: hall.layout,
        seats: seatsWithAvailability
    };
};

export const getReservedSessionSeatsService = async (sessionId: string) => {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        throw new Error('Invalid session ID format');
    }

    try {
        //Find all reservations for the given session id
        const reservations = await Reservation.find({ sessionId: new mongoose.Types.ObjectId(sessionId) })
            .select('seats')
            .lean();

        const reservedSeats: SeatZod[] = reservations.flatMap((reservation) => {
            let reservedSeatsArray: SeatZod[] = new Array();

            reservation.seats.map((seat) => {
                const newSeat: SeatZod = {
                    originalSeatId: seat.originalSeatId.toString(),
                    row: seat.row,
                    column: seat.column,
                    seatNumber: seat.seatNumber,
                    type: seat.type,
                    price: seat.price
                };
                reservedSeatsArray.push(newSeat);
            });
            return reservedSeatsArray;
        });

        return reservedSeats;
    } catch (error) {
        console.error(`Error in getReservationsBySessionIdService for session ${sessionId}:`, error);
        throw new Error(`Failed to retrieve reservations for session ${sessionId}.`);
    }
};
