// src/components/slides/SlideSingleQuote.jsx
import React from "react";
import { motion } from "framer-motion";

export default function SlideSingleQuote({ quote }) {
    return (
        <section style={sx.section}>
            {/* 아주 약한 라이트 그라데이션만 (배경이미지는 전역에서) */}
            <div aria-hidden style={sx.bg} />
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={sx.quoteText}
            >
                {quote.split("\n").map((line, i, arr) => (
                    <React.Fragment key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                    </React.Fragment>
                ))}
            </motion.p>
        </section>
    );
}

const sx = {
    section: {
        position: "relative",
        minHeight: "100vh",
        scrollSnapAlign: "start",
        background: "transparent", // 전역 배경 보이도록
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        textAlign: "center",
        padding: "0 20px",
    },
    bg: {
        position: "absolute",
        inset: 0,
        background: "radial-gradient(45% 40% at 50% 50%, rgba(253, 216, 53, 0.10) 0%, rgba(0,0,0,0) 72%)",
        pointerEvents: "none",
        zIndex: 0,
    },
    quoteText: {
        position: "relative",
        zIndex: 1,
        fontSize: "2.2rem",
        fontWeight: 800,
        lineHeight: 1.4,
        letterSpacing: "-0.02em",
        color: "#f0f0f0",
        maxWidth: "800px",
        textShadow: "0 2px 8px rgba(0,0,0,0.4)",
        whiteSpace: "pre-wrap",
    },
};
