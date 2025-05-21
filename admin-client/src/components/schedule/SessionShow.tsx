import { SessionDisplay } from "../../utils";
import styles from "./SessionShow.module.css";
type SessionShowProps = {
    session: SessionDisplay
    hideCinemaInfo:boolean;
    hideHallInfo:boolean;
    hideMovieInfo:boolean;
    hideDateInfo: boolean;
    onSessionClick?: (session:SessionDisplay) => void;
}

const SessionShow: React.FC<SessionShowProps> = ({
    session,
    hideCinemaInfo,
    hideHallInfo,
    hideMovieInfo,
    hideDateInfo,
    onSessionClick
}) => {

    const handleClick = () => {
        if(onSessionClick){
            onSessionClick(session)
        }
    }

    return (
        <div className={styles.sessionCard} onClick={handleClick}>
            
            {!hideCinemaInfo && <div className={styles.row}>
                <span className={styles.label}>Cinema:</span>
                <span className={styles.value}>{session.cinemaName}</span>
            </div> }
            
            {!hideHallInfo && <div className={styles.row}>
                <span className={styles.label}>Hall:</span>
                <span className={styles.value}>{session.hallName}</span>
            </div>}
            
            {!hideMovieInfo && <div className={styles.row}>
                <span className={styles.label}>Movie:</span>
                <span className={styles.value}>{session.movieName}</span>
            </div>}
            
            {!hideDateInfo && <div className={styles.row}>
                <span className={styles.label}>Date:</span>
                <span className={styles.value}>{session.date}</span>
            </div>}
            
            <div className={styles.row}>
                <span className={styles.label}>Time:</span>
                <span className={styles.value}>{session.startTime} - {session.endTime}</span>
            </div>
        </div>
    );
};

export default SessionShow;