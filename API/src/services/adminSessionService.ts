import mongoose from 'mongoose';
import { SessionPaginatedResponse, SessionZod, sessionDisplayPaginatedSchema, sessionSchema } from '../utils';
import Session from '../models/session.model';
import { SessionDisplay } from '../utils';
import { paginate } from '../utils';
import { totalmem } from 'node:os';

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

export const getSessionsWithFiltersService = async ({ cinemaId, hallId, movieId, date, page = 1, limit = 10 }: SessionFilters): Promise<SessionPaginatedResponse> => {
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

    const formattedSessions: SessionDisplay[] = populatedSessions.map((session) => {
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
            cinemaId: populatedSession.cinemaId._id.toString(),
            cinemaName: populatedSession.cinemaId.name,
            hallId: populatedSession.hallId._id.toString(),
            hallName: populatedSession.hallId.name,
            movieId: populatedSession.movieId._id.toString(),
            movieName: populatedSession.movieId.title,
            date: populatedSession.date,
            startTime: populatedSession.startTime,
            endTime: populatedSession.endTime
        };
    });

    const validatedSessions = sessionDisplayPaginatedSchema.parse({
        data:formattedSessions,
        totalPages: paginationResult.totalPages,
        currentPage: paginationResult.currentPage
    })

    return validatedSessions
};
