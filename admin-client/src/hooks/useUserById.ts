import { useEffect, useState } from "react";

import { getUserById } from "../services";
import { User } from "../utils";
import { DEFAULT_USER_VALUES } from "../utils/constants";

export const useUserById = (userId?: string) => {
  const [user, setUser] = useState<User>(DEFAULT_USER_VALUES);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const userData = await getUserById(userId);
      if (!userData) {
        throw new Error(`No user found with ID: ${userId}`);
      }
      setUser(userData);
    } catch (err) {
      setError(
        `Failed to fetch user data: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  return { user, loading, error};
};
