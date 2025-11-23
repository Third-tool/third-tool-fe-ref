import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithAccess } from "../../utils/authFetch.js";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;
const ACCENT = "#f66957"; // 새 Accent 색상
const lift = { whileHover: { y: -2, scale: 1.01 }, whileTap: { scale: 0.98 } };

// 새 디자인 컨셉에 맞는 SVG 아이콘
const Icons = {
    Lightning: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
    ),
    Infinity: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 12c-3.1 0-6.1-2.2-8.3-5C1.1 4.5 1 2 1 2s.5-1.5 2.7-1C5.9 0 9 2.2 12 2.2s6.1-2.2 8.3-5C22.9 4.5 23 2 23 2s-.5-1.5-2.7-1C18.1 0 15 2.2 12 2.2z"></path>
            <path d="M12 12c3.1 0 6.1 2.2 8.3 5C22.9 19.5 23 22 23 22s-.5 1.5-2.7 1C18.1 24 15 21.8 12 21.8s-6.1 2.2-8.3 5C1.1 19.5 1 22 1 22s.5 1.5 2.7 1C5.9 24 9 21.8 12 21.8z"></path>
        </svg>
    ),
    ArrowLeft: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
    ),
};

export default function SearchLearningPage() {
    const [sp] = useSearchParams();
    const navigate = useNavigate();

    const cardId = sp.get("cardId");
    const [loading, setLoading] = useState(true);
    const [showAnswer, setShowAnswer] = useState(false);
    const [main, setMain] = useState(null);

    const load = useCallback(async () => {
        if (!cardId) return;
        setLoading(true);
        setShowAnswer(false);
        try {
            const res = await fetchWithAccess(`${BASE_URL}/api/learning/search/${cardId}`);
            const m = await res.json();
            const formatted = {
                id: m.id,
                question: m.question,
                answer: m.answer,
                deckId: m.deckId,
                deckName: m.deckName,
                questionImage:
                    m.thumbnailUrl ||
                    m.images?.questionImages?.[0]?.imageUrl ||
                    m.images?.answerImages?.[0]?.imageUrl ||
                    null,
                answerImage:
                    m.images?.answerImages?.[0]?.imageUrl ||
                    m.images?.questionImages?.[1]?.imageUrl ||
                    null,
            };
            setMain(formatted);
        } catch (e) {
            console.error("❌ SearchLearning main load failed:", e);
        } finally {
            setLoading(false);
        }
    }, [cardId]);

    useEffect(() => { load(); }, [load]);

    // Space로 Q/A 토글
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

    // 모드만 선택 → DeckList로 이동 (해당 덱 강조)
    const goDeckListWithMode = (mode) => {
        const base = `/decks?mode=${mode}`;
        if (main?.deckId) {
            navigate(`${base}&highlightDeckId=${main.deckId}&from=search`);
        } else {
            navigate(base);
        }
    };

    if (!cardId) {
        return (
            <div style={sx.container}>
                <div style={sx.centerBox}>
                    <p style={sx.muted}>cardId가 없습니다. 검색 결과에서 카드를 선택해주세요.</p>
                    <motion.button {...lift} style={sx.secondaryBtn} onClick={() => navigate("/search")}>
                        🔎 검색으로 돌아가기
                    </motion.button>
                </div>
            </div>
        );
    }

    if (loading || !main) {
        return (
            <div style={sx.container}>
                <div style={sx.centerBox}><p style={sx.muted}>Loading…</p></div>
            </div>
        );
    }

    return (
        // ProtectedLayout 내부에서 렌더링되므로, .page-content의 padding을 활용합니다.
        // 자체 배경/높이 설정 제거
        <div style={sx.pageWrapper}>

            {/* 상단 바 (디자인 변경) */}
            <header style={sx.pageHeader}>
                {/* 뒤로가기 버튼 */}
                <motion.button {...lift} style={sx.secondaryBtn} onClick={() => navigate(-1)}>
                    <Icons.ArrowLeft />
                    <span style={{ marginLeft: '8px' }}>Back</span>
                </motion.button>

                {/* 모드 선택 CTA */}
                <div style={sx.modeCtaWrap}>
                  <span style={sx.deckHint}>
                    <strong>“{main.deckName ?? "알 수 없는 덱"}”</strong> 덱을
                  </span>
                    <div style={{ display: "flex", gap: 8 }}>
                        <motion.button {...lift} style={sx.modeBtn3} onClick={() => goDeckListWithMode("THREE_DAY")}>
                            <Icons.Lightning /> <span style={{ marginLeft: '4px' }}>3 Day로 보기</span>
                        </motion.button>
                        <motion.button {...lift} style={sx.modeBtnP} onClick={() => goDeckListWithMode("PERMANENT")}>
                            <Icons.Infinity /> <span style={{ marginLeft: '4px' }}>Permanent로 보기</span>
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* 메인 카드 */}
            <motion.main
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .35 }}
                style={sx.main}
            >
                <motion.div
                    style={sx.cardBox}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: .35 }}
                    onClick={() => setShowAnswer((v) => !v)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setShowAnswer((v) => !v)}
                >
                    <p style={sx.label}>{showAnswer ? "Answer" : "Question"}</p>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={showAnswer ? "a" : "q"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: .28 }}
                            style={sx.scrollArea}
                        >
                            <div style={sx.textBlock}>
                                {showAnswer ? main.answer : main.question}
                            </div>
                            {/* 이미지가 있을 때만 img 태그 렌더링 */}
                            {(showAnswer ? main.answerImage : main.questionImage) && (
                                <img
                                    src={showAnswer ? main.answerImage : main.questionImage}
                                    alt="card"
                                    style={sx.image}
                                    onError={(e) => (e.currentTarget.style.display = 'none')} // 로드 실패 시 숨김
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {!showAnswer && <p style={sx.hint}>스페이스/클릭으로 답변 보기</p>}
                </motion.div>
            </motion.main>
        </div>
    );
}

/* 간단 XSS 방어 */
function safeHtml(html) {
    if (!html) return "";
    // 스크립트 태그 제거
    let safe = String(html).replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
    // onerror, onload 등 이벤트 핸들러 속성 제거 (간단한 버전)
    safe = safe.replace(/\s(on\w+)=(".*?"|'.*?'|[^\s>]+)/gim, "");
    return safe;
}

const sx = {
    // pageWrapper는 ProtectedLayout의 .page-content 내부에서 렌더링되므로
    // 자체 배경이나 minHeight가 필요 없습니다.
    pageWrapper: {
        width: "100%",
    },
    // DeckListPage와 유사한 헤더
    pageHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        gap: 12,
        flexWrap: "wrap", // 화면 작을 시 줄바꿈
    },
    // DeckDetailPage의 backBtn 스타일과 유사
    secondaryBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        color: "var(--text-primary)",
        padding: "10px 16px",
        borderRadius: "8px",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: "14px",
    },
    modeCtaWrap: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        justifyContent: "flex-end", // 오른쪽 정렬 (flex-wrap시)
    },
    deckHint: {
        color: "var(--text-secondary)",
        fontSize: ".95rem",
        textAlign: "right",
    },
    // 3 Day 버튼 (Primary)
    modeBtn3: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        background: ACCENT, // 새 Accent
        border: "none",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: 8,
        fontWeight: 800,
        cursor: "pointer",
        fontSize: "14px",
    },
    // Permanent 버튼 (Secondary)
    modeBtnP: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        background: "var(--bg-card)", // Secondary 버튼 스타일
        border: "1px solid var(--border-color)",
        color: "var(--text-primary)",
        padding: "10px 16px",
        borderRadius: 8,
        fontWeight: 800,
        cursor: "pointer",
        fontSize: "14px",
    },
    main: {
        maxWidth: 980,
        margin: "0 auto",
        padding: "0 20px"
    },
    cardBox: {
        background: "linear-gradient(180deg,#111,#0a0a0a)",
        border: "1px solid #2b2b2b",
        borderRadius: 16,
        padding: "18px 18px 12px",
        minHeight: 420,
        height: "68vh",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        cursor: "pointer",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    },
    label: {
        color: "#9aa0a6",
        fontSize: ".95rem",
        margin: 0,
        padding: "0 6px",
    },
    scrollArea: {
        flex: 1,
        overflowY: "auto",
        padding: "4px 6px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "center"
    },
    textBlock: {
        width: "100%",
        maxWidth: 860,
        textAlign: "left",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        color: "#eee",
        fontSize: "1.1rem",
        lineHeight: "1.7rem"
    },
    image: {
        maxWidth: "100%",
        maxHeight: "50vh",
        borderRadius: 10,
        border: "1px solid #222",
        objectFit: "contain",
        background: "#0b0b0b",
        display: "block", // onError시 'none'으로 변경하기 위함
    },
    hint: {
        textAlign: "center",
        color: "#9aa0a6",
        fontSize: ".9rem",
        margin: "10px 0 0 0",
    },
    centerBox: {
        maxWidth: 720,
        margin: "0 auto",
        padding: "80px 24px",
        textAlign: "center"
    },
    muted: {
        color: "#b8bec4"
    },
};