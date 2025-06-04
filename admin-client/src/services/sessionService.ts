import {
  Session,
  sessionDisplayPaginatedSchema,
  SessionPaginatedResponse,
  sessionSchema,
} from "../utils";

const BASE_URL = "http://localhost:3123/admin";

export const createSession = async (
  cinemaId: string,
  hallId: string,
  session: Session
): Promise<Session> => {
  const url = `${BASE_URL}/cinemas/${cinemaId}/halls/${hallId}/sessions`;
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
  return sessionSchema.parse(data);
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

  const url = `${BASE_URL}/sessions${queryParams ? `?${queryParams}` : ""}`;

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
