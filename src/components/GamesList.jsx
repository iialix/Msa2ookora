import { Link } from "react-router-dom";

import React from "react";
import Game from "./Game";
import BorderGlow from "./BorderGlow";
import "./GamesList.css";

export default function GamesList() {
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
        {
            id: 4,
            title: "offside",
            image: "/offside.png",
            urlText: "offside",
        },
        {
            id: 5,
            title: "بنك",
            image: "/bank.png",
            urlText: "bank",
        },
        {
            id: 6,
            title: "Top 10",
            image: "/top10.png",
            urlText: "top10",
        },
        {
            id: 7,
            title: "خمسة × عشرة",
            image: "/fivexten.png",
            urlText: "fivexten",
        },
        {
            id: 8,
            title: "Risk",
            image: "/risk.png",
            urlText: "risk",
        },
        {
            id: 9,
            title: "Infinity XO",
            image: "/infinityxo.png",
            urlText: "infinityxo",
        },
        {
            id: 10,
            title: "XO",
            image: "/xo.png",
            urlText: "xo",
        },
        {
            id: 11,
            title: "XOXO",
            image: "/xo.png",
            urlText: "xoxo",
        },
    ];

    return (
        <section className="games-section">
            <h2 className="section-title">الألعاب</h2>
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
