import { useState, useEffect } from "react";
import { ZodSchema } from "zod";

export const usePaginated = <T>(
  endpoint: string,
  pageSize: number,
  schema: ZodSchema<T[]>
) => {
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000${endpoint}?_page=${currentPage}&_per_page=${pageSize}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        const parsedData = schema.parse(result.data);
        setData(parsedData);
        setTotalPages(result.pages);
        setError(null);
      } catch (err) {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [endpoint, currentPage]);

  return { data, currentPage, totalPages, loading, error, setCurrentPage };
};