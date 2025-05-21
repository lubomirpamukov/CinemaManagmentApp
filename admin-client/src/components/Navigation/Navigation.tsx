import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Navigation.module.css";

const Navigation: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout(); // Call the logout function
    navigate("/login"); // Redirect to the login page after logout
  };

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
        {isAuthenticated ? (
          <>
            <li className={styles.navItem}>
              <NavLink
                to="/movies"
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                Movies
              </NavLink>
            </li>

            <li className={styles.navItem}>
              <NavLink
                to="/movies/create"
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                Create Movie
              </NavLink>
            </li>

            <li className={styles.navItem}>
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                Users
              </NavLink>
            </li>

            <li className={styles.navItem}>
              <NavLink
                to="/cinemas"
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                Cinemas
              </NavLink>
            </li>

            <li className={styles.navItem}>
              <NavLink
                to="/cinemas/create"
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                Create Cinema
              </NavLink>
            </li>

            <li className={styles.navItem}>
              <NavLink
                to="/session"
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                Create Session
              </NavLink>
            </li>

            <li className={styles.navItem}>
              <NavLink
                to="/schedule"
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                Schedule
              </NavLink>
            </li>

            <li className={styles.navItem}>
              <NavLink
                to="/login"
                className={styles.navLink}
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                Logout
              </NavLink>
            </li>
          </>
        ) : (
          <li className={styles.navItem}>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              Login
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;