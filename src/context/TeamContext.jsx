import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const TeamContext = createContext();

const STORAGE_KEY_NAMES = "msa2ookora_team_names";
const STORAGE_KEY_TOURNAMENT = "msa2ookora_tournament";
const STORAGE_KEY_PLAYING = "msa2ookora_playing_tournament_game";

function loadFromStorage(key, fallback) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch {
        return fallback;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {}
}

export function TeamProvider({ children }) {
    // Team names — persisted in localStorage
    const [teamNames, setTeamNamesState] = useState(() =>
        loadFromStorage(STORAGE_KEY_NAMES, { teamA: "", teamB: "" }),
    );

    // Tournament state — persisted in localStorage
    const [tournament, setTournamentState] = useState(() =>
        loadFromStorage(STORAGE_KEY_TOURNAMENT, null),
    );

    // Flag: is the user currently playing a game that was launched FROM the tournament?
    // Persisted so it survives page refreshes mid-game.
    const [playingAsTournament, setPlayingAsTournament] = useState(() =>
        loadFromStorage(STORAGE_KEY_PLAYING, false),
    );

    // Persist on change
    useEffect(() => {
        saveToStorage(STORAGE_KEY_NAMES, teamNames);
    }, [teamNames]);

    useEffect(() => {
        saveToStorage(STORAGE_KEY_TOURNAMENT, tournament);
    }, [tournament]);

    useEffect(() => {
        saveToStorage(STORAGE_KEY_PLAYING, playingAsTournament);
    }, [playingAsTournament]);

    // Ref that mirrors state — used inside reportGameResult to avoid stale closure
    const playingRef = useRef(playingAsTournament);
    useEffect(() => {
        playingRef.current = playingAsTournament;
    }, [playingAsTournament]);

    // Whether team names have been entered at least once
    const hasTeamNames = teamNames.teamA.trim() !== "" && teamNames.teamB.trim() !== "";

    const setTeamNames = useCallback((nameA, nameB) => {
        const names = { teamA: nameA.trim(), teamB: nameB.trim() };
        setTeamNamesState(names);
        // Save immediately (don't rely only on useEffect which is async)
        saveToStorage(STORAGE_KEY_NAMES, names);
    }, []);

    // Tournament controls
    const isTournament = tournament !== null;

    // Called by Tournament.jsx when user clicks "ابدأ اللعب" or "العب اللعبة القادمة"
    const enterTournamentGame = useCallback(() => {
        setPlayingAsTournament(true);
    }, []);

    // Called when user returns to tournament page (GameResult "العودة للبطولة")
    const exitTournamentGame = useCallback(() => {
        setPlayingAsTournament(false);
    }, []);

    const startTournament = useCallback((games) => {
        setTournamentState({
            games: games.map((g) => ({ ...g, winner: null })),
            currentGameIndex: 0,
            scores: { teamA: 0, teamB: 0 },
            status: "playing", // "playing" | "between" | "finished" | "earlyWin"
        });
    }, []);

    /**
     * Called by a game page when the game ends.
     * Only updates tournament state if the game was entered from the tournament.
     * winner: "teamA" | "teamB" | "draw"
     */
    const reportGameResult = useCallback((winner) => {
        // Only update tournament if the game was entered from the tournament page
        if (!playingRef.current) return;

        setTournamentState((prev) => {
            if (!prev || prev.status === "finished") return prev;

            const newGames = [...prev.games];
            newGames[prev.currentGameIndex] = {
                ...newGames[prev.currentGameIndex],
                winner,
            };

            const newScores = { ...prev.scores };
            if (winner === "teamA") newScores.teamA += 1;
            else if (winner === "teamB") newScores.teamB += 1;
            // draw = both get 0

            const isLastGame = prev.currentGameIndex >= newGames.length - 1;

            // Check early win — only if there are games left after this one
            const gamesRemaining = newGames.length - (prev.currentGameIndex + 1);
            const isEarlyWin = !isLastGame && gamesRemaining > 0 && (
                newScores.teamA > newScores.teamB + gamesRemaining ||
                newScores.teamB > newScores.teamA + gamesRemaining
            );

            let status = "between";
            if (isLastGame) status = "finished";
            else if (isEarlyWin) status = "earlyWin";

            return {
                ...prev,
                games: newGames,
                scores: newScores,
                status,
            };
        });
    }, []);

    const nextTournamentGame = useCallback(() => {
        setTournamentState((prev) => {
            if (!prev) return prev;
            const nextIndex = prev.currentGameIndex + 1;
            if (nextIndex >= prev.games.length) {
                return { ...prev, status: "finished" };
            }
            return { ...prev, currentGameIndex: nextIndex, status: "playing" };
        });
    }, []);

    const continueTournament = useCallback(() => {
        // After early win, user chose to continue
        setTournamentState((prev) => {
            if (!prev) return prev;
            const isLastGame = prev.currentGameIndex >= prev.games.length - 1;
            if (isLastGame) return { ...prev, status: "finished" };
            return { ...prev, status: "between" };
        });
    }, []);

    const finishTournament = useCallback(() => {
        setTournamentState((prev) => {
            if (!prev) return prev;
            return { ...prev, status: "finished" };
        });
    }, []);

    const resetTournament = useCallback(() => {
        setTournamentState(null);
        setPlayingAsTournament(false);
        localStorage.removeItem(STORAGE_KEY_TOURNAMENT);
        localStorage.removeItem(STORAGE_KEY_PLAYING);
    }, []);

    const value = {
        teamA: teamNames.teamA || "الفريق 1",
        teamB: teamNames.teamB || "الفريق 2",
        rawTeamA: teamNames.teamA,
        rawTeamB: teamNames.teamB,
        hasTeamNames,
        setTeamNames,
        tournament,
        isTournament,
        isPlayingTournamentGame: playingAsTournament,
        enterTournamentGame,
        exitTournamentGame,
        startTournament,
        reportGameResult,
        nextTournamentGame,
        continueTournament,
        finishTournament,
        resetTournament,
    };

    return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
    const ctx = useContext(TeamContext);
    if (!ctx) throw new Error("useTeam must be used within a TeamProvider");
    return ctx;
}

export default TeamContext;
