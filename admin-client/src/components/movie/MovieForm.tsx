import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

import { createMovie, updateMovie } from "../../services";
import styles from "./MovieForm.module.css";
import CastForm from "./CastForm";
import { DEFAULT_MOVIE_VALUES } from "../../utils/constants";
import { movieSchema } from "../../utils";

export type MovieFormProps = {
  initialValues?: MovieFormValues;
};

export type MovieFormValues = z.infer<typeof movieSchema>;

const MovieForm: React.FC<MovieFormProps> = ({ initialValues }) => {
  //initialize react hook form
  const {
    register, //register input fields
    handleSubmit, //handlke form submission
    control, //Control object for managing dynamic fields => cast[]
    formState: { isSubmitting, errors }, //form state object errors
    reset, // function to reset the form
  } = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: initialValues || DEFAULT_MOVIE_VALUES,
  });

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues); // Reset the form with the new initialValues
    } else {
      reset(DEFAULT_MOVIE_VALUES); // Reset to default empty values
    }
  }, [initialValues, reset]);

  const navigator = useNavigate();

  //handle form submission
  const onSubmit: SubmitHandler<MovieFormValues> = async (data) => {
    try {
      //if initialValues.id is provided , that means the form is used to update a movie
      if (initialValues?.id) {
        await updateMovie(initialValues.id, data);
        navigator(`/movies`);
      } else {
        // if its not provided, that means the form is used to create a new movie
        await createMovie(data);
        navigator(`/movies`);
      }
    } catch (error) {
      console.error("Error submitting form", error); // todo log error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.movieForm}>
      {/* Title field*/}
      <label htmlFor="title" className={styles.formField}>
        Title
        <input
          id="title"
          type="text"
          placeholder="Title"
          {...register("title")}
        />
        {errors.title && <p className={styles.error}>{errors.title.message}</p>}
      </label>

      {/* Duration field*/}
      <label htmlFor="duration" className={styles.formField}>
        Duration (minutes)
        <input
          type="number"
          id="duration"
          placeholder="Duration"
          {...register("duration", { valueAsNumber: true })}
        />
        {errors.duration && (
          <p className={styles.error}>{errors.duration.message}</p>
        )}
      </label>

      {/* PG Rating */}
      <label htmlFor="pgRating" className={styles.formField}>
        PG Rating
        <input
          type="text"
          id="pgRating"
          placeholder="PG Rating"
          {...register("pgRating")}
        />
        {errors.pgRating && (
          <p className={styles.error}>{errors.pgRating.message}</p>
        )}
      </label>

      {/* Genre field*/}
      <label htmlFor="genre" className={styles.formField}>
        Genre
        <input
          type="text"
          id="genre"
          placeholder="Genre"
          {...register("genre")}
        />
        {errors.genre && <p className={styles.error}>{errors.genre.message}</p>}
      </label>

      {/* Year field*/}
      <label htmlFor="year" className={styles.formField}>
        Year
        <input
          type="number"
          id="year"
          placeholder="Year"
          {...register("year", { valueAsNumber: true })}
        />
        {errors.year && <p className={styles.error}>{errors.year.message}</p>}
      </label>

      {/* Director field*/}
      <label htmlFor="director" className={styles.formField}>
        Director
        <input
          type="text"
          id="director"
          placeholder="Director"
          {...register("director")}
        />
        {errors.director && (
          <p className={styles.error}>{errors.director.message}</p>
        )}
      </label>

      {/* Description field*/}
      <label htmlFor="description" className={styles.formField}>
        Description
        <textarea
          id="description"
          placeholder="Movie description"
          {...register("description")}
        ></textarea>
        {errors.description && (
          <p className={styles.error}>{errors.description.message}</p>
        )}
      </label>

      {/* Image URL field*/}
      <label htmlFor="imgURL" className={styles.formField}>
        Image URL
        <input
          type="text"
          id="imgURL"
          placeholder="Image URL"
          {...register("imgURL")}
        />
        {errors.imgURL && (
          <p className={styles.error}>{errors.imgURL.message}</p>
        )}
      </label>

      {/* Cast field array*/}
      <CastForm control={control} register={register} />
      {errors.cast && <p className={styles.error}>{errors.cast.message}</p>}

      {/* Submit button */}
      <button disabled={isSubmitting} className={styles.button} type="submit">
        {isSubmitting
          ? "Submitting..."
          : initialValues
          ? "Update Movie"
          : "Create Movie"}
      </button>
    </form>
  );
};

export default MovieForm;
