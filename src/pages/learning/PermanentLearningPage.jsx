import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithAccess } from "../../utils/authFetch.js";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;
const ACCENT_PERMANENT = "#42a5f5"; // Permanent 모드 고유 색상
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
    Infinity: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 12c-3.1 0-6.1-2.2-8.3-5C1.1 4.5 1 2 1 2s.5-1.5 2.7-1C5.9 0 9 2.2 12 2.2s6.1-2.2 8.3-5C22.9 4.5 23 2 23 2s-.5-1.5-2.7-1C18.1 0 15 2.2 12 2.2z"></path>
            <path d="M12 12c3.1 0 6.1 2.2 8.3 5C22.9 19.5 23 22 23 22s-.5 1.5-2.7 1C18.1 24 15 21.8 12 21.8s-6.1 2.2-8.3 5C1.1 19.5 1 22 1 22s.5 1.5 2.7 1C5.9 24 9 21.8 12 21.8z"></path>
        </svg>
    ),
};

export default function PermanentLearningPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const deckId = searchParams.get("deckId");
    const cardId = searchParams.get("cardId");
    const mode = "PERMANENT";

    const [card, setCard] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [recommended, setRecommended] = useState([]);
    const [remaining, setRemaining] = useState(0);
    const [loading, setLoading] = useState(true);
    const [moving, setMoving] = useState(false);
    const [moveLog, setMoveLog] = useState(null); // ✅ 방금 3Day로 보낸 카드 로그

    useEffect(() => {
        loadCardData(cardId);
        loadRemainingCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardId, deckId]);

    // ✅ targetCardId를 받아서 특정 카드 / 랜덤 카드 둘 다 지원
    async function loadCardData(targetCardId = cardId) {
        if (!deckId) return;
        setLoading(true);
        try {
            const mainUrl = targetCardId
                ? `${BASE_URL}/api/cards/learning/permanent/${targetCardId}/main?deckId=${deckId}`
                : `${BASE_URL}/api/cards/learning/permanent/main?deckId=${deckId}`;
            const recUrl = targetCardId
                ? `${BASE_URL}/api/cards/learning/permanent/${targetCardId}/recommendations?deckId=${deckId}`
                : `${BASE_URL}/api/cards/learning/permanent/recommendations?deckId=${deckId}`;

            const [main, rec] = await Promise.all([
                fetchWithAccess(mainUrl).then((r) => r.json()),
                fetchWithAccess(recUrl).then((r) => r.json()),
            ]);

            const formatted = {
                id: main.id,
                question: main.question,
                answer: main.answer,
                questionImage:
                    main.thumbnailUrl ||
                    main.images?.questionImages?.[0]?.imageUrl ||
                    main.images?.[0]?.imageUrl ||
                    null,
                answerImage:
                    main.images?.answerImages?.[0]?.imageUrl ||
                    main.images?.[1]?.imageUrl ||
                    null,
            };

            // 추천 카드 썸네일 정규화
            const normalizedRec = (rec || []).map((r) => ({
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
        } catch (e) {
            console.error("❌ Permanent 카드 로드 실패:", e);
        } finally {
            setLoading(false);
        }
    }

    async function loadRemainingCount() {
        if (!deckId) return;
        try {
            const res = await fetchWithAccess(
                `${BASE_URL}/api/cards/learning/permanent/count?deckId=${deckId}`
            );
            const data = await res.json();
            setRemaining(data.remainingCount ?? 0);
        } catch (e) {
            console.error("❌ Permanent 잔여 수 로드 실패:", e);
        }
    }

    // 스페이스바 토글
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

    // ✅ 퍼머넌트 → 3Day 전환 (RESET) but 페이지는 그대로 Permanent
    async function moveToThreeDay() {
        if (!card?.id || moving) return;
        const ok = window.confirm("이 카드를 3Day 모드로 보내시겠습니까?");
        if (!ok) return;

        try {
            setMoving(true);

            await fetchWithAccess(`${BASE_URL}/api/cards/${card.id}/reset`, {
                method: "POST",
            });

            // ✅ 로그용 텍스트 (HTML 태그 제거 + 앞부분만)
            const plainQuestion = String(card.question || "")
                .replace(/<[^>]+>/g, "")
                .slice(0, 60);

            setMoveLog({
                id: card.id,
                question: plainQuestion,
            });

            // ✅ URL은 Permanent 그대로 유지하되, cardId는 제거해서 새 카드 추천 받기
            navigate(`/learning/permanent?deckId=${deckId}`, { replace: true });

            // ✅ 남은 개수 갱신
            await loadRemainingCount();
        } catch (e) {
            console.error("❌ 3Day 전환 실패:", e);
            alert("전환 중 오류가 발생했습니다.");
        } finally {
            setMoving(false);
        }
    }

    if (loading || !card) {
        return <div style={sx.loading}>Loading...</div>;
    }

    return (
        <div style={sx.container}>
            {/* 🔒 전역 스타일 (배경, 스크롤바 숨김) */}
            <style>{`
        html, body { margin:0!important; padding:0!important; background:#000!important; overflow:hidden!important; }
        #root { background:#000!important; }
        .ttt-hide-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .ttt-hide-scroll::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>

            {/* 상단 네비게이션 */}
            <header style={sx.topNav}>
                <motion.button {...lift} onClick={() => navigate("/")} style={sx.secondaryBtn}>
                    <Icons.Home />
                    <span style={{ marginLeft: "8px" }}>홈</span>
                </motion.button>
                <motion.button
                    {...lift}
                    style={sx.secondaryBtn}
                    onClick={() => navigate(`/decks/${deckId}?mode=${mode}`)}
                >
                    <Icons.ArrowLeft />
                    <span style={{ marginLeft: "8px" }}>덱으로</span>
                </motion.button>
            </header>

            {/* 좌측 메인 카드 */}
            <div style={sx.mainPanel}>
                <header style={sx.header}>
                    <h1 style={sx.h1}>
                        <span style={{ ...sx.titleIcon, color: ACCENT_PERMANENT }}>
                            <Icons.Infinity />
                        </span>
                        Permanent Project
                    </h1>
                    <p style={sx.remaining}>남은 카드 {remaining}</p>
                </header>

                <motion.div
                    style={sx.cardBox}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setShowAnswer(!showAnswer)}
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
                            <div
                                style={sx.textBlock}
                                dangerouslySetInnerHTML={{
                                    __html: safeHtml(showAnswer ? card.answer : card.question),
                                }}
                            />

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

                {/* 3Day 전환 버튼 + 로그 박스 */}
                <div style={sx.feedbackRow}>
                    <motion.button
                        {...lift}
                        onClick={moveToThreeDay}
                        disabled={moving}
                        style={{
                            ...sx.primaryBtn,
                            backgroundColor: ACCENT_PERMANENT,
                            opacity: moving ? 0.6 : 1,
                            cursor: moving ? "not-allowed" : "pointer",
                        }}
                    >
                        {moving ? "Moving..." : "3Day로 보내기"}
                    </motion.button>
                </div>

                {moveLog && (
                    <div style={sx.moveLogBox}>
                        <p style={sx.moveLogTitle}>최근 3Day로 보낸 카드</p>
                        <p style={sx.moveLogText}>
                            #{moveLog.id} · {moveLog.question}
                        </p>
                    </div>
                )}
            </div>

            {/* 우측 추천 카드 */}
            <aside style={sx.recommendPanel}>
                <h4 style={sx.recommendTitle}>추천 카드</h4>
                <div style={sx.recommendList} className="ttt-hide-scroll">
                    {recommended.map((r) => (
                        <motion.div
                            key={r.id}
                            style={sx.recommendItem}
                            whileHover={{ scale: 1.02, backgroundColor: "var(--bg-hover, #2a2a2a)" }}
                            transition={{ duration: 0.15 }}
                            onClick={() =>
                                navigate(`/learning/permanent?deckId=${deckId}&cardId=${r.id}`)
                            }
                        >
                            <div style={sx.thumbWrap}>
                                {r._thumb ? (
                                    <img
                                        src={r._thumb}
                                        alt="thumb"
                                        style={sx.thumb}
                                        loading="lazy"
                                        onError={(e) => (e.currentTarget.style.display = "none")}
                                    />
                                ) : (
                                    <div style={sx.thumbFallback}>🖼️</div>
                                )}
                            </div>
                            <div style={sx.recTextCol}>
                                <p style={sx.recommendText}>{r.question}</p>
                            </div>
                        </motion.div>
                    ))}
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

/* ===========================
   🎨 스타일
=========================== */
const sx = {
    container: {
        display: "flex",
        background: "#000",
        color: "#fff",
        height: "100vh",
        padding: "30px 40px",
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
    primaryBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: ACCENT_PERMANENT,
        border: "none",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: "8px",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: "14px",
    },
    mainPanel: {
        flex: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "40px",
        position: "relative",
    },
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        gap: 16,
    },
    h1: {
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
        paddingTop: "4px",
    },
    cardBox: {
        background: "linear-gradient(180deg, #111, #090909)",
        borderRadius: 16,
        padding: "24px 24px 14px",
        width: "90%",
        maxWidth: "900px",
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
        marginTop: 24,
    },
    // ✅ 최근 이동 로그 스타일
    moveLogBox: {
        marginTop: 12,
        padding: "10px 14px",
        borderRadius: 8,
        background: "rgba(66,165,245,0.08)",
        border: "1px solid rgba(66,165,245,0.4)",
        width: "90%",
        maxWidth: 900,
        textAlign: "left",
    },
    moveLogTitle: {
        margin: 0,
        fontSize: "0.8rem",
        color: "rgba(200,220,255,0.8)",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
    },
    moveLogText: {
        margin: "4px 0 0 0",
        fontSize: "0.9rem",
        color: "#e3f2fd",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    recommendPanel: {
        flex: 1.2,
        display: "flex",
        flexDirection: "column",
        paddingTop: 80,
        minWidth: 320,
        maxWidth: 400,
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
        height: "100%",
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
        cursor: "pointer",
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
        display: "block",
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
        marginTop: 100,
    },
};
