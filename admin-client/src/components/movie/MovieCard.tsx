import React from "react";
import { useNavigate } from "react-router-dom";
import MovieDetails, { MovieDetailsProps } from "./MovieDetails";
import MovieCast from "./MovieCast";
import ActionButton, { ActionButtonProps } from "../buttons/ActionButton";
import { deleteMovie } from "../../services/movieService";
import styles from "./MovieCard.module.css"; // Import module CSS
import { MovieFormValues } from "./MovieForm";

export interface MovieCardProps {
  id: string;
  title: string;
  duration: number;
  description: string;
  pgRating: string;
  genre: string;
  year: number;
  director?: string;
  cast?: { name: string; role: string }[];
  imgURL?: string;
  onRefresh: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  duration,
  pgRating,
  genre,
  year,
  director,
  cast,
  description,
  imgURL,
  onRefresh,
}) => {
  const movieDetailsProps: MovieDetailsProps = {
    genre,
    year,
    duration,
    description,
    pgRating,
    director,
  };

  
  // Create movieData object using destructured props
  const movieData: MovieFormValues = {
    id,
    title,
    duration,
    pgRating,
    genre,
    year,
    director,
    cast: cast || [], // Ensure cast is an array
    description,
    imgURL,
  };

  const navigate = useNavigate();

  const editButtonProps: ActionButtonProps = {
    label: "Edit",
    id: id,
    type: "edit",
    onClick: () => navigate("/movies/create",{
      state: movieData
    })
  };

  const deleteButtonProps: ActionButtonProps = {
    label: "Delete",
    id: id,
    type: "delete",
    onClick: () => handlesDelete(id),
  };

  const handlesDelete = async (id: string) => {
    try {
      await deleteMovie(id);
      onRefresh();
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  return (
    <div className={styles.movieCard}>
      {imgURL && <img src={imgURL} alt={title} className={styles.movieCardImg} />}
      <div className={styles.movieCardContent}>
        <h2 className={styles.movieTitle}>{title}</h2>
        <MovieDetails {...movieDetailsProps} />
        {cast && <MovieCast cast={cast} />}
        <div className={styles.movieActions}>
          <ActionButton {...editButtonProps} />
          <ActionButton {...deleteButtonProps} />
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
