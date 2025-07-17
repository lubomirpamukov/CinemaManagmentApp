import { TCinema, cinemaSchema } from '../utils/CinemaValidation';
import Cinema, { ICinema } from '../models/cinema.model';
import mongoose from 'mongoose';

/**
 * Fetches all cinemas from the database, transforms them into DTO,
 * and validates them against the cinema schema.
 * @throws {ZodError} If the data from the database fails validation.
 * @returns {Promise<TCinema[]>} Resolves to an array of valid cinema objects.
 */
export const getCinemasService = async (): Promise<TCinema[]> => {
    const cinemasFromDB: ICinema[] = await Cinema.find().lean();

    const transformedCinemasDTO: TCinema[] = cinemasFromDB.map((cinema) => {
        const cinemaDTO = {
            id: cinema._id?.toString(),
            city: cinema.city,
            name: cinema.name,
            halls: Array.isArray(cinema.halls) ? cinema.halls.map((hall) => hall.toString()) : [],
            imgURL: cinema.imgURL,
            snacks: cinema.snacks
                ? cinema.snacks.map((snack) => ({
                      id: snack._id?.toString(),
                      name: snack.name,
                      description: snack.description,
                      price: snack.price
                  }))
                : []
        };
        return cinemaDTO as TCinema;
    });

    const validatedCinemas: TCinema[] = cinemaSchema.array().parse(transformedCinemasDTO);
    return validatedCinemas;
};

/**
 * Fetches a specific cinema based on ID from the database, transforms it into DTO,
 * and validates them against cinema schema.
 * @param {string} id The ID of the cinema.
 * @throws {ZodError} If the data from the database fails validation.
 * @throws {Error} If cinema document dosnt exist throws `Cinema not found`
 * @returns {Promise<TCinema>} Resolves to a valid cinema object or null if not found.
 */
export const getCinemaByIdService = async (id: string): Promise<TCinema> => {
    const cinemaFromDB: ICinema | null = await Cinema.findById(id).lean();
    if (!cinemaFromDB) throw new Error('Cinema not found')

    const transformedCinemaDTO: TCinema = {
        id: cinemaFromDB._id?.toString(),
        city: cinemaFromDB.city,
        name: cinemaFromDB.name,
        halls: Array.isArray(cinemaFromDB.halls) ? cinemaFromDB.halls.map((hall) => hall.toString()) : [],
        imgURL: cinemaFromDB.imgURL,
        snacks: Array.isArray(cinemaFromDB.snacks)
            ? cinemaFromDB.snacks.map((snack) => ({
                  id: snack._id?.toString(),
                  name: snack.name,
                  description: snack.description,
                  price: snack.price
              }))
            : []
    };
    const validatedCinema: TCinema = cinemaSchema.parse(transformedCinemaDTO);
    return validatedCinema;
};

/**
 * Updates a cinema's details by its ID.
 * Assumes the `updates` object has been validated by the controller.
 * @param {string} id The Id of the cinema to update.
 * @param {Partial<TCinema>} updates An object containing the validated cinema data to update.
 * @returns {Promise<Tcinema>} Resloves to the update cinema DTO.
 * @throws {Error} If the cinema with the given ID is not found.
 */
export const updateCinemaByIdService = async (id: string, updates: Partial<TCinema>): Promise<TCinema> => {
    const updatedCinema = await Cinema.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
    });

    if (!updatedCinema) {
        throw new Error('Cinema not found');
    }

    const cinemaExportDto: TCinema = {
        id: updatedCinema._id?.toString(),
        city: updatedCinema.city,
        name: updatedCinema.name,
        halls: Array.isArray(updatedCinema.halls) ? updatedCinema.halls.map((h) => h.toString()) : [],
        imgURL: updatedCinema.imgURL,
        snacks: Array.isArray(updatedCinema.snacks)
            ? updatedCinema.snacks.map((snack) => ({
                  id: snack._id?.toString(),
                  name: snack.name,
                  description: snack.description,
                  price: snack.price
              }))
            : []
    };
    return cinemaExportDto;
};

/**
 * Adds a hall's ID to a cinemas list of halls.
 * @param {string} cinemaId The ID of the cinema to update.
 * @param {mongoose.Types.ObjectId} hallId The ID of the new hall to add.
 * @param {mongoose.ClientSession} [session] Optional Mongoose session for transactions.
 */
export const addHallToCinemaService = async (cinemaId: string, hallId: mongoose.Types.ObjectId, session?: mongoose.ClientSession) => {
    await Cinema.findByIdAndUpdate(cinemaId, { $push: { halls: hallId } }, { session });
};

/**
 * Removes a hall's ID from its parent cinema's array.
 * @param {string} hallId The ID of the hall to remove.
 * @param {mongoose.ClientSession} [session] The mongoose session for the transaction.
 */
export const removeHallFromCinemaService = async (hallId: string, session?: mongoose.ClientSession): Promise<void> => {
    await Cinema.updateOne({ halls: hallId }, { $pull: { halls: hallId } }, { session });
};
