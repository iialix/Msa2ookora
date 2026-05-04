import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRisk } from "../util/http";
import Timer from "../components/Timer";
import ScoreBoard from "../components/ScoreBoard";
import GameResult from "../components/GameResult";
import "./Risk.css";

const DIFFICULTY_LABELS = { 5: "سهل", 10: "متوسط", 20: "صعب", 40: "خبير" };
const DIFFICULTY_ORDER = [5, 10, 20, 40];

export default function Risk() {
    const [activeTeam, setActiveTeam] = useState(1); // whose turn to pick
    const [scores, setScores] = useState({ teamA: 0, teamB: 0 });
    const [usedIds, setUsedIds] = useState({}); // answered/expired questions
    const [doubleId, setDoubleId] = useState(null); // which question is the double
    const [shuffledChoices, setShuffledChoices] = useState([]); // memoized shuffled choices
    const [extraTime, setExtraTime] = useState(0);

    // Power-ups: each team gets one of each
    const [powerUps, setPowerUps] = useState({
        teamA: { steal: true, extraTime: true, choices: true },
        teamB: { steal: true, extraTime: true, choices: true },
    });

    // Modal state
    const [modal, setModal] = useState(null);
    /*  modal = {
          question, answer, points, choices,
          phase: "idle"|"timer"|"steal"|"extra"|"expired",
          showAnswer: bool,
          showChoices: bool,
          stealActive: bool,     // other team is now answering
          timerKey: number,
          timerDuration: number,
          stealUsedBy: null|1|2,
        }
    */

    const [gameResult, setGameResult] = useState(null);

    const { data, isPending, isError } = useQuery({
        queryKey: ["risk"],
        queryFn: fetchRisk,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    // Group by category
    const categories = useMemo(() => {
        if (!data) return {};

        const byCat = {};
        data.forEach((q, idx) => {
            const id = q.id ?? idx;
            if (!byCat[q.category]) byCat[q.category] = [];
            byCat[q.category].push({ ...q, id });
        });

        return byCat;
    }, [data]);

    // Set doubleId once after data loads
    useEffect(() => {
        if (data && data.length > 0 && doubleId === null) {
            const allIds = data.map((q, idx) => q.id ?? idx);
            const randomDouble = allIds[Math.floor(Math.random() * allIds.length)];
            setDoubleId(randomDouble);
        }
    }, [data]);

    const activeTeamKey = activeTeam === 1 ? "teamA" : "teamB";
    const otherTeam = activeTeam === 1 ? 2 : 1;
    const otherTeamKey = otherTeam === 1 ? "teamA" : "teamB";

    const handleNewGame = () => window.location.reload();

    // ── Open question modal ──────────────────────────────────────
    const openQuestion = (q) => {
        if (usedIds[q.id] !== undefined) return;
        const isDouble = doubleId === q.id || doubleId === String(q.id);
        const pts = isDouble ? q.difficulty * 2 : q.difficulty;
        // Pre-shuffle choices so they don't reshuffle on re-render
        const allChoices = q.choices ? [q.answer, ...q.choices].sort(() => Math.random() - 0.5) : [q.answer];
        setShuffledChoices(allChoices);
        setModal({
            question: q.question,
            answer: q.answer,
            choices: q.choices || [],
            points: pts,
            isDouble,
            phase: "timer",
            showAnswer: false,
            showChoices: false,
            stealActive: false,
            stealUsedBy: null,
            timerKey: 0,
            timerDuration: 30,
            qId: q.id,
            pickingTeam: activeTeam, // remember who picked
            powerUpUsed: false, // track if any powerup was used this question
        });
    };

    const closeModal = () => {
        setModal(null);
        setExtraTime(0);
        setActiveTeam((t) => (t === 1 ? 2 : 1));
    };

    const markUsed = (correctAnswer) => {
        setUsedIds((prev) => ({
            ...prev,
            [modal.qId]: correctAnswer ? modal.pickingTeam : null,
        }));
    };

    // ── Timer controls ───────────────────────────────────────────
    const handleStartTimer = () => {
        setModal((m) => ({ ...m, phase: "timer", timerKey: m.timerKey + 1 }));
    };

    const handleTimerEnd = () => {
        setModal((m) => {
            // If we're already in steal phase (10s steal timer ended), expire
            if (m.phase === "steal") {
                return { ...m, phase: "expired" };
            }
            // Main timer ended — if steal was reserved by button click, enter steal phase
            if (m.stealActive) {
                return {
                    ...m,
                    phase: "steal",
                    timerKey: m.timerKey + 1,
                    timerDuration: 10,
                };
            }
            // No steal reserved, just expire
            return { ...m, phase: "expired" };
        });
        markUsed(false);
    };

    // ── Power-ups ────────────────────────────────────────────────
    const handleSteal = () => {
        // Steal is used by the OTHER team (the one not currently answering)
        setPowerUps((prev) => ({
            ...prev,
            [otherTeamKey]: { ...prev[otherTeamKey], steal: false },
        }));
        // Immediately transition to steal phase with 10s timer
        setModal((m) => ({
            ...m,
            stealActive: true,
            stealUsedBy: otherTeam,

            powerUpUsed: true,
        }));
    };

    const handleExtraTime = () => {
        setExtraTime((prev) => prev + 30);
        setPowerUps((prev) => ({
            ...prev,
            [activeTeamKey]: { ...prev[activeTeamKey], extraTime: false },
        }));
        setModal((m) => ({
            ...m,
            phase: "timer",
            powerUpUsed: true,
        }));
    };

    const handleChoices = () => {
        setPowerUps((prev) => ({
            ...prev,
            [activeTeamKey]: { ...prev[activeTeamKey], choices: false },
        }));
        setModal((m) => ({ ...m, showChoices: true, powerUpUsed: true, timerKey: m.timerKey + 1, }));
    };

    // ── Award points ─────────────────────────────────────────────
    const handleCorrect = () => {
        const scoringTeam = modal.phase === "steal" ? otherTeamKey : activeTeamKey;
        setScores((prev) => {
            const updated = {
                ...prev,
                [scoringTeam]: prev[scoringTeam] + modal.points,
            };
            checkGameEndWithScores(updated);
            return updated;
        });
        markUsed(true);
        setExtraTime(0);
        closeModal();
    };

    const handleWrong = () => {
        markUsed(false);
        // Wrong on steal = no points; wrong on normal = no points, just close
        checkGameEndWithScores(scores);
        setExtraTime(0);
        closeModal();
    };

    const checkGameEndWithScores = (currentScores) => {
        // Game ends when all questions are used (including current)
        const totalQ = data?.length || 0;
        if (Object.keys(usedIds).length + 1 >= totalQ) {
            const { teamA, teamB } = currentScores;
            if (teamA === teamB) setGameResult("انتهت اللعبة بالتعادل!");
            else {
                const winner = teamA > teamB ? "الفريق 1" : "الفريق 2";
                setGameResult(`انتهت اللعبة! الفائز هو: ${winner}`);
            }
        }
    };

    // ── Which teams can use which power-ups right now ────────────
    // Once any powerup is used during a question, hide all powerup buttons
    const canSteal = () => {
        if (modal?.powerUpUsed) return false;
        if (modal?.phase !== "timer") return false;
        if (modal?.stealActive) return false; // only one steal per question
        // Steal is available to the OTHER team (not the one who picked)
        return powerUps[otherTeamKey].steal;
    };

    const canExtraTime = () => {
        if (modal?.powerUpUsed) return false;
        if (modal?.phase !== "timer") return false;
        return powerUps[activeTeamKey].extraTime;
    };

    const canChoices = () => {
        if (!modal) return false;
        if (modal?.powerUpUsed) return false;
        return powerUps[activeTeamKey].choices && !modal.showChoices;
    };

    // ── Render ───────────────────────────────────────────────────
    if (isPending)
        return (
            <div className="risk-container" dir="rtl">
                جاري التحميل...
            </div>
        );
    if (isError)
        return (
            <div className="risk-container" dir="rtl">
                حدث خطأ في تحميل البيانات
            </div>
        );
    if (gameResult)
        return (
            <GameResult
                gameResult={gameResult}
                scores={scores}
                handleNewGame={handleNewGame}
            />
        );

    const categoryNames = Object.keys(categories);

    return (
        <div className="risk-container" dir="rtl">
            {/* ── Header ── */}
            <div className="risk-header">
                <ScoreBoard
                    isTurns={true}
                    selectedTeam={activeTeam}
                    round={Object.keys(usedIds).length + 1}
                    scores={scores}
                    totalRounds={data?.length || 16}
                />
                <div className="risk-turn-info">
                    <span
                        className={`active-badge ${activeTeam === 1 ? "team-a-badge" : "team-b-badge"}`}>
                        دور {activeTeam === 1 ? "الفريق 1" : "الفريق 2"}
                    </span>
                    <div className="powerup-status">
                        <span className="pu-label">
                            مميزات الفريق {activeTeam}:
                        </span>
                        <span
                            className={`pu-tag ${powerUps[activeTeamKey].steal ? "available" : "used"}`}>
                            🎯 سرقة
                        </span>
                        <span
                            className={`pu-tag ${powerUps[activeTeamKey].extraTime ? "available" : "used"}`}>
                            ⏱ وقت
                        </span>
                        <span
                            className={`pu-tag ${powerUps[activeTeamKey].choices ? "available" : "used"}`}>
                            💡 خيارات
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Board (desktop: grid by difficulty rows, mobile: stacked by category) ── */}
            {/* Desktop layout */}
            <div className="risk-board risk-board-desktop">
                {/* Category headers */}
                <div className="risk-categories-row">
                    {categoryNames.map((cat) => (
                        <div key={cat} className="risk-category-header">
                            {cat}
                        </div>
                    ))}
                </div>

                {/* Question cells — rows by difficulty */}
                {DIFFICULTY_ORDER.map((diff) => (
                    <div key={diff} className="risk-row">
                        {categoryNames.map((cat) => {
                            const q = categories[cat]?.find(
                                (q) => q.difficulty === diff,
                            );
                            if (!q)
                                return (
                                    <div
                                        key={cat}
                                        className="risk-cell empty"
                                    />
                                );
                            const isUsed = usedIds[q.id] !== undefined;
                            const usedBy = usedIds[q.id];
                            const pts = diff;
                            return (
                                <button
                                    key={q.id}
                                    className={`risk-cell ${isUsed ? "used" : "available"} ${usedBy === 1 ? "team-a" : ""} ${usedBy === 2 ? "team-b" : ""} `}
                                    onClick={() => !isUsed && openQuestion(q)}
                                    disabled={isUsed}>
                                    {isUsed ? (
                                        <span className={`cell-used-icon`}>
                                            ✓
                                        </span>
                                    ) : (
                                        <>
                                            <span className="cell-points">
                                                {pts}
                                            </span>

                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Mobile layout — each category stacked with its questions */}
            <div className="risk-board risk-board-mobile">
                {categoryNames.map((cat) => (
                    <div key={cat} className="risk-category-block">
                        <div className="risk-category-header">{cat}</div>
                        <div className="risk-category-questions">
                            {DIFFICULTY_ORDER.map((diff) => {
                                const q = categories[cat]?.find(
                                    (q) => q.difficulty === diff,
                                );
                                if (!q) return null;
                                const isUsed = usedIds[q.id] !== undefined;
                                const usedBy = usedIds[q.id];

                                const pts = diff;
                                return (
                                    <button
                                        key={q.id}
                                        className={`risk-cell ${isUsed ? "used" : "available"} ${usedBy === 1 ? "team-a" : ""} ${usedBy === 2 ? "team-b" : ""}`}
                                        onClick={() => !isUsed && openQuestion(q)}
                                        disabled={isUsed}>
                                        {isUsed ? (
                                            <span className={`cell-used-icon `}>
                                                ✓
                                            </span>
                                        ) : (
                                            <>
                                                <span className="cell-points">
                                                    {pts}
                                                </span>
                                                <span className="cell-difficulty">
                                                    {DIFFICULTY_LABELS[diff]}
                                                </span>

                                            </>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Modal ── */}
            {modal && (
                <div
                    className="risk-overlay"
                    onClick={(e) => e.target === e.currentTarget && null}>
                    <div className="risk-modal" dir="rtl">
                        {/* Modal Header */}
                        <div className="modal-header">
                            <span
                                className={`modal-points-badge ${modal.isDouble ? "double" : ""}`}>
                                {modal.points} نقطة{" "}
                                {modal.isDouble ? "⚡×2" : ""}
                            </span>
                            {modal.phase === "steal" && (
                                <span className="steal-active-badge">
                                    🎯 دور{" "}
                                    {otherTeam === 1 ? "الفريق 1" : "الفريق 2"}{" "}
                                    — سرقة!
                                </span>
                            )}
                            {modal.phase === "expired" && (
                                <span className="expired-badge">
                                    ⏰ انتهى الوقت
                                </span>
                            )}
                        </div>

                        {/* Question */}
                        <p className="modal-question">{modal.question}</p>

                        {/* Choices */}
                        {modal.showChoices && (
                            <div className="modal-choices">
                                {shuffledChoices.map((c, i) => (
                                    <div key={i} className="modal-choice">
                                        {c}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Answer reveal */}
                        {modal.showAnswer ? (
                            <div className="modal-answer">
                                <span className="answer-label">الإجابة:</span>
                                <span className="answer-text">
                                    {modal.answer}
                                </span>
                            </div>
                        ) : (
                            <button
                                className="btn-show-answer"
                                onClick={() =>
                                    setModal((m) => ({
                                        ...m,
                                        showAnswer: true,
                                    }))
                                }>
                                عرض الإجابة
                            </button>
                        )}

                        {/* Timer */}
                        {modal.phase !== "idle" &&
                            modal.phase !== "expired" && (
                                <div className="modal-timer">
                                    <Timer
                                        key={modal.timerKey}
                                        time={modal.timerDuration}
                                        currentPlayer={modal.question}
                                        reset={modal.timerKey}
                                        onEnd={handleTimerEnd}
                                        addedTime={extraTime}
                                    />
                                </div>
                            )}

                        {/* Action Row */}
                        <div className="modal-actions">
                            {/* Start timer */}
                            {modal.phase === "idle" && (
                                <button
                                    className="btn-modal btn-start-timer"
                                    onClick={handleStartTimer}>
                                    ⏱ ابدأ المؤقت
                                </button>
                            )}

                            {/* Power-ups row */}
                            <div className="powerup-row">
                                {canSteal() && (
                                    <button
                                        className="btn-modal btn-steal"
                                        onClick={handleSteal}>
                                        🎯 سرقة
                                    </button>
                                )}
                                {canExtraTime() && (
                                    <button
                                        className="btn-modal btn-extra"
                                        onClick={handleExtraTime}>
                                        ⏱ وقت إضافي
                                    </button>
                                )}
                                {canChoices() && (
                                    <button
                                        className="btn-modal btn-choices"
                                        onClick={handleChoices}>
                                        💡 خيارات
                                    </button>
                                )}
                            </div>

                            {/* Correct / Wrong */}
                            {modal.phase !== "idle" && (
                                <div className="answer-buttons">
                                    <button
                                        className="btn-modal btn-correct"
                                        onClick={handleCorrect}>
                                        ✓ صح
                                    </button>
                                    <button
                                        className="btn-modal btn-wrong"
                                        onClick={handleWrong}>
                                        ✗ خطأ
                                    </button>
                                </div>
                            )}

                            {/* Close after expiry */}
                            {modal.phase === "expired" && (
                                <button
                                    className="btn-modal btn-close-expired"
                                    onClick={closeModal}>
                                    اغلاق النافذة
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
