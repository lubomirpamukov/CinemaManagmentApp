import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { createMovie, updateMovie, deleteMovie } from "../../services/movieService";
import styles from './MovieForm.module.css';

export interface MovieFormProps {
  initialValues?: MovieFormValues; // Pre-filled values for editing
  onSubmitSuccess: () => void; // Callback after successful submission
}

export interface MovieFormValues {
  id?: string; // Optional for new movies
  title: string;
  duration: number;
  pgRating: string;
  genre: string;
  year: number;
  director?: string;
  cast: { name: string; role: string }[];
  description: string;
  imgURL?: string;
}

const MovieForm: React.FC<MovieFormProps> = ({ initialValues, onSubmitSuccess }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: {},
  } = useForm<MovieFormValues>({
    defaultValues: initialValues || {
      title: "",
      duration: 0,
      pgRating: "",
      genre: "",
      year: new Date().getFullYear(),
      director: "",
      cast: [{ name: "", role: "" }],
      description: "",
      imgURL: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "cast", // Manage the "cast" array
  });

  const onSubmit = async (data: MovieFormValues) => {
    try {
      if (initialValues?.id) {
        // Edit movie
        await updateMovie(initialValues.id, data);
        console.log("Movie updated successfully");
      } else {
        // Create movie
        await createMovie(data);
        console.log("Movie created successfully");
      }
      onSubmitSuccess(); // Trigger parent refresh or navigation
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = async () => {
    if (!initialValues?.id) return;
    try {
      await deleteMovie(initialValues.id);
      console.log("Movie deleted successfully");
      onSubmitSuccess(); // Trigger parent refresh or navigation
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="movie-form">
      <div className={styles.formField}>
        <label>Title:</label>
        <input type="text" {...register("title")} />
      </div>
      <div className={styles.formField}>
        <label>Duration (minutes):</label>
        <input type="number" {...register("duration")} />
      </div>
      <div className={styles.formField}>
        <label>PG Rating:</label>
        <input type="text" {...register("pgRating")} />
      </div>
      <div className={styles.formField}>
        <label>Genre:</label>
        <input type="text" {...register("genre")} />
      </div>
      <div className={styles.formField}>
        <label>Year:</label>
        <input type="number" {...register("year")} />
      </div>
      <div className={styles.formField}>
        <label>Director:</label>
        <input type="text" {...register("director")} />
      </div>
      <div className={styles.formField}>
        <label>Description:</label>
        <textarea {...register("description")} />
      </div>
      <div className={styles.formField}>
        <label>Image URL:</label>
        <input type="text" {...register("imgURL")} />
      </div>
      <div className={styles.formField}>
        <label>Cast:</label>
        {fields.map((field, index) => (
          <div key={field.id} className={styles.castMember}>
            <input
              type="text"
              placeholder="Name"
              {...register(`cast.${index}.name`)}
            />
            <input
              type="text"
              placeholder="Role"
              {...register(`cast.${index}.role`)}
            />
            <button
              className={`${styles.castButton} ${styles.remove}`}
              type="button"
              onClick={() => remove(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          className={styles.castButton}
          type="button"
          onClick={() => append({ name: "", role: "" })}
        >
          Add Cast Member
        </button>
      </div>
      <button type="submit">{initialValues ? "Update Movie" : "Create Movie"}</button>
      {initialValues && (
        <button
          className={`${styles.button} ${styles.danger}`}
          type="button"
          onClick={handleDelete}
        >
          Delete Movie
        </button>
      )}
    </form>
  );
};

export default MovieForm;