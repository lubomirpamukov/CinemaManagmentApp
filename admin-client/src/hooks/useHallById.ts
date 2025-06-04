import { useState, useEffect } from "react";
import { getHallById } from "../services";
import { Hall } from "../utils";

export const useHallById = (hallId: string | undefined) => {
  const [hall, setHall] = useState<Hall | null>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hallId) {
      setHall(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchHall = async () => {
      setLoading(true);
      setError(null);
      try {
        const hallData = await getHallById(hallId);
        setHall(hallData);
      } catch (error: any) {
        setError(error.message || "Failed to load hall data");
        setHall(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHall();
  }, [hallId]);

  return { hall, loading, error };
};
