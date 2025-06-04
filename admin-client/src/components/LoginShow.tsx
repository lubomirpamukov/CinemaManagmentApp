import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/buttons/ActionButton";
import styles from "./LoginShow.module.css";

type LoginShowProps = {
  onLogin: (email: string, password: string) => void;
};

const LoginShow: React.FC<LoginShowProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

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
