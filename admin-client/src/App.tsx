import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MoviePage from "./pages/MoviePage";
import CreateMoviePage from "./pages/CreateMoviePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/movies" element={<MoviePage />} />
        <Route path="/movies/create" element={<CreateMoviePage />} />
      </Routes>
    </Router>
  );
}

export default App;
