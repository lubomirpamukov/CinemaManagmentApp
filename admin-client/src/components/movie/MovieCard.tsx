import MovieDetails, { MovieDetailsProps } from "./MovieDetails";
import MovieCast from "./MovieCast";
import "./MovieCard.css";
import ActionButton, { ActionButtonProps } from "../buttons/ActionButton";

export interface MovieCardProps {
  id: string;
  title: string;
  duration: number;
  description: string;
  pgRating: string;
  genre: string;
  year: number;
  director?: string;
  cast?: { name: string; role: string }[];
  imgURL?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  duration,
  pgRating,
  genre,
  year,
  director,
  cast,
  description,
  imgURL,
}) => {
  // Define the props for the MovieDetails component
  const movieDetailsProps: MovieDetailsProps = {
    genre,
    year,
    duration,
    description,
    pgRating,
    director,
  };

  // Define the props for the ActionButton component
  // These buttons are for editing and deleting the movie
  const editButtonProps: ActionButtonProps = {
    label: "Edit",
    id: id,
    type: "edit",
    onClick: () => console.log(`Edit button clicked for ${id}`),
  };

  const deleteButtonProps: ActionButtonProps = {
    label: "Delete",
    id: id,
    type: "delete",
    onClick: () => handlesDelete(id)
  };

  // Function to handle delete action
  const handlesDelete = async (id: string) => {
    
   try{
    const response = await fetch(`http://localhost:3000/movies/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete movie");
    }
    console.log(`Movie with id ${id} deleted successfully`);
   }catch (error) {
    console.error("Error deleting movie:", error);
   }

  };

  return (
    <div className="movie-card">
      {imgURL && <img src={imgURL} alt={title} className="movie-card-img" />}
      <div className="movie-card-content">
        <h2 className="movie-title">{title}</h2>
        <MovieDetails {...movieDetailsProps} />
        {cast && <MovieCast cast={cast} />}
        <div className="movie-actions">
          <ActionButton {...editButtonProps} />
          <ActionButton {...deleteButtonProps} />
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
