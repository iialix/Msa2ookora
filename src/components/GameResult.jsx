import "./GameResult.css";

export default function GameResult({ gameResult, scores, handleNewGame }) {
    let winner = "";

    if (scores.teamA > scores.teamB) {
        winner = "teamA";
    } else if (scores.teamA < scores.teamB) {
        winner = "teamB";
    } else {
        winner = "draw";
    }

    return (
        <div className="game-result-container" dir="rtl">
            <div className="game-result">
                <h2>{gameResult}</h2>

                <div className="scoreboard">
                    <div
                        className={`result-box teamA ${
                            winner === "teamA" ? "active" : ""
                        }`}>
                        <span>الفريق 1</span>
                        <strong>{scores.teamA}</strong>
                    </div>

                    <div
                        className={`result-box teamB ${
                            winner === "teamB" ? "active" : ""
                        }`}>
                        <span>الفريق 2</span>
                        <strong>{scores.teamB}</strong>
                    </div>
                </div>

                <button
                    className="btn-primary playAgain"
                    onClick={handleNewGame}>
                    العب مجدداً
                </button>
            </div>
        </div>
    );
}
