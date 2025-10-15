import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchWithAccess } from "../../utils/authFetch.js";
import DailyProgressModal from "../common/DailyProgressModal.jsx";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function PermanentLearningPage() {
    const [searchParams] = useSearchParams();
    const deckId = searchParams.get("deckId");
    const mode = "PERMANENT";

    const [mainCard, setMainCard] = useState(null);
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRandomCard();
    }, []);

    async function loadRandomCard() {
        setLoading(true);
        try {
            const res = await fetchWithAccess(`${BASE_URL}/api/cards/learning/permanent/random?deckId=${deckId}`);
            const data = await res.json();
            setMainCard(data.mainCard);
            setRecommended(data.recommendedCards);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function moveToThreeDay() {
        alert("이 카드를 3Day 모드로 이동하시겠습니까?");
        // TODO: POST /api/cards/move-to-3day { cardId }
    }

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h2 style={styles.title}>♾ Permanent Project</h2>
            </header>

            <div style={styles.qaSection}>
                <div style={styles.qaBox}>
                    <h4>Question</h4>
                    <div style={styles.textBox}>{mainCard?.question}</div>
                </div>
                <div style={styles.qaBox}>
                    <h4>Answer</h4>
                    <div style={styles.textBox}>{mainCard?.answer}</div>
                </div>
            </div>

            {/* Move button */}
            <div style={styles.bottomButtonBox}>
                <button onClick={moveToThreeDay} style={styles.moveBtn}>
                    Move to 3Day
                </button>
            </div>

            {/* 추천 카드 */}
            <aside style={styles.sidePanel}>
                {recommended.map((card) => (
                    <div key={card.id} style={styles.recommendCard}>
                        <p>{card.question}</p>
                    </div>
                ))}
            </aside>

            <DailyProgressModal />
        </div>
    );
}

const styles = {
    container: { display: "flex", flexDirection: "column", alignItems: "center", color: "white", backgroundColor: "#111", minHeight: "100vh", padding: "30px" },
    header: { textAlign: "center", marginBottom: 20 },
    title: { fontSize: "1.5rem", color: "#42a5f5" },
    qaSection: { width: "60%", display: "flex", flexDirection: "column", gap: 20 },
    qaBox: { background: "#222", padding: 20, borderRadius: 10 },
    textBox: { background: "#333", padding: 15, borderRadius: 8, minHeight: 100 },
    bottomButtonBox: { marginTop: 30 },
    moveBtn: { background: "#1976d2", color: "white", border: "none", borderRadius: 8, padding: "10px 25px", fontWeight: "bold", cursor: "pointer" },
    sidePanel: { position: "absolute", right: "3%", top: "20%", display: "flex", flexDirection: "column", gap: 10 },
    recommendCard: { background: "#2c2c2c", borderRadius: 8, padding: 10, width: 200, cursor: "pointer" },
    loading: { color: "white", textAlign: "center", marginTop: 100 },
};