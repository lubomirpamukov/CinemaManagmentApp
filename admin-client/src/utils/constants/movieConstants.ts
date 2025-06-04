import { MovieFormValues } from "../../components/movie/MovieForm";

export const DEFAULT_MOVIE_VALUES: MovieFormValues = {
  title: "",
  duration: 0,
  pgRating: "",
  genre: "",
  year: new Date().getFullYear(),
  director: "",
  cast: [{ name: "", role: "" }],
  description: "",
  imgURL: "",
};


export const MovieValidation = {
  titleLength: "Title must be between 3 and 60 charaters.",
  duration: "Movie duration must be between 15 and 500 minutes.",
  pgRating: "PG Rating is required",
  genre: "Genre must be between 2 and 25 characters long.",
  year() {
    return `Year must be between 1850 and ${new Date().getFullYear()}.`;
  },
  director: "Director name must be between 2 and 100 characters long.",
  actorName: "Actor name must be between 2 and 100 characters long.",
  actorRole: "Actor role must be between 2 and 100 characters long.",
  actorRequired: "At least 1 actor is required.",
  description: "Description must be between 10 and 700 characters long.",
  url: "Image URL must be valid URL.",
};
