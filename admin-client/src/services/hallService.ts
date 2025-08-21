import { hallSchema, Hall } from "../utils";

const BASE_URL = "http://localhost:3123";

export const getHallsByCinemaId = async (cinemaId: string): Promise<Hall[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/admin/cinemas/${cinemaId}/halls`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Error fetching halls for cinema with id ${cinemaId}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error in getHallsByCinemaId:", error);
    throw error;
  }
};

export const getHalls = async (): Promise<Hall[]> => {
  try {
    const response = await fetch(`${BASE_URL}/admin`);
    if (!response.ok) {
      throw new Error("Error fetching halls");
    }
    const data = await response.json();
    return hallSchema.array().parse(data);
  } catch (error) {
    console.error("Error fetching halls:", error);
    throw error; // to do log
  }
};

export const getHallById = async (hallId: string): Promise<Hall> => {
  try {
    const response = await fetch(`${BASE_URL}/halls/${hallId}`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Error fetching hall with id ${hallId}`);
    }
    const data = await response.json();
    return hallSchema.parse(data);
  } catch (error) {
    console.error("Error fetching hall:", error);
    throw error; // to do log
  }
};

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

export const createHall = async (
  cinemaId: string,
  hall: Hall
): Promise<Hall> => {
  try {
    const response = await fetch(
      `${BASE_URL}/admin/cinemas/${cinemaId}/halls`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hall),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server error:", errorData);
      throw new Error(errorData.error || "Error creating hall");
    }
    const responseData = await response.json();

    return hallSchema.parse(responseData.data);
  } catch (error) {
    console.error("Error creating hall:", error);
    throw error; // to do log
  }
};
export const updateHall = async (id: string, hall: Hall): Promise<Hall> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hall),
    });
    if (!response.ok) {
      throw new Error(`Error updating hall with id ${id}`);
    }
    const data = await response.json();
    return hallSchema.parse(data);
  } catch (error) {
    console.error("Error updating hall:", error);
    throw error; // to do log
  }
};

export const deleteHall = async (hallId: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/admin/halls/${hallId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Error deleting hall with id ${hallId}`
      );
    }
  } catch (error) {
    console.error("Error deleting hall:", error);
    throw error; // to do log
  }
};
