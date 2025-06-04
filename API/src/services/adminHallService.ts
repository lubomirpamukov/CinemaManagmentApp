import Hall, { IHall } from '../models/hall.model';
import mongoose from 'mongoose';
import Cinema from '../models/cinema.model';
import { Hall as HallValidation } from '../utils';
import { Types } from 'mongoose';

export const getCinemaHallsService = async (cinemaId: string): Promise<IHall[]> => {
    if (!cinemaId) {
        throw new Error('Cinema ID is required.');
    }
    const objectId = new mongoose.Types.ObjectId(cinemaId);
    const hallsFromDB: IHall[] = await Hall.find({ cinemaId: objectId }).lean();

    if (!hallsFromDB) {
        return [];
    }

    const hallDTOs = hallsFromDB.map((hall) => ({
        id: hall._id?.toString(),
        name: hall.name,
        layout: hall.layout,
        movieProgram: hall.movieProgram || [],
        seats: hall.seats
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

    return hallDTOs as any;
};

export const createHallService = async (cinemaId: string, hallData: HallValidation): Promise<HallValidation> => {
    if (!cinemaId) {
        throw new Error('Cinema ID is required.');
    }
    const objectId = new mongoose.Types.ObjectId(cinemaId);

    // Ensure cinemaId is set in the hall document
    const hall = await Hall.create(hallData);

    // Add the hall's ID to the cinema's halls array
    await Cinema.findByIdAndUpdate(objectId, { $push: { halls: hall._id } });

    const hallExportDto: HallValidation = {
        id: hall._id?.toString() || '',
        cinemaId: objectId.toString(),
        name: hall.name,
        layout: hall.layout,
        movieProgram: hall.movieProgram || [],
        seats: hall.seats
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
    };
    return hallExportDto;
};

export const deleteHallService = async (cinemaId: string, hallId: string): Promise<IHall> => {
    if (!cinemaId || !hallId) {
        throw new Error('Cinema ID and Hall ID are required.');
    }
    const objectId = new mongoose.Types.ObjectId(cinemaId);
    const hallObjectId = new mongoose.Types.ObjectId(hallId);

    // Find the cinema and remove the hall from its halls array
    await Cinema.findByIdAndUpdate(objectId, { $pull: { halls: hallObjectId } });

    // Delete the hall
    const deletedHall = await Hall.findByIdAndDelete(hallObjectId);

    if (!deletedHall) {
        throw new Error('Hall not found.');
    }

    return deletedHall;
};

export const getHallByIdService = async (id: string): Promise<HallValidation> => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid Hall id format');
    }

    const hall = await Hall.findById(id);

    if (!hall) {
        throw new Error(`Hall with id ${id} not found.`);
    }

    const hallDto: HallValidation = {
        id: hall._id?.toString(),
        cinemaId: hall.cinemaId.toString(), 
        name: hall.name,
        layout: hall.layout, 
        movieProgram: hall.movieProgram
            ? hall.movieProgram.map((program: any) => ({ 
                  movieId: program.movieId.toString(), 
                  startTime: program.startTime.toISOString(), 
                  endTime: program.endTime.toISOString(), 
              }))
            : [],
        seats: hall.seats
            ? hall.seats.map((seat: any) => ({ 
                  originalSeatId: seat._id.toString(), 
                  row: seat.row,
                  column: seat.column,
                  seatNumber: seat.seatNumber,
                  isAvailable: seat.isAvailable, 
                  type: seat.type,               
                  price: seat.price,
              }))
            : [],
    };

    return hallDto;
};
