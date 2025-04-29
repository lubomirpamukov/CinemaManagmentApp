import React, { useState } from "react";
import styles from "./SearchBar.module.css";

type SearchBarProps = {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string
};

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = "Search..." }) => {
  const [query, setQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={styles.searchInput}
      />
    </div>
  );
};

export default SearchBar;
