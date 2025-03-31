import React from 'react';
import './CinemaDetails.css';

interface Schedule {
  day: string;
  times: { movie: string; time: string }[];
}

interface Room {
  name: string;
  capacity: number;
  type: string;
  schedule: Schedule[];
}

interface CinemaDetailsProps {
  name: string;
  location: string;
  numberOfScreens: number;
  contact: string;
  rooms: Room[];
}

const CinemaDetails: React.FC<CinemaDetailsProps> = ({ name, location, numberOfScreens, contact, rooms }) => {
  return (
    <div className="cinema-details">
      <h2 className="cinema-name">{name}</h2>
      <p className="cinema-location">Location: {location}</p>
      <p className="cinema-screens">Number of Screens: {numberOfScreens}</p>
      <p className="cinema-contact">Contact: {contact}</p>

      <div className="cinema-program">
        <h3>Cinema Program</h3>
        <table className="program-table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Day</th>
              <th>Movie</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room, roomIndex) =>
              room.schedule.map((daySchedule, dayIndex) =>
                daySchedule.times.map((timeSlot, timeIndex) => (
                  <tr key={`${roomIndex}-${dayIndex}-${timeIndex}`}>
                    <td>{room.name}</td>
                    <td>{room.type}</td>
                    <td>{room.capacity}</td>
                    <td>{daySchedule.day}</td>
                    <td>{timeSlot.movie}</td>
                    <td>{timeSlot.time}</td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CinemaDetails;