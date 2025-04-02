import React,{ Suspense} from "react";
import MovieList from "../components/movie/MovieList";
import styles from "./MoviePage.module.css";

const MoviePage: React.FC = () =>{
    return (
        <section className={styles.moviePage}>
            <header className={styles.moviePageHeader}>
                <h1>Movies</h1>
            </header>
            <main className={styles.moviePageContent}>
            <Suspense fallback={<p>Loading cinemas...</p>}>
                <MovieList />
            </Suspense>
            </main>
        </section>
    )
}

export default MoviePage;