import Hall, { IHall } from "../models/hall.model";
import mongoose from "mongoose";
import Cinema from '../models/cinema.model';
import { hallSchema, Hall as HallValidation } from '../utils';
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

    const hallDTOs = hallsFromDB.map(hall => ({
        id: hall._id?.toString(),
        name: hall.name,
        layout: hall.layout, 
        seats: hall.seats ? hall.seats.map(seat => ({ 
            row: seat.row,
            column: seat.column,
            seatNumber: seat.seatNumber,
            isAvailable: seat.isAvailable,
            type: seat.type,
            price: seat.price,
        })) : [],
    }));


    return hallDTOs as any; 
                       
};

export const createHallService = async (cinemaId: string, hallData: HallValidation): Promise<IHall> => {
    if (!cinemaId) {
        throw new Error('Cinema ID is required.');
    }
    const objectId = new mongoose.Types.ObjectId(cinemaId);

    // Ensure cinemaId is set in the hall document
    const hall = await Hall.create(hallData);

    // Add the hall's ID to the cinema's halls array
    await Cinema.findByIdAndUpdate(
        objectId,
        { $push: { halls: hall._id } }
    );

    const hallExportDto: HallValidation = {
        id: hall._id?.toString() || '',
        cinemaId: objectId.toString(),
        name: hall.name,
        layout: hall.layout,
        movieProgram: hall.movieProgram,
        seats: hall.seats ? hall.seats.map(seat => ({
            row: seat.row,
            column: seat.column,
            seatNumber: seat.seatNumber,
            isAvailable: seat.isAvailable,
            type: seat.type,
            price: seat.price,
        })) : [],
    }
    return hallExportDto as IHall;
}

export const deleteHallService = async (cinemaId: string, hallId: string): Promise<IHall> => {
    if (!cinemaId || !hallId) {
        throw new Error('Cinema ID and Hall ID are required.');
    }
    const objectId = new mongoose.Types.ObjectId(cinemaId);
    const hallObjectId = new mongoose.Types.ObjectId(hallId);

    // Find the cinema and remove the hall from its halls array
    await Cinema.findByIdAndUpdate(
        objectId,
        { $pull: { halls: hallObjectId } }
    );

    // Delete the hall
    const deletedHall = await Hall.findByIdAndDelete(hallObjectId);

    if (!deletedHall) {
        throw new Error('Hall not found.');
    }

    return deletedHall;
}



