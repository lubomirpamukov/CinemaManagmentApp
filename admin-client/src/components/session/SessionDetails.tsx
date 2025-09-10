import React from "react";
import { SessionDisplay } from "../../utils";
import styles from "./SessionDetails.module.css";
import ActionButton from "../buttons/ActionButton";
import SessionSeatMap from "./SessionSeatMap";
import { useHallById } from "../../hooks";
import Spinner from "../Spinner";

type SessionDetailsProps = {
  session: SessionDisplay;
  onClose: () => void;
};

const SessionDetail: React.FC<SessionDetailsProps> = ({ session, onClose }) => {
  if (!session) {
    return null;
  }

  const { hall, loading } = useHallById(session.hallId);

  //to do: make calls for seat layout and avaliablity here:
  if (loading) {
    return <Spinner />;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.detailContainer}>
        <div className={styles.header}>
          <h2>Session Details</h2>
          <ActionButton
            id="close-detail"
            label="&times;"
            onClick={onClose}
            className={styles.closeButton}
            type="delete"
          />
        </div>
        <div className={styles.content}>
          <p>
            <strong>Movie:</strong> {session.movieName}
          </p>
          <p>
            <strong>Cinema:</strong> {session.cinemaName}
          </p>
          <p>
            <strong>Hall:</strong> {session.hallName}
          </p>
          <p>
            <strong>Date:</strong> {new Date(session.date).toLocaleDateString()}
          </p>
          <p>
            <strong>Time:</strong> {session.startTime} - {session.endTime}
          </p>
          <SessionSeatMap sessionId={session._id} hall={hall!} />
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
