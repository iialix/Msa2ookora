import { useState, useRef, useCallback, Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchConnect4, fetchReplacement } from "../util/http.js";
import GameResult from "../components/GameResult";
import LoadingIndicator from "../components/LoadingIndicator";
import Timer from "../components/Timer";
import TeamNameModal from "../components/TeamNameModal";
import { useTeam } from "../context/TeamContext";
import "./Connect4.css";

const TOTAL_ROUNDS = 1;
const ROWS = 6;
const COLS = 7;
const MAX_STRIKES = 3;

const formatImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return url.replace("./public", "../../backend/public");
};

function initRoundState(nextStartingPlayer) {
    return {
        cells: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
        activePlayer: nextStartingPlayer,
        orderCounter: 0,
        winResult: null,
    };
}

function checkWinner(cells) {
    const check = (r, c, dr, dc) => {
        const player = cells[r][c]?.player;
        if (!player) return null;
        const line = [[r, c]];
        for (let i = 1; i < 4; i++) {
            const nr = r + dr * i,
                nc = c + dc * i;
            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return null;
            if (cells[nr][nc]?.player !== player) return null;
            line.push([nr, nc]);
        }
        return { winner: player, line };
    };
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const result =
                check(r, c, 0, 1) ||
                check(r, c, 1, 0) ||
                check(r, c, 1, 1) ||
                check(r, c, 1, -1);
            if (result) return result;
        }
    }
    return null;
}

function isBoardFull(cells) {
    return cells.every((row) => row.every((cell) => cell !== null));
}

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

export default function Connect4() {
    const { teamA, teamB, isTournament, reportGameResult } = useTeam();
    const [round] = useState(1);
    const [roundWins, setRoundWins] = useState({ p1: 0, p2: 0 });
    const [roundState, setRoundState] = useState(initRoundState(1));
    const [gameResult, setGameResult] = useState(null);
    const [finalScores, setFinalScores] = useState({ teamA: 0, teamB: 0 });
    const [strikes, setStrikes] = useState({ 1: 0, 2: 0 });
    const [roundCategories, setRoundCategories] = useState(null);
    const [bonusTurns, setBonusTurns] = useState(0);
    const [tooltip, setTooltip] = useState(null);
    const [swapping, setSwapping] = useState(null);
    const longPressTimer = useRef(null);
    const swapTargetRef = useRef(null);

    // ── Overlay ball state ──
    // fallingBall: { left, top, player, dropFrom, dropDuration } | null
    const [fallingBall, setFallingBall] = useState(null);
    // Whether the animation CSS class has been applied (one tick after mount)
    const [ballAnimating, setBallAnimating] = useState(false);

    // Ref to the grid wrapper so we can measure cell positions
    const gridWrapperRef = useRef(null);
    // Ref map: "row-col" → DOM button element
    const cellRefs = useRef({});

    const { cells, activePlayer, orderCounter, winResult } = roundState;

    const { data, isPending, isError } = useQuery({
        queryKey: ["connect4"],
        queryFn: fetchConnect4,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    const { refetch, isFetching } = useQuery({
        queryKey: ["swapCategory"],
        queryFn: () => fetchReplacement(swapTargetRef.current.type),
        enabled: false,
        staleTime: 0,
        gcTime: 0,
        retry: false,
    });

    // 3. Call site — same signature as before
    const handleSwapCategory = async (type, idx) => {
        swapTargetRef.current = { type, idx };
        setSwapping(`${type}-${idx}`);
        setTooltip(null);

        const { data: replacement, error } = await refetch();

        if (error) {
            console.error("Failed to swap category:", error);
        } else {
            setRoundCategories((prev) => {
                const baseCols = prev?.columns ?? categoryCols; // ✅ was: columns
                const baseRows = prev?.rows ?? categoryRows; // ✅ was: rows
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

    const categoryRows = roundCategories?.rows ?? data?.rows ?? [];
    const categoryCols = roundCategories?.columns ?? data?.Columns ?? [];

    // ── Animation lock: prevents clicking while a ball is in the air ──
    const isAnimating = fallingBall !== null;

    const handleColumnClick = useCallback(
        (colIdx) => {
            if (winResult || gameResult || isAnimating) return;

            // Find target row (lowest empty)
            let targetRow = -1;
            for (let r = ROWS - 1; r >= 0; r--) {
                if (cells[r][colIdx] === null) {
                    targetRow = r;
                    break;
                }
            }
            if (targetRow === -1) return;

            // ── Measure positions ──
            const wrapperEl = gridWrapperRef.current;
            const cellEl = cellRefs.current[`${targetRow}-${colIdx}`];
            if (!wrapperEl || !cellEl) return;

            const wrapperRect = wrapperEl.getBoundingClientRect();
            const cellRect = cellEl.getBoundingClientRect();

            // Centre of the target cell, relative to the wrapper
            const cellCentreX =
                cellRect.left - wrapperRect.left + cellRect.width / 2;
            const cellCentreY =
                cellRect.top - wrapperRect.top + cellRect.height / 2;

            // Ball starts above the very top of the wrapper
            // dropFrom is negative: how many px above the resting position the ball starts
            const startAboveWrapper = 60; // px above wrapper top edge
            const dropFrom = -(cellCentreY + startAboveWrapper);

            // Duration scales with distance: ~50ms per row, minimum 200ms, max 600ms
            const dropDuration = Math.min(
                Math.max(0.18 + targetRow * 0.07, 0.22),
                0.6,
            );

            // ── Spawn ball at rest position; animation kicks in next tick ──
            setFallingBall({
                left: cellCentreX,
                top: cellCentreY,
                player: activePlayer,
                dropFrom,
                dropDuration,
            });
            setBallAnimating(false);

            // Next tick: add animating class to trigger keyframe
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setBallAnimating(true);
                });
            });

            // Commit board state when ball is ~90% through its animation
            const commitAt = dropDuration * 900;
            setTimeout(() => {
                const newOrder = orderCounter + 1;
                const newCells = cells.map((row) => [...row]);
                newCells[targetRow][colIdx] = {
                    player: activePlayer,
                    order: newOrder,
                };

                const result = checkWinner(newCells);
                const draw = !result && isBoardFull(newCells);

                let nextPlayer = activePlayer;
                if (!result && !draw) {
                    if (bonusTurns > 0) {
                        setBonusTurns((b) => b - 1);
                    } else {
                        nextPlayer = activePlayer === 1 ? 2 : 1;
                    }
                }

                setRoundState((rs) => ({
                    ...rs,
                    cells: newCells,
                    orderCounter: newOrder,
                    winResult: result || null,
                    activePlayer: result || draw ? rs.activePlayer : nextPlayer,
                }));

                // Remove overlay ball — the real cell symbol now shows
                setFallingBall(null);
                setBallAnimating(false);

                if (result) {
                    setTimeout(() => {
                        const newWins = { ...roundWins };
                        if (result.winner === 1) newWins.p1 += 1;
                        else newWins.p2 += 1;
                        setRoundWins(newWins);
                        setFinalScores({
                            teamA: newWins.p1,
                            teamB: newWins.p2,
                        });
                        const winner =
                            result.winner === 1 ? teamA : teamB;
                        setGameResult(`انتهت اللعبة! الفائز هو: ${winner}`);
                        if (isTournament) reportGameResult(result.winner === 1 ? "teamA" : "teamB");
                    }, 800);
                } else if (draw) {
                    setTimeout(() => {
                        setFinalScores({
                            teamA: roundWins.p1,
                            teamB: roundWins.p2,
                        });
                        setGameResult("انتهت اللعبة! تعادل!");
                        if (isTournament) reportGameResult("draw");
                    }, 800);
                }
            }, commitAt);
        },
        [
            winResult,
            gameResult,
            isAnimating,
            cells,
            activePlayer,
            orderCounter,
            bonusTurns,
            roundWins,
            teamA,
            teamB,
            isTournament,
            reportGameResult,
        ],
    );

    const handleSkip = () => {
        if (winResult || gameResult || isAnimating) return;
        const currentStrikes = strikes[activePlayer] + 1;
        setStrikes((s) => ({ ...s, [activePlayer]: currentStrikes }));

        if (currentStrikes >= MAX_STRIKES) {
            setStrikes((s) => ({ ...s, [activePlayer]: 0 }));
            setBonusTurns(1);
            const opponent = activePlayer === 1 ? 2 : 1;
            setRoundState((rs) => ({ ...rs, activePlayer: opponent }));
        } else {
            setRoundState((rs) => ({
                ...rs,
                activePlayer: rs.activePlayer === 1 ? 2 : 1,
            }));
        }
    };

    const handleNewGame = () => window.location.reload();

    const startLongPress = (type, idx) => {
        longPressTimer.current = setTimeout(() => {
            handleSwapCategory(type, idx); // keep existing swap logic
        }, 600);
    };
    const cancelLongPress = () => clearTimeout(longPressTimer.current);

    const handleCategoryClick = (label, key) => {
        setTooltip((prev) => (prev?.key === key ? null : { label, key }));
    };

    const winLine = winResult?.line || [];
    const isWinCell = (r, c) =>
        winLine.some(([wr, wc]) => wr === r && wc === c);

    // ── Category button sub-component ──
    const CategoryButton = ({ cat, tooltipKey, type, idx, col }) => {
        if (!cat) return <div className="category-corner" />;
        const { label, imageUrl, isPosition } = normaliseCategory(cat);
        const isLoading = swapping === `${type}-${idx}`;
        return (
            <div
                className={`category-wrapper ${isLoading ? " category-wrapper-loading" : ""}`}>
                <button
                    className={`category${isPosition ? " category-position" : ""}${isLoading ? " category-loading" : ""} ${col ? "cols" : ""}`}
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
                        <LoadingIndicator />
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

    // ── Strikes display ──
    const StrikesDisplay = ({ player }) => {
        const count = strikes[player];
        const isP1 = player === 1;
        return (
            <div
                className={`strikes-display ${isP1 ? "strikes-p1" : "strikes-p2"}`}>
                {Array.from({ length: MAX_STRIKES }).map((_, i) => (
                    <span
                        key={i}
                        className={`strike-dot ${i < count ? "strike-filled" : "strike-empty"}`}>
                        {i < count ? "x" : ""}
                    </span>
                ))}
            </div>
        );
    };

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
                scores={finalScores}
                handleNewGame={handleNewGame}
            />
        );

    return (
        <TeamNameModal>
            <>
                <div className="portrait-overlay">
                    <span className="portrait-overlay-icon">📱</span>
                    <p className="portrait-overlay-title">اقلب الشاشة أفقياً</p>
                    <p className="portrait-overlay-sub">
                        يعمل هذا اللعبة بشكل أفضل في الوضع الأفقي.
                        <br />
                        Please rotate your device to landscape mode.
                    </p>
                </div>

                <div className="connect4-container" dir="rtl">
                    {/* ── HEADER ── */}
                    <div className="connect4-header">
                        <div className="connect4-player-col">
                            <div
                                className={`connect4-player-badge ${activePlayer === 1 ? "p1-active" : "p1-idle"}`}>
                                <span className="connect4-symbol">✕</span>
                                <span>{teamA}</span>
                                {activePlayer === 1 && (
                                    <span className="turn-dot" />
                                )}
                            </div>
                            <StrikesDisplay player={1} />
                        </div>

                        <div className="connect4-round-info">
                            <span className="connect4-round-label">
                                جولة {round} / {TOTAL_ROUNDS}
                            </span>
                            <p className="connect4-turn-label">
                                دور{" "}
                                {activePlayer === 1 ? `${teamA} ✕` : `${teamB} ○`}
                                {bonusTurns > 0 && " 🎯"}
                            </p>
                            {bonusTurns > 0 && (
                                <span className="bonus-turns-label">
                                    +{bonusTurns} 🎯
                                </span>
                            )}
                        </div>

                        <div className="connect4-player-col">
                            <div
                                className={`connect4-player-badge ${activePlayer === 2 ? "p2-active" : "p2-idle"}`}>
                                <span className="connect4-symbol">○</span>
                                <span>{teamB}</span>
                                {activePlayer === 2 && (
                                    <span className="turn-dot" />
                                )}
                            </div>
                            <StrikesDisplay player={2} />
                        </div>
                    </div>

                    {/* ── TIMER ── */}
                    <div className="timer-section">
                        <Timer time={20} currentPlayer={activePlayer} />
                    </div>

                    {/* ── GRID ── */}
                    <div className="connect4-grid-wrapper" ref={gridWrapperRef}>
                        {fallingBall && (
                            <div
                                className={`falling-ball p${fallingBall.player}${ballAnimating ? " animating" : ""}`}
                                style={{
                                    left: fallingBall.left,
                                    top: fallingBall.top,
                                    "--drop-from": `${fallingBall.dropFrom}px`,
                                    "--drop-duration": `${fallingBall.dropDuration}s`,
                                }}>
                                <span className="cell-symbol"></span>
                            </div>
                        )}

                        <div className="connect4-grid" dir="ltr">
                            <div className="category-corner" />
                            {categoryCols.map((col, colIdx) => (
                                <CategoryButton
                                    key={`col-${colIdx}`}
                                    cat={categoryCols[colIdx]}
                                    tooltipKey={`col-${colIdx}`}
                                    type="col"
                                    idx={colIdx}
                                    col={true}
                                />
                            ))}

                            {cells.map((row, rowIdx) => (
                                <Fragment key={`row-${rowIdx}`}>
                                    <CategoryButton
                                        cat={categoryRows[rowIdx]}
                                        tooltipKey={`row-${rowIdx}`}
                                        type="row"
                                        idx={rowIdx}
                                        col={false}
                                    />
                                    {row.map((cell, colIdx) => (
                                        <button
                                            key={`${rowIdx}-${colIdx}`}
                                            ref={(el) => {
                                                cellRefs.current[
                                                    `${rowIdx}-${colIdx}`
                                                ] = el;
                                            }}
                                            className={`connect4-cell
                                            ${cell === null ? "empty" : ""}
                                            ${cell?.player === 1 ? "p1" : ""}
                                            ${cell?.player === 2 ? "p2" : ""}
                                            ${isWinCell(rowIdx, colIdx) ? "win-cell" : ""}
                                        `}
                                            onClick={() =>
                                                handleColumnClick(colIdx)
                                            }
                                            disabled={!!winResult || isAnimating}>
                                            {cell?.player === 1 && (
                                                <span className="cell-symbol"></span>
                                            )}
                                            {cell?.player === 2 && (
                                                <span className="cell-symbol"></span>
                                            )}
                                        </button>
                                    ))}
                                </Fragment>
                            ))}
                        </div>
                    </div>

                    {/* ── SKIP ── */}
                    <div className="skip-container">
                        <button
                            className="skip-btn"
                            onClick={handleSkip}
                            disabled={isAnimating}>
                            تخطي ({MAX_STRIKES - strikes[activePlayer]} متبقي)
                        </button>
                    </div>
                </div>
            </>
        </TeamNameModal>
    );
}
