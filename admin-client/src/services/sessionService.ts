import { z } from "zod";
import {
  seatsSchema,
  SeatZod,
  Session,
  sessionDisplayPaginatedSchema,
  SessionPaginatedResponse,
  sessionSchema,
} from "../utils";

const BASE_URL = "http://localhost:3123";

export const createSession = async (
  cinemaId: string,
  hallId: string,
  session: Session
): Promise<Session> => {
  const url = `${BASE_URL}/admin/cinemas/${cinemaId}/halls/${hallId}/sessions`;
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(session),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create session: ${errorText}`);
  }

  const data = await response.json();
  return sessionSchema.parse(data.session);
};

type SessionFilters = {
  cinemaId?: string;
  hallId?: string;
  movieId?: string;
  date?: string;
  page?: number;
  limit?: number;
};

export const getFilteredSessions = async (
  filters: SessionFilters
): Promise<SessionPaginatedResponse> => {
  //building query from existing filters
  const queryParams = Object.entries(filters)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== ""
    )
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const url = `${BASE_URL}/admin/sessions${
    queryParams ? `?${queryParams}` : ""
  }`;

  const response = await fetch(url, {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get session:" ${errorText}`);
  }

  const data = await response.json();
  const validatedData = sessionDisplayPaginatedSchema.parse(data);
  return validatedData;
};

export const ReservedSeatsResponseZod = z.object({
  reservedSeats: z.array(seatsSchema),
});

export const getReservedSeatsForSession = async (
  sessionId: string
): Promise<SeatZod[]> => {
  if (!sessionId) {
    throw new Error("Session ID is required to fetch reserved seats.");
  }

  const url = `${BASE_URL}/session/${sessionId}/reserved-seats`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch reserved seats. Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }

    const responseData = await response.json();

    const validationResult = ReservedSeatsResponseZod.safeParse(responseData);
    if (!validationResult.success) {
      console.error(
        "Invalid data structure received for reserved seats:",
        validationResult.error.errors
      );
      throw new Error("Received invalid data format for reserved seats.");
    }
    return validationResult.data.reservedSeats;
  } catch (error) {
    console.error("Error fetching reseved seats for session:", error);
    throw error;
  }
};
