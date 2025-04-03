import React from "react";

import { CinemaWithAction } from "./CinemaList";
import styles from "./CinemaCard.module.css";
import { useNavigate } from "react-router-dom";
import ActionButton ,{ ActionButtonProps } from "../buttons/ActionButton";
import { Cinema } from "../../utils/CinemaValidationsSchema";
import { deleteCinema } from "../../services/cinemaService";
import CinemaDetails from "./CinemaDetails";

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

  // Cinema details props
  const cinemaDetailsProps = {
    id,
    name,
    city,
    halls,
    snacks,
  }

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
        onRefresh(); // Refresh the cinema list after deletion

    }catch(error){
        console.log(`Error deleting cinema ${error}`) //to do log
    }
  }

  return (
    <div className={styles.cinemaCard}>
      {imgURL && (
        <img src={imgURL} alt={name} className={styles.cinemaCardImg} />
      )}
      <div className={styles.cinemaCardContent}>
        <h2 className={styles.cinemaName}>{name}</h2>
        {/* cinema details component */}
        <CinemaDetails {...cinemaDetailsProps} />
        <div className={styles.cinemaActions}>
          <ActionButton {...editButtonProps} />
          <ActionButton {...deleteButtonProps} />
        </div>
      </div>
    </div>
  );
};

export default CinemaCard;
