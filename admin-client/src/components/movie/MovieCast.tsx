import React from "react";

export type CastMember = {
    name: string;
    role: string;
}

export type MovieCastProps = {
    cast: CastMember[];
}

const MovieCast: React.FC<MovieCastProps> = ({ cast }) => {
    return (
        <div className="movie-cast">
        <strong>Cast:</strong>
        <ul style={{listStyle: "none"}}>
            {cast.map((actor, index) => (
            <li key={index}>
                {actor.name} as <em>{actor.role}</em>
            </li>
            ))}
        </ul>
        </div>
    );
}

export default MovieCast;
