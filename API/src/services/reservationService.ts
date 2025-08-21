import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CreateReservationRequest, ReservationFilter, TReservationDisplay } from '../utils';
import Reservation, { IPurchasedSnack } from '../models/reservation.model';
import Session from '../models/session.model';
import { ReservationStatus } from '../models';
import { fetchAndValidatePrerequisites, getBookedSeatIdsForSession, processSnacks, verifyAndPrepareSeatDetails } from '../utils/reservation.helpers';
import Cinema from '../models/cinema.model';
import { ISnack } from '../models/cinema.model';
import Movie from '../models/movie.model';

/**
 * Creates a new reservation for an authenticated user.
 * This function executes a series of critical operations within a single atomic transaction to ensure data integrity.
 * 1. Fetches and validates the user, session, and hall.
 * 2. Checks for seat availability against currently booked seats.
 * 3. Verifies snack data and calculates the total price for tickets and snacks.
 * 4. Creates the new Reservation document.
 * 5. Updates the Session by decrementing the available seat count.
 * 6. Updates the User by adding the new reservation to their history.
 *
 * @param {string} userId The ID of the authenticated user (from JWT).
 * @param {CreateReservationRequest} reservationInput The reservation details from the request.
 * @throws {Error} Throws specific, user-friendly errors for invalid data (e.g., `User not found`, `Session not found`, `Seats not available`)
 * @throws {Error} Throws generic error if the transaction fails for other reasons.
 * @returns {Promise<TReservationDisplay>} A promise that resolves to a display-firendly DTO of the created reservation.
 */
export const createReservationService = async (userId: string, reservationInput: CreateReservationRequest): Promise<TReservationDisplay> => {
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
        // 1. Fetch and validate prerequsites (within the transaction)
        const { hall, session, user } = await fetchAndValidatePrerequisites(userId, reservationInput.sessionId, dbSession); // add transaction to this function

        const movie = await Movie.findById(session.movieId).select('title').lean();
        if (!movie) throw new Error('Movie for this session not found.');

        const cinema = await Cinema.findById(session.cinemaId).lean();
        if (!cinema) throw new Error('Cinema not found for this session');

        // 2. Check seat availability
        const requestedSeatIds = reservationInput.seats.map((seat) => new mongoose.Types.ObjectId(seat.originalSeatId));
        if (requestedSeatIds.length === 0) throw new Error('No seats selected');

        const bookedSeatIdsSet = await getBookedSeatIdsForSession(session._id);
        const unavailableSeatNumbers: string[] = [];

        for (const seatId of requestedSeatIds) {
            if (bookedSeatIdsSet.has(seatId.toString())) {
                const seatDetail = hall.seats.find((s) => s._id.equals(seatId));
                unavailableSeatNumbers.push(seatDetail ? seatDetail.seatNumber : seatId.toString());
            }
        }

        if (unavailableSeatNumbers.length > 0) {
            throw new Error(`Seats already booked: ${unavailableSeatNumbers.join(', ')}`);
        }

        // 3. Process seats and snacks, calculate price.
        const { verifiedSeatsData, calculatedTotalPrice } = verifyAndPrepareSeatDetails(requestedSeatIds, hall);
        const { purchasedSnacks, totalSnackPrice } = processSnacks(reservationInput.purchasedSnacks, cinema);

        //4. Create Reservation
        const reservationCode = uuidv4().substring(0, 8).toUpperCase();
        const [newReservation] = await Reservation.create(
            [
                {
                    userId: user._id,
                    sessionId: session._id,
                    seats: verifiedSeatsData,
                    totalPrice: calculatedTotalPrice + totalSnackPrice,
                    status: reservationInput.status || ReservationStatus.PENDING,
                    reservationCode,
                    purchasedSnacks
                }
            ],
            { session: dbSession }
        );

        // 5. Update session and user.
        session.availableSeats -= verifiedSeatsData.length;
        user.reservations.push(newReservation._id);

        await session.save({ session: dbSession });
        await user.save({ session: dbSession });

        await dbSession.commitTransaction();

        // 6. Construct and return response DTO
         return {
            _id: newReservation._id.toString(),
            reservationCode: newReservation.reservationCode!,
            status: newReservation.status,
            userId: newReservation.userId.toString(),
            sessionId: newReservation.sessionId.toString(),
            totalPrice: newReservation.totalPrice,
            createdAt: newReservation.createdAt.toISOString(),
            updatedAt: newReservation.updatedAt.toISOString(),
            movieName: movie.title,
            hallName: hall.name,
            sessionStartTime: session.startTime.toISOString(),
            seats: newReservation.seats.map((seat) => ({
                originalSeatId: seat.originalSeatId.toString(),
                seatNumber: seat.seatNumber,
                row: seat.row,
                column: seat.column,
                type: seat.type,
                price: seat.price,
            })),
            purchasedSnacks: newReservation.purchasedSnacks.map((snack) => ({
                snackId: snack.snackId.toString(),
                name: snack.name,
                price: snack.price,
                quantity: snack.quantity,
            })),
        };

    } catch (error) {
        //If any errors occurs, abort the entire transaction.
        await dbSession.abortTransaction();
        console.error('Reservation Service Transaction Error:', error);
        throw error
    } finally {
        dbSession.endSession();
    }

    
};

export const getUserReservationService = async (filter: ReservationFilter): Promise<TReservationDisplay[]> => {
    if (!filter.userId) throw new Error('User ID required.');
    if (!mongoose.Types.ObjectId.isValid(filter.userId)) throw new Error('User ID invalid format.');

    const userReservations = await Reservation.find(filter)
        .populate({
            path: 'sessionId',
            select: 'movieId hallId startTime',
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
            userId: reservation.userId.toString(),
            sessionId: session?._id.toString() || '',
            totalPrice: reservation.totalPrice,
            createdAt: reservation.createdAt.toISOString(),
            updatedAt: reservation.updatedAt.toISOString(),
            movieName: session.movieId ? (session.movieId as any).title : 'Movie deleted',
            hallName: session.hallId ? (session.hallId as any).name : 'Hall deleted',
            sessionStartTime: session?.startTime || 'N/A',
            sessionDate: session?.date || 'N/A',
            seats: reservation.seats.map((seat) => ({
                originalSeatId: seat.originalSeatId.toString(),
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

    const sessionStartDateTime = session.startTime;
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
