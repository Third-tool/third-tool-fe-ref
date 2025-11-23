import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithAccess } from "../../utils/authFetch.js";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;
const ACCENT = "#f66957"; // 새 Accent 색상
const lift = { whileHover: { y: -2, scale: 1.01 }, whileTap: { scale: 0.98 } };

// SVG 아이콘 정의
const Icons = {
    Home: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    ),
    ArrowLeft: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
    ),
    Lightning: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
    ),
};

export default function ThreeDayLearningPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const deckId = searchParams.get("deckId");
    const rankName = searchParams.get("rankName");
    const mode = searchParams.get("mode") || "THREE_DAY";
    const cardId = searchParams.get("cardId");

    const [card, setCard] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [recommended, setRecommended] = useState([]);
    const [remaining, setRemaining] = useState(0);
    const [loading, setLoading] = useState(true);
    const [feedbackSent, setFeedbackSent] = useState(false);

    /* ============ 카드 데이터 로드 ============ */
    useEffect(() => {
        loadCardData();
        loadRemainingCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardId, deckId, rankName]);

    async function loadCardData() {
        setLoading(true);
        setFeedbackSent(false);

        try {
            // rankName 있으면 모든 요청에 붙여주는 공통쿼리
            const rankQS = rankName ? `&rankName=${rankName}` : "";

            // 🔹 메인 카드 URL
            const mainUrl = cardId
                ? `${BASE_URL}/api/cards/${cardId}/learning/main?deckId=${deckId}&mode=${mode}${rankQS}`
                : `${BASE_URL}/api/cards/learning/random/main?deckId=${deckId}&mode=${mode}&rankName=${rankName || "SILVER"}`;

            // 🔹 추천 카드 URL
            const recUrl = cardId
                ? `${BASE_URL}/api/cards/${cardId}/learning/recommendations?deckId=${deckId}&mode=${mode}${rankQS}`
                : `${BASE_URL}/api/cards/learning/random/recommendations?deckId=${deckId}&mode=${mode}&rankName=${rankName || "SILVER"}`;

            // 🔹 병렬 호출
            const [mainData, recData] = await Promise.all([
                fetchWithAccess(mainUrl).then((r) => r.json()),
                fetchWithAccess(recUrl).then((r) => r.json()),
            ]);

            // 🔹 메인 카드 포맷팅
            const formatted = {
                id: mainData.id,
                question: mainData.question,
                answer: mainData.answer,
                questionImage:
                    mainData.thumbnailUrl ||
                    mainData.images?.questionImages?.[0]?.imageUrl ||
                    mainData.images?.[0]?.imageUrl ||
                    null,
                answerImage:
                    mainData.images?.answerImages?.[0]?.imageUrl ||
                    mainData.images?.[1]?.imageUrl ||
                    null,
            };

            // 🔹 추천카드 포맷팅
            const normalizedRec = (recData || []).map((r) => ({
                ...r,
                _thumb:
                    r.thumbnailUrl ||
                    r.images?.questionImages?.[0]?.imageUrl ||
                    r.images?.[0]?.imageUrl ||
                    r.images?.answerImages?.[0]?.imageUrl ||
                    null,
            }));

            setCard(formatted);
            setRecommended(normalizedRec);
            setShowAnswer(false);
        } catch (err) {
            console.error("❌ 카드 로드 실패:", err);
        } finally {
            setLoading(false);
        }
    }

    async function loadRemainingCount() {
        try {
            const rankQS = rankName ? `&rankName=${rankName}` : "";
            const res = await fetchWithAccess(
                `${BASE_URL}/api/cards/learning/count?deckId=${deckId}&mode=${mode}${rankQS}`
            );
            const data = await res.json();
            setRemaining(data.remainingCount ?? 0);
        } catch (err) {
            console.error("❌ 잔여 카드 개수 실패:", err);
        }
    }

    /* ============ 피드백 ============ */
    async function sendFeedback(feedbackType) {
        if (feedbackSent) return;
        setFeedbackSent(true);

        const FEEDBACK_MAP = {
            AGAIN: "BAD",
            HARD: "NORMAL",
            NORMAL: "NORMAL",
            GOOD: "GOOD",
            GREAT: "GREAT",
        };

        try {
            await fetchWithAccess(`${BASE_URL}/api/cards/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cardId: card.id,
                    feedback: FEEDBACK_MAP[feedbackType] ?? feedbackType,
                    rankType: rankName || "SILVER",
                }),
            });
        } catch (err) {
            console.error("❌ 피드백 실패:", err);
            setFeedbackSent(false);
        }
    }

    /* ============ 스페이스바 토글 ============ */
    useEffect(() => {
        const onKey = (e) => {
            if (e.code === "Space") {
                e.preventDefault();
                setShowAnswer((v) => !v);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    if (loading || !card) return <div style={sx.loading}>Loading...</div>;

    /* ============ UI ============ */
    return (
        <div style={sx.container}>
            {/* 🔒 전역 스타일 (배경, 스크롤바 숨김) */}
            <style>{`
        html, body { margin:0!important; padding:0!important; background:#000!important; overflow:hidden!important; }
        #root { background:#000!important; }
        .ttt-hide-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .ttt-hide-scroll::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>

            {/* 상단 네비 (디자인 변경) */}
            <header style={sx.topNav}>
                <motion.button {...lift} onClick={() => navigate("/home")} style={sx.secondaryBtn}>
                    <Icons.Home />
                    <span style={{ marginLeft: '8px' }}>홈</span>
                </motion.button>
                <motion.button
                    {...lift}
                    onClick={() => navigate(`/decks/${deckId}?mode=${mode}`)}
                    style={sx.secondaryBtn}
                >
                    <Icons.ArrowLeft />
                    <span style={{ marginLeft: '8px' }}>덱으로</span>
                </motion.button>
            </header>

            {/* 좌측 학습 카드 */}
            <div style={sx.mainPanel}>
                <header style={sx.header}>
                    <h1 style={sx.h1}>
                        <span style={sx.titleIcon}><Icons.Lightning /></span>
                        3 Day Project
                    </h1>
                    <p style={sx.remaining}>남은 카드 {remaining}</p>
                </header>

                <motion.div
                    style={sx.cardBox}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setShowAnswer((v) => !v)}
                >
                    <p style={sx.label}>{showAnswer ? "Answer" : "Question"}</p>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={showAnswer ? "answer" : "question"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.35 }}
                            style={sx.scrollArea}
                            className="ttt-hide-scroll"
                        >
                            {/* ✅ showAnswer에 따라 텍스트 스위칭 */}
                            <div style={sx.textBlock}>
                                {showAnswer ? card.answer : card.question}
                            </div>

                            {/* ✅ showAnswer에 따라 이미지 스위칭 */}
                            {(showAnswer ? card.answerImage : card.questionImage) && (
                                <img
                                    src={showAnswer ? card.answerImage : card.questionImage}
                                    alt="card"
                                    style={sx.image}
                                    onError={(e) => (e.currentTarget.style.display = "none")}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {!showAnswer && <p style={sx.hint}>스페이스바/클릭으로 답변 보기</p>}
                </motion.div>

                {/* 피드백 / 안내 (디자인 변경) */}
                <AnimatePresence>
                    {!feedbackSent ? (
                        <motion.div
                            style={sx.feedbackRow}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* "다시" 버튼만 Primary(ACCENT)로 강조 */}
                            <motion.button {...lift} onClick={() => sendFeedback("AGAIN")} style={sx.primaryBtn}>
                                다시
                            </motion.button>
                            <motion.button {...lift} onClick={() => sendFeedback("HARD")} style={sx.secondaryBtn}>
                                어려움
                            </motion.button>
                            <motion.button {...lift} onClick={() => sendFeedback("NORMAL")} style={sx.secondaryBtn}>
                                보통
                            </motion.button>
                            <motion.button {...lift} onClick={() => sendFeedback("GOOD")} style={sx.secondaryBtn}>
                                쉬움
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="next-msg"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, type: "spring" }}
                            style={sx.feedbackMsgBox}
                        >
                            <motion.p
                                style={sx.feedbackMsg}
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                🌿 오른쪽에서 다음 카드를 선택해주세요
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 우측 추천 리스트 (디자인 변경) */}
            <aside style={sx.recommendPanel}>
                <h4 style={sx.recommendTitle}>추천 카드</h4>
                <div style={sx.recommendList} className="ttt-hide-scroll">
                    {recommended.map((r) => {
                        const to = `/learning/three-day?deckId=${deckId}&cardId=${r.id}&mode=${mode}`;
                        const disabled = !feedbackSent;
                        return (
                            <motion.div
                                key={r.id}
                                style={{
                                    ...sx.recommendItem,
                                    cursor: disabled ? "not-allowed" : "pointer",
                                    opacity: disabled ? 0.6 : 1,
                                }}
                                whileHover={!disabled ? { scale: 1.02, backgroundColor: "var(--bg-hover, #2a2a2a)" } : {}}
                                transition={{ duration: 0.15 }}
                                onClick={() => !disabled && navigate(to)}
                                title={disabled ? "피드백 후 선택 가능" : "다음 카드로 이동"}
                            >
                                <div style={sx.thumbWrap}>
                                    {r._thumb ? (
                                        <img
                                            src={r._thumb}
                                            alt="thumb"
                                            style={sx.thumb}
                                            loading="lazy"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    ) : (
                                        <div style={sx.thumbFallback}>🖼️</div>
                                    )}
                                </div>
                                <div style={sx.recTextCol}>
                                    <p style={sx.recommendText}>{r.question}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </aside>
        </div>
    );
}

/* 간단 XSS 방어 */
function safeHtml(html) {
    if (!html) return "";
    let safe = String(html).replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
    safe = safe.replace(/\s(on\w+)=(".*?"|'.*?'|[^\s>]+)/gim, "");
    return safe;
}

/* ============ 스타일 ============ */
const sx = {
    container: {
        display: "flex",
        background: "#000",
        color: "#fff",
        height: "100vh",
        padding: "30px 40px", // 패딩 조정
        gap: "30px",
        position: "relative",
        overflow: "hidden",
    },
    topNav: {
        position: "absolute",
        top: 20,
        right: 40,
        display: "flex",
        gap: 10,
        zIndex: 10,
    },
    // DeckListPage 등에서 사용하는 secondaryBtn 스타일
    secondaryBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "var(--bg-card, #1a1a1a)",
        border: "1px solid var(--border-color, #3f3f3f)",
        color: "var(--text-primary, #f0f0f0)",
        padding: "10px 16px",
        borderRadius: "8px",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: "14px",
    },
    // DeckListPage 등에서 사용하는 primaryBtn 스타일
    primaryBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: ACCENT,
        border: "none",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: "8px",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: "14px",
    },

    /* 좌측 */
    mainPanel: {
        flex: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "40px", // 헤더를 위한 공간
        position: "relative", // 헤더 기준점
    },
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        gap: 16
    },
    h1: { // DeckListPage h1 스타일
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontSize: "28px",
        fontWeight: 700,
        color: "var(--text-primary, #f0f0f0)",
        margin: 0,
    },
    titleIcon: {
        display: "grid",
        placeItems: "center",
        color: "var(--text-secondary, #a0a0a0)",
    },
    remaining: {
        color: "var(--text-secondary, #a0a0a0)",
        fontSize: "1rem",
        fontWeight: 500,
        paddingTop: "4px", // h1과 정렬
    },

    cardBox: {
        background: "linear-gradient(180deg, #111, #090909)",
        borderRadius: 16,
        padding: "24px 24px 14px",
        width: "90%", // 너비 조정
        maxWidth: "900px", // 최대 너비
        height: "64vh",
        minHeight: 420,
        textAlign: "center",
        cursor: "pointer",
        border: "1px solid var(--border-color, #3f3f3f)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    },
    label: {
        color: "var(--text-secondary, #a0a0a0)",
        fontSize: "0.9rem",
        margin: 0,
        textAlign: "left",
    },
    scrollArea: {
        flex: 1,
        overflowY: "auto",
        padding: "6px 8px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
    },
    textBlock: {
        width: "100%",
        maxWidth: 860,
        textAlign: "left",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        color: "var(--text-primary, #f0f0f0)",
        fontSize: "1.1rem",
        lineHeight: "1.7rem",
    },
    image: {
        maxWidth: "100%",
        maxHeight: "46vh",
        borderRadius: 10,
        border: "1px solid #222",
        objectFit: "contain",
        background: "#0b0b0b",
        display: "block",
    },
    hint: {
        fontSize: "0.85rem",
        color: "var(--text-secondary, #a0a0a0)",
        margin: "10px 0 0 0",
    },

    feedbackRow: {
        display: "flex",
        gap: 12,
        marginTop: 24, // 간격 조정
    },
    feedbackMsgBox: {
        marginTop: 24, // 간격 조정
        padding: "10px 16px", // 피드백 버튼과 높이 맞춤
        textAlign: "center"
    },
    feedbackMsg: {
        fontSize: "1.05rem",
        color: "#b0f3a2",
        fontWeight: 500,
        margin: 0,
    },
    // 피드백 버튼 스타일은 sx.primaryBtn, sx.secondaryBtn으로 대체됨

    /* 우측 추천 */
    recommendPanel: {
        flex: 1.2,
        display: "flex",
        flexDirection: "column",
        paddingTop: 80, // mainPanel의 h1과 높이 맞춤
        minWidth: 320,
        maxWidth: 400, // 최대 너비
    },
    recommendTitle: {
        fontSize: "1rem",
        marginBottom: 10,
        color: "var(--text-secondary, #a0a0a0)",
        textAlign: "left",
        fontWeight: 600,
    },
    recommendList: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        overflowY: "auto",
        paddingRight: 4,
        height: "100%", // 부모 flex에 맞게
    },
    recommendItem: {
        display: "grid",
        gridTemplateColumns: "112px 1fr",
        gap: 10,
        alignItems: "center",
        background: "var(--bg-card, #1a1a1a)",
        border: "1px solid var(--border-color, #3f3f3f)",
        borderRadius: 10,
        padding: 10,
    },
    thumbWrap: {
        width: "100%",
        aspectRatio: "16/9",
        borderRadius: 8,
        overflow: "hidden",
        background: "#0b0b0b",
        border: "1px solid #222",
    },
    thumb: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block"
    },
    thumbFallback: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#777",
        background: "#0b0b0b",
    },
    recTextCol: { minWidth: 0 },
    recommendText: {
        margin: 0,
        color: "var(--text-primary, #f0f0f0)",
        fontSize: "0.95rem",
        lineHeight: "1.35rem",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    loading: {
        color: "var(--text-primary, #f0f0f0)",
        textAlign: "center",
        marginTop: 100
    },
};