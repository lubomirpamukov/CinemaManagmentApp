import React from "react";
import styles from "./CinemaDetails.module.css";
import { Cinema } from "../../utils/CinemaValidationsSchema";
import SnackList from "./SnackList";

type CinemaDetailsProps = Omit<Cinema, "imgURL">;

const CinemaDetails: React.FC<CinemaDetailsProps> = ({
  id,
  name,
  city,
  halls,
  snacks,
}) => {
  return (
    <div className={styles.cinemaDetails}>
      <p>
        <strong>Name:</strong> {name}
      </p>
      <p>
        <strong>City:</strong> {city}
      </p>
      <p>{/* halls component */}</p>
      <SnackList cinemaId={id} snacks={snacks} />
    </div>
  );
};

export default CinemaDetails;
