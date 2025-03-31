import React from "react";
import { Link } from "react-router-dom";

import './Navbar.css';

const Navbar : React.FC = () => {
    return (
        <nav className="navbar">
            <ul>
                <li>
                    <Link to="/cinemas">Cinemas</Link>
                </li>
                <li>
                    <Link to="/movies">Movies</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;