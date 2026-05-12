import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAnaMeen, fetchxo } from "../util/http";
import GameResult from "../components/GameResult";
import EarlyWin from "../components/EarlyWin";
import "./TicTacToe.css";

const formatImageUrl = (url) => url.replace(".", "../../backend");

const TOTAL_ROUNDS = 3;
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

function initRoundState(nextStartingPlayer) {
    return {
        cells: Array(9).fill(null),
        activePlayer: nextStartingPlayer,
        orderCounter: 0,
        winResult: null,
        pendingRemove: null,
    };
}

export default function TicTacToe({ override }) {
    const [round, setRound] = useState(1);
    const [startingPlayer, setStartingPlayer] = useState(1);
    const [roundWins, setRoundWins] = useState({ p1: 0, p2: 0 });
    const [roundState, setRoundState] = useState(
        initRoundState(startingPlayer),
    );
    const [roundSummary, setRoundSummary] = useState(null);
    const [earlyWin, setEarlyWin] = useState(null);
    const [gameResult, setGameResult] = useState(null);
    const [finalScores, setFinalScores] = useState({ teamA: 0, teamB: 0 });
    const [continued, setContinued] = useState(false);

    const { cells, activePlayer, orderCounter, winResult, pendingRemove } =
        roundState;

    const { data, isPending, isError } = useQuery({
        queryKey: ["xo"],
        queryFn: fetchxo,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });
    function checkWinner(cells) {
        for (const [a, b, c] of WIN_LINES) {
            if (
                cells[a] &&
                cells[a].player === cells[b]?.player &&
                cells[a].player === cells[c]?.player
            )
                return { winner: cells[a].player, line: [a, b, c] };
        }

        if (!override) {
            let countx = 0;
            let counto = 0;
            for (let i = 0; i < 9; i++) {
                if (cells[i]?.player === 1) {
                    countx++;
                } else if (cells[i]?.player === 2) {
                    counto++;
                }
            }

            if (countx === 5) {
                return { winner: 1, line: null };
            } else if (counto === 5) {
                return { winner: 2, line: null };
            }
        }
        return null;
    }

    const handleCellClick = (idx) => {
        if (winResult || gameResult || roundSummary) return;
        if (override) {
            if (cells[idx]?.player === activePlayer) return;
        } else {
            if (cells[idx] !== null) return;
        }

        const newOrder = orderCounter + 1;
        const newCells = [...cells];

        const finalCells = [...newCells];
        finalCells[idx] = {
            player: activePlayer,
            order: newOrder,
        };
        const result = checkWinner(finalCells);
        setRoundState((rs) => ({
            ...rs,
            cells: finalCells,
            orderCounter: newOrder,
            winResult: result || null,
            activePlayer: result
                ? rs.activePlayer
                : rs.activePlayer === 1
                  ? 2
                  : 1,
        }));

        if (result) {
            resolveRoundEnd(result.winner, roundWins, round);
        }
    };

    function handleSkip() {
        setRoundState((rs) => ({
            ...rs,
            activePlayer: rs.activePlayer === 1 ? 2 : 1,
        }));
    }

    const handleNewGame = () => window.location.reload();

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

    const handleNextRound = () => {
        const nextStarter = startingPlayer === 1 ? 2 : 1;
        setRound((r) => r + 1);
        setStartingPlayer(nextStarter);
        setRoundState(initRoundState(nextStarter));
        setRoundSummary(null);
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

    const resolveRoundEnd = (winner, currentWins, currentRound) => {
        const newWins = { ...currentWins };
        if (winner === 1) newWins.p1 += 1;
        else if (winner === 2) newWins.p2 += 1;
        setRoundWins(newWins);

        // Early win check
        const roundsLeft = TOTAL_ROUNDS - currentRound;

        if (!continued && currentRound < TOTAL_ROUNDS) {
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
                    return (
                        <button
                            key={idx}
                            className={`xo-cell
                                    ${isEmpty ? "empty" : ""}
                                    ${cell?.player === 1 ? "p1" : ""}
                                    ${cell?.player === 2 ? "p2" : ""}
                                    ${isWinCell ? "win-cell" : ""}
                                `}
                            onClick={() => handleCellClick(idx)}
                            disabled={!!winResult}>
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

            <div className="skip-container">
                <button className="skip-btn" onClick={handleSkip}>
                    skip
                </button>
            </div>
        </div>
    );
}
