import { useState, useEffect } from "react";

import { getUsers } from "../services";
import { TUser } from "../utils";

export const useUsers = () => {
  const [users, setUsers] = useState<TUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data: TUser[] = await getUsers();
        setUsers(data);
        setError(null);
      } catch (error) {
        setError("Failed to fetch users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};
