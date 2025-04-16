import { useNavigate } from "react-router-dom";

import styles from "./UserList.module.css";
import { User } from "../../utils";
import UserShow from "./UserShow";
import ActionButton from "../buttons/ActionButton";

type UserListProps = {
  users: User[];
};

const UserList: React.FC<UserListProps> = ({ users }) => {
  const renderedUsers = users.map((user) => (
    <div key={user.id} className={styles.user}>
      <UserShow user={user} />
    </div>
  ));

  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/users/edit");
  }

  return (
    <>
      <ActionButton className={styles.centeredButton} id="add-user-button" type="add" label="Add User" onClick={handleClick}/>
      {renderedUsers}
    </>
  );
};

export default UserList;
