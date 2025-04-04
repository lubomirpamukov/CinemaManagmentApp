import React from "react";
import { useHallDetails } from "../../hooks/fetchHallDetails";
import styles from "./HallList.module.css";
import { useNavigate } from "react-router-dom";

interface HallListProps {
  hallIds: string[];
}

const HallList: React.FC<HallListProps> = ({ hallIds }) => {
  const { hallDetails, loading, error } = useHallDetails(hallIds);
  const navigator = useNavigate();

  //redirect
  function handleEdit(id: string) {
    navigator(`/halls/${id}/edit`);
  }

  if (loading) {
    return <div>Loading halls...</div>;
  }

  if (error) {
    return <p className={styles.error}>Error: {error}</p>;
  }

  if (hallDetails.length === 0) {
    return <p>No halls available.</p>;
  }

  return (
    <div className={styles.hallList}>
      <h2>Halls</h2>
      <div className={styles.hallGrid}>
        {hallDetails.map((hall) => (
          <div key={hall.id} className={styles.hallCard}>
            <h3>{hall.name}</h3>
            <div className={styles.hallDetails}>
              <p>
                <strong>Layout:</strong> {hall.layout.rows} rows × {hall.layout.columns} columns
              </p>
              <p>
                <strong>Seats:</strong> {hall.layout.columns * hall.layout.rows}
              </p>
              <p>
                <strong>Movies Scheduled:</strong> {hall.movieProgram.length}
              </p>
            </div>
            <button 
              className={styles.viewButton} 
              onClick={() => handleEdit(hall.id)}
            >
              Edit
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default HallList;