import { useState, useEffect } from "react";
import "./Timer.css";

export default function Timer({ time, currentPlayer, reset }) {
    const [timeLeft, setTimeLeft] = useState(time);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        setTimeLeft(time);
        setIsActive(false);
    }, [currentPlayer, time, reset]);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(interval);
                    setIsActive(false);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive]);

    const startTimer = () => {
        if (!isActive) {
            setTimeLeft(time);
            setIsActive(true);
        } else {
            resetTurn();
        }
    };

    const resetTurn = () => {
        setIsActive(false);
        setTimeLeft(time);
    };

    return (
        <>
            <div className={`timer-display ${timeLeft <= 5 ? "danger" : ""}`}>
                {timeLeft}
            </div>
            <button
                className="btn-primary"
                onClick={startTimer}
                disabled={!currentPlayer}>
                {isActive ? "أعد تعيين الوقت" : `ابدأ المؤقت (${time} ثانية)`}
            </button>
        </>
    );
}
