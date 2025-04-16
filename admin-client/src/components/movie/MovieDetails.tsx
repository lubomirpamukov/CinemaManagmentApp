import React from "react";

import styles from "./MovieDetails.module.css";

export type MovieDetailsProps = {
    genre: string;
    year: number;
    duration: number;
    description: string;
    pgRating: string;
    director?: string;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({
  genre,
  year,
  duration,
  description,
  pgRating,
  director,
}) => {
  return (
    <div className={styles.MovieDetails}>
      <p>
        <strong>Genre:</strong> {genre}
      </p>
      <p>
        <strong>Year:</strong> {year}
      </p>
      <p>
        <strong>Duration:</strong> {duration} minutes
      </p>
      <p>{description}</p>
      <p>
        <strong>PG Rating:</strong> {pgRating}
      </p>
      {director && (
        <p>
          <strong>Director:</strong> {director}
        </p>
      )}
    </div>
  );
};


export default MovieDetails;