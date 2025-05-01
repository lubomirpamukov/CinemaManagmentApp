import { useNavigate } from "react-router-dom";

import styles from "./UserList.module.css";
import { User } from "../../utils";
import UserShow from "./UserShow";
import ActionButton from "../buttons/ActionButton";
import SearchBar from "../SearchBar";

type UserWithoutRole = Omit<User, "role">;

type UserListProps = {
  users: UserWithoutRole[];
  refresh: () => void;
};

const UserList: React.FC<UserListProps> = ({ users, refresh }) => {
  const renderedUsers = users.map((user) => (
    <div key={user.id} className={styles.user}>
      <UserShow user={user} refresh={refresh} />
    </div>
  ));

  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/users/create");
  };

  return (
    <>
      <div className={styles.buttonSearchbarContainer}>
        <SearchBar
          onSearch={(query) => console.log(query)}
          placeholder="Search Users"
          className={styles.searchBar}
        />
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
