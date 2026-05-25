import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTeam } from "../context/TeamContext";
import gamesData from "../data/gamesData";
import "./Tournament.css";

export default function Tournament() {
    const navigate = useNavigate();
    const {
        teamA,
        teamB,
        rawTeamA,
        rawTeamB,
        setTeamNames,
        tournament,
        isTournament,
        startTournament,
        reportGameResult,
        nextTournamentGame,
        continueTournament,
        finishTournament,
        resetTournament,
        enterTournamentGame,
    } = useTeam();

    // Setup form state
    const [nameA, setNameA] = useState(rawTeamA || "");
    const [nameB, setNameB] = useState(rawTeamB || "");
    const [selectedGames, setSelectedGames] = useState([]);
    const [error, setError] = useState("");

    // Reset with confirmation
    const handleReset = () => {
        if (
            window.confirm(
                "هل أنت متأكد؟ سيتم مسح البطولة بالكامل والبدء من الصفر.",
            )
        ) {
            resetTournament();
        }
    };

    // Toggle game selection
    const toggleGame = (id) => {
        setSelectedGames((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
        );
    };

    const selectAll = () => setSelectedGames(gamesData.map((g) => g.id));
    const deselectAll = () => setSelectedGames([]);

    // Start the tournament
    const handleStart = () => {
        if (!nameA.trim() || !nameB.trim()) {
            setError("يرجى إدخال اسم لكلا الفريقين");
            return;
        }
        if (nameA.trim() === nameB.trim()) {
            setError("يجب أن يكون اسم كل فريق مختلفاً");
            return;
        }
        if (selectedGames.length < 2) {
            setError("يرجى اختيار لعبتين على الأقل");
            return;
        }

        setTeamNames(nameA, nameB);

        // Get selected games in order
        const games = gamesData.filter((g) => selectedGames.includes(g.id));
        startTournament(games);
    };

    // Navigate to current game
    const goToCurrentGame = () => {
        if (!tournament) return;
        enterTournamentGame();
        const game = tournament.games[tournament.currentGameIndex];
        navigate(`/${game.urlText}`);
    };

    // ── SETUP PHASE ──────────────────────────────────────────────
    if (!tournament || tournament.status === "finished") {
        // Show results if tournament just finished
        if (tournament?.status === "finished") {
            return (
                <div className="tournament-container" dir="rtl">
                    <div className="tournament-results">
                        <div className="tournament-results-icon"></div>
                        <h1 className="tournament-results-title">
                            {tournament.scores.teamA > tournament.scores.teamB
                                ? `${teamA} فاز بالبطولة!`
                                : tournament.scores.teamB >
                                    tournament.scores.teamA
                                  ? `${teamB} فاز بالبطولة!`
                                  : "البطولة انتهت بالتعادل!"}
                        </h1>

                        <div className="tournament-final-scores">
                            <div className="tournament-final-team team-a-final">
                                <span className="final-team-name">{teamA}</span>
                                <span className="final-team-score">
                                    {tournament.scores.teamA}
                                </span>
                            </div>
                            <div className="final-vs">VS</div>
                            <div className="tournament-final-team team-b-final">
                                <span className="final-team-name">{teamB}</span>
                                <span className="final-team-score">
                                    {tournament.scores.teamB}
                                </span>
                            </div>
                        </div>

                        <div className="tournament-games-list">
                            <h3>نتائج الألعاب</h3>
                            {tournament.games.map((game, i) => (
                                <div
                                    key={i}
                                    className={`tournament-game-result ${game.winner === "teamA" ? "won-a" : ""} ${game.winner === "teamB" ? "won-b" : ""} ${game.winner === "draw" ? "draw" : ""}`}>
                                    <span className="game-result-title">
                                        {game.title}
                                    </span>
                                    <span className="game-result-winner">
                                        {game.winner === "teamA"
                                            ? ` ${teamA}`
                                            : game.winner === "teamB"
                                              ? ` ${teamB}`
                                              : game.winner === "draw"
                                                ? " تعادل"
                                                : "—"}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            className="tournament-new-btn"
                            onClick={resetTournament}>
                            بطولة جديدة
                        </button>
                    </div>
                </div>
            );
        }

        // SETUP form
        return (
            <div className="tournament-container" dir="rtl">
                <div className="tournament-setup">
                    <h1 className="tournament-setup-title">البطولة</h1>
                    <p className="tournament-setup-subtitle">
                        أدخل أسماء الفرق واختر الألعاب
                    </p>

                    {/* Team Names */}
                    <div className="tournament-names">
                        <div className="tournament-name-group">
                            <label className="team-label team-a-label">
                                الفريق الأول
                            </label>
                            <input
                                type="text"
                                className="tournament-input team-a-input"
                                value={nameA}
                                onChange={(e) => {
                                    setNameA(e.target.value);
                                    setError("");
                                }}
                                placeholder="مثال: النسور"
                                maxLength={20}
                                autoFocus
                            />
                        </div>
                        <div className="tournament-vs">VS</div>
                        <div className="tournament-name-group">
                            <label className="team-label team-b-label">
                                الفريق الثاني
                            </label>
                            <input
                                type="text"
                                className="tournament-input team-b-input"
                                value={nameB}
                                onChange={(e) => {
                                    setNameB(e.target.value);
                                    setError("");
                                }}
                                placeholder="مثال: الأسود"
                                maxLength={20}
                            />
                        </div>
                    </div>

                    {/* Game Selection */}
                    <div className="tournament-games-selection">
                        <div className="tournament-games-header">
                            <h3>اختر الألعاب</h3>
                            <div className="tournament-select-btns">
                                <button
                                    className="select-btn"
                                    onClick={selectAll}>
                                    تحديد الكل
                                </button>
                                <button
                                    className="select-btn"
                                    onClick={deselectAll}>
                                    إلغاء الكل
                                </button>
                            </div>
                        </div>

                        <div className="tournament-games-grid">
                            {gamesData.map((game) => {
                                const isSelected = selectedGames.includes(
                                    game.id,
                                );
                                return (
                                    <button
                                        key={game.id}
                                        className={`tournament-game-card ${isSelected ? "selected" : ""}`}
                                        onClick={() => toggleGame(game.id)}>
                                        <div className="tournament-game-check">
                                            {isSelected ? "✓" : ""}
                                        </div>
                                        {/* <img
                                            src={game.image}
                                            alt={game.title}
                                            className="tournament-game-img"
                                            loading="lazy"
                                        /> */}
                                        <span className="tournament-game-title">
                                            {game.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <p className="tournament-game-count">
                            {selectedGames.length} / {gamesData.length} ألعاب
                            مختارة
                        </p>
                    </div>

                    {error && <p className="tournament-error">{error}</p>}

                    <button
                        className="tournament-start-btn"
                        onClick={handleStart}
                        disabled={selectedGames.length < 2}>
                        ابدأ البطولة
                    </button>
                </div>
            </div>
        );
    }

    // ── EARLY WIN ─────────────────────────────────────────────────
    if (tournament.status === "earlyWin") {
        const earlyWinner =
            tournament.scores.teamA > tournament.scores.teamB ? teamA : teamB;
        return (
            <div className="tournament-container" dir="rtl">
                <div className="tournament-early-win">
                    <div className="tournament-early-icon"></div>
                    <h1 className="tournament-early-title">
                        {earlyWinner} فاز بالبطولة مبكراً!
                    </h1>
                    <div className="tournament-final-scores">
                        <div className="tournament-final-team team-a-final">
                            <span className="final-team-name">{teamA}</span>
                            <span className="final-team-score">
                                {tournament.scores.teamA}
                            </span>
                        </div>
                        <div className="final-vs">VS</div>
                        <div className="tournament-final-team team-b-final">
                            <span className="final-team-name">{teamB}</span>
                            <span className="final-team-score">
                                {tournament.scores.teamB}
                            </span>
                        </div>
                    </div>
                    <p className="tournament-early-sub">
                        الفريق الآخر لا يمكنه اللحاق حتى لو فاز بكل الألعاب
                        المتبقية
                    </p>
                    <div className="tournament-early-btns">
                        <button
                            className="tournament-continue-btn"
                            onClick={continueTournament}>
                            استمر في البطولة
                        </button>
                        <button
                            className="tournament-finish-btn"
                            onClick={finishTournament}>
                            أنهِ البطولة
                        </button>
                        <button
                            className="tournament-reset-btn"
                            onClick={handleReset}>
                            🔄 إعادة تعيين
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── BETWEEN GAMES ─────────────────────────────────────────────
    if (tournament.status === "between") {
        const nextGame = tournament.games[tournament.currentGameIndex + 1];
        return (
            <div className="tournament-container" dir="rtl">
                <div className="tournament-between">
                    <h2 className="tournament-between-title">
                        📊 نتيجة البطولة
                    </h2>

                    <div className="tournament-scores-bar">
                        <div className="tournament-score-side team-a-side">
                            <span className="score-team-name">{teamA}</span>
                            <span className="score-team-value">
                                {tournament.scores.teamA}
                            </span>
                        </div>
                        <div className="score-divider">—</div>
                        <div className="tournament-score-side team-b-side">
                            <span className="score-team-name">{teamB}</span>
                            <span className="score-team-value">
                                {tournament.scores.teamB}
                            </span>
                        </div>
                    </div>

                    {/* Games progress */}
                    <div className="tournament-progress">
                        {tournament.games.map((game, i) => {
                            const isCurrent =
                                i === tournament.currentGameIndex + 1;
                            const isPlayed = game.winner !== null;
                            return (
                                <div
                                    key={i}
                                    className={`tournament-progress-item ${isPlayed ? "played" : ""} ${isCurrent ? "current" : ""} ${game.winner === "teamA" ? "won-a" : ""} ${game.winner === "teamB" ? "won-b" : ""} ${game.winner === "draw" ? "draw" : ""}`}>
                                    <span className="progress-num">
                                        {i + 1}
                                    </span>
                                    <span className="progress-title">
                                        {game.title}
                                    </span>
                                    <span className="progress-status">
                                        {game.winner === "teamA"
                                            ? teamA
                                            : game.winner === "teamB"
                                              ? teamB
                                              : game.winner === "draw"
                                                ? "تعادل"
                                                : "—"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {nextGame && (
                        <div className="tournament-next-game">
                            <p>اللعبة القادمة:</p>
                            <h3>{nextGame.title}</h3>
                        </div>
                    )}

                    <button
                        className="tournament-play-next-btn"
                        onClick={() => {
                            enterTournamentGame();
                            nextTournamentGame();
                            const game =
                                tournament.games[
                                    tournament.currentGameIndex + 1
                                ];
                            if (game) navigate(`/${game.urlText}`);
                        }}>
                        العب اللعبة القادمة ▶
                    </button>
                    <button
                        className="tournament-reset-btn"
                        onClick={handleReset}>
                        🔄 إعادة تعيين
                    </button>
                </div>
            </div>
        );
    }

    // ── PLAYING ──────────────────────────────────────────────────
    // If status is "playing", redirect to current game
    if (tournament.status === "playing") {
        const currentGame = tournament.games[tournament.currentGameIndex];
        return (
            <div className="tournament-container" dir="rtl">
                <div className="tournament-playing">
                    <div className="tournament-playing-header">
                        <span className="tournament-badge">
                            البطولة — لعبة {tournament.currentGameIndex + 1} /{" "}
                            {tournament.games.length}
                        </span>
                    </div>

                    <div className="tournament-scores-bar">
                        <div className="tournament-score-side team-a-side">
                            <span className="score-team-name">{teamA}</span>
                            <span className="score-team-value">
                                {tournament.scores.teamA}
                            </span>
                        </div>
                        <div className="score-divider">—</div>
                        <div className="tournament-score-side team-b-side">
                            <span className="score-team-value">
                                {tournament.scores.teamB}
                            </span>
                            <span className="score-team-name">{teamB}</span>
                        </div>
                    </div>

                    <div className="tournament-current-game">
                        <h2>اللعبة الحالية</h2>
                        <h1>{currentGame.title}</h1>
                        <img
                            src={currentGame.image}
                            alt={currentGame.title}
                            className="tournament-current-img"
                        />
                    </div>

                    <button
                        className="tournament-go-btn"
                        onClick={goToCurrentGame}>
                        ابدأ اللعب ▶
                    </button>
                    <button
                        className="tournament-reset-btn"
                        onClick={handleReset}>
                        🔄 إعادة تعيين
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
