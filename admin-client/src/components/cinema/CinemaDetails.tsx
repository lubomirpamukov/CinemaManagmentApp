import React from "react";

import { Cinema } from "../../utils/CinemaValidationsSchema";
import SnackList from "./SnackList";
import styles from "./CinemaDetails.module.css";
import { useHallDetails } from "../../hooks/fetchHallDetails";

type CinemaDetailsProps = Omit<Cinema, "imgURL">;

const CinemaDetails: React.FC<CinemaDetailsProps> = ({
  id,
  name,
  city,
  halls,
  snacks,
}) => {
  const { hallDetails, loading, error } = useHallDetails(halls); // Fetch hall details using the custom hook

  return (
    <div className={styles.cinemaDetails}>
      <p>
        <strong>Name:</strong> {name}
      </p>
      <p>
        <strong>City:</strong> {city}
      </p>
      {hallDetails.map((hall) => (
        <div key={hall.id} className={styles.hallItem}>
          <h4>{hall.name}</h4>
        </div>
      ))}
      <SnackList cinemaId={id} snacks={snacks} />
    </div>
  );
};

export default CinemaDetails;
