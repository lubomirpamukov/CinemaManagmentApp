import { z } from 'zod';
import { hallSchema } from '../utils/HallsValidationSchema';

const BASE_URL = 'http://localhost:3000/halls';

export type Hall = z.infer<typeof hallSchema>;

export const getHallsByIds = async (ids: string[]): Promise<Hall[]> => {
    const halls: Hall[] = [];
    for (const id of ids) {
      const response = await fetch(`${BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching hall with id ${id}`);
      }
      const data = await response.json();
      const hall = hallSchema.parse(data);
      halls.push(hall);
    }
    return halls;
  };