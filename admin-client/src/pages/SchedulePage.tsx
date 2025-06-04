import React, { useState, useEffect } from "react";

import Schedule from "../components/schedule/Schedule";
import { useCinemas, useHallDetails, useMovies } from "../hooks";
import Spinner from "../components/Spinner";
import styles from "./SchedulePage.module.css";
import { Hall, SessionDisplay } from "../utils";
import ActionButton from "../components/buttons/ActionButton";
import SessionDetail from "../components/session/SessionDetails";

const SchedulePage: React.FC = () => {
  // Cinemas
  const {
    cinemas,
    loading: loadingCinemas,
    error: cinemasError,
  } = useCinemas();
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>("");

  const { movies, loading: loadingMovies, error: moviesError } = useMovies();
  const [selectedMovieId, setSelectedMovieId] = useState<string>("");

  const {
    hallsDetails,
    loading: loadingHalls,
    error: hallsError,
  } = useHallDetails(selectedCinemaId);
  const [selectedHallId, setSelectedHallId] = useState<string>("");

  const [selectedDate, setSelectedDate] = useState<string>("");

  const [selectedSessionForDetail, setSelectedSessionForDetail] =
    useState<SessionDisplay | null>(null);

  const handleSessionSelect = (session: SessionDisplay) => {
    setSelectedSessionForDetail(session);
  };

  const handleCloseDetailView = () => {
    setSelectedSessionForDetail(null);
  };

  useEffect(() => {
    setSelectedHallId("");
  }, [selectedCinemaId]);

  if (loadingCinemas || loadingMovies || (selectedCinemaId && loadingHalls)) {
    return <Spinner />;
  }

  if (cinemasError || moviesError || (selectedCinemaId && hallsError)) {
    return (
      <div>
        Error loading data. Details: {cinemasError || moviesError || hallsError}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <select
          value={selectedCinemaId}
          onChange={(e) => {
            setSelectedCinemaId(e.target.value);
          }}
          className={styles.select}
        >
          <option value="">Select a cinema</option>
          {cinemas.map((cinema) => (
            <option key={cinema.id} value={cinema.id}>
              {cinema.name}
            </option>
          ))}
        </select>

        <select
          value={selectedHallId}
          onChange={(e) => setSelectedHallId(e.target.value)}
          className={styles.select}
          disabled={loadingHalls || !selectedCinemaId}
        >
          <option value="">Select a hall</option>
          {hallsDetails.map((hall: Hall) => (
            <option key={hall.id} value={hall.id}>
              {hall.name}
            </option>
          ))}
        </select>

        {selectedCinemaId &&
          !loadingHalls &&
          hallsDetails &&
          hallsDetails.length === 0 && <p>No halls found for this cinema.</p>}

        <select
          value={selectedMovieId}
          onChange={(e) => setSelectedMovieId(e.target.value)}
          className={styles.select}
        >
          <option value="">Select a movie</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.title}
            </option>
          ))}
        </select>

        <label htmlFor="session-date" className={styles.filterLabel} />
        <input
          id="session-date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={styles.dateInput}
        />
        {selectedDate && (
          <ActionButton
            id="clear-date-button"
            label="Clear"
            type="edit"
            onClick={() => setSelectedDate("")}
            className={styles.clearDateButton}
          />
        )}
      </div>

      <div className={styles.scheduleSection}>
        <Schedule
          cinemaId={selectedCinemaId}
          hallId={selectedHallId}
          movieId={selectedMovieId}
          date={selectedDate}
          onSessionClick={handleSessionSelect}
        />
      </div>

      {selectedSessionForDetail && (
        <SessionDetail
          session={selectedSessionForDetail}
          onClose={handleCloseDetailView}
        />
      )}
    </div>
  );
};

export default SchedulePage;
