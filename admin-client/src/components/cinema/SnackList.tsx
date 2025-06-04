import React from "react";
import { useNavigate } from "react-router-dom";

import styles from "./SnackList.module.css";
import ActionButton from "../buttons/ActionButton";

export type Snack = {
  id?: string;
  name: string;
  price: number;
  description?: string;
};

type SnackListProps = {
  snacks: Snack[];
  cinemaId: string;
};

const SnackList: React.FC<SnackListProps> = ({ snacks, cinemaId }) => {
  const navigation = useNavigate();

  const handleEditSnacks = () => {
    const windowConfirm = window.confirm(
      "Are you sure you want to edit the snacks for this cinema?"
    );
    if (!windowConfirm) return;
    navigation(`/cinemas/${cinemaId}/snacks/edit`);
  };

  return (
    <section className={styles.snackList}>
      <ul>
        {snacks.map((snack, index) => (
          <li key={snack.id || `snack-${index}`} className={styles.snackItem}>
            <p>
              <strong>{snack.name}</strong> - ${snack.price.toFixed(2)}
            </p>
            {snack.description && (
              <p className={styles.description}>{snack.description}</p>
            )}
          </li>
        ))}
      </ul>
      <ActionButton
        id=""
        label="Edit Snacks"
        type="edit"
        onClick={handleEditSnacks}
      />
    </section>
  );
};

export default SnackList;
