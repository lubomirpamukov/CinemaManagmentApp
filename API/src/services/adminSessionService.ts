import mongoose from 'mongoose';
import { SessionZod, sessionSchema } from '../utils/SessionValidationSchema';
import Session from '../models/session.model';

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
