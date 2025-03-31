import React from 'react';
import CinemaCard from '../components/Cinema/CinemaCard';
import './CinemasPage.css';

const CinemasPage: React.FC = () => {
  const cinemas = [
    {
      id: '1', // Unique ID for the cinema
      name: 'Grand Cinema',
      location: 'Downtown',
      numberOfScreens: 10,
      contact: '123-456-7890',
      rooms: [
        {
          name: 'Room 1',
          capacity: 100,
          type: 'IMAX',
          schedule: [
            { day: 'Monday', times: [{ movie: 'Inception', time: '10:00 AM' }, { movie: 'Interstellar', time: '2:00 PM' }] },
            { day: 'Tuesday', times: [{ movie: 'Dunkirk', time: '12:00 PM' }] },
          ],
        },
        {
          name: 'Room 2',
          capacity: 80,
          type: 'Standard',
          schedule: [
            { day: 'Monday', times: [{ movie: 'The Dark Knight', time: '11:00 AM' }] },
            { day: 'Wednesday', times: [{ movie: 'Tenet', time: '3:00 PM' }] },
          ],
        },
      ],
    },
    {
      id: '2', // Unique ID for the cinema
      name: 'City Lights Cinema',
      location: 'Uptown',
      numberOfScreens: 8,
      contact: '987-654-3210',
      rooms: [
        {
          name: 'Room A',
          capacity: 120,
          type: '3D',
          schedule: [
            { day: 'Monday', times: [{ movie: 'Avatar', time: '1:00 PM' }, { movie: 'Titanic', time: '4:00 PM' }] },
            { day: 'Friday', times: [{ movie: 'The Avengers', time: '6:00 PM' }] },
          ],
        },
      ],
    },
  ];

  return (
    <div className="cinemas-page">
      <h1>Cinemas</h1>
      <div className="cinema-list">
        {cinemas.map((cinema, index) => (
          <CinemaCard
            key={index}
            id={cinema.id}
            name={cinema.name}
            location={cinema.location}
            numberOfScreens={cinema.numberOfScreens}
            contact={cinema.contact}
            rooms={cinema.rooms}
          />
        ))}
      </div>
    </div>
  );
};

export default CinemasPage;