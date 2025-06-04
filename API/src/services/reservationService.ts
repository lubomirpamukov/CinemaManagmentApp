import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CreateReservationZod, SeatZod } from '../utils';
import Reservation from '../models/reservation.model';
import { IReservation, ReservationStatus } from '../models';
import { fetchAndValidatePrerequisites, getBookedSeatIdsForSession, verifyAndPrepareSeatDetails } from '../utils/reservation.helpers';

export const createReservationService = async (reservationData: CreateReservationZod): Promise<IReservation> => {
    // fetch and validate prerequisite entities
    const { hall, session, user } = await fetchAndValidatePrerequisites(reservationData.userId, reservationData.sessionId);

    const sessionObjectId = session._id as mongoose.Types.ObjectId;
    const userObjectId = user._id as mongoose.Types.ObjectId;

    // prepare requested seat ObjectIds
    const requestedSeatOriginalObjectIds = reservationData.seats.map((seat) => {
        return new mongoose.Types.ObjectId(seat.originalSeatId);
    });

    if (requestedSeatOriginalObjectIds.length === 0) {
        throw new Error('No seats selected');
    }

    // get currently booked seats for this session
    const bookedSeatIdsSet = await getBookedSeatIdsForSession(sessionObjectId);

    //check for seat availability
    const unavailableSeatNumbers: string[] = [];
    for (const requestedSeatObjectId of requestedSeatOriginalObjectIds) {
        if (bookedSeatIdsSet.has(requestedSeatObjectId.toString())) {
            const seatDetail = hall.seats.find((s) => s._id.equals(requestedSeatObjectId));
            unavailableSeatNumbers.push(seatDetail ? seatDetail.seatNumber : requestedSeatObjectId.toString());
        }
    }

    if (unavailableSeatNumbers.length > 0) {
        throw new Error(`The following seats are alredy booked or pending for this session: ${unavailableSeatNumbers.join(', ')}.`);
    }

    // verify requested seats agains hall data, prepare details and calculate price
    const { verifiedSeatsData, calculatedTotalPrice } = verifyAndPrepareSeatDetails(requestedSeatOriginalObjectIds, hall);

    // generate reservation code
    const reservationCode = uuidv4().substring(0, 8).toUpperCase();

    const newReservationDataForModel = {
        userId: userObjectId,
        sessionId: sessionObjectId,
        seats: verifiedSeatsData,
        totalPrice: calculatedTotalPrice,
        status: reservationData.status || ReservationStatus.PENDING,
        reservationCode: reservationCode
    };

    const newReservation = await Reservation.create(newReservationDataForModel);
    return newReservation;
};


