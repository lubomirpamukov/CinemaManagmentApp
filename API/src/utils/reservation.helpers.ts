import mongoose from 'mongoose';
import { IUser, ISession, IHall, ReservationStatus, IReservedSeat } from '../models';
import User from '../models/user.model';
import Session from '../models/session.model';
import Hall from '../models/hall.model';
import Reservation from '../models/reservation.model';

// Helper to fetch and validate prerequisite entities
type ReservationPrerequisites = {
    user: IUser;
    session: ISession;
    hall: IHall;
};

export const fetchAndValidatePrerequisites = async (userId: string, sessionId: string): Promise<ReservationPrerequisites> => {
    // check if user exist
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const user = await User.findById(userObjectId);
    if (!user) {
        throw new Error("User don't exist");
    }

    // check if session exists
    const sessionObjectId = new mongoose.Types.ObjectId(sessionId);
    const session = await Session.findById(sessionObjectId);
    if (!session) {
        throw new Error("Session don't exist");
    }

    // check if hall exist
    const hall = await Hall.findById(session.hallId);
    if (!hall) {
        throw new Error("Hall assosicated with the session doesn't exist");
    }

    return { user, session, hall };
};

// Helper to get all booked seat Ids for a session (highly reusable)

export const getBookedSeatIdsForSession = async (sessionId: mongoose.Types.ObjectId): Promise<Set<string>> => {
    // get reserved seats
    const existingActiveReservations = await Reservation.find({
        sessionId: sessionId,
        status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] }
    }).select('seats.originalSeatId');

    const bookedSeatIds = new Set<string>();
    existingActiveReservations.forEach((reservation) => {
        reservation.seats.forEach((seat) => {
            bookedSeatIds.add(seat.originalSeatId.toString());
        });
    });
    return bookedSeatIds;
};

// Helper to verify requested seats against hall data and prepare them
type PrepareSeatsResult = {
    verifiedSeatsData: IReservedSeat[];
    calculatedTotalPrice: number;
};

export const verifyAndPrepareSeatDetails = (requestedSeatObjectIds: mongoose.Types.ObjectId[], hall: IHall): PrepareSeatsResult => {
    let verifiedSeatsData: IReservedSeat[] = [];
    let calculatedTotalPrice = 0;

    for (const requestedSeatObjectId of requestedSeatObjectIds) {
        const seatDefinition = hall.seats.find((s) => s._id.equals(requestedSeatObjectId));

        if (!seatDefinition) {
            throw new Error(`Seat with ID ${requestedSeatObjectId.toString()} not found in hall`);
        }

        verifiedSeatsData.push({
            originalSeatId: seatDefinition._id,
            row: seatDefinition.row,
            column: seatDefinition.column,
            seatNumber: seatDefinition.seatNumber,
            type: seatDefinition.type,
            price: seatDefinition.price
        });
        calculatedTotalPrice += seatDefinition.price;
    }

    return { verifiedSeatsData, calculatedTotalPrice };
};
