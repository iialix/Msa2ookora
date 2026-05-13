import { useState, useRef, Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchxo } from "../util/http";
import GameResult from "../components/GameResult";
import EarlyWin from "../components/EarlyWin";
import { fetchReplacement } from "../util/http.js";
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

// Arabic labels for player positions
const POSITION_LABELS = {
    st: "مهاجم",
    cf: "مهاجم وسط",
    ss: "مهاجم ثانٍ",
    lw: "جناح أيسر",
    rw: "جناح أيمن",
    cam: "وسط هجومي",
    cm: "وسط",
    cdm: "وسط دفاعي",
    lb: "ظهير أيسر",
    rb: "ظهير أيمن",
    cb: "مدافع",
    gk: "حارس مرمى",
};

/**
 * Normalise a category entry into a stable shape.
 * Handles both:
 *   { id, name, image_url }   → normal club/comp/coach entry
 *   { position: "RW" }        → player-position entry (no image)
 */
function normaliseCategory(cat) {
    if (cat.position) {
        const key = cat.position.toLowerCase();
        return {
            id: `pos-${key}`,
            label: cat.position,
            imageUrl: null,
            isPosition: true,
        };
    }
    return {
        id: String(cat.id),
        label: cat.name,
        imageUrl: cat.image_url ? formatImageUrl(cat.image_url) : null,
        isPosition: false,
    };
}

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
    const [roundState, setRoundState] = useState(initRoundState(1));
    const [roundSummary, setRoundSummary] = useState(null);
    const [earlyWin, setEarlyWin] = useState(null);
    const [gameResult, setGameResult] = useState(null);
    const [finalScores, setFinalScores] = useState({ teamA: 0, teamB: 0 });
    const [continued, setContinued] = useState(false);

    const [roundCategories, setRoundCategories] = useState(null);
    const [tooltip, setTooltip] = useState(null);
    const [swapping, setSwapping] = useState(null); // "col-0" | "row-2" etc.
    const longPressTimer = useRef(null);
    const swapTargetRef = useRef(null);

    const { cells, activePlayer, orderCounter, winResult, pendingRemove } =
        roundState;

    const { data, isPending, isError } = useQuery({
        queryKey: ["xo"],
        queryFn: fetchxo,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    let columns = null;
    let rows = null;

    if (data) {
        const roundData = data[`round${round}`];
        if (roundData) {
            columns = roundData.columns;
            rows = roundData.rows;
        }
    }

    const currentColumns = roundCategories?.columns || columns;
    const currentRows = roundCategories?.rows || rows;

    // Stable unique key for deduplication — works for both shapes
    const getCatId = (cat) => normaliseCategory(cat).id;

    const getAllCategories = () => {
        if (!data) return { columns: [], rows: [] };
        const allCols = Object.values(data).flatMap((r) => r.columns);
        const allRows = Object.values(data).flatMap((r) => r.rows);
        const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
        return {
            columns: shuffle(allCols).slice(0, 3),
            rows: shuffle(allRows).slice(0, 3),
        };
    };

    const handleShuffleAll = () => {
        setRoundCategories(getAllCategories());
        setTooltip(null);
    };

    // Long-press: call the API to get a replacement, then swap it in
    const { refetch, isFetching } = useQuery({
        queryKey: ["swapCategory"],
        queryFn: () => fetchReplacement(swapTargetRef.current.type),
        enabled: false, // never runs automatically
        staleTime: 0, // always re-fetch, never serve cached data
        gcTime: 0, // don't cache between swaps
        retry: false,
    });

    // 3. Call site — same signature as before
    const handleSwapCategory = async (type, idx) => {
        swapTargetRef.current = { type, idx }; // set ref before refetch (sync)
        setSwapping(`${type}-${idx}`);
        setTooltip(null);

        const { data: replacement, error } = await refetch();

        if (error) {
            console.error("Failed to swap category:", error);
        } else {
            setRoundCategories((prev) => {
                const baseCols = prev?.columns || columns;
                const baseRows = prev?.rows || rows;
                return {
                    columns:
                        type === "col"
                            ? baseCols.map((c, i) =>
                                  i === idx ? replacement : c,
                              )
                            : baseCols,
                    rows:
                        type === "row"
                            ? baseRows.map((r, i) =>
                                  i === idx ? replacement : r,
                              )
                            : baseRows,
                };
            });
        }

        setSwapping(null);
    };

    const startLongPress = (type, idx) => {
        longPressTimer.current = setTimeout(() => {
            handleSwapCategory(type, idx);
        }, 600);
    };

    const cancelLongPress = () => clearTimeout(longPressTimer.current);

    const handleCategoryClick = (label, key) => {
        setTooltip((prev) => (prev?.key === key ? null : { label, key }));
    };

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
                if (cells[i]?.player === 1) countx++;
                else if (cells[i]?.player === 2) counto++;
            }
            if (countx === 5) return { winner: 1, line: null };
            if (counto === 5) return { winner: 2, line: null };
        }
        return null;
    }

    const handleCellClick = (idx) => {
        if (winResult || gameResult || roundSummary) return;
        if (tooltip) {
            setTooltip(null);
            return;
        }
        if (override) {
            if (cells[idx]?.player === activePlayer) return;
        } else {
            if (cells[idx] !== null) return;
        }

        const newOrder = orderCounter + 1;
        const finalCells = [...cells];
        finalCells[idx] = { player: activePlayer, order: newOrder };

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

        if (result) resolveRoundEnd(result.winner, roundWins, round);
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
        setRoundCategories(null);
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

    // ── Category button renderer ──
    const CategoryButton = ({ cat, tooltipKey, type, idx }) => {
        const { label, imageUrl, isPosition } = normaliseCategory(cat);
        const isLoading = swapping === `${type}-${idx}`;
        return (
            <div className="category-wrapper">
                <button
                    className={`category${isPosition ? " category-position" : ""}${isLoading ? " category-loading" : ""}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryClick(label, tooltipKey);
                    }}
                    onMouseDown={() => startLongPress(type, idx)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    onTouchStart={() => startLongPress(type, idx)}
                    onTouchEnd={cancelLongPress}
                    disabled={isLoading}
                    title="اضغط لمعرفة الفئة • اضغط مطولاً للتغيير">
                    {isLoading ? (
                        <span className="category-spinner" />
                    ) : isPosition ? (
                        <span className="category-pos-label">{label}</span>
                    ) : (
                        <img src={imageUrl} alt={label} />
                    )}
                </button>
                {tooltip?.key === tooltipKey && (
                    <div className="category-tooltip">{tooltip.label}</div>
                )}
            </div>
        );
    };

    return (
        <div
            className="xo-container"
            dir="rtl"
            onClick={() => tooltip && setTooltip(null)}>
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

            {/* ── Shuffle All Button ── */}
            <button
                className="shuffle-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    handleShuffleAll();
                }}>
                🔀 تغيير جميع الفئات
            </button>

            {/* ── Grid ── */}
            {currentColumns && currentRows && (
                <div className="xo-grid">
                    {/* Empty corner */}
                    <div className="category-corner" />

                    {/* Column headers */}
                    {currentColumns.map((col, i) => (
                        <CategoryButton
                            key={`col-${i}`}
                            cat={col}
                            tooltipKey={`col-${i}`}
                            type="col"
                            idx={i}
                        />
                    ))}

                    {/* Rows + cells — Fragment with key fixes the warning */}
                    {currentRows.map((row, rowIdx) => (
                        <Fragment key={`row-${rowIdx}`}>
                            {/* Row header */}
                            <CategoryButton
                                cat={row}
                                tooltipKey={`row-${rowIdx}`}
                                type="row"
                                idx={rowIdx}
                            />

                            {/* 3 cells for this row */}
                            {[0, 1, 2].map((colIdx) => {
                                const idx = rowIdx * 3 + colIdx;
                                const cell = cells[idx];
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
                                            ${isFading ? "fading" : ""}
                                        `}
                                        onClick={() => handleCellClick(idx)}
                                        disabled={!!winResult}>
                                        {cell?.player === 1 && (
                                            <span className="cell-symbol">
                                                ✕
                                            </span>
                                        )}
                                        {cell?.player === 2 && (
                                            <span className="cell-symbol">
                                                ○
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </Fragment>
                    ))}
                </div>
            )}

            <div className="skip-container">
                <button className="skip-btn" onClick={handleSkip}>
                    skip
                </button>
            </div>
        </div>
    );
}
