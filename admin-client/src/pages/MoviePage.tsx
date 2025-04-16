import { z } from "zod";

import { usePaginated } from "../hooks";
import Pagination from "../components/buttons/Pagination";
import Spinner from "../components/Spinner";
import { movieSchema } from "../utils";
import MovieList from "../components/movie/MovieList";
import styles from "./MoviePage.module.css";

const MoviePage: React.FC = () =>{
    const {
        data: movies,
        currentPage,
        totalPages,
        setCurrentPage,
        loading,
        error,
    } 
    = usePaginated("/movies", 3, z.array(movieSchema))

    if(loading){
        return <Spinner />
    }

    if(error){
        return <div>{error}</div>
    }

    if(!movies || movies.length <= 0){
        return <div>No movies found</div>
    }


    
    return (
        <section className={styles.moviePage}>
            <header className={styles.moviePageHeader}>
                <h1>Movies</h1>
            </header>
            <main className={styles.moviePageContent}>
                <MovieList movies={movies} />
                <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                />
            </main>
        </section>
    )
}

export default MoviePage;