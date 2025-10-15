import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DailyProgressModal from "./decks/DailyProgressModal.jsx";
import LearningCalendar from "./components/LearningCalendar.jsx"; // ✅ 달력 컴포넌트 분리
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function HomePage() {
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    async function fetchRecommendations() {
        const accessToken = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${BASE_URL}/api/recommendations/decks?limit=3`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok) {
                const data = await res.json();
                setRecommendations(data);
            }
        } catch (err) {
            console.error("추천 데이터 불러오기 실패:", err);
        }
    }

    const goToDeckPage = (mode) => navigate(`/decks?mode=${mode}`);
    const goToRecentDecks = () => navigate("/decks/recent");

    return (
        <div style={s.container}>
            {/* 🔹 상단 헤더 */}
            <header style={s.header}>
                <h1 style={s.logo}>🧠 The Third Tool</h1>
                <nav style={s.nav}>
                    <button style={s.navBtn}>Home</button>
                    <button style={s.navBtn}>Library</button>
                    <button
                        style={s.logoutBtn}
                        onClick={() => {
                            localStorage.removeItem("accessToken");
                            localStorage.removeItem("refreshToken");
                            navigate("/login");
                        }}
                    >
                        Logout
                    </button>
                </nav>
            </header>

            <main style={s.grid}>
                {/* 🔸 3 Day & 영구 프로젝트 */}
                <motion.div style={s.card} whileHover={{ scale: 1.02 }}>
                    <div onClick={() => goToDeckPage("THREE_DAY")}>
                        <h3 style={s.cardTitle}>3 Day Project</h3>
                        <p style={s.subText}>Review: 3일 후</p>
                    </div>
                </motion.div>

                <motion.div style={s.card} whileHover={{ scale: 1.02 }}>
                    <div onClick={() => goToDeckPage("PERMANENT")}>
                        <h3 style={s.cardTitle}>영구 프로젝트</h3>
                        <p style={s.subText}>언제든 복습</p>
                    </div>
                </motion.div>

                {/* 🔸 학습 캘린더 */}
                <motion.div style={{ ...s.card, gridColumn: "3 / span 2" }} whileHover={{ scale: 1.01 }}>
                    <LearningCalendar />
                </motion.div>

                {/* 🔸 최근 학습한 덱 */}
                <motion.div style={s.card} whileHover={{ scale: 1.02 }}>
                    <h4 style={s.sectionTitle}>최근 학습한 덱</h4>
                    <div style={s.progressBox}>
                        <h3 style={s.deckName}>3 Day Project</h3>
                        <div style={s.progressBarOuter}>
                            <div style={{ ...s.progressBarInner, width: "60%" }}></div>
                        </div>
                        <div style={s.progressFooter}>
                            <span style={s.progressText}>진행률 60%</span>
                            <button style={s.primaryBtn} onClick={goToRecentDecks}>
                                이어서 학습 →
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* 🔸 추천 덱 */}
                <motion.div style={s.card} whileHover={{ scale: 1.02 }}>
                    <h4 style={s.sectionTitle}>추천 덱</h4>
                    {recommendations.length === 0 ? (
                        <p style={s.emptyText}>로딩 중...</p>
                    ) : (
                        recommendations.map((r, i) => (
                            <div key={i} style={s.recItem}>
                                <span>{r.deckName}</span>
                                <div style={s.recBarOuter}>
                                    <div style={{ ...s.recBarInner, width: `${r.score || 70}%` }}></div>
                                </div>
                                <span style={s.recScore}>{r.score || 70}%</span>
                            </div>
                        ))
                    )}
                </motion.div>
            </main>

            <DailyProgressModal />
        </div>
    );
}

const s = {
    container: {
        backgroundColor: "#0b0b0b",
        color: "white",
        minHeight: "100vh",
        padding: "30px 60px",
        fontFamily: "Pretendard, sans-serif",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 40,
    },
    logo: { fontSize: "1.5rem", fontWeight: "700", color: "#ff3b30" },
    nav: { display: "flex", gap: "20px" },
    navBtn: {
        background: "none",
        border: "none",
        color: "#ccc",
        fontSize: "1rem",
        cursor: "pointer",
        transition: "color 0.3s",
    },
    logoutBtn: {
        background: "#ff3b30",
        border: "none",
        borderRadius: "8px",
        padding: "6px 14px",
        color: "#fff",
        cursor: "pointer",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "25px",
    },
    card: {
        background: "linear-gradient(180deg, #141414, #1b1b1b)",
        borderRadius: "14px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        transition: "transform 0.3s",
    },
    cardTitle: {
        fontSize: "1.2rem",
        fontWeight: "600",
        color: "#fff",
    },
    subText: { color: "#aaa", marginTop: "6px", fontSize: "0.9rem" },
    sectionTitle: {
        color: "#fff",
        fontSize: "1.1rem",
        marginBottom: "15px",
    },
    deckName: { fontSize: "1.1rem", color: "#fff" },
    progressBox: { marginTop: "10px" },
    progressBarOuter: {
        background: "#222",
        borderRadius: "10px",
        height: "10px",
        marginTop: "10px",
        overflow: "hidden",
    },
    progressBarInner: {
        background: "#ff3b30",
        height: "100%",
        borderRadius: "10px",
        transition: "width 0.4s",
    },
    progressFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "8px",
    },
    progressText: { color: "#ccc", fontSize: "0.85rem" },
    primaryBtn: {
        background: "#ff3b30",
        border: "none",
        padding: "6px 12px",
        borderRadius: "8px",
        color: "#fff",
        cursor: "pointer",
        fontSize: "0.85rem",
    },
    recItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "8px",
    },
    recBarOuter: {
        background: "#222",
        borderRadius: "8px",
        width: "60%",
        height: "8px",
        overflow: "hidden",
        margin: "0 10px",
    },
    recBarInner: {
        background: "#ff3b30",
        height: "100%",
        borderRadius: "8px",
        transition: "width 0.4s ease",
    },
    recScore: { fontSize: "0.85rem", color: "#ccc" },
    emptyText: { color: "#666" },
};