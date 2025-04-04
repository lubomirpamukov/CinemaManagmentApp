import { useState, useEffect, useCallback } from 'react';
import { getMovies } from '../services/movieService';
import { MovieCardProps } from '../components/movie/MovieCard';

/**
 * Custom hook for fetching and managing movie data with refresh capability
 * 
 * This hook:
 * 1. Fetches movie data from the API
 * 2. Handles loading and error states
 * 3. Provides a refresh function to reload data when needed
 * 4. Attaches the refresh function to each movie item
 * 
 * @returns {Object} An object containing:
 *   - movies: Array of movie objects with attached refresh function
 *   - loading: Boolean indicating if data is currently being fetched
 *   - error: Error message string or null if no error
 *   - refresh: Function to manually trigger data refresh
 * 
 * Usage example:
 * ```tsx
 * // In your component:
 * const { movies, loading, error, refresh } = useMovies();
 * 
 * // Render movies
 * return (
 *   <div>
 *     {loading ? (
 *       <LoadingSpinner />
 *     ) : error ? (
 *       <ErrorMessage message={error} />
 *     ) : (
 *       movies.map(movie => (
 *         <MovieCard 
 *           key={movie.id} 
 *           {...movie} 
 *           onRefresh={refresh} 
 *         />
 *       ))
 *     )}
 *     <button onClick={refresh}>Refresh All</button>
 *   </div>
 * );
 * ```
 * 
 * When a specific movie is updated/deleted, call the refresh function
 * to trigger a data reload for the entire list.
 */
export const useMovies = () => {
  // Track movie data
  const [movies, setMovies] = useState<MovieCardProps[]>([]);
  
  // Track loading state
  const [loading, setLoading] = useState(true);
  
  // Track error state
  const [error, setError] = useState<string | null>(null);
  
  // refreshKey is used to trigger re-fetching
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Refresh function to reload movie data
   * - Wrapped in useCallback to maintain reference stability
   * - Increments refreshKey which triggers the useEffect
   */
  const refresh = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  /**
   * Effect to fetch movie data
   * - Runs on initial mount
   * - Re-runs whenever refreshKey changes (when refresh() is called)
   */
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true); // Start loading state
      try {
        const data = await getMovies();
        const moviesWithActions: MovieCardProps[] = data.map((movie) => ({
          ...movie,
          onRefresh: refresh, // Attach the refresh function
          id: movie.id ?? '' 
        }));
        setMovies(moviesWithActions);
        setError(null); // Clear any previous errors
      } catch (err: any) {
        setError(err.message || 'Failed to fetch movies');
        setMovies([]); // Reset movies on error
      } finally {
        setLoading(false); // End loading state
      }
    };

    fetchMovies();
  }, [refreshKey, refresh]);

  // Return all necessary data and functions
  return { movies, loading, error, refresh };
};