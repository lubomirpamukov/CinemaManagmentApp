import { z } from "zod";

import { hallSchema } from "../utils";

const BASE_URL = "http://localhost:3000/halls";

export type Hall = z.infer<typeof hallSchema>;

export const getHalls = async (): Promise<Hall[]> => {
  try {
    const response = await fetch(BASE_URL);
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

export const getHallById = async (id: string): Promise<Hall> =>{
  try{
    const response = await fetch(`${BASE_URL}/${id}`);
    if(!response.ok){
      throw new Error(`Error fetching hall with id ${id}`);
    }
    const data = await response.json();
    return hallSchema.parse(data);
  }catch(error){
    console.error("Error fetching hall:", error);
    throw error; // to do log
  }
}

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


export const createHall = async(hall: Hall): Promise<Hall> => {
  try{
    const response = await fetch(BASE_URL,{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hall),
    });
    if(!response.ok){
      throw new Error("Error creating hall");
    }
    const data = await response.json();
    return hallSchema.parse(data);
  }catch(error){
    console.error("Error creating hall:", error);
    throw error; // to do log
  }
};

export const updateHall = async (id: string, hall: Hall): Promise<Hall> => {
  try{
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
  }catch(error){
    console.error("Error updating hall:", error);
    throw error; // to do log
  }
};

export const deleteHall = async (id: string): Promise<void> => {
  try{
    const response = await fetch(`${BASE_URL}/${id}`,{
      method: "DELETE",
    });
    if(!response.ok){
      throw new Error(`Error deleting hall with id ${id}`);
    }
    console.log(`Hall with id ${id} deleted successfully`);
  }catch(error){
    console.error("Error deleting hall:", error);
    throw error; // to do log
  }
}
