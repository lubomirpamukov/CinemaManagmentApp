import { useState, useEffect } from "react";

import { Cinema } from "../utils";
import { getCinemaById } from "../services";

/**
 * Custom hook for fetching a specific cinema by ID.
 * 
 * @param {string} cinemaId - The ID of the cinema to fetch.
 * @returns {Object} An object containing:
 *   - cinema: The fetched cinema object or null if not found.
 *   - loading: Boolean indicating if the data is being fetched.
 *   - error: Error message string or null if no error occurred.
 */
export const useCinemaById = (cinemaId: string) => {
  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCinema = async () => {
      setLoading(true);
      try {
        const data = await getCinemaById(cinemaId); // Fetch cinema by ID
        setCinema(data);
        setError(null); // Clear any previous errors
      } catch (err: any) {
        setError(err.message || "Failed to fetch cinema");
        setCinema(null); // Reset cinema on error
      } finally {
        setLoading(false);
      }
    };

    fetchCinema();
  }, [cinemaId, cinema?.halls.length, cinema?.snacks?.length]); // Re-fetch when cinemaId, halls, or snacks change

  return { cinema, loading, error };
};
