import React from "react";
import { useNavigate } from "react-router-dom";

import { CinemaWithAction } from "./CinemaList";
import styles from "./CinemaCard.module.css";
import ActionButton from "../buttons/ActionButton";
import { deleteCinema } from "../../services";
import CinemaDetails from "./CinemaDetails";

export const CinemaCard: React.FC<CinemaWithAction> = ({
  id,
  name,
  imgURL,
}) => {
  const navigate = useNavigate();


  const handlesDelete = async (id: string) => {
    try {
      await deleteCinema(id);
      navigate("/cinemas");
    } catch (error) {
      console.log(`Error deleting cinema ${error}`); //to do log
    }
  };

  return (
    <div className={styles.cinemaCard}>
      {imgURL && (
        <img src={imgURL} alt={name} className={styles.cinemaCardImg} />
      )}
      <div className={styles.cinemaCardContent}>
        <h2 className={styles.cinemaName}>{name}</h2>
        <CinemaDetails />
        <div className={styles.cinemaActions}>
          <ActionButton label="Delete" id={`button-delete`} type="delete" onClick={() => handlesDelete(id!)} />
        </div>
      </div>
    </div>
  );
};

export default CinemaCard;

