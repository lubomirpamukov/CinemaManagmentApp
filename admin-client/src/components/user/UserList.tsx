import { useNavigate } from "react-router-dom";

import styles from "./UserList.module.css";
import { User } from "../../utils";
import UserShow from "./UserShow";
import ActionButton from "../buttons/ActionButton";
import SearchBar from "../SearchBar";

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
    navigate("/users/create");
  };

  return (
    <>
      <SearchBar
        onSearch={(query) => console.log(query)}
        placeholder="Search Users"
      />
      {renderedUsers}
      <ActionButton
        className={styles.centeredButton}
        id="add-user-button"
        type="add"
        label="Add User"
        onClick={handleClick}
      />
    </>
  );
};

export default UserList;
