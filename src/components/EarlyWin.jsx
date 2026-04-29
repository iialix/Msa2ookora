import "./EarlyWin.css";

export default function EarlyWin({
    earlyWin,
    scores,
    handleContinue,
    handleNewGame,
}) {
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
                            className="btn-primary"
                            onClick={handleContinue}>
                            استمر في اللعب
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={handleNewGame}>
                            لعبة جديدة
                        </button>
                    </div>
                </div>
            </div>
        )
    );
}
