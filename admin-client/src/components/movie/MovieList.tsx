import React, { useEffect, useState } from "react";
import MovieCard, { MovieCardProps } from "./MovieCard";
import "./MovieList.css";

const MovieList: React.FC = () => {
  const [movies, setMovies] = React.useState<MovieCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:3000/movies");
        if (!response.ok) {
          throw new Error("Failed to fetch movies");
        }
        const data: MovieCardProps[] = await response.json();
        setMovies(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [movies]);

  if(loading) {
    return <div>Loading...</div>; // to do loading spinner
  }

  if(error){
    return <p>Error: {error}</p> // to do error message
  }

  return (
    <div className="movie-list">
      {movies.map((movie) => (
        <MovieCard key={movie.id} {...movie} />
      ))}
    </div>
  );
};

export default MovieList;