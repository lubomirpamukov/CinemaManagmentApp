import { TCinema, cinemaSchema } from '../utils/CinemaValidation';
import Cinema, { ICinema } from '../models/cinema.model';
import mongoose from 'mongoose';
import { mapCinemaToTCinema } from '../utils/mapping-functions';

/**
 * Fetches all cinemas from the database, transforms them into DTO,
 * and validates them against the cinema schema.
 * @throws {ZodError} If the data from the database fails validation.
 * @returns {Promise<TCinema[]>} Resolves to an array of valid cinema objects.
 */
export const getCinemasService = async (): Promise<TCinema[]> => {
    const cinemasFromDB: ICinema[] = await Cinema.find().lean();

    const transformedCinemasDTO = cinemasFromDB.map(mapCinemaToTCinema);

    const validatedCinemas = cinemaSchema.array().parse(transformedCinemasDTO);
    return validatedCinemas;
};

/**
 * Fetches a specific cinema based on ID from the database, transforms it into DTO,
 * and validates them against cinema schema.
 * @param {string} id The ID of the cinema.
 * @throws {ZodError} If the data from the database fails validation.
 * @throws {Error} If cinema document dosnt exist throws `Cinema not found`
 * @returns {Promise<TCinema>} Resolves to a valid cinema object.
 */
export const getCinemaByIdService = async (id: string): Promise<TCinema> => {
    const cinemaFromDB: ICinema | null = await Cinema.findById(id).lean();
    if (!cinemaFromDB) throw new Error('Cinema not found');

    const transformedCinemaDTO = mapCinemaToTCinema(cinemaFromDB);
    const validatedCinema = cinemaSchema.parse(transformedCinemaDTO);
    return validatedCinema;
};


/**
 * Creates a cinema document, transforms it into DTO and validates them agains cinema schema
 * @param {TCinema} cinema - Cinema object that will be created
 * @returns {Promise<TCinema>} - Resolves to a DTO object of the cinema document.
 */
export const createCinemaService = async (cinema: TCinema): Promise<TCinema> => {
    const cinemaDocument = await Cinema.create(cinema);
    const dto = mapCinemaToTCinema(cinemaDocument);
    return cinemaSchema.parse(dto)
}

/**
 * Deletes a cinema document if it exists
 * Assumes the id is in valid format.
 * @param {string | mongoose.Types.ObjectId} id - The id of the cinema document to delete
 * @returns {Promise<TCinema | null>} - Resolves to the deleted cinema DTO if successful or null if not successful
 */
export const deleteCinemaService = async (id: string | mongoose.Types.ObjectId) : Promise<TCinema | null> => {
    const deletedDoc = await Cinema.findByIdAndDelete(id);
    if (!deletedDoc) return null;
    return cinemaSchema.parse(mapCinemaToTCinema(deletedDoc));
}

/**
 * Updates a cinema's details by its ID.
 * Assumes the `updates` object has been validated by the controller.
 * @param {string} id The Id of the cinema to update.
 * @param {Partial<TCinema>} updates An object containing the validated cinema data to update.
 * @throws {Error} If the database connection is lost throws Error.
 * @returns {Promise<TCinema | null>} Resloves to the update cinema DTO, if cinema dont exist returns null.
 */
export const updateCinemaByIdService = async (id: string, updates: Partial<TCinema>): Promise<TCinema | null> => {
    const updatedCinema = await Cinema.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
    });

    if (!updatedCinema) {
        return null;
    }

    const cinemaExportDto = mapCinemaToTCinema(updatedCinema);
    return cinemaSchema.parse(cinemaExportDto);
};

/**
 * Adds a hall's ID to a cinema's list of halls.
 * The service relies that cinemaId and hallId will be validated in the parent function
 *
 * @param {string | mongoose.Types.ObjectId} cinemaId The Id of the cinema to update.
 * @param {string | mongoose.Types.ObjectId} hallId The ID of the new hall to add.
 * @param {mongoose.ClientSession} [session] Optional Mongoose session for transaction.
 * @returns {Promise<mongoose.UpdateWriteOpResult | null>} Resolves to the result of the update operation, including matched and modified counts.
 */
export const addHallToCinemaService = async (
    cinemaId: string | mongoose.Types.ObjectId,
    hallId: string | mongoose.Types.ObjectId,
    session?: mongoose.ClientSession
): Promise<mongoose.UpdateWriteOpResult | null> => {
    return await Cinema.updateOne({ _id: cinemaId }, { $addToSet: { halls: hallId } }, { session });
};

/**
 * Removes a hall's ID from a speficif cinema's halls array.
 *
 * @param {string | mongoose.Types.ObjectId} cinemaId The ID of the cinema.
 * @param {string | mongoose.Types.ObjectId} hallId The ID of the hall to remove.
 * @param {mongoose.cilenSession} [session] Optional mongoose session for transaction.
 * @returns {Promise<mongoose.UpdateWriteOpResult | null>} Resolves to the result of the update operation, including matched and modified counts.
 */

export const removeHallFromCinemaService = async (
    cinemaId: string | mongoose.Types.ObjectId,
    hallId: string | mongoose.Types.ObjectId,
    session?: mongoose.ClientSession
): Promise<mongoose.UpdateWriteOpResult | null> => {
    return await Cinema.updateOne({ _id: cinemaId, halls: hallId }, { $pull: { halls: hallId } }, { session });
};


