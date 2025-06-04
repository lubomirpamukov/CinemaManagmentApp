import { useState, useEffect, useCallback } from "react";

import { getMovies } from "../services";
import { Movie } from "../utils";

export const useMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchMovies = async () => {
      setLoading(true);
      try {
        const data = await getMovies();
        if (isActive) {
          setMovies(data);
          setError(null);
        }
      } catch (err: any) {
        if (isActive) {
          setError(err.message || "Failed to fetch movies");
          setMovies([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchMovies();

    return () => {
      isActive = false;
    };
  }, [refreshKey, refresh]);

  return { movies, loading, error, refresh };
};
