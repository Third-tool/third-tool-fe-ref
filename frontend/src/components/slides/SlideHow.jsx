// src/components/slides/SlideHow.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import PersonWithLaptopSVG from "../PersonWithLaptopSVG.jsx";

/** HOW 페이지: 카드 호버 시에만 아바타가 반응 (레드 글로우 제거) */
export default function SlideHow() {
    const [isHoveringCard, setIsHoveringCard] = useState(false);

    return (
        <section style={sx.section}>
            {/* ✅ 그리드 배경만 남기고 레드 글로우 제거 */}
            <div aria-hidden style={sx.gridBg} />

            {/* 좌상단 아바타 — 카드 호버시만 반응 */}
            <motion.div
                aria-hidden
                animate={
                    isHoveringCard
                        ? { x: -6, y: -8, rotate: -4, scale: 1.02 }
                        : { x: 0, y: 0, rotate: -8, scale: 1 }
                }
                transition={{ type: "spring", stiffness: 220, damping: 16 }}
                style={sx.avatarTL}
            >
                <PersonWithLaptopSVG float={false} />
            </motion.div>

            <div style={sx.inner}>
                <div style={sx.metaRow}>
                    <span style={sx.metaLeft}>2030</span>
                    <a href="#" style={sx.metaRight}>www.the.third-tool.com</a>
                </div>

                <h1 style={sx.title}>
                    HOW <span style={sx.titleThin}> — THIRD TOOL</span>
                </h1>

                <div style={sx.cards}>
                    <RoleCard
                        titleTop="노출 빈도"
                        titleBottom="Exposure Frequency"
                        body={[
                            "장기기억의 핵심은 ‘노출 빈도’입니다.",
                            "반복해서 보일수록 기억 곡선이 덜 내려갑니다.",
                        ]}
                        onHoverChange={setIsHoveringCard}
                    />
                    <RoleCard
                        titleTop="자주 접하는 환경"
                        titleBottom="Familiar Context"
                        body={[
                            "한국어가 자연스러운 이유처럼 지식도 자주 접할수록 자연스러워집니다.",
                            "짧고 잦은 노출이 익숙함을 만듭니다.",
                        ]}
                        onHoverChange={setIsHoveringCard}
                    />
                    <RoleCard
                        titleTop="부담 없는 반복"
                        titleBottom="Lightweight Loop"
                        body={[
                            "‘할 수 있을 것 같은 양’을 주기적으로 제시합니다.",
                            "부담 없이 반복 노출을 만들어 장기기억으로 보냅니다.",
                        ]}
                        onHoverChange={setIsHoveringCard}
                    />
                </div>

                <div style={sx.presenter}>DIRECTED BY : Team, Third Tool</div>
            </div>
        </section>
    );
}

function RoleCard({ titleTop, titleBottom, body = [], onHoverChange }) {
    return (
        <motion.article
            style={sx.card}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            onHoverStart={() => onHoverChange?.(true)}
            onHoverEnd={() => onHoverChange?.(false)}
        >
            <div style={sx.cardTab}>
                <span style={sx.dot} />
                <span style={{ ...sx.dot, opacity: 0.6 }} />
            </div>
            <div style={sx.cardBody}>
                <h3 style={sx.cardTitle}>
                    {titleTop}<br />{titleBottom}
                </h3>
                <div style={sx.cardTextWrap}>
                    {body.map((t, i) => (
                        <p style={sx.cardText} key={i}>{t}</p>
                    ))}
                </div>
            </div>
        </motion.article>
    );
}

/* ---------- 스타일 ---------- */
const sx = {
    section: {
        position: "relative",
        minHeight: "100vh",
        scrollSnapAlign: "start",
        background: "#0a0a0a",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
    },
    inner: {
        width: "min(1200px, 94vw)",
        padding: "56px 0 72px",
        position: "relative",
        zIndex: 1,
    },
    gridBg: {
        position: "absolute",
        inset: 0,
        background:
            "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",
        backgroundSize: "64px 64px, 64px 64px",
        opacity: 0.24,
        pointerEvents: "none",
    },
    /* 🔻 redGlow 완전 제거됨 */

    metaRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
        fontSize: 14,
        opacity: 0.9,
    },
    metaLeft: { letterSpacing: ".08em", color: "#d6d6d6" },
    metaRight: {
        color: "#ffffff",
        textDecoration: "none",
        border: "2px solid #9b4bff",
        padding: "4px 10px",
        borderRadius: 8,
        fontSize: 12,
        letterSpacing: ".02em",
    },
    title: {
        margin: "6px 0 26px",
        fontSize: "clamp(28px, 6vw, 76px)",
        lineHeight: 0.96,
        fontWeight: 900,
        letterSpacing: "-.02em",
        color: "#ff4d46", // 타이틀 레드는 유지 (조명만 제거)
    },
    titleThin: {
        color: "#ffffff",
        fontWeight: 600,
        fontSize: "70%",
        letterSpacing: ".02em",
    },
    cards: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 28,
    },
    card: {
        position: "relative",
        borderRadius: 14,
        border: "1.5px solid rgba(255,255,255,.14)",
        background: "rgba(0,0,0,.35)",
        boxShadow: "0 18px 30px rgba(0,0,0,.35)",
        overflow: "hidden",
        display: "grid",
        gridTemplateRows: "auto 1fr",
    },
    cardTab: {
        height: 50,
        background:
            "linear-gradient(180deg, rgba(229,57,53,1), rgba(229,57,53,.92))",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
    },
    dot: {
        width: 14,
        height: 14,
        borderRadius: "999px",
        background: "#fff",
        display: "inline-block",
    },
    cardBody: {
        padding: "18px 18px 22px",
        display: "grid",
        alignContent: "start",
        gap: 10,
    },
    cardTitle: {
        fontSize: "clamp(16px, 2.1vw, 22px)",
        fontWeight: 900,
        letterSpacing: "-.01em",
        lineHeight: 1.25,
    },
    cardTextWrap: { marginTop: 6, display: "grid", gap: 6 },
    cardText: {
        margin: 0,
        color: "#e4e4e4",
        fontSize: "clamp(13px, 1.6vw, 15px)",
        lineHeight: 1.6,
    },
    avatarTL: {
        position: "absolute",
        left: "3.2vw",
        top: "2.8vh",
        width: "min(210px, 24vw)",
        transformOrigin: "40% 40%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.95,
    },
};

/* 간단 반응형(모바일 1열) */
(() => {
    const mq = window.matchMedia?.("(max-width: 980px)");
    if (mq && mq.matches) {
        sx.cards.gridTemplateColumns = "1fr";
        sx.cards.gap = 18;
        sx.title.fontSize = "clamp(28px, 9vw, 48px)";
    }
})();
