import { CinemaZod, cinemaSchema } from '../utils/CinemaValidation';
import Cinema, { ICinema } from '../models/cinema.model';


export const getCinemasService = async (): Promise<CinemaZod[]> => {
    const cinemasFromDB: ICinema[] = await Cinema.find().lean();

    try {
        const transformedCinemasDTO: CinemaZod[] = cinemasFromDB.map((cinema) => {
            const cinemaDTO = {
                id: cinema._id?.toString(),
                city: cinema.city,
                name: cinema.name,
                halls: cinema.halls || [],
                imgURL: cinema.imgURL,
                snacks: cinema.snacks
                    ? cinema.snacks.map((snack) => ({
                          id: snack._id?.toString(),
                          name: snack.name,
                          description: snack.description,
                          price: snack.price,
                      }))
                    : [],
            };
            return cinemaDTO as CinemaZod;
        });
        
        const validatedCinemas: CinemaZod[] = cinemaSchema.array().parse(transformedCinemasDTO);
        return validatedCinemas;
    } catch (err: any) {
        throw new Error(err.message);
    }
};

export const getCinemaByIdService = async (id: string): Promise<CinemaZod | null> => {
    const cinemaFromDB: ICinema | null = await Cinema.findById(id);
    if (!cinemaFromDB) return null;

    try {
        console.log('cinemaFromDB', cinemaFromDB);
        const transformedCinemaDTO: CinemaZod = {
            id: cinemaFromDB._id?.toString(),
            city: cinemaFromDB.city,
            name: cinemaFromDB.name,
            halls: cinemaFromDB.halls || [],
            imgURL: cinemaFromDB.imgURL,
            snacks: cinemaFromDB.snacks
                ? cinemaFromDB.snacks.map((snack) => ({
                      id: snack._id?.toString(),
                      name: snack.name,
                      description: snack.description,
                      price: snack.price,
                  }))
                : [],
        };
        const validatedCinema: CinemaZod = cinemaSchema.parse(transformedCinemaDTO);
        return validatedCinema;
    } catch (err: any) {
        throw new Error(err.message);
    }
};

export const updateCinemaByIdService = async (id: string, updates: CinemaZod): Promise<CinemaZod | null> => {
    if(!id){
        throw new Error('Cinema ID is required.')
    }

    const updatedCinema = await Cinema.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    });

    if(!updatedCinema){
        throw new Error('Cinema not found');
    }

    const cinemaExportDto: CinemaZod = {
        id: updatedCinema._id?.toString(),
        city: updatedCinema.city,
        name: updatedCinema.name,
        halls: updatedCinema.halls || [],
        imgURL: updatedCinema.imgURL,
        snacks: updatedCinema.snacks
            ? updatedCinema.snacks.map((snack) => ({
                  id: snack._id?.toString(),
                  name: snack.name,
                  description: snack.description,
                  price: snack.price,
              }))
            : [],
    };
    return cinemaExportDto;
}
