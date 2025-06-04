import { useState, useEffect } from "react";

import { Cinema } from "../utils";
import { getCinemaById } from "../services";

export const useCinemaById = (cinemaId: string) => {
  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const fetchCinema = async () => {
      setLoading(true);
      try {
        if (isActive) {
          const data = await getCinemaById(cinemaId);
          setCinema(data);
          setError(null);
        }
      } catch (err: any) {
        if (isActive) {
          setError(err.message || "Failed to fetch cinema");
          setCinema(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchCinema();
    return () => {
      isActive = false;
    };
  }, []);

  return { cinema, loading, error };
};
