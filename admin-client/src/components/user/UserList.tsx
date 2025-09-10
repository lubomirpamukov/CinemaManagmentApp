import { useNavigate } from "react-router-dom";

import styles from "./UserList.module.css";
import { TUser } from "../../utils";
import UserShow from "./UserShow";
import ActionButton from "../buttons/ActionButton";
import Spinner from "../Spinner";

type UserWithoutRole = Omit<TUser, "role">;

type UserListProps = {
  users: UserWithoutRole[];
  loading: boolean;
  refresh: () => void;
};

const UserList: React.FC<UserListProps> = ({ users, loading, refresh }) => {
  const renderedUsers = users.map((user) => (
    <div key={user.id} className={styles.user}>
      <UserShow user={user} refresh={refresh} />
    </div>
  ));

  if (loading) {
    return <Spinner />;
  }

  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/users/create");
  };

  return (
    <>
      <div className={styles.buttonSearchbarContainer}>
        <ActionButton
          className={styles.buttonAdd}
          id="add-user-button"
          type="add"
          label="Add User"
          onClick={handleClick}
        />
      </div>
      {renderedUsers}
    </>
  );
};

export default UserList;
