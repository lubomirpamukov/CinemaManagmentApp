import Hall, { IHall } from '../models/hall.model';
import mongoose from 'mongoose';
import Cinema from '../models/cinema.model';
import Session from '../models/session.model';
import { hallSchema, THall } from '../utils';

/**
 * Fetches halls of specific cinema based on ID from the database, transforms it into DTO,
 * and validates them against hall schema.
 * @param {string} cinemaId The ID of the cinema.
 * @throws {Error} If no halls are found, or the data from the database fails validation.
 * @returns {Promise<THall[]>} Resolves to array of THall
 */
export const getCinemaHallsService = async (cinemaId: string): Promise<THall[]> => {
    const cinemaExists = await Cinema.findById(cinemaId).lean();
    if (!cinemaExists) {
        throw new Error('Cinema not found');
    }

    const hallsFromDB: IHall[] = await Hall.find({ cinemaId: cinemaId }).lean();

    if (hallsFromDB.length === 0) {
        return [];
    }

    const hallDTOs: THall[] = hallsFromDB.map((hall) => ({
        id: hall._id?.toString(),
        name: hall.name,
        cinemaId: hall.cinemaId.toString(),
        layout: hall.layout,
        seats: Array.isArray(hall.seats)
            ? hall.seats.map((seat) => ({
                  originalSeatId: seat._id.toString(),
                  row: seat.row,
                  column: seat.column,
                  seatNumber: seat.seatNumber,
                  isAvailable: seat.isAvailable,
                  type: seat.type,
                  price: seat.price
              }))
            : []
    }));

    return hallSchema.array().parse(hallDTOs);
};

/**
 * Creates new hall document in the database.
 * Does NOT modify the parent cinema.
 * @param {THall} hallData The validated hall data, including cinemaId.
 * @param {mongoose.ClientSession} [session] Optional Mongoose session for transactions.
 * @returns {Promise<IHall>} A promise that resolves to the created Mongoose Hall document.
 */
export const createHallService = async (hallData: THall, session?: mongoose.ClientSession): Promise<IHall> => {
    const hall = new Hall(hallData);
    await hall.save({ session });
    return hall;
};

/**
 * Delete hall document from the database.
 * This is a single operation intended to be used within a transaction.
 * @param {string} hallId The ID of the hall document that will be removed.
 * @param {mongoose.ClientSession} [session] The mongoose session for transaction.
 * @returns {Promise<THall>} Resolves to the Hall object that was removed.
 */
export const deleteHallByIdService = async (hallId: string, session?: mongoose.ClientSession): Promise<IHall | null> => {
    return Hall.findByIdAndDelete(hallId, { session });
};

/**
 * Fetches a hall by its ID, transforms it into a DTO, and validates it.
 * @param {string} id The ID of the hall to fetch.
 * @throws {Error} Throws an error if the hall is not found.
 * @returns {Promise<THall>} A promise that resolves to the validated hall DTO.
 */
export const getHallByIdService = async (id: string): Promise<THall> => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid Hall id format');
    }

    const hall = await Hall.findById(id).lean();

    if (!hall) {
        throw new Error(`Hall with id ${id} not found.`);
    }

    const hallDto: THall = {
        id: hall._id?.toString(),
        cinemaId: hall.cinemaId.toString(),
        name: hall.name,
        layout: hall.layout,
        seats: hall.seats
            ? hall.seats.map((seat: any) => ({
                  originalSeatId: seat._id.toString(),
                  row: seat.row,
                  column: seat.column,
                  seatNumber: seat.seatNumber,
                  isAvailable: seat.isAvailable,
                  type: seat.type,
                  price: seat.price
              }))
            : []
    };

    return hallSchema.parse(hallDto);
};
