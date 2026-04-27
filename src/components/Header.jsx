import React from "react";
import "./Header.css";

const Header = () => {
    return (
        <header className="navbar">
            <div className="logo">
                <a href="/">
                    <img src="/logo.png" alt="logo" />
                </a>
            </div>
            <nav>
                <ul className="nav-links">
                    <li>
                        <a href="#home">Home</a>
                    </li>
                    <li>
                        <a href="#games">Games</a>
                    </li>
                    <li>
                        <a href="#about">About</a>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
