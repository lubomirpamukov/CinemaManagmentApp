import React from "react";
import MovieList from "../components/movie/MovieList";
import styles from "./MoviePage.module.css";

const MoviePage: React.FC = () =>{
    return (
        <div className={styles.moviePage}>
            <header className={styles.moviePageHeader}>
                <h1>Movies</h1>
            </header>
            <main className={styles.moviePageContent}>
                <MovieList />
            </main>
        </div>
    )
}

export default MoviePage;