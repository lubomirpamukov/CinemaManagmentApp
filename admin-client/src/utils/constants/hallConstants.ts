import { Hall } from "../../services/hallService";

export const HallValidation = {
    name: "Hall name must be between 3 and 100 characters long",
    layoutRows: "Rows must be between 1 and 50",
    layoutColumns: "Columns must be between 1 and 50",
    price: "Price must be a positive number",
    seats: "All seats must be within the rows and columns range of the hall layout",
    seatName: "Seat name must be between 1 and 10 characters long",
    movieOverlap: "Movie times cannot overlap",
}

export const DEFAULT_HALL_VALUES: Hall = {
    id: "",
    cinemaId: "",
    name: "",
    layout: {
      rows: 10,
      columns: 15
    },
    movieProgram: [],
    seats: []
  };