import { useState } from "react";
import { useTeam } from "../context/TeamContext";
import "./TeamNameModal.css";

/**
 * Gate component: wraps a game page.
 * If team names aren't set, show the modal to enter them.
 * If names exist in localStorage, skip the modal entirely.
 * In tournament mode, always skip (names set during tournament setup).
 */
export default function TeamNameModal({ children }) {
    const {
        hasTeamNames,
        setTeamNames,
        isPlayingTournamentGame,
        rawTeamA,
        rawTeamB,
    } = useTeam();
    const [nameA, setNameA] = useState(rawTeamA || "");
    const [nameB, setNameB] = useState(rawTeamB || "");
    const [error, setError] = useState("");
    const [dismissed, setDismissed] = useState(false);

    // Skip modal if:
    // - Playing a tournament game (names already set via tournament setup)
    // - Team names already exist in localStorage
    // - User dismissed the modal this session
    if (isPlayingTournamentGame || dismissed) {
        return children;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nameA.trim() || !nameB.trim()) {
            setError("يرجى إدخال اسم لكلا الفريقين");
            return;
        }
        if (nameA.trim() === nameB.trim()) {
            setError("يجب أن يكون اسم كل فريق مختلفاً");
            return;
        }
        setTeamNames(nameA, nameB);
        setDismissed(true);
    };

    return (
        <div className="team-modal-overlay" dir="rtl">
            <div className="team-modal">
                <div className="team-modal-icon">⚽</div>
                <h2 className="team-modal-title">أدخل أسماء الفرق</h2>
                <p className="team-modal-subtitle">
                    اختر اسماً مميزاً لكل فريق
                </p>

                <form onSubmit={handleSubmit} className="team-modal-form">
                    <div className="team-input-group">
                        <label
                            htmlFor="teamA-name"
                            className="team-label team-a-label">
                            الفريق الأول
                        </label>
                        <input
                            id="teamA-name"
                            type="text"
                            className="team-input team-a-input"
                            value={nameA}
                            onChange={(e) => {
                                setNameA(e.target.value);
                                setError("");
                            }}
                            placeholder="مثال: النسور"
                            autoComplete="off"
                            maxLength={20}
                            autoFocus
                        />
                    </div>

                    <div className="team-vs">VS</div>

                    <div className="team-input-group">
                        <label
                            htmlFor="teamB-name"
                            className="team-label team-b-label">
                            الفريق الثاني
                        </label>
                        <input
                            id="teamB-name"
                            type="text"
                            className="team-input team-b-input"
                            value={nameB}
                            onChange={(e) => {
                                setNameB(e.target.value);
                                setError("");
                            }}
                            placeholder="مثال: الأسود"
                            autoComplete="off"
                            maxLength={20}
                        />
                    </div>

                    {error && <p className="team-modal-error">{error}</p>}

                    <button type="submit" className="team-modal-submit">
                        ابدأ اللعب 🎮
                    </button>
                </form>
            </div>
        </div>
    );
}
