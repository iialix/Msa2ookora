import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import "./passwordChallenge.css";
import { fetchChangePlayer, fetchPasswordPlayers } from "../util/http";

const formatImageUrl = (url) => url.replace(".", "backend");

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

    const { data, isPending, isError } = useQuery({
        queryKey: ["passwordPlayers"],
        queryFn: fetchPasswordPlayers,
    });

    const { mutateAsync: changePlayerMutation } = useMutation({
        mutationFn: fetchChangePlayer,
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

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const startTimer = () => {
        if (!isActive) {
            setTimeLeft(30);
            setIsActive(true);
        } else {
            resetTurn();
        }
    };

    const addPoint = (team) => {
        const newScores = { ...scores, [team]: scores[team] + 1 };
        setScores(newScores);

        // ✅ NEW: Check if a team reached 5 points — show popup before continuing
        if (newScores[team] >= 5) {
            const winnerName = team === "teamA" ? "الفريق 1" : "الفريق 2";
            setEarlyWin(winnerName);
            resetTurn();
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

            resetTurn();
        } else {
            if (currentScores.teamA === currentScores.teamB) {
                setGameResult("انتهت اللعبة بالتعادل!");
            } else {
                setGameResult(
                    `انتهت اللعبة! الفائز هو: ${
                        currentScores.teamA > currentScores.teamB
                            ? "الفريق 1"
                            : "الفريق 2"
                    }`,
                );
            }
            resetTurn();
        }
    };

    const resetTurn = () => {
        setIsActive(false);
        setTimeLeft(30);
    };

    // ✅ NEW: Continue the same game (dismiss popup, advance round normally)
    const handleContinue = () => {
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
            <div className="game-result-container" dir="rtl">
                <div className="game-result">
                    <h2>{gameResult}</h2>
                    <div className="scoreboard">
                        <div className="score-box">
                            <span>الفريق 1</span>{" "}
                            <strong>{scores.teamA}</strong>
                        </div>
                        <div className="score-box">
                            <span>الفريق 2</span>{" "}
                            <strong>{scores.teamB}</strong>
                        </div>
                    </div>
                    <button
                        className="btn-primary playAgain"
                        onClick={() => window.location.reload()}>
                        العب مجدداً
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="game-container" dir="rtl">
            {earlyWin && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <h2>🏆 {earlyWin} وصل إلى 5 نقاط!</h2>
                        <p>
                            هل تريدون الاستمرار في نفس اللعبة أم البدء من جديد؟
                        </p>
                        <div className="popup-buttons">
                            <button
                                className="btn-primary"
                                onClick={handleContinue}>
                                استمر في اللعب
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={handleNewGame}>
                                لعبة جديدة
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="game-header">
                <span className="round-badge">الجولة: {round} / 8</span>
                <div className="scoreboard">
                    <div className="score-box">
                        <span>الفريق 1</span> <strong>{scores.teamA}</strong>
                    </div>
                    <div className="score-box">
                        <span>الفريق 2</span> <strong>{scores.teamB}</strong>
                    </div>
                </div>
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
                <div
                    className={`timer-display ${timeLeft <= 5 ? "danger" : ""}`}>
                    {timeLeft}
                </div>
                <button className="btn-primary" onClick={startTimer}>
                    {isActive ? "أعد تعيين الوقت" : "ابدأ المؤقت (30 ثانية)"}
                </button>
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
