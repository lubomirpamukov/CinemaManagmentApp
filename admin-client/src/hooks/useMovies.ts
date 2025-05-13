import { useState, useEffect, useCallback } from 'react';

import { getMovies } from '../services';
import { MovieCardProps } from '../components/movie/MovieCard';


export const useMovies = () => {
  const [movies, setMovies] = useState<MovieCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true); 
      try {
        const data = await getMovies();
        const moviesWithActions: MovieCardProps[] = data.map((movie) => ({
          movie,
          onRefresh: refresh, 
        }));
        setMovies(moviesWithActions);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch movies');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [refreshKey, refresh]);

  // Return all necessary data and functions
  return { movies, loading, error, refresh };
};
