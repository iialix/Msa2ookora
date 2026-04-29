import { Link } from "react-router-dom";

import React from "react";
import Game from "./Game";
import BorderGlow from "./BorderGlow";
import "./GamesList.css";

export default function GamesList() {
    // Example data - usually this would come from an API
    const gamesData = [
        {
            id: 1,
            title: "Password Challenge",
            image: "/Password.png",
            urlText: "password-challenge",
        },
        {
            id: 2,
            title: "بدون كلام",
            image: "/bedonKalam.png",
            urlText: "bedon-kalam",
        },
        {
            id: 3,
            title: "أنا مين",
            image: "/anameen.png",
            urlText: "ana-meen",
        },
    ];

    return (
        <section className="games-section">
            <h2 className="section-title">الألعاب</h2>
            <div className="games-grid">
                {gamesData.map((game) => {
                    // Convert "Password Challenge" to "password-challenge"
                    const gameSlug = game.title
                        .toLowerCase()
                        .replace(/\s+/g, "-");

                    return (
                        <Link
                            to={`/${game.urlText}`}
                            key={game.id}
                            style={{
                                textDecoration: "none",
                                color: "inherit",
                            }}>
                            <BorderGlow
                                edgeSensitivity={30}
                                // H: 160 (Aqua), S: 100%, L: 75% (Bright & Glowing)
                                glowColor="160 100 75"
                                backgroundColor="#120f17"
                                borderRadius={28}
                                glowRadius={40}
                                glowIntensity={1.2}
                                // Updated color array to shades of Aquamarine, Cyan, and Teal
                                colors={["#7fffd4", "#40e0d0", "#00ced1"]}>
                                <Game
                                    key={game.id}
                                    title={game.title}
                                    image={game.image}
                                />
                            </BorderGlow>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
