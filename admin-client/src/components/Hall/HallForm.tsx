import React, { useState } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import { hallSchema, Hall, seatsSchema} from "../../utils";
import Spinner from "../Spinner";
import styles from "./HallForm.module.css";
import { createHall } from "../../services";
import { useCinemaById } from "../../hooks";
import { updateCinema } from "../../services";


const HallForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { cinemaId } = useParams<{ cinemaId: string }>();

  if(cinemaId === undefined) {
    throw new Error("cinemaId is undefined");
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<Hall>({
    resolver: zodResolver(hallSchema),
    defaultValues: {
      cinemaId: cinemaId,
      name: "",
      layout: { rows: 5, columns: 5 },
      movieProgram: [],
      seats: [],
    },
  });

  const {
    fields: movieFields,
    append: appendMovie,
    remove: removeMovie,
  } = useFieldArray({
    control,
    name: "movieProgram",
  });

  const {
    fields: seatFields,
    append: appendSeat,
    remove: removeSeat,
  } = useFieldArray({
    control,
    name: "seats",
  });

  // Watch the layout values to ensure seats are within bounds
  const layout = watch("layout");

    //Update Cinema Data
    const {cinema} = useCinemaById(cinemaId);



  const onSubmit: SubmitHandler<Hall> = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const hall = await createHall(data);
      console.log("Form submitted successfully:", data);
      cinema?.halls.push(hall.id); // Update the cinema data with the new hall ID
      if (!cinema){
        throw Error("Cinema not found");
      }
      await updateCinema(cinemaId, cinema)
      // After successful creation, navigate back to halls list
      navigate(`/cinemas/${data.cinemaId}/edit`);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err instanceof Error ? err.message : "Failed to create hall");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSeats = () => {
    const { rows, columns } = layout;
    const newSeats = [];

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= columns; c++) {
        // Generate seat number (A1, A2, B1, etc.)
        const rowLabel = String.fromCharCode(64 + r); // 65 is ASCII for 'A'
        newSeats.push({
          row: r,
          column: c,
          seatNumber: `${rowLabel}${c}`,
          isAvailable: "available",
          type: "regular",
          price: 10, // Default price
        });
      }
    }

    // Replace all seats with the generated ones
    seatFields.forEach((_, index) => {
      removeSeat(index);
    });


    newSeats.forEach((seat) => {
      appendSeat(seatsSchema.parse(seat));
    });
  };

  if (isSubmitting) {
    return <Spinner />;
  }

  return (
    <div className={styles.hallFormContainer}>
      <h1>Create Hall</h1>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formSection}>
          <h2>Basic Information</h2>

          <div className={styles.formGroup}>
            <label htmlFor="name">Hall Name</label>
            <input id="name" {...register("name")} className={styles.input} />
            {errors.name && (
              <p className={styles.fieldError}>{errors.name.message}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cinemaId">Cinema ID</label>
            <input
              id="cinemaId"
              {...register("cinemaId")}
              className={styles.input}
              disabled={!!cinemaId} // Disable if cinemaId is provided via URL
            />
            {errors.cinemaId && (
              <p className={styles.fieldError}>{errors.cinemaId.message}</p>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="layoutRows">Number of Rows</label>
              <input
                id="layoutRows"
                type="number"
                {...register("layout.rows", { valueAsNumber: true })}
                className={styles.input}
              />
              {errors.layout?.rows && (
                <p className={styles.fieldError}>
                  {errors.layout.rows.message}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="layoutColumns">Number of Columns</label>
              <input
                id="layoutColumns"
                type="number"
                {...register("layout.columns", { valueAsNumber: true })}
                className={styles.input}
              />
              {errors.layout?.columns && (
                <p className={styles.fieldError}>
                  {errors.layout.columns.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={generateSeats}
            className={styles.secondaryButton}
          >
            Generate Seats
          </button>
        </div>

        <div className={styles.formSection}>
          <h2>Movie Program</h2>
          {errors.movieProgram?.message && (
            <p className={styles.sectionError}>{errors.movieProgram.message}</p>
          )}

          {movieFields.map((field, index) => (
            <div key={field.id} className={styles.arrayItem}>
              <label htmlFor={`movieId-${index}`} className={styles.formGroup}>
                Movies
                <select
                  id={`movieId-${index}`}
                  {...register(`movieProgram.${index}.movieId`)}
                  className={styles.select}
                >
                  <option value="">Select a movie</option>
                  {movieTitles.map((title) => (
                    <option key={title.title} value={title.id}>
                      {title.title}
                    </option>
                  ))}
                </select>
                {errors.movieProgram?.[index]?.movieId && (
                  <p className={styles.fieldError}>
                    {errors.movieProgram[index]?.movieId?.message}
                  </p>
                )}
              </label>

              <label
                htmlFor={`startTime-${index}`}
                className={styles.formGroup}
              >
                Start Time
                <input
                  id={`startTime-${index}`}
                  type="datetime-local"
                  {...register(`movieProgram.${index}.startTime`)}
                  className={styles.input}
                />
                {errors.movieProgram?.[index]?.startTime && (
                  <p className={styles.fieldError}>
                    {errors.movieProgram[index]?.startTime?.message}
                  </p>
                )}
              </label>

              <div className={styles.formGroup}>
                <label htmlFor={`endTime-${index}`}>End Time</label>
                <input
                  id={`endTime-${index}`}
                  type="datetime-local"
                  {...register(`movieProgram.${index}.endTime`)}
                  className={styles.input}
                />
                {errors.movieProgram?.[index]?.endTime && (
                  <p className={styles.fieldError}>
                    {errors.movieProgram[index]?.endTime?.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeMovie(index)}
                className={styles.removeButton}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              appendMovie({
                movieId: "",
                startTime: '',
                endTime: '',
              })
            }
            className={styles.addButton}
          >
            Add Movie
          </button>
        </div>

        <div className={styles.formSection}>
          <h2>Seats Configuration</h2>
          {errors.seats?.message && (
            <p className={styles.sectionError}>{errors.seats.message}</p>
          )}

          <div className={styles.seatsGrid}>
            {seatFields.length > 0 ? (
              <table className={styles.seatsTable}>
                <thead>
                  <tr>
                    <th>Seat #</th>
                    <th>Row</th>
                    <th>Column</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {seatFields.map((field, index) => (
                    <tr key={field.id}>
                      <td>
                        <input
                          {...register(`seats.${index}.seatNumber`)}
                          className={styles.smallInput}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          {...register(`seats.${index}.row`, {
                            valueAsNumber: true,
                          })}
                          className={styles.smallInput}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          {...register(`seats.${index}.column`, {
                            valueAsNumber: true,
                          })}
                          className={styles.smallInput}
                        />
                      </td>
                      <td>
                        <select
                          {...register(`seats.${index}.type`)}
                          className={styles.select}
                        >
                          <option value="regular">Regular</option>
                          <option value="vip">VIP</option>
                          <option value="couple">Couple</option>
                        </select>
                      </td>
                      <td>
                        <select
                          {...register(`seats.${index}.isAvailable`)}
                          className={styles.select}
                        >
                          <option value="available">Available</option>
                          <option value="reserved">Reserved</option>
                          <option value="sold">Sold</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          {...register(`seats.${index}.price`, {
                            valueAsNumber: true,
                          })}
                          className={styles.smallInput}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeSeat(index)}
                          className={styles.iconButton}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>
                No seats configured. Use the "Generate Seats" button or add
                seats manually.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              appendSeat({
                row: 1,
                column: 1,
                seatNumber: "A1",
                isAvailable: "available",
                type: "regular",
                price: 10,
              })
            }
            className={styles.addButton}
          >
            Add Seat Manually
          </button>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            Create Hall
          </button>
        </div>
      </form>
    </div>
  );
};

export default HallForm;

