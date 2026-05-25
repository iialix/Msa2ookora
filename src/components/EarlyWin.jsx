import "./EarlyWin.css";
import { useTeam } from "../context/TeamContext";
import { useNavigate } from "react-router-dom";

export default function EarlyWin({
    earlyWin,
    scores,
    handleContinue,
    handleNewGame,
}) {
    const { isPlayingTournamentGame, exitTournamentGame, reportGameResult } = useTeam();
    const navigate = useNavigate();

    const handleReturnToTournament = () => {
        // Report the result to the tournament before leaving
        if (scores.teamA > scores.teamB) {
            reportGameResult("teamA");
        } else if (scores.teamB > scores.teamA) {
            reportGameResult("teamB");
        } else {
            reportGameResult("draw");
        }
        exitTournamentGame();
        navigate("/tournament");
    };

    return (
        earlyWin && (
            <div className="popup-overlay">
                <div className="popup-box">
                    <h2>🏆</h2>
                    <h2>
                        {earlyWin} فاز ووصل إلى{" "}
                        {Math.max(scores.teamA, scores.teamB)} نقاط!
                    </h2>
                    <p>هل تريدون الاستمرار في نفس اللعبة أم البدء من جديد؟</p>
                    <div className="popup-buttons">
                        <button
                            className="popup-btn-primary"
                            onClick={handleContinue}>
                            استمر في اللعب
                        </button>
                        {isPlayingTournamentGame ? (
                            <button
                                className="popup-btn-tournament"
                                onClick={handleReturnToTournament}>
                                العودة للبطولة 🏆
                            </button>
                        ) : (
                            <button
                                className="popup-btn-secondary"
                                onClick={handleNewGame}>
                                لعبة جديدة
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    );
}
