import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CreateReservationRequest, TReservationDisplay } from '../utils';
import Reservation, { IPurchasedSnack } from '../models/reservation.model';
import Session from '../models/session.model';
import { IReservation, ReservationStatus } from '../models';
import { fetchAndValidatePrerequisites, getBookedSeatIdsForSession, verifyAndPrepareSeatDetails } from '../utils/reservation.helpers';
import Cinema from '../models/cinema.model';
import { ISnack } from '../models/cinema.model';

type SelectedSnacks = {
    [snackId: string]: number;
};

export const createReservationService = async (reservationData: CreateReservationRequest): Promise<IReservation> => {
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

    // fetch cinema and create a snack map for better efficiency
    const cinema = await Cinema.findById(session.cinemaId).lean(); // Assuming session has cinemaId
    if (!cinema) throw new Error('Cinema not found for this session');

    const snackMap: { [snackId: string]: ISnack } = {};
    cinema.snacks.forEach((snack) => {
        snackMap[snack._id.toString()] = snack;
    });

    let totalSnackPrice = 0;
    const selectedSnacks = reservationData.purchasedSnacks || {};
    const purchasedSnacks: IPurchasedSnack[] = [];
    // calculate total snack price
    if (Object.keys(selectedSnacks).length > 0) {
        // Calculate total snack price
        for (const snackId in selectedSnacks) {
            if (selectedSnacks.hasOwnProperty(snackId)) {
                const quantity = selectedSnacks[snackId];
                if (quantity) {
                    const snack = snackMap[snackId]; // Use the snack map for lookup
                    if (snack) {
                        totalSnackPrice += snack.price * quantity;
                        purchasedSnacks.push({
                            snackId: new mongoose.Types.ObjectId(snack._id),
                            name: snack.name,
                            price: snack.price,
                            quantity: quantity
                        });
                    } else {
                        console.warn(`Snack with ID ${snackId} not found in cinema ${cinema.name}`);
                    }
                }
            }
        }
    }
    // generate reservation code
    const reservationCode = uuidv4().substring(0, 8).toUpperCase();
    console.log(purchasedSnacks);
    const newReservationDataForModel = {
        userId: userObjectId,
        sessionId: sessionObjectId,
        seats: verifiedSeatsData,
        totalPrice: calculatedTotalPrice + totalSnackPrice,
        status: reservationData.status || ReservationStatus.PENDING,
        reservationCode: reservationCode,
        purchasedSnacks: purchasedSnacks
    };

    const newReservation = await Reservation.create(newReservationDataForModel);

    if (newReservation && (newReservation.status === ReservationStatus.PENDING || newReservation.status === ReservationStatus.CONFIRMED)) {
        await Session.findByIdAndUpdate(sessionObjectId, {
            $inc: { availableSeats: -verifiedSeatsData.length } // Decrement by the number of reserved seats
        });
    }

    return newReservation;
};

export const getUserReservationService = async (userId: string): Promise<TReservationDisplay[]> => {
    if (!userId) throw new Error('User ID required.');
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error('User ID invalid format.');

    const userReservations = await Reservation.find({ userId: userId })
        .populate({
            path: 'sessionId',
            select: 'movieId hallId startTime date',
            populate: [
                { path: 'movieId', select: 'title' },
                { path: 'hallId', select: 'name' }
            ]
        })
        .lean();

    const reservationDisplayData: TReservationDisplay[] = userReservations.map((reservation) => {
        const session = reservation.sessionId as any; // cast to any to avoid typescript error
        return {
            _id: reservation._id.toString(),
            reservationCode: reservation.reservationCode || 'N/A',
            status: reservation.status,
            totalPrice: reservation.totalPrice,
            createdAt: reservation.createdAt.toISOString(),
            updatedAt: reservation.updatedAt.toISOString(),
            movieName: session.movieId ? (session.movieId as any).title : 'N/A',
            hallName: session.hallId ? (session.hallId as any).name : 'N/A',
            sessionStartTime: session.startTime,
            sessionDate: session.date,
            seats: reservation.seats.map((seat) => ({
                seatNumber: seat.seatNumber,
                row: seat.row,
                column: seat.column,
                type: seat.type,
                price: seat.price
            })),
            purchasedSnacks: reservation.purchasedSnacks.map((snack) => ({
                snackId: snack.snackId.toString(),
                name: snack.name,
                price: snack.price,
                quantity: snack.quantity
            }))
        };
    });

    return reservationDisplayData;
};

export const deleteReservationService = async (reservationId: string, userId: string, userRole: string): Promise<void> => {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) throw new Error('Reservation not found.');

    if (userId !== reservation.userId.toString() && userRole !== 'admin') throw new Error('Unauthorized');

    const session = await Session.findById(reservation.sessionId);
    if (!session) throw new Error('Could not find the session associated with this reservation.');

    const sessionStartDateTime = new Date(`${session.date}T${session.startTime}`);
    const now = new Date();

    const hoursUntilSession = (sessionStartDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilSession <= 24) throw new Error('Reservations can only be deleted more than 24 hours before the session.');

    //if all checks are passed delete session
    await Reservation.findByIdAndDelete(reservationId);

    //Increment avaliable seats count in session document
    await Session.findByIdAndUpdate(reservation.sessionId, {
        $inc: { availableSeats: reservation.seats.length }
    });
};
