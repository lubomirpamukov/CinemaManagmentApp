import React from 'react';
import { SeatZod } from '../../utils';
import styles from './ShowSeat.module.css';

type ShowSeatProps = {
    seat: SeatZod;
};

const ShowSeat: React.FC<ShowSeatProps> = ({ seat }) => {
    const seatClasses = [
        styles.seat,
        styles[seat.type],
        !seat.isAvailable ? styles.unavailable : styles.available
    ].join(' ');

    return (
    <div
      className={seatClasses}
      title={`Seat: ${seat.seatNumber}\nRow: ${seat.row}, Col: ${seat.column}\nType: ${seat.type}\nPrice: ${seat.price}\n${seat.isAvailable ? 'Available' : 'Unavailable/Reserved'}`}
      aria-disabled={!seat.isAvailable}
    >
      <span className={styles.seatNumber}>{seat.seatNumber}</span>
    </div>
  );
};

export default ShowSeat;