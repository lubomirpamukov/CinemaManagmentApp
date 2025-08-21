import mongoose from 'mongoose';
import { IUser, ISession, IHall, ReservationStatus, IReservedSeat, ICinema, ISnack } from '../models';
import User from '../models/user.model';
import Session from '../models/session.model';
import Hall from '../models/hall.model';
import Reservation, { IPurchasedSnack } from '../models/reservation.model';
import { CreateReservationRequest } from './ReservationValidation';

// Helper to fetch and validate prerequisite entities
type ReservationPrerequisites = {
    user: IUser;
    session: ISession;
    hall: IHall;
};

/**
 * Fetches and validates the core entittes (User, Session, Hall) required to create a reservation.
 * This function is designed to be executed within a Mongoose transaction to ensure atomic reads.
 *
 * @param {string} userId The ID of the user making the reservation.
 * @param {string} sessionId The ID of the session for the reservation.
 * @param {mongoose.ClientSession} dbSession The Mongoose transaction session to use for the database queries.
 * @throws {Error} Throws an error if the user, session or hall cannot be found.
 * @returns {Promise<ReservationPrerequisites>} A promise that resolves to an object containing the user, session and hall documents.
 */
export const fetchAndValidatePrerequisites = async (
    userId: string,
    sessionId: string,
    dbSession: mongoose.ClientSession
): Promise<ReservationPrerequisites> => {
    // check if user exist
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const user = await User.findById(userObjectId).session(dbSession);
    if (!user) {
        throw new Error("User don't exist");
    }

    // check if session exists
    const sessionObjectId = new mongoose.Types.ObjectId(sessionId);
    const session = await Session.findById(sessionObjectId).session(dbSession);
    if (!session) {
        throw new Error("Session don't exist");
    }

    // check if hall exist
    const hall = await Hall.findById(session.hallId).session(dbSession);
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

/**
 * Processes an array of purchased snacks against the available snacks in a cinema.
 * @param {IPurchasedSnack[]} purchasedSnacks The snacks the user wants to buy.
 * @param {ICinema} cinema The cinema document containing the list of available snacks.
 * @returns An Object with the prepared snack data for the reservation and the total price.
 */

export const processSnacks = (
    purchasedSnacks: CreateReservationRequest['purchasedSnacks'],
    cinema: ICinema
): { purchasedSnacks: IPurchasedSnack[]; totalSnackPrice: number } => {
    const snackMap = new Map<string, ISnack>(cinema.snacks.map((s) => [s._id.toString(), s]));
    let totalSnackPrice = 0;
    const preparedSnacks: IPurchasedSnack[] = [];

    if (purchasedSnacks) {
        for (const snackId in purchasedSnacks) {
            const quantity = purchasedSnacks[snackId];
            const snackDetails = snackMap.get(snackId);
            if (snackDetails && quantity > 0) {
                totalSnackPrice += snackDetails.price * quantity;
                preparedSnacks.push({
                    snackId: snackDetails._id,
                    name: snackDetails.name,
                    price: snackDetails.price,
                    quantity
                });
            }
        }
    }

    return { purchasedSnacks: preparedSnacks, totalSnackPrice };
};
