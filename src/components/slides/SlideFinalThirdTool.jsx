// src/components/slides/SlideFinalThirdTool.jsx
import React from "react";
import { motion } from "framer-motion";

/**
 * 마지막 슬라이드 – Playlist 스타일 히어로
 * - 로컬 배경 이미지: src/assets/start/background.png
 */
export default function SlideFinalThirdTool() {
    // ✅ 단일 배경 이미지 (Vite 권장 방식)
    const bg = new URL("../../assets/start/background.png", import.meta.url).href;

    return (
        <section style={sx.section}>
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&display=swap"
                rel="stylesheet"
            />

            {/* 배경 이미지 + 오버레이 */}
            <div aria-hidden style={{ ...sx.bg, backgroundImage: `url(${bg})` }} />
            <div aria-hidden style={sx.overlay} />

            {/* 중앙 타이포 */}
            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                style={sx.center}
            >
                <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.6 }}
                    style={sx.overline}
                >
                    knowledge playlist
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28, duration: 0.7 }}
                    style={sx.title}
                >
                    THIRD&nbsp;TOOL
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.6 }}
                    style={sx.caption}
                >
                    – Learn small, repeat smart –
                </motion.p>
            </motion.div>
        </section>
    );
}

/* ===== styles ===== */
const sx = {
    section: {
        position: "relative",
        minHeight: "100vh",
        scrollSnapAlign: "start",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        background: "#000",
    },
    bg: {
        position: "absolute",
        inset: 0,
        backgroundPosition: "center",
        backgroundSize: "cover",
        transform: "scale(1.02)",
        filter: "saturate(105%)",
    },
    overlay: {
        position: "absolute",
        inset: 0,
        background:
            "linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.25) 40%, rgba(0,0,0,.35) 100%)",
    },
    center: {
        position: "relative",
        zIndex: 2,
        textAlign: "center",
        padding: "0 4vw",
    },
    overline: {
        margin: 0,
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(1rem, 2.4vw, 1.4rem)",
        fontWeight: 600,
        letterSpacing: "0.12em",
        color: "rgba(255,255,255,.95)",
        textShadow: "0 1px 2px rgba(0,0,0,.25)",
    },
    title: {
        margin: "8px 0",
        fontFamily:
            "Pretendard, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        fontWeight: 900,
        letterSpacing: "0.02em",
        fontSize: "clamp(3.2rem, 12vw, 9rem)",
        lineHeight: 1,
        color: "#f66957", // 예시의 주황 포인트
        textShadow: "0 10px 40px rgba(0,0,0,.35)",
    },
    caption: {
        marginTop: 18,
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(1rem, 2.2vw, 1.25rem)",
        color: "rgba(255,255,255,.95)",
        letterSpacing: ".04em",
        fontStyle: "italic",
        textShadow: "0 1px 2px rgba(0,0,0,.25)",
    },
};
