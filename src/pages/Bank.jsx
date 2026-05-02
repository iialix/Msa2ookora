import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBank } from "../util/http";
import Timer from "../components/Timer";
import ScoreBoard from "../components/ScoreBoard";
import GameResult from "../components/GameResult";
import "./Bank.css";

const QUESTIONS_PER_ROUND = 12;
const ROUNDS_PER_TEAM = 3;
const TOTAL_ROUNDS = ROUNDS_PER_TEAM * 2;

function streakToPoints(streak) {
    if (streak <= 0) return 0;
    if (streak === 1) return 1;
    return Math.pow(2, streak); // 2→4, 3→8, 4→16, 5→32 ...
}

export default function Bank() {
    const [round, setRound] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [streak, setStreak] = useState(0); // consecutive correct answers
    const [counter, setCounter] = useState(0); // current unbanked points
    const [scores, setScores] = useState({ teamA: 0, teamB: 0 });
    const [gameResult, setGameResult] = useState(null);
    const [timerKey, setTimerKey] = useState(0); // force Timer remount to reset
    const [roundSummary, setRoundSummary] = useState(null);
    const [roundEnded, setRoundEnded] = useState(false); // timer ran out — waiting for manual end

    const { data, isPending, isError } = useQuery({
        queryKey: ["bank"],
        queryFn: fetchBank,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    const handleNewGame = () => window.location.reload();

    const activeTeam = round % 2 === 0 ? "teamA" : "teamB";
    const activeTeamLabel = activeTeam === "teamA" ? "الفريق 1" : "الفريق 2";
    const teamRound = Math.floor(round / 2) + 1; // which of the 3 rounds for this team

    // Slice the 12 questions for this round from fetched data
    const roundQuestions = data
        ? data.slice(
            round * QUESTIONS_PER_ROUND,
            (round + 1) * QUESTIONS_PER_ROUND,
        )
        : [];
    const currentQuestion = roundQuestions[questionIndex] || null;

    const isLastQuestion = questionIndex === QUESTIONS_PER_ROUND - 1;

    const handleStartTimer = () => {
        setTimerKey((k) => k + 1);
        setTimerActive(true);
    };

    const handleTimerEnd = useCallback(() => {
        setRoundEnded(true);
    }, []);

    const handleCorrect = () => {
        const newStreak = streak + 1;
        const newCounter = streakToPoints(newStreak);
        setStreak(newStreak);
        setCounter(newCounter);
        advanceQuestion();
    };

    const handleWrong = () => {
        setStreak(0);
        setCounter(0);
        advanceQuestion();
    };

    const handleBank = () => {
        const newScores = { ...scores };
        newScores[activeTeam] = scores[activeTeam] + counter;
        setScores(newScores);
        setStreak(0);
        setCounter(0);
        // round continues — don't advance question
    };

    const advanceQuestion = () => {
        const nextIndex = questionIndex + 1;
        if (nextIndex >= QUESTIONS_PER_ROUND) {
            // Last question answered — show "انهاء الجولة" button, don't auto-end
            // (round ends via timer expiry OR manual button on last question)
            setQuestionIndex(nextIndex); // push past last so currentQuestion becomes null
        } else {
            setQuestionIndex(nextIndex);
        }
    };

    const endRound = () => {
        const nextRound = round + 1;
        if (nextRound >= TOTAL_ROUNDS) {
            // Game over
            const { teamA, teamB } = scores;
            if (teamA === teamB) setGameResult("انتهت اللعبة بالتعادل!");
            else {
                const winner = teamA > teamB ? "الفريق 1" : "الفريق 2";
                setGameResult(`انتهت اللعبة! الفائز هو: ${winner}`);
            }
        } else {
            setRoundSummary({
                finishedTeam: activeTeamLabel,
                finishedTeamRound: teamRound,
                nextTeam: nextRound % 2 === 0 ? "الفريق 1" : "الفريق 2",
                nextTeamRound: Math.floor(nextRound / 2) + 1,
                scores,
            });
        }
    };

    const handleNextRound = () => {
        const nextRound = round + 1;
        setRound(nextRound);
        setQuestionIndex(0);
        setStreak(0);
        setCounter(0);
        setTimerKey((k) => k + 1);
        setRoundSummary(null);
        setRoundEnded(false);
    };

    // ── Render states ──────────────────────────────────────────────

    if (isPending)
        return (
            <div className="bank-game-container" dir="rtl">
                جاري التحميل...
            </div>
        );
    if (isError)
        return (
            <div className="bank-game-container" dir="rtl">
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

    // Between-round summary screen
    if (roundSummary) {
        return (
            <div className="bank-game-container bank-summary" dir="rtl">
                <div className="summary-card">
                    <div className="summary-icon">🏦</div>
                    <h2>انتهى دور {roundSummary.finishedTeam}</h2>
                    <div className="summary-scores">
                        <div className="summary-score team-a-score">
                            <span>الفريق 1</span>
                            <strong>{roundSummary.scores.teamA}</strong>
                        </div>
                        <div className="summary-divider">vs</div>
                        <div className="summary-score team-b-score">
                            <span>الفريق 2</span>
                            <strong>{roundSummary.scores.teamB}</strong>
                        </div>
                    </div>
                    <p className="summary-next">
                        الدور القادم:{" "}
                        <span
                            className={
                                roundSummary.nextTeam === "الفريق 1"
                                    ? "team-a-text"
                                    : "team-b-text"
                            }>
                            {roundSummary.nextTeam}
                        </span>{" "}
                        — جولة {roundSummary.nextTeamRound}
                    </p>
                    <button
                        className="btn-start-round"
                        onClick={handleNextRound}>
                        ابدأ الدور
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bank-game-container" dir="rtl">
            {/* ── Header ── */}
            <div className="bank-header">
                <ScoreBoard
                    isTurns={true}
                    selectedTeam={activeTeam === "teamA" ? 1 : 2}
                    round={round + 1}
                    scores={scores}
                    totalRounds={TOTAL_ROUNDS}
                />
                <div className="round-info">
                    <span
                        className={`active-badge ${activeTeam === "teamA" ? "team-a-badge" : "team-b-badge"}`}>
                        {activeTeamLabel} — جولة {teamRound} / {ROUNDS_PER_TEAM}
                    </span>
                    <span className="question-progress">
                        سؤال {questionIndex + 1} / {QUESTIONS_PER_ROUND}
                    </span>
                </div>
            </div>

            {/* ── Counter + Bank ── */}
            <div className="bank-counter-section">
                <div className="counter-display">
                    <span className="counter-label">النقاط المعلقة</span>
                    <span className="counter-value">{counter}</span>
                </div>
                <button
                    className="btn-bank"
                    onClick={handleBank}
                    disabled={counter === 0 || roundEnded}>
                    🏦 بنك!
                </button>
            </div>

            {/* ── Question Card ── */}
            <div className="bank-question-section">
                {currentQuestion ? (
                    <div
                        className="bank-question-card"
                        key={currentQuestion.id}>
                        <p className="bank-question-text">
                            {currentQuestion.question}
                        </p>
                        <div className="bank-answer">
                            <span className="answer-label">الإجابة:</span>
                            <span className="answer-text">
                                {currentQuestion.answer}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="bank-question-card">
                        <p style={{ color: "rgba(255,255,255,0.4)" }}>
                            لا يوجد سؤال
                        </p>
                    </div>
                )}
            </div>

            {/* ── Action Buttons ── */}
            <div className="bank-action-section">
                {roundEnded || questionIndex >= QUESTIONS_PER_ROUND ? (
                    <button className="btn-end-round" onClick={endRound}>
                        انهاء الجولة
                    </button>
                ) : (
                    <div className="answer-buttons">
                        <button
                            className="btn-correct"
                            onClick={handleCorrect}
                            disabled={!currentQuestion}>
                            ✓ صح
                        </button>
                        <button
                            className="btn-wrong"
                            onClick={handleWrong}
                            disabled={!currentQuestion}>
                            ✗ خطأ
                        </button>
                    </div>
                )}
            </div>

            {/* ── Timer ── */}
            <div className="bank-timer-section">
                <Timer
                    time={120}
                    currentPlayer={true}
                    reset={timerKey}
                    onEnd={handleTimerEnd}
                />
            </div>
        </div>
    );
}
