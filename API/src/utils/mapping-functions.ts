import { ICinema, IMovie, IReservation, ISnack, IUser } from '../models';
import { IHall } from '../models/hall.model';
import { THall } from '../utils/HallValidation';
import { TCinema, TSnack } from './CinemaValidation';
import { TMovie } from './MovieValidation';
import { TReservation, TReservationDisplay } from './ReservationValidation';
import { TUserDTO } from './UserValidation';

/**
 * Maps a Mongoose IHall document to a THall DTO.
 *
 * @param {IHall} hall The Mongoose hall document
 * @returns {THall} The hall DTO
 */
export const mapHallToTHall = (hall: IHall): THall => {
    return {
        id: hall._id?.toString(),
        cinemaId: hall.cinemaId.toString(),
        name: hall.name,
        layout: {
            rows: hall.layout.rows,
            columns: hall.layout.columns
        },
        seats: Array.isArray(hall.seats)
            ? hall.seats.map((seat) => ({
                  originalSeatId: seat._id?.toString(),
                  row: seat.row,
                  column: seat.column,
                  seatNumber: seat.seatNumber,
                  isAvailable: seat.isAvailable,
                  type: seat.type,
                  price: seat.price
              }))
            : []
    };
};

/**
 * Maps a Mongoose IMovie document to a TMovie DTO
 *
 * @param {IMovie} movie The mongoose movie document.
 * @returns {TMovie} The movie DTO
 */
export const mapMovieToTMovie = (movie: IMovie): TMovie => {
    return {
        id: movie._id.toString(),
        title: movie.title,
        duration: movie.duration,
        genre: movie.genre,
        pgRating: movie.pgRating,
        year: movie.year,
        director: movie.director,
        cast: movie.cast,
        description: movie.description,
        imgURL: movie.imgURL
    };
};

/**
 * Maps a Mongoose IUser document to a TUser DTO
 *
 * @param {IUser} user The Mongoose user document.
 * @returns {TUser} The user DTO
 */
export const mapUserToTUserDTO = (user: IUser): TUserDTO => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    contact: user.contact,
    address: user.address
});

/**
 * Maps a Mongoose ISnack document to a TSnack DTO.
 *
 * @param {ISnack} snack The mongoose snack document from the database.
 * @returns {TSnack} The snack DTO with a string `id`
 */
export const mapSnackToTSnack = (snack: ISnack): TSnack => ({
    id: snack._id.toString(),
    name: snack.name,
    description: snack.description,
    price: snack.price
});

/**
 * Maps Mongoose ICinema document to a TCinemaDTO.
 * This function ensures that the returned object conforms to the client-facing shape,
 * converting ObjectIds to strings and handling nested documents.
 *
 * @param {ICinema} cinema The Mongoose cinema document from the database.
 * @returns {TCinema} The cinema DTO ready for validation and client response.
 */
export const mapCinemaToTCinema = (cinema: ICinema): TCinema => ({
    id: cinema._id.toString(),
    city: cinema.city,
    name: cinema.name,
    halls: cinema.halls || [],
    snacks: cinema.snacks ? cinema.snacks.map(mapSnackToTSnack) : []
});

/**
 * Maps a Mongoose IReservation document and its related data to a client-facing TReservationDisplay
 *
 * @param {IReservation} reservation - The reservation document from the dtabase.
 * @param {string} movieName - The title of the movie.
 * @param {string} hallName - The Name of the hall.
 * @param {Date} sessionStartTime - The start time of the session.
 * @returns {IReservationDisplay} - The Resevation DTO, ready for serialization.
 */
export const mapReservationToDisplayDTO = (
    reservation: IReservation,
    movieName: string,
    hallName: string,
    sessionStartTime: Date
): TReservationDisplay => {
    return {
        _id: reservation._id.toString(),
        reservationCode: reservation.reservationCode!,
        status: reservation.status,
        userId: reservation.userId.toString(),
        sessionId: reservation.sessionId.toString(),
        totalPrice: reservation.totalPrice,
        createdAt: reservation.createdAt.toISOString(),
        updatedAt: reservation.updatedAt.toISOString(),
        movieName: movieName,
        hallName: hallName,
        sessionStartTime: sessionStartTime.toISOString(),
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
};
