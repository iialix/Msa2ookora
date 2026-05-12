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

export default function TicTacToe({ override }) {
    const [round, setRound] = useState(1);
    const [roundWins, setRoundWins] = useState({ p1: 0, p2: 0 });
    const [roundState, setRoundState] = useState(initRoundState());
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

    return (
        <div className="xo-container" dir="rtl">
            {round !== 3 && (
                <EarlyWin
                    earlyWin={earlyWin}
                    scores={{ teamA: roundWins.p1, teamB: roundWins.p2 }}
                    handleContinue={handleContinue}
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
        </div>
    );
}
