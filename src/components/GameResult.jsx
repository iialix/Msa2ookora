import "./GameResult.css";
import { useTeam } from "../context/TeamContext";
import { useNavigate } from "react-router-dom";

export default function GameResult({ gameResult, scores, handleNewGame }) {
    const { teamA, teamB, isPlayingTournamentGame, exitTournamentGame } = useTeam();
    const navigate = useNavigate();

    let winner = "";

    if (scores.teamA > scores.teamB) {
        winner = "teamA";
    } else if (scores.teamA < scores.teamB) {
        winner = "teamB";
    } else {
        winner = "draw";
    }

    const handleTournamentNext = () => {
        exitTournamentGame();
        navigate("/tournament");
    };

    return (
        <div className="game-result-container" dir="rtl">
            <div className="game-result">
                <h2>{gameResult}</h2>

                <div className="scoreboard">
                    <div
                        className={`result-box teamA ${
                            winner === "teamA" ? "active" : ""
                        }`}>
                        <span>{teamA}</span>
                        <strong>{scores.teamA}</strong>
                    </div>

                    <div
                        className={`result-box teamB ${
                            winner === "teamB" ? "active" : ""
                        }`}>
                        <span>{teamB}</span>
                        <strong>{scores.teamB}</strong>
                    </div>
                </div>

                {isPlayingTournamentGame ? (
                    <button
                        className="btn-primary playAgain"
                        onClick={handleTournamentNext}>
                        العودة للبطولة 🏆
                    </button>
                ) : (
                    <button
                        className="btn-primary playAgain"
                        onClick={handleNewGame}>
                        العب مجدداً
                    </button>
                )}
            </div>
        </div>
    );
}
