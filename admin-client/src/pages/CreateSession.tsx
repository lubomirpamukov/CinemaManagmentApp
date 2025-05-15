import React from "react";
import SessionForm from "../components/session/SessionForm";
import { useCinemas, useMovies } from "../hooks";
import Spinner from "../components/Spinner";

const CreateSession: React.FC = () => {
  const { cinemas, loading, error } = useCinemas();
  const { movies, loading: moviesLoading, error: moviesError } = useMovies();
  if (loading || moviesLoading) {
    return <Spinner />;
  }

  if (error || moviesError) {
    return <div>Error: {error}</div>;
  }

  return <SessionForm cinemas={cinemas} movies={movies}/>;
};

export default CreateSession;
