import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DailyProgressModal from "./decks/DailyProgressModal.jsx";

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

    // ✅ 추천 덱 클릭 시 해당 덱 상세 페이지로 이동
    const handleClickRecommendation = (deckId) => {
        navigate(`/decks/${deckId}?mode=THREE_DAY`);
    };

    return (
        <div style={s.container}>
            <header style={s.header}>
                <h2>The Third Tool</h2>
                <nav>
                    <button style={s.tab}>Home</button>
                    <button style={s.tab}>Library</button>
                    <button
                        onClick={() => {
                            localStorage.removeItem("accessToken");
                            localStorage.removeItem("refreshToken");
                            navigate("/login");
                        }}
                        style={s.logoutBtn}
                    >
                        Logout
                    </button>
                </nav>
            </header>

            <main style={s.main}>
                {/* 프로젝트 선택 */}
                <div style={s.section}>
                    <div style={s.deckCard} onClick={() => goToDeckPage("THREE_DAY")}>
                        <h3>3 Day Project</h3>
                        <p>짧은 주기 집중 학습</p>
                    </div>

                    <div style={s.deckCard} onClick={() => goToDeckPage("PERMANENT")}>
                        <h3>영구 프로젝트</h3>
                        <p>장기 복습 관리</p>
                    </div>
                </div>

                {/* 최근 덱 섹션 */}
                <div style={s.section}>
                    <h4>최근 학습한 덱</h4>
                    <div
                        style={{ ...s.deckCard, backgroundColor: "#2a2a2a" }}
                        onClick={goToRecentDecks}
                    >
                        <h3>최근 학습 보기</h3>
                        <p>마지막 복습 기준으로 정렬</p>
                    </div>
                </div>
            </main>

            {/* ✅ 추천 3줄 박스 */}
            <div style={s.recommendationBox}>
                <h4 style={s.recTitle}>📚 오늘의 추천 덱</h4>
                {recommendations.length === 0 ? (
                    <p style={s.recEmpty}>로딩 중...</p>
                ) : (
                    recommendations.map((r) => (
                        <div
                            key={r.deckId}
                            style={s.recItem}
                            onClick={() => handleClickRecommendation(r.deckId)}
                        >
                            <strong>{r.deckName}</strong>
                            <p style={s.recReason}>{r.reason}</p>
                        </div>
                    ))
                )}
            </div>

            {/* ✅ 진행률 모달 버튼 */}
            <DailyProgressModal />
        </div>
    );
}

const s = {
    container: {
        backgroundColor: "#121212",
        color: "#fff",
        minHeight: "100vh",
        padding: "20px",
        position: "relative",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #333",
        paddingBottom: 10,
    },
    tab: {
        background: "none",
        color: "white",
        border: "none",
        margin: "0 10px",
        cursor: "pointer",
        fontSize: "1rem",
    },
    logoutBtn: {
        background: "#ff5252",
        border: "none",
        color: "white",
        padding: "8px 16px",
        borderRadius: 5,
        cursor: "pointer",
    },
    main: { marginTop: 30 },
    section: { marginBottom: 30 },
    deckCard: {
        backgroundColor: "#1f1f1f",
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        cursor: "pointer",
        transition: "0.2s",
    },

    /** ✅ 추천 박스 */
    recommendationBox: {
        position: "fixed",
        bottom: "80px",
        right: "20px",
        backgroundColor: "#1e1e1e",
        borderRadius: "10px",
        padding: "12px 18px",
        width: "270px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
        fontSize: "0.85rem",
        zIndex: 99,
    },
    recTitle: {
        fontSize: "0.9rem",
        marginBottom: "8px",
        borderBottom: "1px solid #333",
        paddingBottom: "4px",
        color: "#ffcc66",
    },
    recItem: {
        marginBottom: "8px",
        backgroundColor: "#2a2a2a",
        borderRadius: "6px",
        padding: "8px 10px",
        cursor: "pointer",
        transition: "all 0.25s ease",
    },
    recItemHover: {
        backgroundColor: "#383838",
        transform: "scale(1.03)",
    },
    recReason: {
        color: "#bbb",
        fontSize: "0.75rem",
        marginTop: "3px",
    },
    recEmpty: {
        fontSize: "0.8rem",
        color: "#777",
    },
};