import React from "react";
import { useForm } from "react-hook-form";
import { createMovie, updateMovie } from "../../services/movieService";
import styles from "./MovieForm.module.css";
import CastForm from "./CastForm";
import { DEFAULT_MOVIE_VALUES } from "../../utils/constants/movieConstants";

export interface MovieFormProps {
  initialValues?: MovieFormValues;
  onSubmitSuccess: () => void; // Fixed typo in prop name
}

export interface MovieFormValues {
  id?: string;
  title?: string;
  duration: number;
  pgRating: string;
  genre: string;
  year: number;
  director?: string;
  cast: { name: string; role: string }[];
  description: string;
  imgURL?: string;
}

const MovieForm: React.FC<MovieFormProps> = ({
  initialValues,
  onSubmitSuccess,
}) => {
  //initialize react hook form
  const {
    register, //register input fields
    handleSubmit, //handlke form submission
    control, //Control object for managing dynamic fields => cast[]
    formState: {}, //form state object errors
    reset, // function to reset the form
  } = useForm<MovieFormValues>({
    defaultValues: initialValues || DEFAULT_MOVIE_VALUES,
  });

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues); // Reset the form with the new initialValues
    } else {
      reset(DEFAULT_MOVIE_VALUES); // Reset to default empty values
    }
  }, [initialValues, reset]);

  //handle form submission
  const onSubmit = async (data: MovieFormValues) => {
    try {
      //if initialValues.id is provided , that means the form is used to update a movie
      if (initialValues?.id) {
        await updateMovie(initialValues.id, data);
        console.log("Movie updated successfully");
      } else {
        // if its not provided, that means the form is used to create a new movie
        await createMovie(data);
        console.log("Movie created successfully");
      }
      onSubmitSuccess(); // Fixed typo in function call
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
      </label>

      {/* Duration field*/}
      <label htmlFor="duration" className={styles.formField}>
        Duration (minutes)
        <input
          type="number"
          id="duration"
          placeholder="Duration"
          {...register("duration")}
        />
      </label>

      <label htmlFor="pgRating" className={styles.formField}>
        PG Rating
        <input
          type="text"
          id="pgRating"
          placeholder="PG Rating"
          {...register("pgRating")}
        />
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
      </label>

      {/* Year field*/}
      <label htmlFor="year" className={styles.formField}>
        Year
        <input
          type="number"
          id="year"
          placeholder="Year"
          {...register("year")}
        />
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
      </label>

      {/* Description field*/}
      <label htmlFor="description" className={styles.formField}>
        Description
        <textarea
          id="description"
          placeholder="Movie description"
          {...register("description")}
        ></textarea>
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
      </label>

      {/* Cast field array*/}
      <CastForm control={control} register={register} />

      {/* Submit button */}
      <button className={styles.button} type="submit">
        {initialValues ? "Update Movie" : "Create Movie"}
      </button>
    </form>
  );
};

export default MovieForm;
