import React from "react";

import MovieCard from "./MovieCard";
import styles from "./MovieList.module.css";
import { Movie } from "../../utils";
import SearchBar from "../SearchBar";

type MovieListProps = {
  movies: Movie[];
  refresh: () => void;
};

const MovieList: React.FC<MovieListProps> = ({ movies, refresh }) => {
  return (
    <>
      <SearchBar
        onSearch={(query) => console.log(query)}
        placeholder="Search Movies"
      />
      <div className={styles.movieList}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} refresh={refresh} />
        ))}
      </div>
    </>
  );
};

export default MovieList;

