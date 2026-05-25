import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import ScoreBoard from "../components/ScoreBoard";
import EarlyWin from "../components/EarlyWin";
import GameResult from "../components/GameResult";
import Timer from "../components/Timer";
import LoadingIndicator from "../components/LoadingIndicator";
import TeamNameModal from "../components/TeamNameModal";
import { useTeam } from "../context/TeamContext";
import "./Offside.css";

async function fetchOffside() {
    const response = await fetch("http://localhost:8080/offside");
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch offside questions");
    }
    return data;
}

export default function Offside() {
    const { teamA, teamB, isTournament, reportGameResult } = useTeam();
    const [selectedTeam, setSelectedTeam] = useState(1);
    const [round, setRound] = useState(1);
    const [scores, setScores] = useState({ teamA: 0, teamB: 0 });
    const [gameResult, setGameResult] = useState(null);
    const [earlyWin, setEarlyWin] = useState(null);
    const [continued, setContinued] = useState(false);

    const { data, isPending, isError } = useQuery({
        queryKey: ["offside"],
        queryFn: fetchOffside,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    const handleNewGame = () => window.location.reload();

    const addPoint = (points) => {
        const activeTeamKey = selectedTeam === 1 ? "teamA" : "teamB";

        const currentScores = { ...scores };
        currentScores[activeTeamKey] = scores[activeTeamKey] + points;
        setScores(currentScores);

        setSelectedTeam((prev) => (prev === 1 ? 2 : 1));

        if (!continued && round < 10) {
            const roundsRemaining = 10 - round;
            let teamARemaining = 0;
            let teamBRemaining = 0;
            for (let i = round; i < 10; i++) {
                if (i % 2 == 1) {
                    teamBRemaining++;
                } else if (i % 2 == 0) {
                    teamARemaining++;
                }
            }
            const { teamA: tA, teamB: tB } = currentScores;

            if (tA > teamBRemaining * 2 + tB) {
                setEarlyWin(teamA);
                return;
            }
            if (tB > teamARemaining * 2 + tA) {
                setEarlyWin(teamB);
                return;
            }
        }

        if (round >= 10) {
            const { teamA: tA, teamB: tB } = currentScores;
            if (tA === tB) {
                setGameResult("انتهت اللعبة بالتعادل!");
                if (isTournament) reportGameResult("draw");
            } else {
                const winner = tA > tB ? teamA : teamB;
                setGameResult(`انتهت اللعبة! الفائز هو: ${winner}`);
                if (isTournament) reportGameResult(tA > tB ? "teamA" : "teamB");
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
            <div className="offside-game-container" dir="rtl">
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

    const currentQuestion = data[round - 1];
    const activeLabel = selectedTeam === 1 ? teamA : teamB;

    return (
        <TeamNameModal>
            <div className="offside-game-container" dir="rtl">
                <EarlyWin
                    earlyWin={earlyWin}
                    scores={scores}
                    handleContinue={handleContinue}
                    handleNewGame={handleNewGame}
                />

                <div className="game-header">
                    <ScoreBoard
                        isTurns={true}
                        selectedTeam={selectedTeam}
                        round={round}
                        scores={scores}
                        totalRounds={10}
                    />
                </div>

                <div className="question-section">
                    {currentQuestion ? (
                        <div className="question-card" key={currentQuestion.id}>
                            <p className="question-text">
                                {currentQuestion.question}
                            </p>
                        </div>
                    ) : (
                        <div className="question-placeholder">
                            <p>لا يوجد سؤال</p>
                        </div>
                    )}
                </div>

                <div className="timer-section">
                    <Timer time={10} currentPlayer={currentQuestion} />
                </div>

                <div className="action-section">
                    <p>
                        دور{" "}
                        <span
                            className={`active-team-label team-label-${selectedTeam}`}>
                            {activeLabel}
                        </span>
                    </p>
                    <div className="team-buttons">
                        <button
                            className="btn-team two-pts"
                            onClick={() => addPoint(2)}>
                            نقطتان (+2)
                        </button>
                        <button
                            className="btn-team one-pt"
                            onClick={() => addPoint(1)}>
                            نقطة (+1)
                        </button>
                        <button
                            className="btn-team zero-pts"
                            onClick={() => addPoint(0)}>
                            صفر (0)
                        </button>
                    </div>
                </div>
            </div>
        </TeamNameModal>
    );
}
