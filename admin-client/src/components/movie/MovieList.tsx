import React, { useEffect, useState } from "react";
import MovieCard, { MovieCardProps } from "./MovieCard";
import "./MovieList.css";
import { getMovies } from "../../services/movieService";

const MovieList: React.FC = () => {
  const [movies, setMovies] = React.useState<MovieCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  }

  if (loading) {
    return <div>Loading...</div>; // to do loading spinner
  }

  if (error) {
    return <p>Error: {error}</p>; // to do error message
  }

  return (
    <div className="movie-list">
      {movies.map(({ onRefresh, ...movie }) => (
        <MovieCard onRefresh={handleRefresh} key={movie.id} {...movie} />
      ))}
    </div>
  );
};

export default MovieList;
