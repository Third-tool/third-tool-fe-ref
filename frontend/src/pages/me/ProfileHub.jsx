// src/pages/me/ProfileHub.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithAccess } from "../../utils/authFetch.js";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

const fade = (d = 0) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut", delay: d } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
});

function StyleGlobal() {
    return (
        <style>{`
      html, body { margin:0!important; padding:0!important; background:#000!important; overflow-x:hidden!important; }
      #root { background:#000!important; }
    `}</style>
    );
}

export default function ProfileHub() {
    const navigate = useNavigate();
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetchWithAccess(`${BASE_URL}/user`);
                const data = await res.json();
                setMe(data ?? null);
            } catch (e) {
                console.error("❌ 사용자 정보 로드 실패:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div style={s.wrap}>
            <StyleGlobal />
            <div style={s.bg}>
                <div style={s.glowA} />
                <div style={s.glowB} />
            </div>

            <motion.header {...fade(0.02)} style={s.header}>
                <div style={s.headerLeft}>
                    <span style={s.logo}>TTT</span>
                    <h2 style={{ margin: 0 }}>내 프로필</h2>
                </div>
                <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/home")}
                    style={s.homeBtn}
                >
                    홈으로
                </motion.button>
            </motion.header>

            <div style={s.content}>
                <motion.section {...fade(0.06)} style={s.profileCard}>
                    <div style={s.profileLeft}>
                        <div style={s.avatarLg}>준</div>
                        <div>
                            <div style={s.nameRow}>
                                <h3 style={{ margin: 0 }}>{me?.nickname || "게스트"}</h3>
                                <span style={s.roleTag}>
                  {me?.roleType ? `ROLE_${me.roleType}` : "ROLE_USER"}
                </span>
                            </div>
                            <p style={s.email}>{me?.email || "이메일 미등록"}</p>
                            <p style={s.meta}>
                                사용자명: <b>{me?.username || "-"}</b>
                                {me?.isSocial ? " · 소셜" : " · 자체"}
                            </p>
                        </div>
                    </div>

                    <div style={s.profileActions}>
                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            style={s.primaryBtn}
                            onClick={() => navigate("/settings/account")}
                        >
                            프로필 편집
                        </motion.button>
                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            style={s.ghostBtn}
                            onClick={() => navigate("/decks?filter=mine")}
                        >
                            내 덱 보기
                        </motion.button>
                    </div>
                </motion.section>

                <AnimatePresence>
                    <motion.section {...fade(0.08)} style={s.grid}>
                        <HubCard
                            title="내 덱"
                            desc="내가 만든 덱들을 관리합니다."
                            cta="바로가기"
                            onClick={() => navigate("/decks?filter=mine")}
                            emoji="🗂️"
                            delay={0.02}
                        />
                        <HubCard
                            title="공유받은 덱"
                            desc="다른 사용자에게 공유받은 덱."
                            cta="열기"
                            onClick={() => navigate("/decks?filter=shared")}
                            emoji="🤝"
                            delay={0.05}
                        />
                        <HubCard
                            title="가져온 덱(Import)"
                            desc="라이브러리에서 가져온 덱."
                            cta="확인"
                            onClick={() => navigate("/decks?filter=imported")}
                            emoji="📥"
                            delay={0.08}
                        />
                        <HubCard
                            title="내 활동"
                            desc="최근 학습/피드백 로그(추가 예정)."
                            cta="보기"
                            onClick={() => navigate("/activity")}
                            emoji="📈"
                            delay={0.11}
                        />
                        <HubCard
                            title="설정"
                            desc="계정 · 알림 · 개인정보."
                            cta="설정 열기"
                            onClick={() => navigate("/settings")}
                            emoji="⚙️"
                            delay={0.14}
                        />
                        <HubCard
                            title="도움말"
                            desc="가이드와 문의."
                            cta="도움말"
                            onClick={() => navigate("/help")}
                            emoji="❓"
                            delay={0.17}
                        />
                    </motion.section>
                </AnimatePresence>

                {loading && <p style={{ color: "#aaa" }}>로딩 중…</p>}
            </div>
        </div>
    );
}

function HubCard({ title, desc, cta, onClick, emoji, delay = 0 }) {
    return (
        <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.32, delay } }}
            whileHover={{ y: -3, boxShadow: "0 18px 50px rgba(0,0,0,0.35)" }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            style={s.card}
        >
            <div style={s.cardEmoji}>{emoji}</div>
            <div style={{ textAlign: "left" }}>
                <h4 style={s.cardTitle}>{title}</h4>
                <p style={s.cardDesc}>{desc}</p>
            </div>
            <span style={s.cardCta}>{cta} →</span>
        </motion.button>
    );
}

const s = {
    wrap: {
        minHeight: "100vh",
        background: "#000",          // ✅ 배경 통일
        color: "white",
        position: "relative",
        overflowX: "hidden",         // ✅ 가로 스크롤 방지
    },
    bg: { position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" },
    glowA: {
        position: "absolute",
        top: -220,
        left: -160,
        width: 560,
        height: 560,
        borderRadius: "50%",
        filter: "blur(180px)",
        background: "rgba(255,255,255,0.06)",
    },
    glowB: {
        position: "absolute",
        bottom: -240,
        right: -180,
        width: 620,
        height: 620,
        borderRadius: "50%",
        filter: "blur(200px)",
        background: "rgba(211,47,47,0.24)",
    },
    header: {
        position: "relative",
        zIndex: 1,
        height: 72,
        padding: "0 26px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerLeft: { display: "flex", alignItems: "center", gap: 10 },
    logo: { fontWeight: 900, color: "#d32f2f", letterSpacing: 0.5 },
    homeBtn: {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "8px 12px",
        borderRadius: 10,
        color: "white",
        cursor: "pointer",
    },
    content: {
        position: "relative",
        zIndex: 1,
        maxWidth: 1080,
        margin: "0 auto",
        padding: "24px 20px 60px",
    },
    profileCard: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: 18,
        borderRadius: 16,
        background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.32)",
    },
    profileLeft: { display: "flex", alignItems: "center", gap: 16 },
    avatarLg: {
        width: 64,
        height: 64,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(180deg,#2b2b2b,#1a1a1a)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
        fontWeight: 800,
    },
    nameRow: { display: "flex", alignItems: "center", gap: 8 },
    roleTag: {
        fontSize: 12,
        padding: "2px 8px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
    },
    email: { margin: "6px 0 0", color: "#bbb", fontSize: 14 },
    meta: { margin: "4px 0 0", color: "#9a9a9a", fontSize: 13 },
    profileActions: { display: "flex", gap: 10 },
    primaryBtn: {
        background: "#d32f2f",
        color: "white",
        border: "none",
        borderRadius: 12,
        padding: "10px 14px",
        cursor: "pointer",
        boxShadow: "0 20px 48px rgba(211,47,47,0.35)",
    },
    ghostBtn: {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "white",
        borderRadius: 12,
        padding: "10px 14px",
        cursor: "pointer",
    },
    grid: {
        marginTop: 20,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
        gap: 14,
    },
    card: {
        textAlign: "left",
        background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "white",
        borderRadius: 16,
        padding: 16,
        cursor: "pointer",
        display: "grid",
        gridTemplateColumns: "44px 1fr auto",
        alignItems: "center",
        gap: 12,
    },
    cardEmoji: {
        width: 44,
        height: 44,
        borderRadius: 12,
        display: "grid",
        placeItems: "center",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        fontSize: 22,
    },
    cardTitle: { margin: 0, fontSize: 16 },
    cardDesc: { margin: "4px 0 0", color: "#bdbdbd", fontSize: 13 },
    cardCta: { color: "#fff", opacity: 0.9, fontWeight: 600 },
};
