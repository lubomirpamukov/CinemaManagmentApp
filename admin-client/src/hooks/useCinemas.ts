import { useState, useEffect, useCallback } from 'react';
import { Cinema } from "../utils/CinemaValidationsSchema";
import { getCinemas } from "../services/cinemaService";

export type CinemaWithAction = Cinema & { onRefresh: () => void };

/**
 * Custom hook for fetching and managing cinema data with refresh capability
 * 
 * This hook:
 * 1. Fetches cinema data from the API
 * 2. Handles loading and error states
 * 3. Provides a refresh function to reload data when needed
 * 4. Attaches the refresh function to each cinema item
 * 
 * @returns {Object} An object containing:
 *   - cinemas: Array of cinema objects with attached refresh function
 *   - loading: Boolean indicating if data is currently being fetched
 *   - error: Error message string or null if no error
 *   - refresh: Function to manually trigger data refresh
 * 
 * Usage example:
 * ```tsx
 * // In your component:
 * const { cinemas, loading, error, refresh } = useCinemas();
 * 
 * // Render cinemas
 * return (
 *   <div>
 *     {loading ? (
 *       <LoadingSpinner />
 *     ) : error ? (
 *       <ErrorMessage message={error} />
 *     ) : (
 *       cinemas.map(cinema => (
 *         <CinemaCard 
 *           key={cinema.id} 
 *           {...cinema} 
 *           onRefresh={refresh} 
 *         />
 *       ))
 *     )}
 *     <button onClick={refresh}>Refresh All</button>
 *   </div>
 * );
 * ```
 * 
 * When a specific cinema is updated/deleted, call the onRefresh prop
 * to trigger a data reload for the entire list.
 */
export const useCinemas = () => {
  // Track cinema data with the refresh function attached
  const [cinemas, setCinemas] = useState<CinemaWithAction[]>([]);
  
  // Track loading state to show/hide loading indicators
  const [loading, setLoading] = useState(true);
  
  // Track error state for displaying error messages
  const [error, setError] = useState<string | null>(null);
  
  // refreshKey is used to trigger re-fetching data when incremented
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Refresh function to reload cinema data
   * - Wrapped in useCallback to maintain reference stability
   * - Can be passed to child components to allow them to trigger refresh
   * - Increments refreshKey which triggers the useEffect dependency
   */
  const refresh = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  /**
   * Effect to fetch cinema data
   * - Runs on initial mount
   * - Re-runs whenever refreshKey changes (when refresh() is called)
   */
  useEffect(() => {
    const fetchCinemas = async () => {
      setLoading(true); // Start loading
      try {
        // Fetch cinema data from API
        const data = await getCinemas();
        
        // Attach refresh function to each cinema object
        // This allows individual cinema cards to trigger a refresh
        const cinemasWithAction: CinemaWithAction[] = data.map((cinema) => ({
          ...cinema,
          onRefresh: refresh
        }));
        
        setCinemas(cinemasWithAction);
        setError(null); // Clear any previous errors
      } catch (err: any) {
        // Handle and store error message
        setError(err.message || 'Failed to fetch cinemas');
        setCinemas([]); // Reset cinemas on error
      } finally {
        setLoading(false); // End loading state regardless of outcome
      }
    };

    fetchCinemas();
  }, [refreshKey, refresh]); // Dependencies: refreshKey and refresh function

  // Return all necessary data and functions
  return { cinemas, loading, error, refresh };
};