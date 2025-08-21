import React from "react";
import { Link } from "react-router-dom";

import { TCinema } from "../../utils";
import { useCinemas } from "../../hooks";
import styles from "./CinemaList.module.css";
import Spinner from "../Spinner";

export type CinemaWithAction = TCinema;

const CinemaList: React.FC = () => {
  const { cinemas, loading } = useCinemas();

  if (loading) {
    <Spinner />;
  }

  return (
    <div className={styles.cinemaList}>
      {cinemas.map((cinema) => (
        <Link
          to={`/cinemas/${cinema.id}/edit`}
          key={cinema.id}
          className={styles.cinemaCardLink}
        >
          <div className={styles.cinemaCard}>
            {cinema.imgURL && (
              <img
                src={cinema.imgURL}
                alt={cinema.name}
                className={styles.cinemaImage}
              />
            )}
            <div className={styles.cinemaContent}>
              <h2 className={styles.cinemaName}>{cinema.name}</h2>
              <p className={styles.cinemaLocation}>
                <strong>Location:</strong> {cinema.city}
              </p>
              <p className={styles.cinemaRooms}>
                <strong>Rooms count:</strong> {cinema.halls.length}
              </p>
              <p className={styles.cinemaRooms}>
                <strong>Snack's count:</strong> {cinema.snacks?.length}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CinemaList;
