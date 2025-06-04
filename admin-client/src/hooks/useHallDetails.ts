import { useState, useEffect } from "react";
import { getHallsByCinemaId } from "../services";
import { Hall } from "../utils";

export const useHallDetails = (cinemaId: string | undefined) => {
  const [hallsDetails, setHallDetails] = useState<Hall[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cinemaId) {
      // Don't do anything if cinemaId is not available
      setHallDetails([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchHallDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const halls = await getHallsByCinemaId(cinemaId);
        setHallDetails(halls);
      } catch (err: any) {
        setError(err.message || "Failed to load hall details");
        setHallDetails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHallDetails();
  }, [cinemaId]);
  return { hallsDetails, loading, error };
};