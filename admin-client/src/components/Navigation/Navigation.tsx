import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Navigation.module.css";

const Navigation: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
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
            to="/movies/create"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Create Movie
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;