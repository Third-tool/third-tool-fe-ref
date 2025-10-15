import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithAccess } from "../../utils/authFetch.js";
import DailyProgressModal from "../decks/DailyProgressModal.jsx";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function ThreeDayLearningPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const deckId = searchParams.get("deckId");
    const rankName = searchParams.get("rankName");
    const mode = searchParams.get("mode") || "THREE_DAY";
    const cardId = searchParams.get("cardId");

    const [mainCard, setMainCard] = useState(null);
    const [recommended, setRecommended] = useState([]);
    const [remaining, setRemaining] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        if (cardId) loadSpecificCard();
        else loadRandomCard();
    }, [cardId, deckId, rankName]);

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
            setShowAnswer(false);
        } catch (e) {
            console.error("❌ 특정 카드 학습 로드 실패:", e);
        } finally {
            setLoading(false);
        }
    }

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
            setShowAnswer(false);
        } catch (e) {
            console.error("❌ 랜덤 카드 로드 실패:", e);
        } finally {
            setLoading(false);
        }
    }

    function handleFeedback(feedback) {
        console.log("Feedback:", feedback);
        loadRandomCard();
    }

    function handleRecommendedClick(nextCardId) {
        navigate(
            `/learning/three-day?deckId=${deckId}&cardId=${nextCardId}&mode=${mode}&rankName=${rankName}`
        );
    }

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.container}>
            {/* 🔹 좌측 메인 학습 영역 */}
            <div style={styles.leftPane}>
                <div style={styles.topBar}>
                    <h1 style={styles.logo}>
                        TTT <span style={styles.project}>3Day Project</span>
                    </h1>
                    <div style={styles.deckInfo}>
                        <h3 style={styles.deckName}>{mainCard?.deckName || "Chinese Grammar"}</h3>
                        <p style={styles.remaining}>남은 카드 {remaining}</p>
                    </div>
                </div>

                {/* 메인 카드 */}
                <motion.div
                    style={styles.cardBox}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <p style={styles.label}>Question</p>

                    {/* 카드 본체 */}
                    <motion.div
                        style={styles.questionArea}
                        whileHover={{ rotateY: 2, scale: 1.02 }}
                        onClick={() => setShowAnswer(!showAnswer)}
                    >
                        <AnimatePresence mode="wait">
                            <motion.h2
                                key={showAnswer ? "answer" : "question"}
                                initial={{ rotateY: 90, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                exit={{ rotateY: -90, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                style={styles.questionText}
                            >
                                {showAnswer ? mainCard?.answer : mainCard?.question}
                            </motion.h2>
                        </AnimatePresence>

                        {!showAnswer && <p style={styles.tapHint}>Tap to show answer (Space)</p>}
                        <div style={styles.glowEffect}></div>
                    </motion.div>
                </motion.div>

                {/* 피드백 버튼 */}
                <div style={styles.feedbackBar}>
                    {[
                        { label: "다시", color: "#222", border: "1px solid #555" },
                        { label: "어려움", color: "#8B0000" },
                        { label: "보통", color: "#E5A50A" },
                        { label: "쉬움", color: "#1B8A3E" },
                    ].map((btn, i) => (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            style={{
                                ...styles.feedbackBtn,
                                backgroundColor: btn.color,
                                border: btn.border,
                            }}
                            onClick={() => handleFeedback(btn.label)}
                        >
                            {btn.label}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* 🔹 우측 추천 카드 리스트 */}
            <motion.div
                style={styles.rightPane}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <h4 style={styles.recommendTitle}>다른 카드 미리보기</h4>
                <div style={styles.recommendList}>
                    {recommended.map((card, i) => (
                        <motion.div
                            key={card.id}
                            whileHover={{ scale: 1.05, x: 5 }}
                            style={{
                                ...styles.recommendCard,
                                borderLeft: `5px solid ${[
                                    "#FF7B00",
                                    "#FF4C4C",
                                    "#C040FF",
                                    "#3FD7BE",
                                    "#00CC66",
                                ][i % 5]}`,
                            }}
                            onClick={() => handleRecommendedClick(card.id)}
                        >
                            <p style={styles.recommendText}>{card.question}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <DailyProgressModal />
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        background:
            "radial-gradient(circle at top, rgba(30,30,30,1), rgba(5,5,5,1) 90%)",
        color: "#fff",
        height: "100vh",
        padding: "40px 60px",
        gap: "40px",
        perspective: "1200px", // 광각 느낌
        overflow: "hidden",
    },
    leftPane: {
        flex: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
    },
    topBar: {
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    logo: { color: "#f44336", fontSize: "1.3rem", fontWeight: 700 },
    project: { color: "#ccc", fontWeight: 500, marginLeft: 6 },
    deckInfo: { textAlign: "right" },
    deckName: { fontSize: "1.1rem", color: "#eee" },
    remaining: { color: "#999", fontSize: "0.9rem" },
    cardBox: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #111 0%, #191919 100%)",
        borderRadius: 16,
        padding: 40,
        width: "85%",
        boxShadow: "0 0 40px rgba(255,255,255,0.05), 0 0 80px rgba(255,255,255,0.02)",
        transformStyle: "preserve-3d",
    },
    label: { color: "#888", fontSize: "0.9rem", marginBottom: 10 },
    questionArea: {
        background: "linear-gradient(145deg, #101010, #0b0b0b)",
        borderRadius: 14,
        padding: "60px 40px",
        textAlign: "center",
        width: "100%",
        cursor: "pointer",
        position: "relative",
        transformStyle: "preserve-3d",
        boxShadow: "inset 0 0 30px rgba(255,255,255,0.05)",
    },
    glowEffect: {
        content: '""',
        position: "absolute",
        top: "-10%",
        left: "-10%",
        width: "120%",
        height: "120%",
        background:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1), transparent 70%)",
        borderRadius: "16px",
        zIndex: 0,
        pointerEvents: "none",
        mixBlendMode: "overlay",
        filter: "blur(30px)",
    },
    questionText: {
        fontSize: "1.8rem",
        lineHeight: "2.5rem",
        fontWeight: "600",
        zIndex: 2,
        position: "relative",
    },
    tapHint: { fontSize: "0.9rem", color: "#aaa", marginTop: 20 },
    feedbackBar: {
        display: "flex",
        justifyContent: "space-between",
        width: "85%",
        marginTop: 25,
        gap: 10,
    },
    feedbackBtn: {
        flex: 1,
        padding: "12px 0",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "1rem",
        transition: "transform 0.2s",
    },
    rightPane: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    recommendTitle: {
        fontSize: "1.1rem",
        color: "#ccc",
        marginBottom: 10,
    },
    recommendList: {
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 10,
    },
    recommendCard: {
        background: "#1a1a1a",
        borderRadius: 8,
        padding: "14px 18px",
        cursor: "pointer",
        transition: "background 0.2s",
        boxShadow: "0 0 10px rgba(255,255,255,0.05)",
    },
    recommendText: {
        color: "#eee",
        fontSize: "0.95rem",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
    },
    loading: { color: "#fff", textAlign: "center", marginTop: 100 },
};