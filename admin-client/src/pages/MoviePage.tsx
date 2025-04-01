import React from "react";
import MovieList from "../components/movie/MovieList";
import "./MoviePage.css";

const MoviePage: React.FC = () =>{
    return (
        <div className="movie-page">
            <header className="movie-page-header">
                <h1>Movies</h1>
            </header>
            <main className="movie-page-content">
                <MovieList />
            </main>
        </div>
    )
}

export default MoviePage;