// src/components/PersonWithLaptopSVG.jsx
import { motion } from "framer-motion";

export default function PersonWithLaptopSVG({ className = "", float = false }) {
    const baseProps = { className, viewBox: "0 0 520 420", fill: "none" };
    return float ? (
        <motion.svg {...baseProps} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <Body />
        </motion.svg>
    ) : (
        <svg {...baseProps}><Body /></svg>
    );
}

function Body() {
    const S = { stroke: "#fff", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" };
    return (
        <>
            {/* 외곽 가이드(연한 원광 → 아주 미세) */}
            <radialGradient id="g" cx="0" cy="0" r="1" gradientTransform="translate(360 150) rotate(90) scale(260 260)">
                <stop stopColor="rgba(255,255,255,0.06)"/><stop offset="1" stopColor="rgba(255,255,255,0)"/>
            </radialGradient>
            <circle cx="360" cy="150" r="240" fill="url(#g)" />

            {/* 얼굴/헤어/표정 */}
            <path d="M180 160c0-56 36-90 82-90s82 34 82 90v22" {...S}/>
            <path d="M166 260c12-48 54-74 96-74s84 26 96 74" {...S}/>
            <path d="M246 170c0 12 10 22 22 22s22-10 22-22" {...S}/>
            <circle cx="262" cy="160" r="3" fill="#fff"/>
            <circle cx="282" cy="160" r="3" fill="#fff"/>
            <path d="M266 176c5 3 13 3 18 0" {...S}/>

            {/* 노트북 */}
            <path d="M140 290h280l-22 42H162l-22-42Z" stroke="#fff" />
            <circle cx="280" cy="312" r="7" fill="#fff" />
        </>
    );
}
