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