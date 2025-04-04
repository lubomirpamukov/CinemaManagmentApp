import React from "react";

import styles from "./CinemaList.module.css";
import { Cinema } from "../../utils/CinemaValidationsSchema";
import CinemaCard from "./CinemaCard";
import { useCinemas } from "../../hooks/useCinemas";

export type CinemaWithAction = Cinema & { onRefresh: () => void }; // adds refresh method on the cinema object to refresh page

const CinemaList: React.FC = () => {
  
  const { cinemas, loading, error, refresh } = useCinemas();

  if (loading) {
    return <div>Loading...</div>; // to do loading spinner
  }

  if (error) {
    return <p>Error: {error}</p>; // to do error message
  }

 

  return (
    <div className={styles.cinemaList}>
      {cinemas.map(({ onRefresh, ...cinema }, index) => (
        <CinemaCard onRefresh={refresh} key={cinema.id || `cinema-${index}`} {...cinema} />
      ))}
    </div>
  );
};

export default CinemaList;
