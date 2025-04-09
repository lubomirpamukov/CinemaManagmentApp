import React from "react";
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
  const { hallDetails, loading, error } = useHallDetails(hallIds);
  const navigator = useNavigate();
  const { cinema } = useCinemaById(cinemaId);

  //redirect
  function handleEdit(id: string) {
    const windowConfirm = window.confirm(
      "Are you sure you want to edit this hall?"
    );
    // If the user confirms, navigate to the edit page
    if (!windowConfirm) return;
    navigator(`/halls/${id}/edit`);
  }

  async function handleDelete(id: string) {
    const windowConfirm = window.confirm(
      "Are you sure you want to delete this hall?"
    );
    // If the user confirms, navigate to the edit page
    if (!windowConfirm) return;

    //Delete hall from cinema Array

    if (!cinema) {
      console.error("Cinema not found");
      return;
    }
    const updatedHalls = cinema.halls.filter((hall) => hall !== id);
    cinema.halls = updatedHalls;
    await updateCinema(cinemaId, cinema);

    //Delete hall from hall collection
    await deleteHall(id);
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
                <strong>Layout:</strong> {hall.layout.rows} rows ×{" "}
                {hall.layout.columns} columns
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
