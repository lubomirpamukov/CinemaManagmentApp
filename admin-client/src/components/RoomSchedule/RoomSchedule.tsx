import React from 'react';
import './RoomSchedule.css';

interface Schedule {
  day: string;
  times: { movie: string; time: string }[];
}

interface RoomScheduleProps {
  roomName: string;
  schedule: Schedule[];
}

const RoomSchedule: React.FC<RoomScheduleProps> = ({ roomName, schedule }) => {
  return (
    <div className="room-schedule">
      <h3 className="room-name">Schedule for {roomName}</h3>
      <div className="schedule-table">
        {schedule.map((daySchedule, index) => (
          <div key={index} className="schedule-day">
            <h4>{daySchedule.day}</h4>
            <ul>
              {daySchedule.times.map((timeSlot, idx) => (
                <li key={idx}>
                  <strong>{timeSlot.movie}</strong> - {timeSlot.time}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomSchedule;