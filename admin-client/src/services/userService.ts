import { TUser, userSchema } from "../utils";
const BASE_URL = "http://localhost:3123/admin/users";

export const getUsers = async (): Promise<TUser[]> => {
  try {
    const response = await fetch(BASE_URL, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    const data = await response.json();
    return userSchema.array().parse(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; // to do logger
  }
};

export const getUserById = async (id: string): Promise<TUser> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }
    const data = await response.json();
    return userSchema.parse(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; // to do logger
  }
};

export type UserInput = Omit<TUser, "id">;
export const createUser = async (user: UserInput): Promise<TUser> => {
  user.role = "user";
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error("Failed to create user");
    }
    const data = await response.json();
    return userSchema.parse(data);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error; // to do logger
  }
};

export const updateUser = async (id: string, user: TUser): Promise<TUser> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error("Failed to update user");
    }
    const data = await response.json();
    return userSchema.parse(data);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error; // to do logger
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      credentials: "include",
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }
    console.log("User deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error; // to do logger
  }
};
