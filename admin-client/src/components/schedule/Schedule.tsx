import SessionShow from "./SessionShow";
import Spinner from "../Spinner";
import { useFilteredSessions } from "../../hooks"; // Assuming this is the correct path to your hooks index or the hook file itself
import styles from "./Schedule.module.css";
import ActionButton from "../buttons/ActionButton";
import Pagination from "../buttons/Pagination"; // Import the Pagination component
import { SessionDisplay } from "../../utils";

type ScheduleProps = {
    cinemaId?: string,
    hallId?: string,
    movieId?: string,
    date?: string,
    pageSize?: number,
    onSessionClick?: (session: SessionDisplay) => void;
}

const Schedule: React.FC<ScheduleProps> = ({
    cinemaId, 
    hallId, 
    movieId, 
    date,
    pageSize = 1,
    onSessionClick
}) => {

    const {
        sessions, 
        loading, 
        error, 
        refetch, 
        pagination, 
        setPage     
    } = useFilteredSessions({cinemaId, hallId, movieId, date, limit: pageSize });

    const hideCinemaInfo = !! cinemaId;
    const hideHallInfo = !! hallId;
    const hideMovieInfo = !! movieId;
    const hideDateInfo = !! date;

    if (loading && sessions.length === 0) {
       return <Spinner />;
    }

    if(error){
        return <div>Error: {error} <ActionButton id="retry" label="Retry" onClick={refetch} /></div>;
    }
    
    if (!loading && sessions.length === 0 && (cinemaId || hallId || movieId || date)) {
        return <div>No sessions found for the selected filters. <ActionButton id="refresh" label="Refresh" onClick={refetch} /></div>;
    }
    
    if (!loading && sessions.length === 0 && !(cinemaId || hallId || movieId || date)) {
        return <div>No sessions to display. Try selecting some filters or <ActionButton id="refresh-all" label="Refresh All" onClick={refetch} /></div>;
    }


    // Create array of active filters to display
    const activeFilters = [];
    if (cinemaId && sessions.length > 0 && sessions[0].cinemaName) {
        activeFilters.push(`Cinema: ${sessions[0].cinemaName}`);
    }
    if (hallId && sessions.length > 0 && sessions[0].hallName) { 
        activeFilters.push(`Hall: ${sessions[0].hallName}`);
    }
    if (movieId && sessions.length > 0 && sessions[0].movieName) { 
        activeFilters.push(`Movie: ${sessions[0].movieName}`);
    }
    if (date) {
        activeFilters.push(`Date: ${date}`);
    }

    return (
        <div className={styles.scheduleContainer}>
            {/* Filter summary heading */}
            {(activeFilters.length > 0) && (
                <h1 className={styles.filterHeading}>
                    Filtered by: {activeFilters.join(' • ')}
                </h1>
            )}
            
            <ActionButton id="refresh-button" label="Refresh" className={styles.button} onClick={refetch}/>

            {loading && <Spinner />}

            {!loading && sessions.length > 0 && (
                <>
                    <div className={styles.sessionList}>
                        {sessions.map(session => (
                            <SessionShow
                                key={session._id}
                                // Pass all necessary props to SessionShow
                                session={session}
                                hideCinemaInfo={hideCinemaInfo}
                                hideHallInfo={hideHallInfo}
                                hideMovieInfo={hideMovieInfo}
                                hideDateInfo={hideDateInfo}
                                onSessionClick={onSessionClick}
                            />
                        ))}
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className={styles.paginationContainer}>
                            <Pagination 
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Schedule;