import React from "react";
import { Link } from "react-router-dom";

import { Cinema } from "../../utils";
import { useCinemas } from "../../hooks";
import styles from "./CinemaList.module.css";

export type CinemaWithAction = Cinema;

const CinemaList: React.FC = () => {
  
  const { cinemas, loading, error} = useCinemas();

  if (loading) {
    return <div>Loading...</div>; // to do loading spinner
  }

  if (error) {
    return <p>Error: {error}</p>; // to do error message
  }

 

  return (
    <div className={styles.cinemaList}>
      {cinemas.map((cinema) => (
        <Link
          to={`/cinemas/${cinema.id}/edit`} // Navigate to the edit page for the cinema
          key={cinema.id}
          className={styles.cinemaCardLink} // Add a class for styling the link
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
                <strong>Snack's count:</strong> {cinema.snacks.length}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CinemaList;

