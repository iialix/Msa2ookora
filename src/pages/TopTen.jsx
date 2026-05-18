import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTopTen } from "../util/http";
import Timer from "../components/Timer";
import ScoreBoard from "../components/ScoreBoard";
import GameResult from "../components/GameResult";
import EarlyWin from "../components/EarlyWin";
import LoadingIndicator from "../components/LoadingIndicator";
import "./TopTen.css";
import { button } from "framer-motion/client";

const TOTAL_ROUNDS = 3;

// Extract the 10 answers from a question object into an array
function getAnswers(q) {
    return Array.from({ length: 10 }, (_, i) => q[`answer${i + 1}`]);
}

// Partial case-insensitive match — checks if the guess appears anywhere in the answer
function isMatch(guess, answer) {
    const g = guess.trim().toLowerCase();
    const a = answer.toLowerCase();
    return g.length > 0 && a.includes(g);
}

export default function TopTen() {
    const [round, setRound] = useState(0);
    const [activeTeam, setActiveTeam] = useState(1);
    const [scores, setScores] = useState({ teamA: 0, teamB: 0 });
    const [totalWins, setTotalWins] = useState({ teamA: 0, teamB: 0 });
    const [revealed, setRevealed] = useState(Array(10).fill(false));
    const [revealedBy, setRevealedBy] = useState(Array(10).fill(null));
    const [guess, setGuess] = useState("");
    const [wrongFlash, setWrongFlash] = useState(false);
    const [timerKey, setTimerKey] = useState(0);
    const [roundSummary, setRoundSummary] = useState(null);
    const [gameResult, setGameResult] = useState(null);
    const [allRevealed, setAllRevealed] = useState(false);
    const [earlyWin, setEarlyWin] = useState(null);
    const [continued, setContinued] = useState(false);
    const inputRef = useRef(null);

    const { data, isPending, isError } = useQuery({
        queryKey: ["topTen"],
        queryFn: fetchTopTen,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    const handleNewGame = () => window.location.reload();

    const currentQuestion = data?.[round] || null;
    const answers = currentQuestion ? getAnswers(currentQuestion) : [];

    const pointsFor = (i) => i + 1;

    const handleGuessSubmit = (e) => {
        e?.preventDefault();
        if (!guess.trim() || allRevealed) return;

        let matched = false;
        const newRevealed = [...revealed];
        const newRevealedBy = [...revealedBy];
        const newScores = { ...scores };

        for (let i = 0; i < answers.length; i++) {
            if (!newRevealed[i] && isMatch(guess, answers[i])) {
                newRevealed[i] = true;
                newRevealedBy[i] = activeTeam;
                const pts = pointsFor(i);
                const scoringTeam = activeTeam === 1 ? "teamA" : "teamB";
                newScores[scoringTeam] = (newScores[scoringTeam] || 0) + pts;
                matched = true;

                break;
            }
        }

        if (matched) {
            setRevealed(newRevealed);
            setRevealedBy(newRevealedBy);
            setScores(newScores);

            // Early win check
            const remainingPoints = newRevealed.reduce(
                (sum, rev, i) => (rev ? sum : sum + (i + 1)),
                0,
            );
            if (newScores.teamA > newScores.teamB + remainingPoints) {
                setEarlyWin("الفريق 1");
            } else if (newScores.teamB > newScores.teamA + remainingPoints) {
                setEarlyWin("الفريق 2");
            }

            // Check if all answers found
            if (newRevealed.every(Boolean)) {
                endRound(newScores);
            }
        } else {
            // Wrong answer flash
            setWrongFlash(true);
            setTimeout(() => setWrongFlash(false), 600);
        }

        handleSwitchTurns();

        setGuess("");
        inputRef.current?.focus();
    };

    const handleContinue = () => {
        setContinued(true);
        setEarlyWin(null);
    };

    const handleSkip = () => {
        // Switch team, reset timer
        setActiveTeam((t) => (t === 1 ? 2 : 1));
        setTimerKey((k) => k + 1);
        inputRef.current?.focus();
    };

    const handleRevealAll = () => {
        setContinued(true);
        setRevealed(Array(10).fill(true));
        setAllRevealed(true);
    };

    const endRound = (finalScores) => {
        const { teamA, teamB } = finalScores;
        const newWins = { ...totalWins };
        let roundWinner = null;

        if (teamA > teamB) {
            newWins.teamA += 1;
            roundWinner = "الفريق 1";
        } else if (teamB > teamA) {
            newWins.teamB += 1;
            roundWinner = "الفريق 2";
        }

        setTotalWins(newWins);

        const nextRound = round + 1;
        if (nextRound >= TOTAL_ROUNDS) {
            // Game over
            if (newWins.teamA === newWins.teamB) {
                setGameResult("انتهت اللعبة بالتعادل!");
            } else {
                const winner =
                    newWins.teamA > newWins.teamB ? "الفريق 1" : "الفريق 2";
                setGameResult(`انتهت اللعبة! الفائز هو: ${winner}`);
            }
        } else {
            setRoundSummary({
                roundWinner,
                roundScores: finalScores,
                wins: newWins,
                nextRound: nextRound + 1,
            });
        }
    };

    const handleNextRound = () => {
        const nextRound = round + 1;
        setRound(nextRound);
        setActiveTeam(1);
        setScores({ teamA: 0, teamB: 0 });
        setRevealed(Array(10).fill(false));
        setRevealedBy(Array(10).fill(null));
        setGuess("");
        setTimerKey((k) => k + 1);
        setRoundSummary(null);
        setAllRevealed(false);
        setEarlyWin(null);
    };

    function handleSwitchTurns() {
        setActiveTeam((t) => (t === 1 ? 2 : 1));
    }

    // ── Render states ────────────────────────────────────────────

    if (isPending)
        return (
            <div className="game-container loading">
                <LoadingIndicator />
            </div>
        );
    if (isError)
        return (
            <div className="topten-container" dir="rtl">
                حدث خطأ في تحميل البيانات
            </div>
        );

    if (gameResult)
        return (
            <GameResult
                gameResult={gameResult}
                scores={totalWins}
                handleNewGame={handleNewGame}
            />
        );

    if (roundSummary) {
        return (
            <div className="topten-container topten-summary" dir="rtl">
                <div className="summary-card">
                    <div className="summary-icon">🏆</div>
                    <h2>
                        {roundSummary.roundWinner
                            ? `فاز ${roundSummary.roundWinner} بهذه الجولة!`
                            : "تعادل في هذه الجولة!"}
                    </h2>
                    <div className="summary-round-scores">
                        <div className="summary-score team-a-score">
                            <span>الفريق 1</span>
                            <strong>{roundSummary.roundScores.teamA}</strong>
                            <small>{roundSummary.wins.teamA} انتصار</small>
                        </div>
                        <div className="summary-divider">vs</div>
                        <div className="summary-score team-b-score">
                            <span>الفريق 2</span>
                            <strong>{roundSummary.roundScores.teamB}</strong>
                            <small>{roundSummary.wins.teamB} انتصار</small>
                        </div>
                    </div>
                    <p className="summary-next">
                        الجولة القادمة: {roundSummary.nextRound} /{" "}
                        {TOTAL_ROUNDS}
                    </p>
                    <button
                        className="btn-next-round"
                        onClick={handleNextRound}>
                        ابدأ الجولة القادمة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="topten-container" dir="rtl">
            {!continued && (
                <EarlyWin
                    earlyWin={earlyWin}
                    scores={scores}
                    handleContinue={handleContinue}
                    handleNewGame={handleRevealAll}
                />
            )}
            {/* ── Header ── */}
            <div className="topten-header">
                <ScoreBoard
                    isTurns={true}
                    selectedTeam={activeTeam}
                    round={round + 1}
                    scores={scores}
                    totalRounds={TOTAL_ROUNDS}
                />
                <div className="round-meta">
                    <span
                        className={`active-badge ${activeTeam === 1 ? "team-a-badge" : "team-b-badge"}`}>
                        دور {activeTeam === 1 ? "الفريق 1" : "الفريق 2"}
                    </span>
                    <span className="wins-display">
                        انتصارات: الفريق 1 — {totalWins.teamA} | الفريق 2 —{" "}
                        {totalWins.teamB}
                    </span>
                </div>
            </div>

            {/* ── Question ── */}
            <div className="topten-question-section">
                <div className="topten-question-card">
                    <p className="topten-question-text">
                        {currentQuestion?.question}
                    </p>
                </div>

                {/* ── 10 Answer Slots ── */}
                <div className="topten-answers-grid">
                    {answers.map((answer, i) => (
                        <div
                            key={i}
                            className={`answer-slot ${revealed[i] ? "revealed" : "hidden"}
                                ${revealed[i] && revealedBy[i] === 1 ? "by-team-a" : ""}
                                ${revealed[i] && revealedBy[i] === 2 ? "by-team-b" : ""}
                                ${revealed[i] && revealedBy[i] === null ? "revealed-all" : ""}`}>
                            <span className="slot-index">{i + 1}</span>
                            {revealed[i] ? (
                                <span className="slot-answer">{answer}</span>
                            ) : (
                                <span className="slot-placeholder">؟؟؟</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Input ── */}
            <div className="topten-input-section">
                {!allRevealed && (
                    <>
                        <form
                            onSubmit={handleGuessSubmit}
                            className={`guess-form ${wrongFlash ? "wrong-flash" : ""}`}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={guess}
                                onChange={(e) => setGuess(e.target.value)}
                                placeholder="اكتب إجابتك هنا..."
                                className="guess-input"
                                disabled={allRevealed}
                                autoComplete="off"
                                dir="rtl"
                            />
                            <div className="form-buttons">
                                <button
                                    type="button"
                                    className="btn-skip"
                                    onClick={handleSkip}>
                                    Skip
                                </button>
                                <button
                                    type="submit"
                                    className="btn-guess"
                                    disabled={allRevealed || !guess.trim()}>
                                    تأكيد
                                </button>
                            </div>
                        </form>
                        <button
                            className="btn-reveal-all"
                            onClick={handleRevealAll}
                            disabled={allRevealed}>
                            كشف جميع الإجابات
                        </button>
                    </>
                )}
                {allRevealed && (
                    <button
                        className="btn-end-round"
                        onClick={() => endRound(scores)}>
                        إنهاء الجولة
                    </button>
                )}
            </div>

            {/* ── Timer ── */}
            {!allRevealed && (
                <div className="topten-timer-section">
                    <Timer
                        time={20}
                        currentPlayer={currentQuestion}
                        reset={timerKey}
                    />
                </div>
            )}
        </div>
    );
}
