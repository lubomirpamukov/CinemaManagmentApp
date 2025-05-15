import { Request, Response} from 'express';
import { createSessionService } from '../services/adminSessionService';
import { SessionZod } from '../utils/SessionValidationSchema';


//validate response
export const createSession = async (req: Request, res: Response) => {
    try{
        const newSession = await createSessionService(req.body);
        if(!newSession) return res.status(400).json({ message: 'Session not created'});
        res.status(201).json(newSession);
    }catch(err: any){
        if(err.name === 'ZodError'){
            return res.status(400).json({ error: err.errors });
        }
        res.status(500).json({ error: err.message });
    }
}