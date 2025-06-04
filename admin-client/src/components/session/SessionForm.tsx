import { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Cinema, Movie, Hall } from "../../utils";
import { getHallsByCinemaId, createSession } from "../../services";
import ActionButton from "../buttons/ActionButton";
import styles from "./SessionForm.module.css";
import { Session } from "../../utils/";

type SessionFormProps = {
  cinemas: Cinema[];
  movies: Movie[];
};

const SessionForm: React.FC<SessionFormProps> = ({ cinemas, movies }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Session>();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const selectedCinema = watch("cinemaId");
  const selectedHall = watch("hallId");
  const startTime = watch("startTime");

  useEffect(() => {
    if (selectedCinema) {
      getHallsByCinemaId(selectedCinema).then(setHalls);
      setValue("hallId", ""); // Reset hall selection when cinema changes
    } else {
      setHalls([]);
      setValue("hallId", "");
    }
  }, [selectedCinema, setValue]);

  const onSubmit = async (data: Session) => {
    setServerError(null);
    try {
      await createSession(selectedCinema, selectedHall, data);
      setValue("date", "");
      setValue("startTime", "");
      setValue("endTime", "");
    } catch (error: any) {
      let message = "Unknown error";
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(
            error.message.replace("Failed to create session: ", "")
          );
          message = parsed.error || error.message;
        } catch {
          message = error.message;
        }
      }
      setServerError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.sessionForm}>
      <h1 className={styles.heading}>Create Session</h1>

      <label className={styles.label}>
        Cinema:
        <select
          {...register("cinemaId", { required: "Cinema is required" })}
          className={styles.select}
        >
          <option value="">Select a cinema</option>
          {cinemas.map((cinema) => (
            <option key={cinema.id} value={cinema.id}>
              {cinema.name}
            </option>
          ))}
        </select>
        {errors.cinemaId && (
          <span className={styles.error}>{errors.cinemaId.message}</span>
        )}
      </label>

      <label className={styles.label}>
        Hall:
        <select
          {...register("hallId", { required: "Hall is required" })}
          className={styles.select}
          disabled={!selectedCinema}
        >
          <option value="">Select a hall</option>
          {halls.map((hall) => (
            <option key={hall.id} value={hall.id}>
              {hall.name}
            </option>
          ))}
        </select>
        {errors.hallId && (
          <span className={styles.error}>{errors.hallId.message}</span>
        )}
      </label>

      <label className={styles.label}>
        Movie:
        <select
          {...register("movieId", { required: "Movie is required" })}
          className={styles.select}
        >
          <option value="">Select a movie</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.title}
            </option>
          ))}
        </select>
        {errors.movieId && (
          <span className={styles.error}>{errors.movieId.message}</span>
        )}
      </label>

      <label className={styles.label}>
        Date:
        <input
          type="date"
          {...register("date", { required: "Date is required" })}
          className={styles.input}
        />
        {errors.date && (
          <span className={styles.error}>{errors.date.message}</span>
        )}
      </label>

      <label className={styles.label}>
        Start Time:
        <input
          type="time"
          {...register("startTime", { required: "Start time is required" })}
          className={styles.input}
        />
        {errors.startTime && (
          <span className={styles.error}>{errors.startTime.message}</span>
        )}
      </label>

      <label className={styles.label}>
        End Time:
        <input
          type="time"
          {...register("endTime", {
            required: "End time is required",
            validate: (value) =>
              !startTime ||
              value > startTime ||
              "End time must be after start time",
          })}
          className={styles.input}
        />
        {errors.endTime && (
          <span className={styles.error}>{errors.endTime.message}</span>
        )}
      </label>
      {serverError && <div className={styles.error}>{serverError}</div>}
      <ActionButton id="create-button" label="Create" buttonType="submit" />
    </form>
  );
};

export default SessionForm;
