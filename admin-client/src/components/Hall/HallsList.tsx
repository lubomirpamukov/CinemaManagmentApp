import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import styles from "./HallList.module.css";
import { deleteHall } from "../../services";
import ActionButton from "../buttons/ActionButton";
import { Cinema, Hall } from "../../utils";

type HallListProps = {
  halls: Hall[];
  cinema: Cinema;
};

const HallList: React.FC<HallListProps> = ({ cinema, halls }) => {
  const [hallDetails, setHallDetails] = useState<Hall[]>(halls); // Local state for hall details

  // Sync local state with props
  useEffect(() => {
    setHallDetails(halls);
  }, [halls]);

  // Delete a hall
  async function handleDelete(id: string) {
    const windowConfirm = window.confirm(
      "Are you sure you want to delete this hall?"
    );
    if (!windowConfirm) return;

    // Update hallDetails locally
    const updatedHallDetails = hallDetails.filter((hall) => hall.id !== id);
    setHallDetails(updatedHallDetails);

    // Update the server
    try {
      await deleteHall(cinema.id!, id);
    } catch (error) {
      console.error("Failed to delete hall:", error);
      // Restore the original state if the API call fails
      setHallDetails(halls);
    }
  }

  return (
    <div className={styles.hallList}>
      <h2>Halls</h2>
      <div className={styles.hallGrid}>
        {hallDetails.map((hall) => (
          <div key={hall.id} className={styles.hallCard}>
            <h3>{hall.name || "Unnamed Hall"}</h3>
            <div className={styles.hallDetails}>
              <p>
                <strong>Layout:</strong> {hall.layout?.rows || 0} rows ×{" "}
                {hall.layout?.columns || 0} columns
              </p>
              <p>
                <strong>Seats:</strong>{" "}
                {(hall.layout?.columns || 0) * (hall.layout?.rows || 0)}
              </p>
              <p>
                <strong>Movies Scheduled:</strong>{" "}
                {hall.movieProgram?.length || 0}
              </p>
            </div>
            <ActionButton
              label="Delete"
              id={`delete-hall-${hall.id}`}
              type="delete"
              onClick={() => handleDelete(hall.id!)}
            />
          </div>
        ))}
      </div>
      <Link
        to={`/cinemas/${cinema?.id}/hall/create`}
        className={styles.addHallLink}
      >
        Add hall
      </Link>
    </div>
  );
};

export default HallList;
