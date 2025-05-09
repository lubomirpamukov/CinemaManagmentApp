import { useState, useEffect } from "react";
import { ZodSchema } from "zod";

export const usePaginated = <T>(
  endpoint: string,
  pageSize: number,
  schema: ZodSchema<T[]>,
  searchQuery?: string
) => {
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3123${endpoint}?page=${currentPage}&limit=${pageSize}&search=${searchQuery}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      const parsedData = schema.parse(result.data);
      setData(parsedData);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
      setError(null);
    } catch (err) {
      setError("Error fetching data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, currentPage, pageSize, searchQuery]);

  const refresh = async () => {
    await fetchData();
  };

  return {
    data,
    currentPage,
    totalPages,
    loading,
    error,
    setCurrentPage,
    refresh,
  };
};
