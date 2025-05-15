import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import CreateSession from "./pages/CreateSession";
import LoginPage from "./pages/LoginPage";
import MoviePage from "./pages/MoviePage";
import CreateMoviePage from "./pages/CreateMoviePage";
import Navigation from "./components/Navigation/Navigation";
import CinemaPage from "./pages/CinemaPage";
import SnackPage from "./pages/SnackPage";
import CreateHallPage from "./pages/CreateHallPage";
import EditCinemaPage from "./pages/EditCinemaPage";
import CreateCinemaPage from "./pages/CreateCinemaPage";
import UserPage from "./pages/UserPage";
import EditCreateUserPage from "./pages/EditCreateUserPage";
import ErrorFallback from "./components/ErrorFallback";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error("Application error:", error);
        console.error("Component stack:", info.componentStack);
      }}
    >
      <Router>
        <Navigation />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/users" element={<UserPage />} />
            <Route path="/users/create" element={<EditCreateUserPage />} />
            <Route path="/users/:userId/edit" element={<EditCreateUserPage />} />
            <Route path="/cinemas/:cinemaId/snacks/edit" element={<SnackPage />} />
            <Route path="/cinemas/:cinemaId/hall/create" element={<CreateHallPage />} />
            <Route path="/cinemas/:cinemaId/edit" element={<EditCinemaPage />} />
            <Route path="/cinemas" element={<CinemaPage />} />
            <Route path="/cinemas/create" element={<CreateCinemaPage />} />
            <Route path="/session" element={<CreateSession />} />
            <Route path="/movies" element={<MoviePage />} />
            <Route path="/movies/create" element={<CreateMoviePage />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;