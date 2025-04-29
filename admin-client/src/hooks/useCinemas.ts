import { useState, useEffect } from 'react';

import { Cinema } from "../utils";
import { getCinemas } from "../services";

/**
 * Custom hook for fetching and managing cinema data
 * 
 * This hook:
 * 1. Fetches cinema data from the API
 * 2. Handles loading and error states
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
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  
  // Track loading state to show/hide loading indicators
  const [loading, setLoading] = useState(true);
  
  // Track error state for displaying error messages
  const [error, setError] = useState<string | null>(null);
  

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
        const data: Cinema[] = await getCinemas();
        
        // Attach refresh function to each cinema object
        // This allows individual cinema cards to trigger a refresh
      
        
        setCinemas(data);
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
  }, [cinemas.length]); // Dependencies: refreshKey and refresh function

  // Return all necessary data and functions
  return { cinemas, loading, error};
};
