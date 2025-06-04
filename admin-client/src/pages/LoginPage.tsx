import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoginShow from "../components/LoginShow";
import { loginUser } from "../services";
import styles from "./LoginPage.module.css";
import Spinner from "../components/Spinner";

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    try {
      await loginUser(email, password);
      login();
      navigate("/users");
    } catch (err: any) {
      console.error("Login failed", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/users");
    }
  }, [isAuthenticated]);

  if (loading) {
    return <Spinner />;
  }

  return <>{!isAuthenticated && <LoginShow onLogin={handleLogin} />}</>;
};

export default LoginPage;
