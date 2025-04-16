import { useState, useEffect } from "react";
import { ZodSchema } from "zod";

export const usePaginated = <T>(
  endpoint: string,
  limit: number,
  schema: ZodSchema<T[]>
) => {
  const [allData, setAllData] = useState<T[]>([]);
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data once refactor when backend is ready !!!
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000${endpoint}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        const parsedData = schema.parse(result);
        setAllData(parsedData);
        setTotalPages(Math.ceil(parsedData.length / limit));
        setError(null);
      } catch (err) {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [endpoint, limit]);

  // Update paginated data when currentPage or allData changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    setData(allData.slice(startIndex, endIndex));
  }, [allData, currentPage, limit]);

  return { data, currentPage, totalPages, loading, error, setCurrentPage };
};