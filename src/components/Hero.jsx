import { useMemo } from "react";
import Ballpit from "./BallPit";
import "./Hero.css";

export default function Hero() {
    const balls = useMemo(() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) return { count: 30, gravity: 0.005, friction: 0.9975, wallBounce: 1.05, followCursor: false, minSize: 0.4, maxSize: 1.2 };
        return { count: 80, gravity: 0.015, friction: 0.9975, wallBounce: 0.95, followCursor: false, minSize: 0.4, maxSize: 1.2 };
    }, []);

    return (
        <div className="hero-wrapper">
            {/* Ballpit canvas */}
            <div className="hero-canvas" style={{ pointerEvents: "none" }}>
                <Ballpit
                    count={balls.count}
                    gravity={balls.gravity}
                    friction={balls.friction}
                    wallBounce={balls.wallBounce}
                    followCursor={balls.followCursor}
                    minSize={balls.minSize}
                    maxSize={balls.maxSize}
                />
            </div>

            {/* Vignette: fades edges + bottom bleeds into games section */}
            <div className="hero-vignette" />

            {/* Content */}
            <div className="hero-content">
                <p className="hero-eyebrow">مرحبا بك في</p>
                <h1 className="hero-title">مســاؤو كــورة</h1>
                <p className="hero-subtitle">
                    اكتشف مجموعة من الألعاب المثيرة وتحدَّ أصدقاءك
                </p>
                {/* <div className="hero-cta">
                    <a href="#games" className="hero-btn-primary">
                        ابدأ اللعب
                    </a>
                    <a href="#about" className="hero-btn-secondary">
                        اعرف أكثر
                    </a>
                </div> */}
            </div>
        </div>
    );
}
