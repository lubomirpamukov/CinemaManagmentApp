import { BrowserRouter as Router ,Routes, Route} from "react-router-dom";
import MoviePage from "./pages/MoviePage";
import CreateMoviePage from "./pages/CreateMoviePage";
import Navigation from "./components/Navigation/Navigation";
import CinemaPage from "./pages/CinemaPage"
import SnackPage from "./pages/SnackPage";
import CreateHallPage from "./pages/CreateHallPage";
import EditCinemaPage from "./pages/EditCinemaPage";

function App() {
  console.log("App component rendered");
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/cinemas/:cinemaId/snacks/edit" element={<SnackPage />} />
        <Route path="/cinemas/:cinemaId/hall/create" element={<CreateHallPage />} />
        <Route path="/cinemas/:cinemaId/edit" element={<EditCinemaPage />}/>
        <Route path="/cinemas" element={<CinemaPage />}/>
        <Route path="/movies" element={<MoviePage />} />
        <Route path="/movies/create" element={<CreateMoviePage />} />
      </Routes>
    </Router>
  );
}

export default App;
