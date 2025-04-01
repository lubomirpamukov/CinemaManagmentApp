import React from "react";
import MovieForm from "../components/movie/MovieForm";

const CreateMoviePage: React.FC = () => {
  const handleSuccess = () => {
    console.log("Movie created successfully!");
    // Optionally navigate to another page or refresh the movie list
  };

  return (
    <div>
      <h1>Create Movie</h1>
      <MovieForm onSubmitSuccess={handleSuccess} />
    </div>
  );
};

export default CreateMoviePage;