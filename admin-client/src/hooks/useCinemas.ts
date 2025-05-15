import { useState, useEffect } from 'react';

import { Cinema } from "../utils";
import { getCinemas } from "../services";


export const useCinemas = () => {
  // Track cinema data with the refresh function attached
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  
  // Track loading state to show/hide loading indicators
  const [loading, setLoading] = useState(true);
  
  // Track error state for displaying error messages
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchCinemas = async () => {
      setLoading(true); // Start loading
      try {
        // Fetch cinema data from API
        const data: Cinema[] = await getCinemas();
  
        
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
  }, []); // Dependencies: refreshKey and refresh function

  // Return all necessary data and functions
  return { cinemas, loading, error};
};
