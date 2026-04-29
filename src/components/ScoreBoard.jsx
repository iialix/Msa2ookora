import "./ScoreBoard.css";

export default function ScoreBoard({
    isTurns,
    selectedTeam,
    round,
    scores,
    totalRounds,
}) {
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
                    <span>الفريق 1</span>
                    <strong>{scores.teamA}</strong>
                </div>
                <div
                    className={`score-box teamB ${selectedTeam === 2 ? "active" : ""} ${activeClass}`}>
                    <span>الفريق 2</span>
                    <strong>{scores.teamB}</strong>
                </div>
            </div>
        </>
    );
}
