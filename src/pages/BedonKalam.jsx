import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import "./BedonKalam.css";
import { fetchBedonKalam } from "../util/http";

const formatImageUrl = (url) => url.replace(".", "backend");

export default function BedonKalam() {
    const [selectedIndex, setSelectedIndex] = useState(null); // which button was clicked
    const [selectedTeam, setSelectedTeam] = useState(1);
    const [usedIndexes, setUsedIndexes] = useState([]); // already chosen buttons
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(45);
    const [isActive, setIsActive] = useState(false);
    const [round, setRound] = useState(1);
    const [scores, setScores] = useState({ teamA: 0, teamB: 0 });
    const [gameResult, setGameResult] = useState(null);
    const [skippedRounds, setSkippedRounds] = useState(0);
    const [earlyWin, setEarlyWin] = useState(null);

    const { data, isPending, isError } = useQuery({
        queryKey: ["bedonKalam"],
        queryFn: fetchBedonKalam,
    });

    // Timer
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleSelectPlayer = (index) => {
        const alreadyUsed = usedIndexes.some(
            (item) => item.selectedIndex === index,
        );

        if (alreadyUsed) return;
        setSelectedIndex(index);
        setCurrentPlayer(data[index]);
        resetTurn();
    };

    const startTimer = () => {
        if (!isActive) {
            setTimeLeft(45);
            setIsActive(true);
        } else {
            resetTurn();
        }
    };

    const resetTurn = () => {
        setIsActive(false);
        setTimeLeft(45);
    };

    const addPoint = (team) => {
        if (selectedIndex === null) return;

        // 1. تبديل الفريق الذي عليه الدور
        setSelectedTeam((prev) => (prev === 1 ? 2 : 1));

        // 2. تحديث السكور والجولات المسحوب عليها
        let currentScores = { ...scores };
        let currentSkipped = skippedRounds;

        if (team === "skip") {
            currentSkipped = skippedRounds + 1;
            setSkippedRounds(currentSkipped);
        } else {
            currentScores[team] = scores[team] + 1;
            setScores(currentScores);
        }

        // 3. تسجيل البيانات وتصفير الجولة
        setUsedIndexes((prev) => [
            ...prev,
            { selectedIndex: selectedIndex, teamAnswer: team },
        ]);
        setSelectedIndex(null);
        setCurrentPlayer(null);
        resetTurn();

        // 4. فحص الفوز المبكر (Early Win)
        // المعادلة: إذا وصل فريق لأكثر من نصف الجولات المتبقية "الممكنة"
        const totalRounds = 10;
        const roundsPlayed = round;
        const roundsRemaining = totalRounds - roundsPlayed;

        const teamAScore = currentScores.teamA;
        const teamBScore = currentScores.teamB;

        // Check if teamA is unreachable
        if (teamAScore > teamBScore + roundsRemaining) {
            setEarlyWin("الفريق 1");
            return;
        }

        // Check if teamB is unreachable
        if (teamBScore > teamAScore + roundsRemaining) {
            setEarlyWin("الفريق 2");
            return;
        }

        // 5. فحص نهاية اللعبة (الجولة 10)
        if (round >= 10) {
            if (currentScores.teamA === currentScores.teamB) {
                setGameResult("انتهت اللعبة بالتعادل!");
            } else {
                const winner =
                    currentScores.teamA > currentScores.teamB
                        ? "الفريق 1"
                        : "الفريق 2";
                setGameResult(`انتهت اللعبة! الفائز هو: ${winner}`);
            }
        } else {
            setRound((r) => r + 1);
        }
    };

    const handleContinue = () => {
        setEarlyWin(null);
        if (round >= 10) {
            const { teamA, teamB } = scores;
            if (teamA === teamB) setGameResult("انتهت اللعبة بالتعادل!");
            else
                setGameResult(
                    `انتهت اللعبة! الفائز هو: ${teamA > teamB ? "الفريق 1" : "الفريق 2"}`,
                );
        } else {
            setRound((r) => r + 1);
        }
    };

    const handleNewGame = () => window.location.reload();

    if (isPending)
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
                        <div className="score-box teamA active">
                            <span>الفريق 1</span>
                            <strong>{scores.teamA}</strong>
                        </div>
                        <div className="score-box teamB active">
                            <span>الفريق 2</span>
                            <strong>{scores.teamB}</strong>
                        </div>
                    </div>
                    <button
                        className="btn-primary playAgain"
                        onClick={handleNewGame}>
                        العب مجدداً
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="game-container" dir="rtl">
            {/* Early Win Popup */}
            {earlyWin && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <h2>🏆</h2>
                        <h2>
                            {earlyWin} فاز ووصل إلى{" "}
                            {Math.max(scores.teamA, scores.teamB)} نقاط!
                        </h2>
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

            {/* Header */}
            <div className="game-header">
                <span className="round-badge">الجولة: {round} / 10</span>
                <div className="scoreboard">
                    <div
                        className={`score-box2 teamA ${selectedTeam === 1 ? "active" : ""}`}>
                        <span>الفريق 1</span>
                        <strong>{scores.teamA}</strong>
                    </div>
                    <div
                        className={`score-box2 teamB ${selectedTeam === 2 ? "active" : ""}`}>
                        <span>الفريق 2</span>
                        <strong>{scores.teamB}</strong>
                    </div>
                </div>
            </div>

            {/* Player Buttons Grid */}
            <div className="player-section">
                <div className="bedon-buttons-grid">
                    {data.map((player, index) => {
                        const usedItem = usedIndexes.find(
                            (item) => item.selectedIndex === index,
                        );
                        const isUsed = !!usedItem;
                        const teamAnswered = usedItem?.teamAnswer;
                        const isSelected = selectedIndex === index;
                        return (
                            <button
                                key={player.id}
                                className={`bedon-player-btn 
                                ${isUsed ? "used" : ""} 
                                ${teamAnswered === "teamA" ? "team-a" : ""} 
                                ${teamAnswered === "teamB" ? "team-b" : ""} 
                                ${teamAnswered === "skip" ? "skipped" : ""} 
                                ${isSelected ? "selected" : ""}`}
                                onClick={() => handleSelectPlayer(index)}
                                disabled={isUsed}>
                                {teamAnswered === "skip" && "✗"}
                                {isUsed && !(teamAnswered === "skip") && "✓"}
                                {!isUsed && index + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Selected Player Card */}
                {currentPlayer ? (
                    <div className="player-card" style={{ marginTop: "20px" }}>
                        <img
                            src={formatImageUrl(currentPlayer.image_url)}
                            alt={currentPlayer.name}
                            className="player-img"
                        />
                        <h3>{currentPlayer.name}</h3>
                    </div>
                ) : (
                    <div className="player-placeholder">
                        <p
                            style={{
                                color: "rgba(255,255,255,0.4)",
                                marginTop: "20px",
                            }}>
                            اختر رقماً لعرض اللاعب
                        </p>
                    </div>
                )}
            </div>

            {/* Timer */}
            <div className="timer-section">
                <div
                    className={`timer-display ${timeLeft <= 5 ? "danger" : ""}`}>
                    {timeLeft}
                </div>
                <button
                    className="btn-primary"
                    onClick={startTimer}
                    disabled={!currentPlayer}>
                    {isActive ? "أعد تعيين الوقت" : "ابدأ المؤقت (45 ثانية)"}
                </button>
            </div>

            {/* Give Point */}
            <div className="action-section">
                <p>منح النقطة لـ:</p>
                <div className="team-buttons">
                    <button
                        className="btn-team a"
                        onClick={() => addPoint("teamA")}
                        disabled={!currentPlayer}>
                        الفريق 1 (+1)
                    </button>
                    <button
                        className="btn-team b"
                        onClick={() => addPoint("teamB")}
                        disabled={!currentPlayer}>
                        الفريق 2 (+1)
                    </button>
                    <button
                        className="btn-team skip"
                        onClick={() => addPoint("skip")}
                        disabled={!currentPlayer}>
                        skip
                    </button>
                </div>
            </div>
        </div>
    );
}
