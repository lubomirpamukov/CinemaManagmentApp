import React, { useEffect, useState } from "react";

import styles from "./CinemaList.module.css";
import { Cinema } from "../../utils/CinemaValidationsSchema";
import { getCinemas } from "../../services/cinemaService";
import CinemaCard from "./CinemaCard";

export type CinemaWithAction = Cinema & { onRefresh: () => void }; // adds refresh method on the cinema object to refresh page

const CinemaList: React.FC = () => {
  const [cinemas, setCinemas] = useState<CinemaWithAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);


  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  }
  
  useEffect(() => {
    const fetchCinema = async () => {
      try {
        const data = await getCinemas();
        const cinemaWithAction: CinemaWithAction[] = data.map((cinema) =>({
            ...cinema,
            onRefresh: handleRefresh
        }));
        setCinemas(cinemaWithAction);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCinema()
  }, [refreshKey]);

  if (loading) {
    return <div>Loading...</div>; // to do loading spinner
  }

  if (error) {
    return <p>Error: {error}</p>; // to do error message
  }

 

  return (
    <div className={styles.cinemaList}>
      {cinemas.map(({ onRefresh, ...cinema }, index) => (
        <CinemaCard onRefresh={handleRefresh} key={cinema.id || `cinema-${index}`} {...cinema} />
      ))}
    </div>
  );
};

export default CinemaList;
