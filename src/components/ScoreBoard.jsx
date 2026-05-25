import "./ScoreBoard.css";
import { useTeam } from "../context/TeamContext";

export default function ScoreBoard({
    isTurns,
    selectedTeam,
    round,
    scores,
    totalRounds,
}) {
    const { teamA, teamB } = useTeam();

    let activeClass = "";

    if (isTurns) {
        const activeTeam = selectedTeam;
    } else {
        activeClass = "active";
    }

    return (
        <>
            <span className="round-badge">
                الجولة: {round} / {totalRounds}
            </span>
            <div className="scoreboard">
                <div
                    className={`score-box teamA ${selectedTeam === 1 ? "active" : ""} ${activeClass}`}>
                    <span>{teamA}</span>
                    <strong>{scores.teamA}</strong>
                </div>
                <div
                    className={`score-box teamB ${selectedTeam === 2 ? "active" : ""} ${activeClass}`}>
                    <span>{teamB}</span>
                    <strong>{scores.teamB}</strong>
                </div>
            </div>
        </>
    );
}
