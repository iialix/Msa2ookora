import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import "./AnaMeen.css";
import { fetchAnaMeen, fetchAllPlayers } from "../util/http";
import LoadingIndicator from "../components/LoadingIndicator";

import Timer from "../components/Timer";
import ScoreBoard from "../components/ScoreBoard";
import EarlyWin from "../components/EarlyWin";
import GameResult from "../components/GameResult";
import TeamNameModal from "../components/TeamNameModal";
import { useTeam } from "../context/TeamContext";

const PENALTY_SECONDS = 60;
const TOTAL_ROUNDS = 3;
function Autocomplete({ data, setAnswerText }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef(null);

    const suggestions = query.trim()
        ? data.filter((item) =>
              item.name.toLowerCase().includes(query.toLowerCase()),
          )
        : [];

    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    function highlight(text, query) {
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return text;
        return (
            <>
                {text.slice(0, idx)}
                <mark className="highlight">
                    {text.slice(idx, idx + query.length)}
                </mark>
                {text.slice(idx + query.length)}
            </>
        );
    }

    function handleSelect(item) {
        setQuery(item.name);
        setAnswerText(item.name);
        setOpen(false);
        setActiveIndex(-1);
    }

    function handleKeyDown(e) {
        if (!open || !suggestions.length) return;
        if (e.key === "ArrowDown")
            setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        if (e.key === "ArrowUp") setActiveIndex((i) => Math.max(i - 1, 0));
        if (e.key === "Enter" && activeIndex >= 0)
            handleSelect(suggestions[activeIndex]);
        if (e.key === "Escape") setOpen(false);
    }

    return (
        <div
            ref={wrapperRef}
            style={{ position: "relative", marginTop: 16 }}
            dir="ltr">
            <input
                className="answer-input"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setAnswerText(e.target.value);
                    setOpen(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => query.trim() && setOpen(true)}
                placeholder="اكتب الإجابة هنا..."
                autoComplete="off"
                dir="ltr"
            />

            {open && suggestions.length > 0 && (
                <ul className="autocomplete-dropdown">
                    {suggestions.map((item, i) => (
                        <li
                            key={i}
                            onMouseDown={() => handleSelect(item)}
                            onMouseEnter={() => setActiveIndex(i)}
                            className={i === activeIndex ? "active" : ""}>
                            {highlight(item.name, query)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function AnaMeen() {
    const { teamA, teamB, isTournament, reportGameResult } = useTeam();
    const TEAMS = { A: teamA, B: teamB };

    const [roundIndex, setRoundIndex] = useState(0);
    const [clueIndex, setClueIndex] = useState(0); // 0–4
    const [scores, setScores] = useState({ teamA: 0, teamB: 0 });
    const [showAnswer, setShowAnswer] = useState(false);
    const [roundOver, setRoundOver] = useState(false);
    const [gameResult, setGameResult] = useState(null);
    const [isRevealing, setIsRevealing] = useState(false);

    // Answer modal
    const [showModal, setShowModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [answerText, setAnswerText] = useState("");
    const [modalFeedback, setModalFeedback] = useState(null); // "correct" | "wrong"
    const [reset, setReset] = useState(1);
    const [earlyWin, setEarlyWin] = useState(false);

    const [wrongOnClue, setWrongOnClue] = useState({ teamA: -1, teamB: -1 });

    const [penalties, setPenalties] = useState({ teamA: 0, teamB: 0 });

    const { data, isPending, isError } = useQuery({
        queryKey: ["anaMeen"],
        queryFn: fetchAnaMeen,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });
    const {
        data: players,
        isPending: isPendingPlayers,
        isError: isErrorPlayers,
    } = useQuery({
        queryKey: ["players"],
        queryFn: fetchAllPlayers,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    // Penalty countdown
    useEffect(() => {
        if (penalties.teamA <= 0 && penalties.teamB <= 0) return;
        const interval = setInterval(() => {
            setPenalties((prev) => ({
                teamA: prev.teamA > 0 ? prev.teamA - 1 : 0,
                teamB: prev.teamB > 0 ? prev.teamB - 1 : 0,
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, [penalties.teamA > 0, penalties.teamB > 0]);

    if (isPending)
        return (
            <div className="game-container loading">
                <LoadingIndicator />
            </div>
        );
    if (isError)
        return (
            <div className="game-container" dir="rtl">
                حدث خطأ في تحميل البيانات
            </div>
        );

    const questions = data?.slice(0, TOTAL_ROUNDS) || [];
    const current = questions[roundIndex];

    const getClues = (q) => [q.clue1, q.clue2, q.clue3, q.clue4, q.clue5];
    const clues = current ? getClues(current) : [];

    function isTeamDisabled(teamKey) {
        const lastWrong = wrongOnClue[teamKey];
        if (lastWrong === -1) return false;

        if (penalties[teamKey] === 0 && clueIndex === 4) {
            return false;
        }

        return clueIndex === lastWrong || clueIndex === lastWrong + 1;
    }

    function shouldShowPenalty(teamKey) {
        const hasTimePenalty = penalties[teamKey] > 0;
        return hasTimePenalty;
    }

    const bothDisabled = isTeamDisabled("teamA") && isTeamDisabled("teamB");

    function openModal() {
        setSelectedTeam(null);
        setAnswerText("");
        setModalFeedback(null);
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setModalFeedback(null);
    }

    function submitAnswer() {
        if (!selectedTeam || !answerText.trim()) return;
        const key = selectedTeam === "A" ? "teamA" : "teamB";
        const otherKey = selectedTeam === "A" ? "teamB" : "teamA";

        const correct =
            answerText.trim().toLowerCase() ===
            current.name.trim().toLowerCase();

        if (correct) {
            setScores((prev) => {
                const newScore = prev[key] + 1;

                if (newScore === 2 && !earlyWin) {
                    setEarlyWin(selectedTeam === "A" ? TEAMS.A : TEAMS.B);
                }

                return { ...prev, [key]: newScore };
            });
            setModalFeedback("correct");
            setRoundOver(true);
            setShowAnswer(true);

            setTimeout(() => setShowModal(false), 1200);
        } else {
            setModalFeedback("wrong");

            setWrongOnClue((prev) => ({ ...prev, [key]: clueIndex }));

            setPenalties((prev) => {
                const newPenalties = { ...prev };
                if (newPenalties[otherKey] > 0) {
                    newPenalties[otherKey] = 0;
                }
                if (clueIndex === 4) {
                    newPenalties[key] = PENALTY_SECONDS;
                }
                return newPenalties;
            });

            setTimeout(() => {
                setModalFeedback(null);
                setSelectedTeam(null);
            }, 1000);
        }
    }
    function handleNextClue() {
        setReset(Math.random() + 1);

        setWrongOnClue((prev) => {
            if (
                prev.teamA !== -1 &&
                prev.teamA === prev.teamB &&
                prev.teamA === clueIndex
            ) {
                return { teamA: -1, teamB: -1 };
            }
            return prev;
        });

        if (clueIndex < 4) {
            setClueIndex((i) => i + 1);
        }
    }

    const handleNewGame = () => {
        window.location.reload();
    };

    function handleRevealAnswer() {
        setIsRevealing(true);

        const startFrom = clueIndex + 1;
        const remaining = 4 - clueIndex;

        for (let i = 0; i < remaining; i++) {
            setTimeout(() => {
                setClueIndex(startFrom + i);
            }, i * 800);
        }

        setTimeout(
            () => {
                setShowAnswer(true);
                setRoundOver(true);
                setIsRevealing(false);
            },
            remaining * 800 + 400,
        );
    }

    function handleNextRound() {
        const nextIndex = roundIndex + 1;
        if (nextIndex >= TOTAL_ROUNDS) {
            const { teamA: tA, teamB: tB } = scores;
            if (tA === tB) {
                setGameResult("انتهت اللعبة بالتعادل!");
                if (isTournament) reportGameResult("draw");
            } else {
                setGameResult(
                    `انتهت اللعبة! الفائز هو: ${tA > tB ? TEAMS.A : TEAMS.B}`,
                );
                if (isTournament) reportGameResult(tA > tB ? "teamA" : "teamB");
            }
        } else {
            setRoundIndex(nextIndex);
            setClueIndex(0);
            setShowAnswer(false);
            setRoundOver(false);
            setWrongOnClue({ teamA: -1, teamB: -1 });
            setPenalties({ teamA: 0, teamB: 0 });
        }
    }

    const handleContinue = () => {
        setEarlyWin(null);
        handleNextRound();
    };

    // ── Game Over Screen ──────────────────────────────────────────────────────
    if (gameResult) {
        return (
            <GameResult
                gameResult={gameResult}
                scores={scores}
                handleNewGame={handleNewGame}></GameResult>
        );
    }

    // ── Main Game ─────────────────────────────────────────────────────────────
    return (
        <TeamNameModal>
            <div className="ana-meen-game-container" dir="rtl">
                <EarlyWin
                    earlyWin={earlyWin}
                    scores={scores}
                    handleContinue={handleContinue}
                    handleNewGame={handleNewGame}></EarlyWin>
                {/* ── Answer Modal ── */}
                {showModal && (
                    <div className="popup-overlay">
                        <div className="popup-box">
                            <h2>من هو؟</h2>
                            <p>اختر الفريق وأدخل الإجابة</p>

                            <div className="team-buttons">
                                {["A", "B"].map((t) => {
                                    const key = t === "A" ? "teamA" : "teamB";
                                    const disabled = isTeamDisabled(key);
                                    const showPenalty = shouldShowPenalty(key);
                                    return (
                                        <button
                                            key={t}
                                            className={`btn-team ${t === "A" ? "a" : "b"} ${selectedTeam === t ? "selected" : ""} ${disabled ? "disabled-penalty" : ""}`}
                                            onClick={() =>
                                                !disabled && setSelectedTeam(t)
                                            }
                                            disabled={disabled}>
                                            {TEAMS[t]}
                                            {showPenalty && (
                                                <span className="penalty-timer">
                                                    {" "}
                                                    ({penalties[key]}ث)
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <Autocomplete
                                key={showModal}
                                data={players || []}
                                setAnswerText={setAnswerText}
                            />

                            {modalFeedback === "correct" && (
                                <div className="feedback correct">
                                    ✅ إجابة صحيحة!
                                </div>
                            )}
                            {modalFeedback === "wrong" && (
                                <div className="feedback wrong">
                                    ❌ إجابة خاطئة!
                                </div>
                            )}

                            <div
                                className="popup-buttons"
                                style={{ marginTop: 16 }}>
                                <button
                                    className="btn-primary"
                                    onClick={submitAnswer}
                                    disabled={!selectedTeam || !answerText.trim()}>
                                    تأكيد الإجابة
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={closeModal}>
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Header ── */}
                <div className="game-header">
                    <ScoreBoard
                        isTurns={false}
                        selectedTeam={null}
                        round={roundIndex + 1}
                        scores={scores}
                        totalRounds={3}></ScoreBoard>
                </div>

                {/* ── Clues Section ── */}
                <div className="clues-section">
                    <h3 className="clues-title">الأدلة</h3>
                    <div className="clues-list">
                        {clues.slice(0, clueIndex + 1).map((clue, i) => (
                            <div key={i} className="clue-item">
                                <span className="clue-number">{i + 1}</span>
                                <span className="clue-text">{clue}</span>
                            </div>
                        ))}
                    </div>

                    {showAnswer && (
                        <div className="answer-reveal">
                            <span className="answer-label">الإجابة:</span>
                            <span className="answer-name">{current.name}</span>
                        </div>
                    )}
                </div>

                {/* ── Action Section ── */}
                <div className="action-section">
                    {/* Timer */}
                    {!roundOver && !isRevealing && (
                        <div className="timer-section">
                            <Timer
                                time={60}
                                currentPlayer={roundIndex + 1}
                                reset={reset}></Timer>
                        </div>
                    )}

                    <div className="action-divider" />

                    {/* Next Clue */}
                    {!roundOver && clueIndex < 4 && (
                        <button
                            className="btn-primary"
                            onClick={handleNextClue}
                            disabled={isRevealing}>
                            الدليل التالي ({clueIndex + 1}/5)
                        </button>
                    )}

                    {/* Answer Button */}
                    {!roundOver && !bothDisabled && (
                        <button
                            className="btn-team a full-width"
                            onClick={openModal}
                            disabled={isRevealing}>
                            الإجابة
                        </button>
                    )}

                    {/* Reveal Answer */}
                    {!roundOver && (
                        <button
                            className="btn-secondary"
                            onClick={handleRevealAnswer}
                            disabled={isRevealing}>
                            {isRevealing ? "جاري الكشف..." : "إظهار الإجابة"}
                        </button>
                    )}

                    {/* Next Round */}
                    {roundOver && (
                        <button className="btn-primary" onClick={handleNextRound}>
                            {roundIndex + 1 >= TOTAL_ROUNDS
                                ? "عرض النتيجة النهائية"
                                : "الجولة التالية ←"}
                        </button>
                    )}
                </div>
            </div>
        </TeamNameModal>
    );
}
