import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInfinity } from "../util/http";
import GameResult from "../components/GameResult";
import EarlyWin from "../components/EarlyWin";
import "./InfinityXO.css";

const TOTAL_ROUNDS = 3;
const QUESTIONS_PER_ROUND = 15;

const WIN_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

function checkWinner(cells) {
    for (const [a, b, c] of WIN_LINES) {
        if (
            cells[a] &&
            cells[a].player === cells[b]?.player &&
            cells[a].player === cells[c]?.player
        )
            return { winner: cells[a].player, line: [a, b, c] };
    }
    return null;
}

function initRoundState() {
    return {
        cells: Array(9).fill(null),
        activePlayer: 1,
        orderCounter: 0,
        winResult: null,
        pendingRemove: null,
    };
}

export default function InfinityXO() {
    const [round, setRound] = useState(1);
    const [roundWins, setRoundWins] = useState({ p1: 0, p2: 0 });
    // Global question index across all rounds (into the full question bank)
    const [questionIndex, setQuestionIndex] = useState(0);
    // How many questions have been used in the CURRENT round (resets each round)
    const [roundQuestionCount, setRoundQuestionCount] = useState(0);
    const [roundState, setRoundState] = useState(initRoundState());
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [correct, setCorrect] = useState(null);
    const [roundSummary, setRoundSummary] = useState(null);
    const [earlyWin, setEarlyWin] = useState(null);
    const [gameResult, setGameResult] = useState(null);
    const [finalScores, setFinalScores] = useState({ teamA: 0, teamB: 0 });
    const [continued, setContinued] = useState(false);

    const { data, isPending, isError } = useQuery({
        queryKey: ["infinity"],
        queryFn: fetchInfinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    const handleNewGame = () => window.location.reload();
    const shuffleChoices = (q) =>
        [q.answer, ...q.choices].sort(() => Math.random() - 0.5);

    const { cells, activePlayer, orderCounter, winResult, pendingRemove } =
        roundState;

    const handleCellClick = (idx) => {
        if (modal || winResult || gameResult || roundSummary) return;
        if (cells[idx] !== null) return;
        if (!data || questionIndex >= data.length) return;

        const q = data[questionIndex];
        setModal({
            cellIndex: idx,
            question: q.question,
            answer: q.answer,
            shuffledChoices: shuffleChoices(q),
        });
        setSelected(null);
        setAnswered(false);
        setCorrect(null);
    };

    const handleChoiceClick = (choice) => {
        if (answered) return;
        setSelected(choice);
        setAnswered(true);
        const isCorrect = choice === modal.answer;
        setCorrect(isCorrect);

        setTimeout(() => {
            const nextQIndex = questionIndex + 1;
            const nextRoundQCount = roundQuestionCount + 1;

            if (isCorrect) {
                placeSymbol(modal.cellIndex, nextQIndex, nextRoundQCount);
            } else {
                setModal(null);
                setQuestionIndex(nextQIndex);
                setRoundQuestionCount(nextRoundQCount);
                setRoundState((rs) => ({
                    ...rs,
                    activePlayer: rs.activePlayer === 1 ? 2 : 1,
                }));
                // End round if we've used all questions for this round
                if (nextRoundQCount >= QUESTIONS_PER_ROUND) {
                    resolveRoundEnd(null, roundWins, round);
                }
            }
        }, 900);
    };

    const placeSymbol = (cellIndex, nextQIndex, nextRoundQCount) => {
        const newOrder = orderCounter + 1;
        const newCells = [...cells];

        const playerCells = newCells
            .map((c, i) => ({ c, i }))
            .filter(({ c }) => c?.player === activePlayer)
            .sort((a, b) => a.c.order - b.c.order);

        if (playerCells.length >= 3) {
            const removeIndex = playerCells[0].i;
            setRoundState((rs) => ({
                ...rs,
                pendingRemove: removeIndex,
                orderCounter: newOrder,
            }));

            setTimeout(() => {
                const finalCells = [...newCells];
                finalCells[removeIndex] = null;
                finalCells[cellIndex] = {
                    player: activePlayer,
                    order: newOrder,
                };
                const result = checkWinner(finalCells);

                setModal(null);
                setQuestionIndex(nextQIndex);
                setRoundQuestionCount(nextRoundQCount);
                setRoundState((rs) => ({
                    ...rs,
                    cells: finalCells,
                    pendingRemove: null,
                    winResult: result || null,
                    activePlayer: result
                        ? rs.activePlayer
                        : rs.activePlayer === 1
                          ? 2
                          : 1,
                }));

                if (result) {
                    setTimeout(
                        () => resolveRoundEnd(result.winner, roundWins, round),
                        800,
                    );
                } else if (nextRoundQCount >= QUESTIONS_PER_ROUND) {
                    resolveRoundEnd(null, roundWins, round);
                }
            }, 800);
        } else {
            newCells[cellIndex] = { player: activePlayer, order: newOrder };
            const result = checkWinner(newCells);

            setModal(null);
            setQuestionIndex(nextQIndex);
            setRoundQuestionCount(nextRoundQCount);
            setRoundState((rs) => ({
                ...rs,
                cells: newCells,
                orderCounter: newOrder,
                winResult: result || null,
                activePlayer: result
                    ? rs.activePlayer
                    : rs.activePlayer === 1
                      ? 2
                      : 1,
            }));

            if (result) {
                setTimeout(
                    () => resolveRoundEnd(result.winner, roundWins, round),
                    800,
                );
            } else if (nextRoundQCount >= QUESTIONS_PER_ROUND) {
                resolveRoundEnd(null, roundWins, round);
            }
        }
    };

    // currentRound passed explicitly to avoid stale closure
    const resolveRoundEnd = (winner, currentWins, currentRound) => {
        const newWins = { ...currentWins };
        if (winner === 1) newWins.p1 += 1;
        else if (winner === 2) newWins.p2 += 1;
        setRoundWins(newWins);

        // Early win check
        const roundsLeft = TOTAL_ROUNDS - currentRound;
        if (!continued) {
            if (newWins.p1 > newWins.p2 + roundsLeft) {
                setEarlyWin("الفريق 1");
                return;
            }
            if (newWins.p2 > newWins.p1 + roundsLeft) {
                setEarlyWin("الفريق 2");
                return;
            }
        }

        if (currentRound >= TOTAL_ROUNDS) {
            triggerGameEnd(newWins);
            return;
        }

        setRoundSummary({
            roundWinner: winner ? `الفريق ${winner}` : null,
            wins: newWins,
            nextRound: currentRound + 1,
        });
    };

    const triggerGameEnd = (wins) => {
        const scores = { teamA: wins.p1, teamB: wins.p2 };
        setFinalScores(scores);
        if (wins.p1 === wins.p2) {
            setGameResult("انتهت اللعبة بالتعادل!");
        } else {
            const winner = wins.p1 > wins.p2 ? "الفريق 1" : "الفريق 2";
            setGameResult(`انتهت اللعبة! الفائز هو: ${winner}`);
        }
    };

    const handleNextRound = () => {
        setRound((r) => r + 1);
        setRoundState(initRoundState());
        setRoundQuestionCount(0); // Reset per-round question counter
        setRoundSummary(null);
        setModal(null);
    };

    const handleContinue = () => {
        setContinued(true);
        setEarlyWin(null);
        if (round >= TOTAL_ROUNDS) {
            triggerGameEnd(roundWins);
        } else {
            setRoundSummary({
                roundWinner: null,
                wins: roundWins,
                nextRound: round + 1,
            });
        }
    };

    if (isPending)
        return (
            <div className="xo-container" dir="rtl">
                جاري التحميل...
            </div>
        );
    if (isError)
        return (
            <div className="xo-container" dir="rtl">
                حدث خطأ في تحميل البيانات
            </div>
        );

    if (gameResult)
        return (
            <GameResult
                gameResult={gameResult}
                scores={finalScores}
                handleNewGame={handleNewGame}
            />
        );

    if (roundSummary) {
        return (
            <div className="xo-container xo-summary" dir="rtl">
                <div className="summary-card">
                    <div className="summary-icon">
                        {roundSummary.roundWinner ? "🏆" : "🤝"}
                    </div>
                    <h2>
                        {roundSummary.roundWinner
                            ? `فاز ${roundSummary.roundWinner} بالجولة ${round}!`
                            : `الجولة ${round} — تعادل!`}
                    </h2>
                    <div className="summary-wins">
                        <div className="win-block p1-block">
                            <span>✕ الفريق 1</span>
                            <strong>{roundSummary.wins.p1}</strong>
                            <small>انتصارات</small>
                        </div>
                        <div className="summary-divider">vs</div>
                        <div className="win-block p2-block">
                            <span>○ الفريق 2</span>
                            <strong>{roundSummary.wins.p2}</strong>
                            <small>انتصارات</small>
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

    const winLine = winResult?.line || [];

    return (
        <div className="xo-container" dir="rtl">
            {round !== 3 && (
                <EarlyWin
                    earlyWin={earlyWin}
                    scores={{ teamA: roundWins.p1, teamB: roundWins.p2 }}
                    handleContinue={handleContinue}
                    handleNewGame={handleNewGame}
                />
            )}

            {/* ── Header ── */}
            <div className="xo-header">
                <div
                    className={`xo-player-badge ${activePlayer === 1 ? "p1-active" : "p1-idle"}`}>
                    <span className="xo-symbol">✕</span>
                    <span>الفريق 1</span>
                    {activePlayer === 1 && <span className="turn-dot" />}
                </div>
                <div className="xo-round-info">
                    <span className="xo-round-label">
                        جولة {round} / {TOTAL_ROUNDS}
                    </span>
                    <div className="xo-wins-row">
                        <span className="wins-p1">{roundWins.p1} ✕</span>
                        <span className="wins-sep">—</span>
                        <span className="wins-p2">○ {roundWins.p2}</span>
                    </div>
                </div>
                <div
                    className={`xo-player-badge ${activePlayer === 2 ? "p2-active" : "p2-idle"}`}>
                    <span className="xo-symbol">○</span>
                    <span>الفريق 2</span>
                    {activePlayer === 2 && <span className="turn-dot" />}
                </div>
            </div>

            <p className="xo-turn-label">
                دور {activePlayer === 1 ? "الفريق 1 ✕" : "الفريق 2 ○"}
            </p>

            {/* ── Grid ── */}
            <div className="xo-grid">
                {cells.map((cell, idx) => {
                    const isWinCell = winLine.includes(idx);
                    const isFading = pendingRemove === idx;
                    const isEmpty = cell === null;

                    const playerCells = cells
                        .map((c, i) => ({ c, i }))
                        .filter(({ c }) => c?.player === activePlayer)
                        .sort((a, b) => a.c.order - b.c.order);
                    const isOldest =
                        !isEmpty &&
                        cell?.player === activePlayer &&
                        playerCells.length >= 3 &&
                        playerCells[0]?.i === idx &&
                        !modal;

                    return (
                        <button
                            key={idx}
                            className={`xo-cell
                                ${isEmpty ? "empty" : ""}
                                ${cell?.player === 1 ? "p1" : ""}
                                ${cell?.player === 2 ? "p2" : ""}
                                ${isWinCell ? "win-cell" : ""}
                                ${isFading ? "fading" : ""}
                                ${isOldest ? "oldest" : ""}
                            `}
                            onClick={() => handleCellClick(idx)}
                            disabled={!!modal || !!winResult}>
                            {cell?.player === 1 && (
                                <span className="cell-symbol">✕</span>
                            )}
                            {cell?.player === 2 && (
                                <span className="cell-symbol">○</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Shows remaining questions for the CURRENT round only */}
            <p className="xo-questions-left">
                أسئلة متبقية: {QUESTIONS_PER_ROUND - roundQuestionCount}
            </p>

            {/* ── Question Modal ── */}
            {modal && (
                <div className="xo-overlay">
                    <div
                        className={`xo-modal ${activePlayer === 1 ? "modal-p1" : "modal-p2"}`}
                        dir="rtl">
                        <div className="modal-player-tag">
                            {activePlayer === 1 ? "✕ الفريق 1" : "○ الفريق 2"}
                        </div>
                        <p className="xo-modal-question">{modal.question}</p>
                        <div className="xo-choices">
                            {modal.shuffledChoices.map((choice, i) => {
                                let state = "";
                                if (answered && choice === modal.answer)
                                    state = "correct";
                                else if (answered && choice === selected)
                                    state = "wrong";
                                return (
                                    <button
                                        key={i}
                                        className={`xo-choice ${state} ${answered ? "locked" : ""}`}
                                        onClick={() =>
                                            handleChoiceClick(choice)
                                        }
                                        disabled={answered}>
                                        {choice}
                                    </button>
                                );
                            })}
                        </div>
                        {answered && (
                            <p
                                className={`xo-result-msg ${correct ? "correct-msg" : "wrong-msg"}`}>
                                {correct ? "✓ إجابة صحيحة!" : "✗ إجابة خاطئة"}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
