import { motion } from "framer-motion";
import "./LoadingIndicator.css";

export default function LoadingIndicator() {
    return (
        <div>
            <div className="loading-img">
                {/* Spinning Ball */}
                <motion.img
                    src="/favicon.png" // ← replace with your extracted ball image
                    alt="ball"
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "linear",
                    }}
                />

                {/* Thunder Effect */}
                <motion.div
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.8, 0.2, 0.8],
                    }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                />

                <motion.div
                    animate={{
                        scale: [1, 1.6, 1],
                        opacity: [0.6, 0.1, 0.6],
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                />
            </div>
        </div>
    );
}
