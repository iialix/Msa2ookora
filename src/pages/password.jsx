import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import "./passwordChallenge.css";
import { fetchChangePlayer, fetchPasswordPlayers } from "../util/http";

const PasswordChallenge = () => {
    const [timeLeft, setTimeLeft] = useState(30);
    const [currentPlayerIndex, setCurrentPlayerindex] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [round, setRound] = useState(1);
    const [scores, setScores] = useState({ teamA: 0, teamB: 0 });
    const [currentPlayer, setCurrentPlayer] = useState({
        name: "جاري التحميل...",
        image: null,
    });

    const { data, isPending, isError } = useQuery({
        queryKey: ["passwordPlayers"],
        queryFn: fetchPasswordPlayers,
    });

    const { refetch } = useQuery({
        queryKey: ["changePlayer"],
        queryFn: fetchChangePlayer,
        enabled: false,
    });

    // إصلاح: تحديث اللاعب الأول عند تحميل البيانات لأول مرة
    useEffect(() => {
        if (data && data.length > 0 && round === 1 && !currentPlayer.image) {
            const firstPlayer = data[0]; // تم تعريف المتغير هنا بدلاً من 'player'
            setCurrentPlayer({
                name: firstPlayer.name,
                image: firstPlayer.image_url.replace(".", "backend"),
            });
        }
    }, [data, round, currentPlayer.image]);

    // منطق المؤقت
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
        } else if (isActive) {
            resetTurn();
        }
    };

    const addPoint = (team) => {
        setScores((prev) => ({ ...prev, [team]: prev[team] + 1 }));
        nextRound();
    };

    const nextRound = () => {
        if (round < 8) {
            const nextIndex = currentPlayerIndex + 1; // حساب الاندكس القادم مسبقاً
            setRound((prev) => prev + 1);
            setCurrentPlayerindex(nextIndex);

            // إصلاح: التأكد من وجود بيانات قبل التحديث لمنع الـ Crash
            if (data && data[nextIndex]) {
                setCurrentPlayer({
                    name: data[nextIndex].name,
                    image: data[nextIndex].image_url.replace(".", "backend"),
                });
            }
            resetTurn();
        } else {
            alert(
                `انتهت اللعبة! الفائز هو: ${scores.teamA > scores.teamB ? "الفريق الأول" : "الفريق الثاني"}`,
            );
        }
    };

    const resetTurn = () => {
        setIsActive(false);
        setTimeLeft(30);
    };

    const changePlayer = async () => {
        refetch().then((result) => {
            if (result.data && result.data.length > 0) {
                const newPlayer = result.data[0];
                setCurrentPlayer({
                    name: newPlayer.name,
                    image: newPlayer.image_url.replace(".", "backend"),
                });
            }
        });
    };

    // منع الرندر إذا كانت البيانات لم تصل بعد
    if (isPending && !currentPlayer.image)
        return <div className="game-container">جاري التحميل...</div>;
    if (isError)
        return <div className="game-container">حدث خطأ في تحميل البيانات</div>;

    return (
        <div className="game-container" dir="rtl">
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
                    {isActive ? " أعد تعيين الوقت" : "ابدأ المؤقت (30 ثانية)"}
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
};

export default PasswordChallenge;
