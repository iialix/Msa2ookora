import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import "./passwordChallenge.css";
import { fetchChangePlayer, fetchPasswordPlayers } from "../util/http";
import Timer from "../components/Timer";
import ScoreBoard from "../components/ScoreBoard";
import EarlyWin from "../components/EarlyWin";
import GameResult from "../components/GameResult";

const formatImageUrl = (url) => url.replace(".", "../../backend");

export default function PasswordChallenge() {
    const [timeLeft, setTimeLeft] = useState(30);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [round, setRound] = useState(1);
    const [scores, setScores] = useState({ teamA: 0, teamB: 0 });
    const [currentPlayer, setCurrentPlayer] = useState({
        name: "جاري التحميل...",
        image: null,
    });
    const [gameResult, setGameResult] = useState(null);
    // ✅ NEW: early win popup state
    const [earlyWin, setEarlyWin] = useState(null); // null | "الفريق 1" | "الفريق 2"

    const [continued, setContinued] = useState(false);

    const { data, isPending, isError } = useQuery({
        queryKey: ["passwordPlayers"],
        queryFn: fetchPasswordPlayers,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    const { mutateAsync: changePlayerMutation } = useMutation({
        mutationFn: fetchChangePlayer,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    useEffect(() => {
        if (data && data.length > 0) {
            const firstPlayer = data[0];
            setCurrentPlayer({
                name: firstPlayer.name,
                image: formatImageUrl(firstPlayer.image_url),
            });
        }
    }, [data]);

    const addPoint = (team) => {
        const newScores = { ...scores, [team]: scores[team] + 1 };
        setScores(newScores);

        // ✅ NEW: Check if a team reached 5 points — show popup before continuing
        if (newScores[team] >= 5 && !continued) {
            const winnerName = team === "teamA" ? "الفريق 1" : "الفريق 2";
            setEarlyWin(winnerName);
            return; // stop here, don't advance round yet
        }

        nextRound(newScores);
    };

    const nextRound = (currentScores) => {
        if (round < 8) {
            setRound((prev) => prev + 1);

            setCurrentPlayerIndex((prev) => {
                const nextIndex = prev + 1;
                if (data && data[nextIndex]) {
                    setCurrentPlayer({
                        name: data[nextIndex].name,
                        image: formatImageUrl(data[nextIndex].image_url),
                    });
                } else {
                    console.warn(
                        "لا يوجد لاعبون إضافيون في البيانات المجلوبة.",
                    );
                }
                return nextIndex;
            });
        } else {
            if (currentScores.teamA === currentScores.teamB) {
                setGameResult("انتهت اللعبة بالتعادل!");
            } else {
                setGameResult(
                    `انتهت اللعبة! الفائز هو: ${currentScores.teamA > currentScores.teamB
                        ? "الفريق 1"
                        : "الفريق 2"
                    }`,
                );
            }
        }
    };

    // ✅ NEW: Continue the same game (dismiss popup, advance round normally)
    const handleContinue = () => {
        setContinued(true);
        setEarlyWin(null);
        nextRound(scores);
    };

    // ✅ NEW: Start a brand new game
    const handleNewGame = () => {
        window.location.reload();
    };

    const changePlayer = async () => {
        try {
            const result = await changePlayerMutation();
            if (result && result.length > 0) {
                const newPlayer = result[0];
                setCurrentPlayer({
                    name: newPlayer.name,
                    image: formatImageUrl(newPlayer.image_url),
                });
            }
        } catch (error) {
            console.error("فشل تغيير اللاعب:", error);
        }
    };

    if (isPending && !currentPlayer.image)
        return (
            <div className="game-container" dir="rtl">
                جاري التحميل...
            </div>
        );

    if (isError)
        return (
            <div className="game-container" dir="rtl">
                حدث خطأ في تحميل البيانات
            </div>
        );

    if (gameResult) {
        return (
            <GameResult
                gameResult={gameResult}
                scores={scores}
                handleNewGame={handleNewGame}></GameResult>
        );
    }

    return (
        <div className="game-container" dir="rtl">
            {/* Early Win Popup */}
            <EarlyWin
                earlyWin={earlyWin}
                scores={scores}
                handleContinue={handleContinue}></EarlyWin>

            {/* Header */}
            <div className="game-header">
                <ScoreBoard
                    isTurns={false}
                    selectedTeam={null}
                    round={round}
                    scores={scores}
                    totalRounds={8}></ScoreBoard>
            </div>

            <div className="player-section">
                <div className="player-card">
                    {currentPlayer.image ? (
                        <img
                            src={currentPlayer.image}
                            alt={currentPlayer.name}
                            className="player-img"
                        />
                    ) : (
                        <div className="player-img-placeholder">
                            جاري التحميل...
                        </div>
                    )}
                    <h3>{currentPlayer.name}</h3>
                    <button className="btn-secondary" onClick={changePlayer}>
                        تغيير اللاعب
                    </button>
                </div>
            </div>

            <div className="timer-section">
                <Timer time={30} currentPlayer={currentPlayer}></Timer>
            </div>

            <div className="action-section">
                <p>منح النقطة لـ:</p>
                <div className="team-buttons">
                    <button
                        className="btn-team a"
                        onClick={() => addPoint("teamA")}>
                        الفريق 1 (+1)
                    </button>
                    <button
                        className="btn-team b"
                        onClick={() => addPoint("teamB")}>
                        الفريق 2 (+1)
                    </button>
                </div>
            </div>
        </div>
    );
}
