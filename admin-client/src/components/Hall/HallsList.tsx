import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { useHallDetails } from "../../hooks";
import styles from "./HallList.module.css";
import { useCinemaById } from "../../hooks";
import { updateCinema } from "../../services";
import { deleteHall } from "../../services";
import ActionButton from "../buttons/ActionButton";
import Spinner from "../Spinner";

type HallListProps = {
  hallIds: string[];
  cinemaId: string;
};

const HallList: React.FC<HallListProps> = ({ cinemaId, hallIds }) => {
  const { hallDetails: initialHallDetails, loading, error } = useHallDetails(hallIds);
  const { cinema } = useCinemaById(cinemaId);
  const [hallDetails, setHallDetails] = useState(initialHallDetails); // Local state for hall details
  // Sync local state with fetched data
  useEffect(() => {
    setHallDetails(initialHallDetails);
  }, [initialHallDetails]);

  // Delete a hall
  async function handleDelete(id: string) {
    const windowConfirm = window.confirm(
      "Are you sure you want to delete this hall?"
    );
    if (!windowConfirm) return;

    if (!cinema) {
      console.error("Cinema not found");
      return;
    }

    // Update cinema's halls locally
    const updatedHalls = cinema.halls.filter((hall) => hall !== id);
    cinema.halls = updatedHalls;

    // Update hallDetails locally
    const updatedHallDetails = hallDetails.filter((hall) => hall.id !== id);
    setHallDetails(updatedHallDetails);

    // Update the server
    await updateCinema(cinemaId, { ...cinema, halls: updatedHalls });
    await deleteHall(id);
  }

  if (loading) {
   return  <Spinner />
  }

  if (error) {
    return <p className={styles.error}>Error: {error}</p>;
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
            <ActionButton
              label="Delete"
              id="delete-button"
              type="delete"
              onClick={() => handleDelete(hall.id)}
            />
          </div>
        ))}
      </div>
      <Link
        to={`/cinemas/${cinemaId}/hall/create`}
        className={styles.addHallLink}
      >
        Add hall
      </Link>
    </div>
  );
};

export default HallList;