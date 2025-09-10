import React from "react";
import useSessionSeatStatus from "../../hooks/useSessionSeatStatus";
import { Hall, SeatZod } from "../../utils/";
import Spinner from "../Spinner";
import ShowSeat from "./ShowSeat";
import styles from "./SessionSeatMap.module.css";
import ActionButton from "../buttons/ActionButton";
type SessionSeatMapProps = {
  sessionId: string;
  hall: Hall | null;
};

const SessionSeatMap: React.FC<SessionSeatMapProps> = ({ sessionId, hall }) => {
  const allHallSeats = hall?.seats || [];
  const { seatsWithStatus, isLoading, error, refetch } = useSessionSeatStatus(
    sessionId,
    allHallSeats
  );

  if (!hall) {
    return (
      <p>Loading hall information or hall not found ...</p>
      // todo add back button
    );
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // make grid with hall layout size
  const seatMatrix: (SeatZod | null)[][] = Array(hall.layout.rows)
    .fill(null)
    .map(() => Array(hall.layout.columns).fill(null));

  // populate grid with seats
  seatsWithStatus.forEach((seat) => {
    const rowIndex = seat.row - 1;
    const colIndex = seat.column - 1;

    // validate row and column index that are inside the boundires of the hall
    if (
      rowIndex >= 0 &&
      rowIndex < hall.layout.rows &&
      colIndex >= 0 &&
      colIndex < hall.layout.columns
    ) {
      seatMatrix[rowIndex][colIndex] = seat;
    }
  });

  const renderedGrid = seatMatrix.map((row, rowIndex) => (
    <React.Fragment key={`row-${rowIndex}`}>
      {row.map((seat, colIndex) => {
        if (seat) {
          return <ShowSeat key={seat.originalSeatId} seat={seat} />;
        } else {
          return (
            <div
              key={`empty-${rowIndex}-${colIndex}`}
              className={styles.emptySeat}
            ></div>
          );
        }
      })}
    </React.Fragment>
  ));

  return (
    <div className={styles.seatMapContainer}>
      <h3>Seat Map for {hall.name}</h3>
      <ActionButton
        id="refetch"
        type="add"
        label="Refresh"
        onClick={() => refetch()}
      />
      <div
        className={styles.seatGrid}
        style={{
          gridTemplateRows: `repeat(${hall.layout.rows}, auto)`,
          gridTemplateColumns: `repeat(${hall.layout.columns}, auto)`,
        }}
      >
        {renderedGrid}
      </div>
      {/* Keep your legend if you have one, or adapt it */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div
            className={`${styles.legendSeatExample} ${styles.regular}`}
          ></div>{" "}
          Regular
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendSeatExample} ${styles.vip}`}></div>{" "}
          VIP
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendSeatExample} ${styles.couple}`}></div>{" "}
          Couple
        </div>
      </div>
    </div>
  );
};

export default SessionSeatMap;
