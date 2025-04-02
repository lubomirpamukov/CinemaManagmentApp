import React from "react";
import MovieForm from "../components/movie/MovieForm";
import { useLocation } from "react-router-dom";
import { MovieFormValues } from "../components/movie/MovieForm";

const CreateMoviePage: React.FC = () => {
  const location = useLocation();
  const movieToEdit: MovieFormValues = location.state || null;

  const handleSuccess = () => {
    console.log("Movie created successfully!");
    // Optionally navigate to another page or refresh the movie list
  };

  return (
    <>
      <h1 style={{textAlign:"center"}}>{movieToEdit ? "Edit Movie" : "Create Movie"}</h1>
      <MovieForm initialValues={movieToEdit} onSubmitSuccess={handleSuccess} />
    </>
  );
};

export default CreateMoviePage;