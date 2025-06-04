import { useState, useEffect } from "react";

import { Cinema } from "../utils";
import { getCinemas } from "../services";

export const useCinemas = () => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const fetchCinemas = async () => {
      setLoading(true);
      try {
        if (isActive) {
          const data: Cinema[] = await getCinemas();

          setCinemas(data);
          setError(null);
        }
      } catch (err: any) {
        if (isActive) {
          setError(err.message || "Failed to fetch cinemas");
          setCinemas([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchCinemas();
    return () => {
      isActive = false;
    };
  }, []);

  return { cinemas, loading, error };
};
