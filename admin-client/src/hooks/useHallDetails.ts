import { useState, useEffect } from "react";
import { Hall, getHallsByIds } from "../services/hallService";

/**
 * Custom hook to fetch hall details based on an array of hall IDs
 * 
 * This hook:
 * 1. Takes an array of hall IDs and fetches the complete details for each hall
 * 2. Manages loading state during data fetching
 * 3. Handles error states if API calls fail
 * 4. Returns structured hall data ready for rendering
 * 
 * @param hallIds Array of hall IDs to fetch (e.g., ["hall_1", "hall_2"])
 * 
 * @returns {Object} An object containing:
 *   - hallDetails: Array of Hall objects with complete details
 *   - loading: Boolean indicating if data is currently being fetched
 *   - error: Error message string or null if no error
 * 
 * Usage example:
 * ```tsx
 * // In your component:
 * const { hallDetails, loading, error } = useHallDetails(["hall_1", "hall_2"]);
 * 
 * // Render halls
 * return (
 *   <div>
 *     {loading ? (
 *       <LoadingSpinner />
 *     ) : error ? (
 *       <ErrorMessage message={error} />
 *     ) : hallDetails.length === 0 ? (
 *       <p>No halls available</p>
 *     ) : (
 *       hallDetails.map(hall => (
 *         <HallCard 
 *           key={hall.id} 
 *           {...hall} 
 *         />
 *       ))
 *     )}
 *   </div>
 * );
 * ```
 * 
 * Common use cases:
 * 1. Displaying hall details in a cinema page
 * 2. Showing hall layout for seat selection
 * 3. Presenting movie schedules per hall
 * 
 * Edge cases handled:
 * - Empty hallIds array: Returns empty hallDetails with loading=false
 * - Failed API calls: Sets error state with appropriate message
 * - Type validation: Ensures returned data matches the Hall interface
 */
export const useHallDetails = (hallIds: string[]) => {
  // State for storing fetched hall data
  const [hallDetails, setHallDetails] = useState<Hall[]>([]);
  
  // Loading state to track when data is being fetched
  const [loading, setLoading] = useState<boolean>(true);
  
  // Error state to capture and display any fetch errors
  const [error, setError] = useState<string | null>(null);

  // Effect hook to fetch hall details when hallIds change
  useEffect(() => {
    // Define the async function to fetch hall details
    const fetchHallDetails = async () => {
      // Handle empty hallIds array case
      if (!hallIds.length) {
        setHallDetails([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch hall details from service
        const fetchedHalls = await getHallsByIds(hallIds);
        setHallDetails(fetchedHalls);
        setError(null); // Clear any previous errors
      } catch (err) {
        // Log and handle errors
        console.error("Failed to fetch hall details:", err);
        setError("Failed to load hall details. Please try again later.");
        setHallDetails([]); // Reset hall details on error
      } finally {
        // Always set loading to false when done
        setLoading(false);
      }
    };

    // Execute the fetch function
    fetchHallDetails();
  }, [hallIds,hallDetails.length]); // Re-run effect when hallIds change

  // Return all necessary data
  return { hallDetails, loading, error };
};