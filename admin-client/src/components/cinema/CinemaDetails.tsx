import React from "react"
import styles from "./CinemaDetails.module.css"
import { Cinema } from "../../utils/CinemaValidationsSchema"

type CinemaDetailsProps = Omit<Cinema, 'id'>;

const CinemaDetails: React.FC<CinemaDetailsProps> = ({
    name,
    city,
    halls,
    snacks,
    imgURL
}) => {
    return (
        <div className={styles.cinemaDetails}>
            <p>
                <strong>Name:</strong> {name}
            </p>
            <p>
                <strong>City:</strong> {city}
            </p>
            <p>
                {/* halls component */}
            </p>
            <p>
                { /* snacks component */}
            </p>
        </div>
    )
}

export default CinemaDetails