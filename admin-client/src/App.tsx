import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MoviePage from "./pages/MoviePage";
import CreateMoviePage from "./pages/CreateMoviePage";
import Navigation from "./components/Navigation/Navigation";
import CinemaPage from "./pages/CinemaPage"
import SnackPage from "./pages/SnackPage";

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/cinemas/:cinemaId/snacks/edit" element={<SnackPage />} />
        <Route path="/cinemas" element={<CinemaPage />}/>
        <Route path="/movies" element={<MoviePage />} />
        <Route path="/movies/create" element={<CreateMoviePage />} />
      </Routes>
    </Router>
  );
}

export default App;
