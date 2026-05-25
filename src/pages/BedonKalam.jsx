import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchBedonKalam } from "../util/http";

import Timer from "../components/Timer";
import ScoreBoard from "../components/ScoreBoard";
import EarlyWin from "../components/EarlyWin";
import GameResult from "../components/GameResult";
import LoadingIndicator from "../components/LoadingIndicator";
import TeamNameModal from "../components/TeamNameModal";
import { useTeam } from "../context/TeamContext";
import "./BedonKalam.css";

const formatImageUrl = (url) => url ? url.replace(".", "backend") : null;

export default function BedonKalam() {
    const { teamA, teamB, isTournament, reportGameResult } = useTeam();
    const [selectedIndex, setSelectedIndex] = useState(null); // which button was clicked
    const [selectedTeam, setSelectedTeam] = useState(1);
    const [usedIndexes, setUsedIndexes] = useState([]); // already chosen buttons
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [round, setRound] = useState(1);
    const [scores, setScores] = useState({ teamA: 0, teamB: 0 });
    const [gameResult, setGameResult] = useState(null);
    const [skippedRounds, setSkippedRounds] = useState(0);
    const [earlyWin, setEarlyWin] = useState(null);
    const [continued, setContinued] = useState(false);

    const { data, isPending, isError } = useQuery({
        queryKey: ["bedonKalam"],
        queryFn: fetchBedonKalam,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    const handleSelectPlayer = (index) => {
        const alreadyUsed = usedIndexes.some(
            (item) => item.selectedIndex === index,
        );

        if (alreadyUsed) return;
        setSelectedIndex(index);
        setCurrentPlayer(data[index]);
    };

    const handleNewGame = () => window.location.reload();

    const addPoint = (team) => {
        if (selectedIndex === null) return;

        // 1. تبديل الفريق الذي عليه الدور
        setSelectedTeam((prev) => (prev === 1 ? 2 : 1));

        // 2. تحديث السكور والجولات المسحوب عليها
        let currentScores = { ...scores };
        let currentSkipped = skippedRounds;

        if (team === "skip") {
            currentSkipped = skippedRounds + 1;
            setSkippedRounds(currentSkipped);
        } else {
            currentScores[team] = scores[team] + 1;
            setScores(currentScores);
        }

        setUsedIndexes((prev) => [
            ...prev,
            { selectedIndex: selectedIndex, teamAnswer: team },
        ]);
        setSelectedIndex(null);
        setCurrentPlayer(null);

        if (!continued) {
            const totalRounds = 10;
            const roundsPlayed = round;
            const roundsRemaining = totalRounds - roundsPlayed;

            const teamAScore = currentScores.teamA;
            const teamBScore = currentScores.teamB;

            // Check if teamA is unreachable
            if (teamAScore > teamBScore + roundsRemaining) {
                setEarlyWin(teamA);
                return;
            }

            // Check if teamB is unreachable
            if (teamBScore > teamAScore + roundsRemaining) {
                setEarlyWin(teamB);
                return;
            }
        }

        if (round >= 10) {
            if (currentScores.teamA === currentScores.teamB) {
                setGameResult("انتهت اللعبة بالتعادل!");
                if (isTournament) reportGameResult("draw");
            } else {
                const winner =
                    currentScores.teamA > currentScores.teamB ? teamA : teamB;
                setGameResult(`انتهت اللعبة! الفائز هو: ${winner}`);
                if (isTournament)
                    reportGameResult(
                        currentScores.teamA > currentScores.teamB
                            ? "teamA"
                            : "teamB",
                    );
            }
        } else {
            setRound((r) => r + 1);
        }
    };

    const handleContinue = () => {
        setContinued(true);
        setEarlyWin(null);
        if (round >= 10) {
            const { teamA: tA, teamB: tB } = scores;
            if (tA === tB) {
                setGameResult("انتهت اللعبة بالتعادل!");
                if (isTournament) reportGameResult("draw");
            } else {
                setGameResult(
                    `انتهت اللعبة! الفائز هو: ${tA > tB ? teamA : teamB}`,
                );
                if (isTournament) reportGameResult(tA > tB ? "teamA" : "teamB");
            }
        } else {
            setRound((r) => r + 1);
        }
    };

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

    if (gameResult) {
        return (
            <GameResult
                gameResult={gameResult}
                scores={scores}
                handleNewGame={handleNewGame}></GameResult>
        );
    }

    return (
        <TeamNameModal>
            <div className="bedon-game-container" dir="rtl">
                {/* Early Win Popup */}
                <EarlyWin
                    earlyWin={earlyWin}
                    scores={scores}
                    handleContinue={handleContinue}
                    handleNewGame={handleNewGame}></EarlyWin>

                {/* Header */}
                <div className="game-header">
                    <ScoreBoard
                        isTurns={true}
                        selectedTeam={selectedTeam}
                        round={round}
                        scores={scores}
                        totalRounds={10}></ScoreBoard>
                </div>

                {/* Player Buttons Grid */}
                <div className="player-section">
                    <div className="bedon-buttons-grid">
                        {data.map((player, index) => {
                            const usedItem = usedIndexes.find(
                                (item) => item.selectedIndex === index,
                            );
                            const isUsed = !!usedItem;
                            const teamAnswered = usedItem?.teamAnswer;
                            const isSelected = selectedIndex === index;
                            return (
                                <button
                                    key={player.id}
                                    className={`bedon-player-btn 
                                    ${isUsed ? "used" : ""} 
                                    ${teamAnswered === "teamA" ? "team-a" : ""} 
                                    ${teamAnswered === "teamB" ? "team-b" : ""} 
                                    ${teamAnswered === "skip" ? "skipped" : ""} 
                                    ${isSelected ? "selected" : ""}`}
                                    onClick={() => handleSelectPlayer(index)}
                                    disabled={isUsed}>
                                    {teamAnswered === "skip" && "✗"}
                                    {isUsed && !(teamAnswered === "skip") && "✓"}
                                    {!isUsed && index + 1}
                                </button>
                            );
                        })}
                    </div>

                    {/* Selected Player Card */}
                    {currentPlayer ? (
                        <div className="player-card" style={{ marginTop: "20px" }}>
                            <img
                                src={formatImageUrl(currentPlayer.image_url)}
                                alt={currentPlayer.name}
                                className="player-img"
                            />
                            <h3>{currentPlayer.name}</h3>
                        </div>
                    ) : (
                        <div className="player-placeholder">
                            <p
                                style={{
                                    color: "rgba(255,255,255,0.4)",
                                    marginTop: "20px",
                                }}>
                                اختر رقماً لعرض اللاعب
                            </p>
                        </div>
                    )}
                </div>

                {/* Timer */}
                <div className="timer-section">
                    <Timer time={45} currentPlayer={currentPlayer}></Timer>
                </div>

                {/* Give Point */}
                <div className="action-section">
                    <p>منح النقطة لـ:</p>
                    <div className="team-buttons">
                        <button
                            className="btn-team a"
                            onClick={() => addPoint("teamA")}
                            disabled={!currentPlayer}>
                            {teamA} (+1)
                        </button>
                        <button
                            className="btn-team b"
                            onClick={() => addPoint("teamB")}
                            disabled={!currentPlayer}>
                            {teamB} (+1)
                        </button>
                        <button
                            className="btn-team skip"
                            onClick={() => addPoint("skip")}
                            disabled={!currentPlayer}>
                            skip
                        </button>
                    </div>
                </div>
            </div>
        </TeamNameModal>
    );
}
