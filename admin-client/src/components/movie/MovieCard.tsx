import React from "react";
import { useNavigate } from "react-router-dom";

import MovieDetails, { MovieDetailsProps } from "./MovieDetails";
import MovieCast from "./MovieCast";
import ActionButton, { ActionButtonProps } from "../buttons/ActionButton";
import { deleteMovie } from "../../services";
import styles from "./MovieCard.module.css";
import { MovieFormValues } from "./MovieForm";
import { Movie } from "../../utils";

export type MovieCardProps = {
  movie: Movie
  onRefresh: () => void;
};

const MovieCard: React.FC<MovieCardProps> = ({ movie, onRefresh }) => {

  const {
    id,
    title,
    genre,
    year,
    duration,
    description,
    pgRating,
    director,
    cast,
    imgURL,
  } = movie;
  
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
    director: director ?? "",
    cast: cast || [], // Ensure cast is an array
    description,
    imgURL,
  };

  if(!movie.id){
    throw new Error("Movie ID is required");
  }

  const navigate = useNavigate();

  const editButtonProps: ActionButtonProps = {
    label: "Edit",
    id: id!,
    type: "edit",
    onClick: () =>
      navigate("/movies/create", {
        state: movieData,
      }),
  };

  const deleteButtonProps: ActionButtonProps = {
    label: "Delete",
    id: id!,
    type: "delete",
    onClick: () => handlesDelete(id!),
  };

  const handlesDelete = async (id: string) => {
    try {
      confirm(`Are you sure you want to delete ${title}?`)
      await deleteMovie(id);
      onRefresh();
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  return (
    <div className={styles.movieCard}>
      {imgURL && (
        <img src={imgURL} alt={title} className={styles.movieCardImg} />
      )}
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

