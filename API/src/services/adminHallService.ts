import Hall, { IHall } from "../models/hall.model";
import mongoose from "mongoose";

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
