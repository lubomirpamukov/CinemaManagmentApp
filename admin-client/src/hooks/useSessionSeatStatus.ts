import { useState, useEffect, useCallback } from "react";
import { getReservedSeatsForSession } from "../services";
import { SeatZod } from "../utils";

export interface UseSessionSeatStatusReturn {
  seatsWithStatus: SeatZod[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const useSessionSeatStatus = (
  sessionId: string | null | undefined,
  allHallSeats: SeatZod[]
): UseSessionSeatStatusReturn => {
  const [seatsWithStatus, setSeatsWithStatus] = useState<SeatZod[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndProcessSeats = useCallback(async () => {
    if (!sessionId || !allHallSeats || allHallSeats.length === 0) {
      setSeatsWithStatus(
        allHallSeats.map((seat) => ({ ...seat, isAvailable: true }))
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reservedSeats = await getReservedSeatsForSession(sessionId);
      const reservedSeatOriginalIds = new Set(
        reservedSeats.map((seat) => seat.originalSeatId)
      );

      const updatedSeatsWithStatus = allHallSeats.map((hallSeat) => ({
        ...hallSeat,
        isAvailable: !reservedSeatOriginalIds.has(hallSeat.originalSeatId),
      }));

      setSeatsWithStatus(updatedSeatsWithStatus);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred while fetching seat status."
      );
      setSeatsWithStatus(
        allHallSeats.map((seat) => ({ ...seat, isReserved: false }))
      );
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, allHallSeats]);

  useEffect(() => {
    fetchAndProcessSeats();
  }, [fetchAndProcessSeats]);

  return { seatsWithStatus, isLoading, error, refetch: fetchAndProcessSeats };
};

export default useSessionSeatStatus;
