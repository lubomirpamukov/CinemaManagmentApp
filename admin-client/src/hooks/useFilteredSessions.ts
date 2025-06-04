import { useEffect, useState } from "react";
import { SessionDisplay } from "../utils";
import { getFilteredSessions } from "../services";

// Define props interface
type FilterProps = {
  cinemaId?: string;
  hallId?: string;
  movieId?: string;
  date?: string;
  page?: number;
  limit?: number;
};

type UseFilteredSessionsResult = {
  sessions: SessionDisplay[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  pagination: {
    currentPage: number;
    totalPages: number;
  };
  setPage: (page: number) => void;
};

export const useFilteredSessions = ({
  cinemaId,
  hallId,
  movieId,
  date,
  page = 1,
  limit = 2,
}: FilterProps): UseFilteredSessionsResult => {
  const [sessions, setSessions] = useState<SessionDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getFilteredSessions({
        cinemaId,
        hallId,
        movieId,
        date,
        page: currentPage,
        limit,
      });

      setSessions(result.data);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError(err instanceof Error ? err.message : "Error fetching sessions");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [cinemaId, hallId, movieId, date, currentPage, limit]);

  const setPage = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
    pagination: { currentPage, totalPages },
    setPage,
  };
};
