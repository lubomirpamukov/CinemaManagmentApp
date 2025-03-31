import React from 'react';
import './CinemaCard.css';
import { useNavigate } from 'react-router-dom';

interface Room {
  name: string;
  capacity: number;
  type: string;
}

interface CinemaCardProps {
  id: string;
  name: string;
  location: string;
  numberOfScreens: number;
  contact: string;
  rooms: Room[];
}

const CinemaCard: React.FC<CinemaCardProps> = ({ id,name, location, numberOfScreens, contact, rooms }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Navigate to the cinema details page
    navigate(`/cinemas/${id}`);
  };

  return (
    <div className="cinema-card" onClick={handleCardClick}>
      <h2 className="cinema-name">{name}</h2>
      <p className="cinema-location">Location: {location}</p>
      <p className="cinema-screens">Number of Screens: {numberOfScreens}</p>
      <p className="cinema-contact">Contact: {contact}</p>
      <div className="cinema-rooms">
        <h3>Rooms:</h3>
        <ul>
          {rooms.map((room, index) => (
            <li key={index}>
              <strong>{room.name}</strong> - {room.type} ({room.capacity} seats)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CinemaCard;