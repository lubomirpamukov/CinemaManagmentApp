import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import CinemasPage from './pages/CinemasPage';
import MoviesPage from './pages/MoviesPage';
import CinemaDetailsPage from './pages/CinemaDetailsPage'; // Import the new page

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
      </div>
      <Routes>
        <Route path="/cinemas" element={<CinemasPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/cinemas/:cinemaId" element={<CinemaDetailsPage />} /> {/* Use the new page */}
      </Routes>
    </Router>
  );
}

export default App;