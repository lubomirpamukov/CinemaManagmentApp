import React, { Suspense} from "react";
import CinemaList from "../components/cinema/CinemaList";
import styles from "./CinemaPage.module.css";

const CinemaPage: React.FC = () => {
    return(
        <section className={styles.cinemaPage}>
            <header className={styles.cinemaPageHeader}>
                <h1>Cinemas</h1>
            </header>
            <main className={styles.cinemaPageContent}>
            <Suspense fallback={<p>Loading cinemas...</p>}>
                <CinemaList />
            </Suspense>
            </main>
        </section>
    )
}

export default CinemaPage