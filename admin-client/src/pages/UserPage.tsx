import { useState } from "react";
import { z } from "zod";

import { useSearch } from "../hooks";
import { useDebounce, usePaginated } from "../hooks";
import Pagination from "../components/buttons/Pagination";
import { userSchema } from "../utils";
import styles from "./UserPage.module.css";
import UserList from "../components/user/UserList";
import SearchBar from "../components/SearchBar";

const userSchemnaWithoutPassword = userSchema.omit({ password: true });

const UserPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 600);

  const {
    data: users,
    currentPage,
    totalPages,
    setCurrentPage,
    loading,
    error,
    refresh,
  } = usePaginated(
    "/admin/users",
    3,
    z.array(userSchemnaWithoutPassword),
    debouncedSearchTerm
  );

  //reset search to page 1
  useSearch({ debouncedValue: debouncedSearchTerm, setCurrentPage });

  const handleSearchChange = (currentQuery: string) => {
    setSearchTerm(currentQuery);
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <>
      <header>
        <h1>Users</h1>
      </header>
      <main>
        <SearchBar
          onSearch={(e) => handleSearchChange(e)}
          placeholder="Search by username, name or email"
          className={styles.searchBar}
        />
        <UserList users={users} loading={loading} refresh={refresh} />
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
