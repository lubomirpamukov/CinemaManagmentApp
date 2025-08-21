import { Cinema, cinemaSchema } from "../utils";

const BASE_URL = "http://localhost:3123/admin/cinemas";
//Fetch all cinemas
export const getCinemas = async (): Promise<Cinema[]> => {
  try {
    const response = await fetch(BASE_URL, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch cinemas");
    }
    const data = await response.json();
    return cinemaSchema.array().parse(data.cinemas);
  } catch (error) {
    console.log(error); //to do log error
    throw error;
  }
};

//Fetch cinema by ID
export const getCinemaById = async (id: string): Promise<Cinema> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch cinema");
    }
    const data = await response.json();
    return cinemaSchema.parse(data.cinema);
  } catch (error) {
    throw error;
  }
};

export type CinemaInput = Omit<Cinema, "id">;

//Create cinema
export const createCinema = async (cinema: CinemaInput): Promise<Cinema> => {
  cinemaSchema.parse(cinema); // validate data before API call
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cinema),
    });

    if (!response.ok) {
      throw new Error("Failed to create cinema");
    }
    const data = await response.json();
    return cinemaSchema.parse(data);
  } catch (error) {
    console.log(error); // to do logger
    throw error;
  }
};

//Update existing cinema
export const updateCinema = async (
  id: string,
  cinema: Cinema
): Promise<Cinema> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cinema),
    });

    if (!response.ok) {
      throw new Error("Failed to update movie");
    }
    const data = await response.json();
    return cinemaSchema.parse(data.cinema);
  } catch (error) {
    console.log(error); // to do logger
    throw error;
  }
};

//Delete cinema
export const deleteCinema = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Failed to delete Cinema");
    }
    console.log(`Cinema with id ${id} deleted successfully.`);
    return true;
  } catch (error) {
    console.log(error); //to do logger
    throw error;
  }
};
