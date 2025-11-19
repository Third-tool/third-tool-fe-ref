import React from "react";
import { motion } from "framer-motion";

/* 더 많은 카드 + 일부는 바깥으로 걸치게 */
const FALL_CARDS = [
    { delay: 0.05, x: -8,  rot: -4 },
    { delay: 0.10, x: 12,  rot: 6  },
    { delay: 0.16, x: -4,  rot: -2 },
    { delay: 0.22, x: 24,  rot: 10 }, // ▶ 바깥으로
    { delay: 0.28, x: -26, rot: -8 }, // ◀ 바깥으로
    { delay: 0.34, x: 10,  rot: 5  },
    { delay: 0.40, x: -14, rot: -6 },
];

const POINTS = [
    { emoji: "📈", tint: "linear-gradient(180deg,#ffe9e2,#fff5f2)", t1: "노출 빈도가", strong: "중요도", tail: "를 대신한다" },
    { emoji: "🗂️", tint: "linear-gradient(180deg,#fff8de,#fff3c4)", t1: "저장은 늘고,", strong: "재노출", tail: "은 줄어든다" },
    { emoji: "🧠", tint: "linear-gradient(180deg,#e8fff1,#d7ffe6)", t1: "보고도", strong: "장기기억", tail: "으로 옮겨가지 못한다" },
];

export default function SlideProblem() {
    const bottomY = 280; // 카드가 쌓일 y

    return (
        <section style={sx.section}>
            <div style={sx.inner}>
                {/* ⬅ 텍스트/포인트 — 즉시 애니메이션 */}
                <motion.div
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    style={sx.left}
                >
                    <h2 style={sx.h2}>
                        AI 이후, <span style={{ color: sx.red }}>쏟아지는 정보</span>의 시대
                    </h2>

                    <p style={sx.lead}>
                        개인이 관리해야 할 지식이 폭증했습니다. 그 결과{" "}
                        <strong>무엇이 더 중요하고 무엇을 관리해야 하는지</strong>를{" "}
                        <strong>착각하는 시대</strong>가 되었습니다.
                    </p>

                    <div style={sx.pointList}>
                        {POINTS.map((p, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * i }}
                                style={sx.pointRow}
                            >
                                <div style={{ ...sx.iconBox, background: p.tint }}>{p.emoji}</div>
                                <div style={sx.pointText}>
                                    <div style={sx.pointLine1}>{p.t1}</div>
                                    <div style={sx.pointLine2}>
                                        <strong style={sx.pointStrong}>{p.strong}</strong>
                                        <span> {p.tail}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* 콜아웃 */}

                </motion.div>

                {/* ➡ 폰 목업 — 반응형 크기 + 카드 낙하 */}
                <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.05 }}
                    style={sx.right}
                >
                    <div style={sx.phone}>
                        <div style={sx.topBar}><span style={sx.topDot} /></div>

                        <div style={sx.headerArea}>
                            <div style={sx.headerTitle}>알림</div>
                            <div style={sx.headerRight}>⚙️</div>
                        </div>

                        {/* 상단 큰 버블 */}
                        <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={sx.bigBubble}
                        >
                            <span style={sx.redBadge}>1</span>
                            <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>
                                chat gpt 😢
                            </div>
                            <div style={{ color: "#9aa0a6" }}>
                                도대체 그 많은 컴공 졸업생들과 부트캠프 졸업자들은 어디로 간 걸까요? 이를 분석하는 재밌는 연구가…
                            </div>
                        </motion.div>

                        {/* 내부 화면(하얀색). 카드가 바깥에 걸쳐 보이도록 overflow visible */}
                        <div style={sx.screenWrap}>
                            <div style={sx.screen}>
                                {FALL_CARDS.map((c, i) => (
                                    <motion.div
                                        key={i}
                                        style={{
                                            ...sx.listCard,
                                            zIndex: 10 + i,
                                            left: `calc(16px + ${c.x}px)`,
                                            right: `calc(16px - ${c.x}px)`,
                                            transformOrigin: "50% 10%",
                                        }}
                                        initial={{ y: -220, rotate: 0, opacity: 0 }}
                                        animate={{
                                            // ✅ tween(기본)으로 3개 keyframe 허용
                                            y: [-220, bottomY - 12, bottomY + i * 3],
                                            rotate: [0, c.rot * 1.5, c.rot],
                                            opacity: 1,
                                        }}
                                        transition={{
                                            delay: c.delay,
                                            duration: 1.05,
                                            ease: "easeOut", // type 지정 X → tween
                                        }}
                                    >
                                        <div style={sx.rowMeta}>
                                            <span style={sx.dot} />
                                            <span style={sx.small}>방금 전 · 3분 읽기</span>
                                        </div>
                                        <div style={sx.rowTitle}>{i + 1}. 모델 업데이트 · New benchmarks</div>
                                    </motion.div>
                                ))}
                                <div style={sx.floorShadow} />
                            </div>

                            <div style={sx.tabbar}>
                                <span>🏠</span><span>🔎</span><span>🧠</span><span>👤</span>
                            </div>
                            <div style={sx.homeBar} />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* ===== styles ===== */
const sx = {
    red: "#e53935",
    section: {
        scrollSnapAlign: "start",
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        padding: "80px 6%",
    },
    inner: {
        width: "min(1150px, 96vw)",
        display: "grid",
        gridTemplateColumns: "1.05fr 1fr",
        gap: 36,
        alignItems: "center",
    },
    left: { display: "grid", alignContent: "start", gap: 16 },
    right: { display: "grid", placeItems: "center" },

    h2: { fontSize: "2.2rem", fontWeight: 900, margin: 0, letterSpacing: "-.02em" },
    lead: { color: "#ddd", lineHeight: 1.75, margin: "6px 0 2px" },

    /* 타일 포인트 */
    pointList: { display: "grid", gap: 18, marginTop: 10 },
    pointRow: { display: "flex", alignItems: "center", gap: 18 },
    iconBox: {
        width: 58, height: 58, borderRadius: 16,
        display: "grid", placeItems: "center",
        fontSize: 26, boxShadow: "0 8px 18px rgba(0,0,0,.12)",
    },
    pointText: { display: "grid", gap: 4 },
    pointLine1: { fontSize: 20, fontWeight: 700, color: "#e7ebf0" },
    pointLine2: { fontSize: 24, fontWeight: 900, color: "#e7ebf0" },
    pointStrong: { color: "#ffffff", textShadow: "0 2px 10px rgba(255,255,255,.12)" },

    callout: {
        marginTop: 12,
        padding: "12px 14px",
        background: "linear-gradient(180deg,#171717,#111)",
        border: "1px solid #2a2a2a",
        borderRadius: 12,
        display: "flex", alignItems: "center", gap: 10,
    },
    arrow: { display: "inline-block", color: "#fff", fontWeight: 900, marginRight: 2 },

    /* Phone — 반응형 크기 */
    phone: {
        width: "clamp(260px, 32vw, 360px)",
        borderRadius: 44,
        background: "#f7f8fa",
        border: "1px solid #eceff3",
        boxShadow: "0 30px 80px rgba(0,0,0,.35)",
        padding: 12,
        position: "relative",
        overflow: "visible",
    },
    topBar: { display: "grid", placeItems: "center" },
    topDot: { width: "40%", height: 8, borderRadius: 99, background: "#e1e6ee" },

    headerArea: {
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        padding: "8px 10px 0",
        color: "#202124",
    },
    headerTitle: { fontWeight: 800 },
    headerRight: { opacity: 0.55 },

    tabs: {
        display: "flex",
        gap: 14,
        padding: "6px 10px 6px",
        borderBottom: "1px solid #eceff3",
        color: "#5f6368",
        fontSize: 12,
    },
    tabMuted: { opacity: 0.6 },
    tabActive: {
        color: "#202124",
        fontWeight: 800,
        borderBottom: "3px solid #202124",
        paddingBottom: 6,
    },

    bigBubble: {
        position: "absolute",
        left: "6%", right: "6%", top: 62,
        background: "#ffffff", color: "#202124",
        padding: "12px 14px", borderRadius: 16,
        border: "1px solid #eef1f5",
        boxShadow: "0 16px 32px rgba(0,0,0,.10)",
        zIndex: 30, pointerEvents: "none",
    },
    redBadge: {
        display: "inline-grid", placeItems: "center",
        width: 24, height: 24, borderRadius: 999,
        background: "#ff4d3d", color: "#fff", fontWeight: 900, marginRight: 8,
    },

    screenWrap: { marginTop: 110 },
    screen: {
        position: "relative",
        height: "clamp(360px, 40vw, 520px)",
        margin: "0 6px",
        borderRadius: 26,
        overflow: "visible",
        background: "#ffffff",
        border: "1px solid #e9edf2",
    },

    listCard: {
        position: "absolute",
        top: 14,
        padding: "12px 14px 10px",
        borderRadius: 14,
        background: "#ffffff",
        border: "1px solid #eaeef4",
        boxShadow: "0 10px 28px rgba(0,0,0,.12)",
    },
    rowMeta: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
    dot: { width: 6, height: 6, borderRadius: 999, background: "#ff5a4e", display: "inline-block" },
    small: { fontSize: 12, color: "#8a8f98" },
    rowTitle: { fontSize: 14, fontWeight: 800, color: "#1f2328" },

    floorShadow: {
        position: "absolute",
        left: 16, right: 16, bottom: 10,
        height: 12, borderRadius: 12,
        background: "radial-gradient(ellipse at center, rgba(0,0,0,.35), rgba(0,0,0,0))",
    },

    tabbar: {
        margin: "10px 18px 8px",
        height: 34, borderRadius: 14,
        background: "#f4f6f9",
        border: "1px solid #e9edf2",
        color: "#8a8f98",
        display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        placeItems: "center", fontSize: 18,
    },
    homeBar: {
        width: "40%", height: 6, borderRadius: 999,
        background: "#e1e6ee", margin: "6px auto 2px",
    },
};
