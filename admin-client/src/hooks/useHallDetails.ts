import { useState, useEffect } from "react";
import { getHallsByCinemaId } from "../services/hallService";
import { Hall } from "../utils";

export const useHallDetails = (cinemaId: string | undefined) => {
  const [hallsDetails, setHallDetails] = useState<Hall[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cinemaId) {
      setHallDetails([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isActive = true;

    const fetchHallDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isActive) {
          const halls = await getHallsByCinemaId(cinemaId);
          setHallDetails(halls);
        }
      } catch (err: any) {
        if (isActive) {
          setError(err.message || "Failed to load hall details");
          setHallDetails([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchHallDetails();

    return () => {
      isActive = false;
    };
  }, [cinemaId]);
  return { hallsDetails, loading, error };
};
