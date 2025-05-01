import { z } from "zod";

import { usePaginated } from "../hooks";
import Pagination from "../components/buttons/Pagination";
import { userSchema } from "../utils";
import Spinner from "../components/Spinner";
import styles from "./UserPage.module.css";
import UserList from "../components/user/UserList";

const userSchemnaWithoutPassword = userSchema.omit({password: true});

const UserPage: React.FC = () => {
  const {
    data: users,
    currentPage,
    totalPages,
    setCurrentPage,
    loading,
    error,
    refresh
  } = usePaginated("/admin/users", 3, z.array(userSchemnaWithoutPassword));
  if (loading) {
    return <Spinner />;
  }
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!users || users.length <= 0) {
    return <div className={styles.error}>No users found</div>;
  }
  return (
    <>
      <header>
        <h1>Users</h1>
      </header>
      <main>
        <UserList users={users} refresh={refresh} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>
    </>
  );
};

export default UserPage;

