import React from "react";
import MovieCard from "./MovieCard";
import styles from "./MovieList.module.css";
import { useMovies } from "../../hooks/useMovies";

/**
 * MovieList Component
 * 
 * Displays a list of movies fetched using the useMovies custom hook.
 * Handles loading and error states.
 */
const MovieList: React.FC = () => {
  // Use the custom hook to fetch and manage movie data
  const { movies, loading, error, refresh } = useMovies();

  if (loading) {
    return <div>Loading...</div>; // to do loading spinner
  }

  if (error) {
    return <p>Error: {error}</p>; // to do error message
  }


  return (
    <div className={styles.movieList}>
      {movies.map(({ onRefresh, ...movie }) => (
        <MovieCard 
        onRefresh={refresh} 
        key={movie.id} 
        {...movie} 
        />
      ))}
    </div>
  );
};

export default MovieList;