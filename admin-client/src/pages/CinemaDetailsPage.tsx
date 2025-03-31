import React from 'react';
import { useParams } from 'react-router-dom';
import CinemaDetails from '../components/Cinema/CinemaDetails';

const CinemaDetailsPage: React.FC = () => {
  const cinemas = [
    {
      id: '1',
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
          ],
        },
      ],
    },
    {
      id: '2',
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
            { day: 'Monday', times: [{ movie: 'Avatar', time: '1:00 PM' }] },
          ],
        },
      ],
    },
  ];

  const { cinemaId } = useParams();
  const cinema = cinemas.find((c) => c.id === cinemaId);

  if (!cinema) {
    return <div>Cinema not found</div>;
  }

  return (
    <CinemaDetails
      name={cinema.name}
      location={cinema.location}
      numberOfScreens={cinema.numberOfScreens}
      contact={cinema.contact}
      rooms={cinema.rooms}
    />
  );
};

export default CinemaDetailsPage;