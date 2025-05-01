import React from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoginShow from "../components/LoginShow";
import styles from "./LoginPage.module.css";
//to do refactor to use login hook
const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:3123/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      login();
      navigate("/users");
    } catch (err: any) {
      console.log(err);
    }
  };

  return (
    <>
      <h1>hello from loginPage</h1>
      <LoginShow onLogin={handleLogin} />
    </>
  );
};

export default LoginPage;
