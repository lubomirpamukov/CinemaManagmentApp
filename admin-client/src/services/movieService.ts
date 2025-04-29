import { Movie, movieSchema } from "../utils";
const BASE_URL = "http://localhost:3000/movies";

export const getMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch movies");
    }

    const data = await response.json();
    return movieSchema.array().parse(data);
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error; // to do logger
  }
};

export const getMovieById = async (id: string): Promise<Movie> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch movie");
    }
    const data = await response.json();
    return movieSchema.parse(data);
  } catch (error) {
    console.error("Error fetching movie:", error);
    throw error; // to do logger
  }
};

export type MovieInput = Omit<Movie, "id">;

export const createMovie = async (movie: MovieInput): Promise<Movie> => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movie),
    });

    if (!response.ok) {
      throw new Error("Failed to create movie");
    }
    const data = await response.json();
    return movieSchema.parse(data);
  } catch (error) {
    console.error("Error creating movie:", error);
    throw error; // to do logger
  }
};

export const updateMovie = async (
  id: string,
  movie: Movie
): Promise<Movie> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movie),
    });

    if (!response.ok) {
      throw new Error("Failed to update movie");
    }
    const data = await response.json();
    return movieSchema.parse(data);
  } catch (error) {
    console.error("Error updating movie:", error);
    throw error; // to do logger
  }
};

export const deleteMovie = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete movie");
    }

    if (response.status === 204) {
      console.log(`Movie with id ${id} deleted successfully`); // to do logger
      return true;
    }

    console.log(`Movie with id ${id} deleted successfully`); // to do logger
    return true;
  } catch (error) {
    console.error("Error deleting movie:", error);
    throw error; // to do logger
  }
};

