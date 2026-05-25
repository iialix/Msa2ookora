import { Link } from "react-router-dom";

import React from "react";
import Game from "./Game";
import BorderGlow from "./BorderGlow";
import "./GamesList.css";
import gamesData from "../data/gamesData";

export default function GamesList() {
    return (
        <section className="games-section">
            <h2 className="section-title">الألعاب</h2>

            {/* Tournament CTA */}
            <Link to="/tournament" className="tournament-cta">
                <span className="tournament-cta-icon">🏆</span>
                <span className="tournament-cta-text">
                    <strong>البطولة</strong>
                    <small>العب عدة ألعاب وتنافس على اللقب!</small>
                </span>
                <span className="tournament-cta-arrow">←</span>
            </Link>

            <div className="games-grid">
                {gamesData.map((game) => {
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
                                glowColor="160 100 75"
                                backgroundColor="#120f17"
                                borderRadius={28}
                                glowRadius={40}
                                glowIntensity={1.2}
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
