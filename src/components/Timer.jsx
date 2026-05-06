import { useState, useEffect, useRef } from "react";
import "./Timer.css";

export default function Timer({ time, currentPlayer, reset, onEnd, addedTime }) {
    const [timeLeft, setTimeLeft] = useState(time);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef(null);
    const [showToast, setShowToast] = useState(false);
    const lastAddedTimeRef = useRef(0);

    // Reset timer
    useEffect(() => {
        setTimeLeft(time);
        setIsActive(false);
    }, [currentPlayer, time, reset]);

    // Handle addedTime regardless of isActive state
    useEffect(() => {
        if (addedTime && addedTime !== lastAddedTimeRef.current) {
            setTimeLeft((t) => t + addedTime);
            lastAddedTimeRef.current = addedTime;
        }
    }, [addedTime]);

    // Reset the ref when timer resets
    useEffect(() => {
        lastAddedTimeRef.current = 0;
    }, [currentPlayer, reset]);

    // Start / stop interval
    useEffect(() => {
        if (!isActive) return;

        intervalRef.current = setInterval(() => {
            setTimeLeft((t) => t - 1);
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [isActive]);

    // Handle end safely here
    useEffect(() => {
        if (timeLeft === 0) {
            setIsActive(false);
            clearInterval(intervalRef.current);

            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);

            const timeout = setTimeout(() => {
                onEnd?.();
            }, 0);

            setTimeLeft(time);
            return () => clearTimeout(timeout);
        }
    }, [timeLeft, onEnd]);

    return (
        <div>
            <div className={`timer-display ${timeLeft <= 5 ? "danger" : ""}`}>
                {timeLeft}
            </div>

            <div className="timer-buttons">
                {!isActive ? (
                    <button
                        className="btn-primary"
                        onClick={() => setIsActive(true)}
                        disabled={!currentPlayer}>
                        ▶ ابدأ ({timeLeft}s)
                    </button>
                ) : (
                    <>
                        <button
                            className="btn-primary controls"
                            onClick={() => setIsActive(false)}
                            disabled={!currentPlayer}>
                            ⏸
                        </button>

                        <button
                            className="btn-primary controls"
                            onClick={() => {
                                setIsActive(false);
                                setTimeLeft(time);
                            }}
                            disabled={!currentPlayer}>
                            ↺
                        </button>
                    </>
                )}
            </div>
            {showToast && <div className="toast-alert">⏰ انتهى الوقت</div>}
        </div>
    );
}
