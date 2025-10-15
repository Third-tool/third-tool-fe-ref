import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { fetchWithAccess } from "../../utils/authFetch.js";
import DailyProgressModal from "../decks/DailyProgressModal.jsx";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function ThreeDayLearningPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const deckId = searchParams.get("deckId");
    const rankName = searchParams.get("rankName");
    const mode = searchParams.get("mode") || "THREE_DAY";
    const cardId = searchParams.get("cardId"); // ✅ 카드 ID 유무로 학습 방식 분기

    const [mainCard, setMainCard] = useState(null);
    const [recommended, setRecommended] = useState([]);
    const [remaining, setRemaining] = useState(0);
    const [loading, setLoading] = useState(true);

    /** ✅ 학습 데이터 로드 */
    useEffect(() => {
        if (cardId) loadSpecificCard(); // 특정 카드 학습
        else loadRandomCard();          // 랜덤 학습
    }, [cardId, deckId, rankName]);

    /** ✅ 특정 카드 학습 */
    async function loadSpecificCard() {
        setLoading(true);
        try {
            const res = await fetchWithAccess(
                `${BASE_URL}/api/cards/${cardId}/learning?deckId=${deckId}&mode=${mode}&rankName=${rankName}`
            );
            const data = await res.json();
            setMainCard(data.mainCard);
            setRecommended(data.recommendedCards);
            setRemaining(data.totalRemaining);
        } catch (e) {
            console.error("❌ 특정 카드 학습 로드 실패:", e);
        } finally {
            setLoading(false);
        }
    }

    /** ✅ 랜덤 학습 */
    async function loadRandomCard() {
        setLoading(true);
        try {
            const res = await fetchWithAccess(
                `${BASE_URL}/api/cards/learning/random?deckId=${deckId}&mode=${mode}&rankName=${rankName}`
            );
            const data = await res.json();
            setMainCard(data.mainCard);
            setRecommended(data.recommendedCards);
            setRemaining(data.totalRemaining);
        } catch (e) {
            console.error("❌ 랜덤 카드 로드 실패:", e);
        } finally {
            setLoading(false);
        }
    }

    /** ✅ 피드백 버튼 클릭 */
    function handleFeedback(feedback) {
        console.log("Feedback:", feedback);
        // TODO: feedback API 호출 예정
        loadRandomCard(); // 다음 카드 자동 로드
    }

    /** ✅ 추천 카드 클릭 → 해당 카드로 이동 */
    function handleRecommendedClick(nextCardId) {
        navigate(
            `/learning/three-day?deckId=${deckId}&cardId=${nextCardId}&mode=${mode}&rankName=${rankName}`
        );
    }

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.container}>
            {/* 🔹 좌측 메인 학습 구역 */}
            <div style={styles.leftPane}>
                <header style={styles.header}>
                    <h2 style={styles.title}>🧠 3 Day Project</h2>
                    <p style={styles.subTitle}>Remaining: {remaining}</p>
                </header>

                {/* Question / Answer */}
                <div style={styles.qaSection}>
                    <div style={styles.qaBox}>
                        <h4 style={styles.qaTitle}>Question</h4>
                        <div style={styles.textBox}>{mainCard?.question}</div>
                    </div>
                    <div style={styles.qaBox}>
                        <h4 style={styles.qaTitle}>Answer</h4>
                        <div style={styles.textBox}>{mainCard?.answer}</div>
                    </div>
                </div>

                {/* Feedback Buttons */}
                <div style={styles.feedbackBar}>
                    {["Again", "Hard", "Good", "Easy"].map((label, idx) => (
                        <button
                            key={label}
                            style={{
                                ...styles.feedbackBtn,
                                backgroundColor: ["#c62828", "#ef6c00", "#fdd835", "#43a047"][idx],
                            }}
                            onClick={() => handleFeedback(label)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 🔹 우측 추천 카드 리스트 */}
            <div style={styles.rightPane}>
                <h4 style={styles.recommendTitle}>Recommended Cards</h4>
                <div style={styles.recommendList}>
                    {recommended.map((card) => (
                        <div
                            key={card.id}
                            style={styles.recommendCard}
                            onClick={() => handleRecommendedClick(card.id)}
                        >
                            <p style={styles.recommendText}>{card.question}</p>
                        </div>
                    ))}
                </div>
            </div>

            <DailyProgressModal />
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "40px 60px",
        gap: "40px",
    },
    /* 왼쪽 메인 카드 */
    leftPane: {
        flex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    header: { textAlign: "center", marginBottom: 25 },
    title: { fontSize: "1.6rem", color: "#f44336", fontWeight: "600" },
    subTitle: { color: "#aaa", marginTop: 4 },
    qaSection: {
        width: "90%",
        display: "flex",
        flexDirection: "column",
        gap: 25,
        marginBottom: 20,
    },
    qaBox: { background: "#1f1f1f", padding: 20, borderRadius: 12 },
    qaTitle: { color: "#bbb", fontSize: "0.9rem", marginBottom: 8 },
    textBox: {
        background: "#2b2b2b",
        padding: 20,
        borderRadius: 10,
        minHeight: 100,
        fontSize: "1rem",
        lineHeight: "1.5rem",
    },
    feedbackBar: {
        display: "flex",
        justifyContent: "space-between",
        width: "90%",
        marginTop: 25,
        gap: 8,
    },
    feedbackBtn: {
        flex: 1,
        padding: "10px 0",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: "bold",
        transition: "transform 0.2s",
    },
    /* 오른쪽 추천 카드 스타일 수정 */
    recommendList: {
        flex: 1,
        overflowY: "auto",
        paddingRight: 8,
        scrollbarWidth: "thin",
        scrollbarColor: "#555 #222",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    recommendCard: {
        background: "#2b2b2b",
        borderRadius: 8,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        transition: "background 0.2s, transform 0.2s",
    },
    recommendCardHover: {
        background: "#383838",
        transform: "scale(1.02)",
    },
    recommendText: {
        fontSize: "0.9rem",
        color: "#eee",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
    },
    loading: { color: "white", textAlign: "center", marginTop: 100 },
};