import React from "react";
import styles from "./SnackList.module.css";
import ActionButton from "../buttons/ActionButton";
import { useNavigate } from "react-router-dom";

export type Snack = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

type SnackListProps = {
  snacks: Snack[];
  cinemaId: string;
};

const SnackList: React.FC<SnackListProps> = ({ snacks, cinemaId }) => {
  // Action button props
  const navigation = useNavigate();

  const handleEditSnacks = () => {
    // Navigate to the snack edit form for the given cinema
    const windowConfirm = window.confirm(
      "Are you sure you want to edit the snacks for this cinema?"
    );
    if (!windowConfirm) return;
    navigation(`/cinemas/${cinemaId}/snacks/edit`);
    console.log(`Edit snacks for cinema ${cinemaId}`);
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
