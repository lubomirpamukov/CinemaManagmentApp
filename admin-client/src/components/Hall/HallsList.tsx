import React, { useState, useEffect } from "react";
import { useHallDetails } from "../../hooks/useHallDetails";
import styles from "./HallList.module.css";
import { useNavigate, Link } from "react-router-dom";
import { useCinemaById } from "../../hooks/useCinemaById";
import { updateCinema } from "../../services/cinemaService";
import { deleteHall } from "../../services/hallService";
import ActionButton from "../buttons/ActionButton";

type HallListProps = {
  hallIds: string[];
  cinemaId: string;
};

const HallList: React.FC<HallListProps> = ({ cinemaId, hallIds }) => {
  const { hallDetails: initialHallDetails, loading, error } = useHallDetails(hallIds);
  const { cinema } = useCinemaById(cinemaId);
  const [hallDetails, setHallDetails] = useState(initialHallDetails); // Local state for hall details
  const navigator = useNavigate();

  // Sync local state with fetched data
  useEffect(() => {
    setHallDetails(initialHallDetails);
  }, [initialHallDetails]);

  // Redirect to edit page
  function handleEdit(id: string) {
    const windowConfirm = window.confirm(
      "Are you sure you want to edit this hall?"
    );
    if (!windowConfirm) return;
    navigator(`/halls/${id}/edit`);
  }

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

  // Update a hall (example function for updating hall details)
  function handleUpdate(updatedHall: any) {
    const updatedHallDetails = hallDetails.map((hall) =>
      hall.id === updatedHall.id ? updatedHall : hall
    );
    setHallDetails(updatedHallDetails); // Update local state
  }

  if (loading) {
    return <div>Loading halls...</div>;
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
              label="Edit"
              id="edit-button"
              type="edit"
              onClick={() => handleEdit(hall.id)}
              style={{ marginRight: "0.5em" }}
            />
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