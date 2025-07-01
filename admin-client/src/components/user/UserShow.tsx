import { useNavigate } from "react-router-dom";

import styles from "./UserShow.module.css";
import ActionButton from "../buttons/ActionButton";
import { TUser } from "../../utils";
import { deleteUser } from "../../services";

type UserWithoutRole = Omit<TUser, "role">;
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
      confirm(`Are you sure you want to delete ${user.name}?`)
    ) {
      await deleteUser(user.id);
      refresh();
      navigate("/users");
    }
  };

  return (
    <div className={styles.userCard}>
      <h2 className={styles.userName}>{user.name}</h2>
      <p className={styles.userEmail}>
        <span className={styles.userLabel}>Email:</span> {user.email}
      </p>
      {user.contact && (
        <p className={styles.userContact}>
          <span className={styles.userLabel}>Contact:</span> {user.contact}
        </p>
      )}

      {/* Address Section */}
      {user.address && (
        <div className={styles.userAddress}>
          <span className={styles.userLabel}>Address:</span>
          <div>
            {user.address.line1 && <div>{user.address.line1}</div>}
            {user.address.city && <div>{user.address.city}</div>}
            {user.address.state && <div>{user.address.state}</div>}
            {user.address.zipcode && <div>{user.address.zipcode}</div>}
          </div>
        </div>
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
