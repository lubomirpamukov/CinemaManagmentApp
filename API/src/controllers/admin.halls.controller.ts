import { Request, Response } from 'express';
import { getCinemaHallsService} from '../services/adminHallService';

export const getCinemaHalls = async (req:Request, res:Response) => {
    try {
        const { id } = req.params;
        console.log("cinemaId", id);
        const halls = await getCinemaHallsService(id);
        res.status(200).json(halls);
    }catch(err:any){
        if(err.name === "ZodError"){
            return res.status(400).json({error: err.errors});
        }
        res.status(500).json({error: err.message});
    }
}