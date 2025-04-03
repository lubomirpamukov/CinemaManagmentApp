import React from "react";

import { CinemaWithAction } from "./CinemaList";
import styles from "./CinemaCard.module.css";
import { useNavigate } from "react-router-dom";
import ActionButton ,{ ActionButtonProps } from "../buttons/ActionButton";
import { Cinema } from "../../utils/CinemaValidationsSchema";
import { deleteCinema } from "../../services/cinemaService";

export const CinemaCard: React.FC<CinemaWithAction> = ({
  id,
  name,
  city,
  halls,
  snacks,
  imgURL,
  onRefresh,
}) => {
  const navigate = useNavigate();

  const cinemaData: Cinema = {
    id: id,
    name,
    city,
    halls,
    snacks,
    imgURL,
  };

  //Edit buttons props
  const editButtonProps: ActionButtonProps = {
    label: "Edit",
    id: id,
    type: "edit",
    onClick: () =>
      navigate("cinemas/create", {
        state: cinemaData,
      }),
  };

  // Delete button props 
  const deleteButtonProps: ActionButtonProps = {
    label: "Delete",
    id: id,
    type: "delete",
    onClick: () => handlesDelete(id),
  }

  const handlesDelete = async (id: string) => {
    try{
        await deleteCinema(id)

    }catch(error){
        console.log(`Error deleting cinema ${error}`) //to do log
    }
  }

  return (
    <div className={styles.movieCard}>
      {imgURL && (
        <img src={imgURL} alt={name} className={styles.cinemaCardImg} />
      )}
      <div className={styles.cinemaCardContent}>
        <h2 className={styles.cinemaName}>{name}</h2>
        {/* cinema details component */}
        <div className={styles.movieActions}>
          <ActionButton {...editButtonProps} />
          <ActionButton {...deleteButtonProps} />
        </div>
      </div>
    </div>
  );
};

export default CinemaCard;
