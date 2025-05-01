import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/buttons/ActionButton";
import styles from "./LoginShow.module.css";

const LoginShow: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3123/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      const token = data.token;
      localStorage.setItem("token", token);
      navigate("/movies");
    } catch (err: any) {
      setError(err.message);
    }
    setEmail("");
    setPassword("");
  };
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label htmlFor="email" className={styles.label}>
        Email
        <input
          className={styles.input}
          id="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
      </label>

      <label htmlFor="password" className={styles.label}>
        Password
        <input
          className={styles.input}
          id="password"
          placeholder="password"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        ></input>
      </label>
      <ActionButton
        label="Login"
        buttonType="submit"
        id="login"
        className={styles.button}
      />
    </form>
  );
};

export default LoginShow;
