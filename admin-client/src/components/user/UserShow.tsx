import { useNavigate } from "react-router-dom";

import styles from "./UserShow.module.css";
import ActionButton from "../buttons/ActionButton";
import { User } from "../../utils";
import { deleteUser } from "../../services";

type UserWithoutRole = Omit<User, "role">;
type UserProps = {
  user: UserWithoutRole;
  refresh: () => void;
};

const UserShow: React.FC<UserProps> = ({ user, refresh }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/users/${user.id}/edit`);
  };

  const handleClickDelete = async () => {
    if (
      confirm(`Are you sure you want to delete ${user.name || user.userName}?`)
    ) {
      await deleteUser(user.id);
      refresh();
      navigate("/users");
    }
  };

  return (
    <div className={styles.userCard}>
      <h2 className={styles.userName}>{user.name || user.userName}</h2>
      <p className={styles.userEmail}>
        <span className={styles.userLabel}>Email:</span> {user.email}
      </p>
      {user.contact && (
        <p className={styles.userContact}>
          <span className={styles.userLabel}>Contact:</span> {user.contact}
        </p>
      )}
      
      <div className={styles.buttons}>
        <ActionButton
          id="edit-user-button"
          label="View"
          type="edit"
          onClick={handleClick}
        />
        <ActionButton
          id="delete-user-button"
          label="Delete"
          type="delete"
          onClick={handleClickDelete}
        />
      </div>
    </div>
  );
};

export default UserShow;

