// src/components/slides/SlideWhy.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import PersonWithLaptopSVG from "../PersonWithLaptopSVG.jsx";

/** WHY 페이지: 카드 호버 시에만 아바타가 반응 */
export default function SlideWhy() {
    const [isHoveringCard, setIsHoveringCard] = useState(false);

    return (
        <section style={sx.section}>
            {/* 그리드 라인만 활성화 (레드 글로우 OFF) */}
            <div aria-hidden style={sx.gridBg} />
            <div aria-hidden style={sx.redGlow} /> {/* ← glow OFF */}

            {/* 우하단 아바타 — 카드 호버시만 살짝 움직임 */}
            <motion.div
                aria-hidden
                animate={
                    isHoveringCard
                        ? { x: -8, y: -10, rotate: -2, scale: 1.02 }
                        : { x: 0, y: 0, rotate: -6, scale: 1 }
                }
                transition={{ type: "spring", stiffness: 220, damping: 16 }}
                style={sx.avatarBR}
            >
                <PersonWithLaptopSVG float={false} />
            </motion.div>

            <div style={sx.inner}>
                {/* 상단 메타 */}
                <div style={sx.metaRow}>
                    <span style={sx.metaLeft}>2030</span>
                    <a href="#" style={sx.metaRight}>www.the.third-tool.com</a>
                </div>

                {/* 큰 제목 */}
                <h1 style={sx.title}>
                    WHY <span style={sx.titleThin}> — THIRD TOOL</span>
                </h1>

                {/* 3열 카드 */}
                <div style={sx.cards}>
                    <RoleCard
                        titleTop="학습 에너지의 한계"
                        titleBottom="Finite Daily Energy"
                        body={[
                            "하루 에너지는 유한합니다.",
                            "중요도에 따라 분배하지 않으면 금방 소진됩니다.",
                        ]}
                        onHoverChange={setIsHoveringCard}
                    />
                    <RoleCard
                        titleTop="마이크로화가 필요한 이유"
                        titleBottom="Make It Micro"
                        body={[
                            "지식을 작게 쪼개면 진입 장벽이 낮아집니다.",
                            "짧고 잦은 반복이 가능해집니다.",
                        ]}
                        onHoverChange={setIsHoveringCard}
                    />
                    <RoleCard
                        titleTop="점수 기반 우선순위"
                        titleBottom="Score-Driven Focus"
                        body={[
                            "score/랭크로 중요한 카드가 먼저 노출됩니다.",
                            "노출 빈도를 제어해 장기기억으로 보냅니다.",
                        ]}
                        onHoverChange={setIsHoveringCard}
                    />
                </div>

                <div style={sx.presenter}>DIRECTED BY : Team, Third Tool</div>
            </div>
        </section>
    );
}

/* 공통 카드 — 상단 붉은 탭 + 두 점 + 본문
   onHoverChange(true/false)로 부모에 호버 상태 전달 */
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
        opacity: 0.28,
        pointerEvents: "none",
    },
    // 🔕 Glow OFF
    redGlow: {
        position: "absolute",
        inset: 0,
        background: "none",
        opacity: 0,
        pointerEvents: "none",
        display: "none",
    },
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
        color: "#ff4d46",
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
    avatarBR: {
        position: "absolute",
        right: "3.2vw",
        bottom: "3.4vh",
        width: "min(220px, 26vw)",
        transformOrigin: "70% 100%",
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
