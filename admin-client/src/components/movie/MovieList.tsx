import React from "react";

import MovieCard from "./MovieCard";
import styles from "./MovieList.module.css";
import { Movie } from "../../utils";
import Spinner from "../Spinner";

type MovieListProps = {
  movies: Movie[];
  loading: boolean;
  refresh: () => void;
};

const MovieList: React.FC<MovieListProps> = ({ movies, refresh, loading }) => {

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <div className={styles.movieList}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onRefresh={refresh} />
        ))}
      </div>
    </>
  );
};

export default MovieList;
