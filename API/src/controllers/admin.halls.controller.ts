import { Request, Response } from 'express';
import { getCinemaHallsService, createHallService, deleteHallService } from '../services/adminHallService';
import { hallSchema } from '../utils/HallValidation';

export const getCinemaHalls =  async (req:Request, res:Response) => {
    try {
        const { id } = req.params;
        const halls = await getCinemaHallsService(id);
        res.status(200).json(halls);
    }catch(err:any){
        if(err.name === "ZodError"){
            return res.status(400).json({error: err.errors});
        }
        res.status(500).json({error: err.message});
    }
}


export const createHall = async (req:Request, res:Response) => {
    try {
        const { id } = req.params;
        const hallData = req.body;
        const hall = await hallSchema.parseAsync(hallData);
        const createdHall = await createHallService(id, hall);
        res.status(200).json(hall);
    }catch(err:any){
        if(err.name === "ZodError"){
            return res.status(400).json({error: err.errors});
        }
        res.status(500).json({error: err.message});
    }
}

export const deleteHall = async (req:Request, res:Response) => {
    try {
        const { id } = req.params;
        const hallId = req.body.hallId;
        const deletedHall = await deleteHallService(id, hallId);
        res.status(200).json(deletedHall);
    }catch(err:any){
        if(err.name === "ZodError"){
            return res.status(400).json({error: err.errors});
        }
        res.status(500).json({error: err.message});
    }
}

