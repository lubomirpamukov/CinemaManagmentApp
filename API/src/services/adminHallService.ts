import Hall, { IHall } from '../models/hall.model';
import mongoose from 'mongoose';
import Cinema from '../models/cinema.model';
import Session from '../models/session.model';
import { hallSchema, THall } from '../utils';
import { mapHallToTHall } from '../utils/mapping-functions';
import { CustomError } from '../middleware/errorHandler';

/**
 * Fetches halls of specific cinema based on ID from the database, transforms it into DTO,
 * and validates them against hall schema.
 * @param {string | mongoose.Types.ObjectId} cinemaId The ID of the cinema.
 * @throws {Error} If no halls are found, or the data from the database fails validation.
 * @returns {Promise<THall[]>} Resolves to array of THall
 */
export const getCinemaHallsService = async (cinemaId: string | mongoose.Types.ObjectId): Promise<THall[]> => {
    const cinemaExists = await Cinema.findById(cinemaId).lean();
    if (!cinemaExists) {
        throw new CustomError('Cinema not found', 404);
    }

    const hallsFromDB: IHall[] = await Hall.find({ cinemaId: cinemaId }).lean();

    if (hallsFromDB.length === 0) {
        return [];
    }

    const hallDTOs: THall[] = hallsFromDB.map(mapHallToTHall);

    return hallSchema.array().parse(hallDTOs);
};

/**
 * Creates new hall document in the database, validation of the hall data is made in the parrent controller.
 * Does NOT modify the parent cinema.
 * @param {THall} hallData The validated hall data, including cinemaId.
 * @throws {Error} Throws error if hall data is not valid.
 * @param {mongoose.ClientSession} [session] Optional Mongoose session for transactions.
 * @returns {Promise<THall>} A promise that resolves to the created and validated THall DTO.
 */
export const createHallService = async (hallData: THall, session?: mongoose.ClientSession): Promise<THall> => {
    const hall = new Hall(hallData);
    await hall.save({ session });
    const tHall = mapHallToTHall(hall);
    return hallSchema.parse(tHall);
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
 * @param {string | mongoose.Types.ObjectId} id The ID of the hall to fetch.
 * @param {mongoose.ClientSession} [session] Optional mongoose session for transaction
 * @throws {Error} Throws an error if the hall is not found.
 * @returns {Promise<THall | null>} A promise that resolves to the validated hall DTO.
 */
export const getHallByIdService = async (id: string | mongoose.Types.ObjectId, session?: mongoose.ClientSession): Promise<THall | null> => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError('Invalid Hall Id format.', 400)
    }

    const hall = await Hall.findById(id).session(session ?? null);

    if (!hall) {
        return null;
    }

    const hallDto: THall = mapHallToTHall(hall)

    return hallSchema.parse(hallDto);
};
