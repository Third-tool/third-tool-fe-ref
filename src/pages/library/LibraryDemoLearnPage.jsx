// src/pages/LibraryDemoLearnPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- LibraryDemoDeckPage.jsx에서 DEMO_DECKS 객체 복사 ---
const DEMO_DECKS = {
    "regex-eng": {
        title: "English Regular Expressions",
        desc: "Common regex patterns for validation & preprocessing in English text",
        cover: "regex-eng",
        cards: [
            {
                q: "Integer (optional sign)",
                a: "/^[+-]?\\d+$/",
                tip: "Validate integer inputs such as IDs, counts, or offsets."
            },
            {
                q: "Email (RFC-lite)",
                a: "/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/",
                tip: "Simple front-end email validation with a minimum 2-character domain."
            },
            {
                q: "URL (http/https)",
                a: "/^(https?):\\/\\/[^\\s\\/$.?#].[^\\s]*$/i",
                tip: "Require http or https at the beginning and ignore case with the i flag."
            },
            {
                q: "US phone (simple)",
                a: "/^\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$/",
                tip: "Allow optional parentheses and separators while keeping a basic US phone pattern."
            },
            {
                q: "Slug (kebab-case)",
                a: "/^[a-z0-9]+(?:-[a-z0-9]+)*$/",
                tip: "Generate a URL-friendly identifier using lowercase letters, numbers, and hyphens."
            },
            {
                q: "ISO date (YYYY-MM-DD)",
                a: "/^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$/",
                tip: "Validate dates with correct ranges for month and day."
            },
            {
                q: "Alphabetic only",
                a: "/^[A-Za-z]+$/",
                tip: "Allow only English alphabet letters, no spaces or symbols."
            },
            {
                q: "Collapse spaces (find)",
                a: "/\\s+/g",
                tip: "Find runs of whitespace characters to collapse them into a single space."
            },
        ],
        tags: ["Regex", "Validation", "Text-Processing"],
    },

    "mcat-miles": {
        title: "MCAT Milesdown",
        desc: "High-yield biochemistry and physiology concepts distilled into quick cards.",
        cover: "mcat-miles",
        cards: [
            {
                q: "What is the effect of a competitive inhibitor on Michaelis–Menten kinetics?",
                a: "Km increases, Vmax stays the same.",
                tip: "The inhibitor competes with substrate for the active site, lowering apparent affinity."
            },
            {
                q: "What is the effect of a noncompetitive inhibitor on Michaelis–Menten kinetics?",
                a: "Vmax decreases, Km stays the same.",
                tip: "The inhibitor binds at a site other than the active site and reduces the effective enzyme amount."
            },
            {
                q: "What factors shift the hemoglobin O2 dissociation curve to the right?",
                a: "Increased CO2, increased H+ (lower pH), increased temperature, and increased 2,3-BPG.",
                tip: "A right shift means hemoglobin releases oxygen more easily in active tissues."
            },
            {
                q: "What is the main transporter in the thick ascending limb of the nephron?",
                a: "NKCC2: Na+/K+/2Cl- reabsorption; segment is impermeable to water.",
                tip: "This segment helps generate the medullary osmotic gradient."
            },
            {
                q: "In a neuronal action potential, what ions drive depolarization and repolarization?",
                a: "Depolarization: sodium influx; repolarization: potassium efflux.",
                tip: "Hyperpolarization occurs when potassium channels remain open longer than needed."
            },
            {
                q: "Name the key enzymes unique to gluconeogenesis.",
                a: "Pyruvate carboxylase, PEPCK, fructose-1,6-bisphosphatase, glucose-6-phosphatase.",
                tip: "These enzymes bypass the three irreversible steps of glycolysis."
            },
            {
                q: "Write the Hardy–Weinberg equilibrium equation.",
                a: "p^2 + 2pq + q^2 = 1, with p + q = 1.",
                tip: "The model assumes random mating, large population size, and no mutation, migration, or selection."
            },
            {
                q: "What is the effect of aldosterone on the nephron?",
                a: "It increases sodium reabsorption and increases potassium secretion in the collecting duct.",
                tip: "Its net effect is to raise blood pressure and extracellular fluid volume."
            },
        ],
        tags: ["Biochem", "Physiology", "MCAT"],
    },
};
// --- DEMO_DECKS 끝 ---


// SearchLearningPage에서 아이콘/모션 가져오기
const lift = { whileHover: { y: -2, scale: 1.01 }, whileTap: { scale: 0.98 } };
const Icons = {
    ArrowLeft: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
    ),
};

// SearchLearningPage에서 safeHtml 함수 가져오기
function safeHtml(html) {
    if (!html) return "";
    let safe = String(html).replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
    safe = safe.replace(/\s(on\w+)=(".*?"|'.*?'|[^\s>]+)/gim, "");
    return safe;
}

export default function LibraryDemoLearnPage() {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [deck, setDeck] = useState(null);
    const [cardIndex, setCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    // 데이터 로드
    useEffect(() => {
        const demoDeck = DEMO_DECKS[slug];
        if (demoDeck) {
            setDeck(demoDeck);
            const startIndex = parseInt(searchParams.get("start") || "0", 10);
            setCardIndex(startIndex);
            setShowAnswer(false); // 새 카드 로드 시 항상 질문부터
        }
    }, [slug, searchParams]);

    // 카드 이동 핸들러
    const handleNext = () => {
        setCardIndex((prevIndex) => (prevIndex + 1) % deck.cards.length);
        setShowAnswer(false);
    };

    const handlePrev = () => {
        setCardIndex((prevIndex) => (prevIndex - 1 + deck.cards.length) % deck.cards.length);
        setShowAnswer(false);
    };

    // 키보드 이벤트 (Space, Arrows)
    useEffect(() => {
        const onKey = (e) => {
            if (e.code === "Space") {
                e.preventDefault();
                setShowAnswer((v) => !v);
            }
            if (e.code === "ArrowRight") {
                e.preventDefault();
                handleNext();
            }
            if (e.code === "ArrowLeft") {
                e.preventDefault();
                handlePrev();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [deck]); // deck이 로드된 후에만(null 아닐 때)

    if (!deck) {
        return (
            <div style={sx.container}>
                <div style={sx.centerBox}>
                    <p style={sx.muted}>데모 덱을 찾을 수 없습니다.</p>
                    <motion.button {...lift} style={sx.secondaryBtn} onClick={() => navigate("/library")}>
                        <Icons.ArrowLeft />
                        <span style={{ marginLeft: '8px' }}>라이브러리로</span>
                    </motion.button>
                </div>
            </div>
        );
    }

    const currentCard = deck.cards[cardIndex];

    return (
        // SearchLearningPage와 동일한 래퍼 사용 (배경/패딩 등)
        <div style={sx.pageWrapper}>

            {/* 상단 바: 뒤로가기 버튼만 */}
            <header style={sx.pageHeader}>
                <motion.button {...lift} style={sx.secondaryBtn} onClick={() => navigate(`/library/demo/${slug}`)}>
                    <Icons.ArrowLeft />
                    <span style={{ marginLeft: '8px' }}>{deck.title}</span>
                </motion.button>
            </header>

            {/* 메인 카드 (SearchLearningPage 스타일) */}
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
                            key={showAnswer ? `a-${cardIndex}` : `q-${cardIndex}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: .28 }}
                            style={sx.scrollArea}
                        >
                            <div
                                style={sx.textBlock}
                                dangerouslySetInnerHTML={{ __html: safeHtml(showAnswer ? currentCard.a : currentCard.q) }}
                            />

                            {/* 답변에만 '팁' 표시 */}
                            {showAnswer && currentCard.tip && (
                                <div style={sx.tipBlock}>
                                    <strong>💡 Tip</strong>
                                    <p style={{margin: 0}}>{currentCard.tip}</p>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                    {!showAnswer && <p style={sx.hint}>스페이스/클릭으로 답변 보기</p>}
                </motion.div>
            </motion.main>

            {/* 하단 컨트롤 (이전/다음) */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={sx.controls}
            >
                <motion.button {...lift} style={sx.navBtn} onClick={handlePrev}>
                    ← 이전
                </motion.button>
                <span style={sx.progressText}>
                    {cardIndex + 1} / {deck.cards.length}
                </span>
                <motion.button {...lift} style={sx.navBtn} onClick={handleNext}>
                    다음 →
                </motion.button>
            </motion.footer>
        </div>
    );
}


// SearchLearningPage의 스타일(sx) 객체를 기반으로 수정
const sx = {
    // pageWrapper는 ProtectedLayout의 .page-content 내부에서 렌더링되므로
    // 자체 배경이나 minHeight가 필요 없습니다.
    pageWrapper: {
        width: "100%",
        // 데모 페이지는 검은색 배경을 직접 가집니다 (ProtectedLayout 밖일 수 있으므로)
        background: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "24px",
    },
    // DeckListPage와 유사한 헤더
    pageHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        gap: 12,
        flexWrap: "wrap",
        maxWidth: 980, // main과 너비 맞춤
        margin: "0 auto 24px", // 중앙 정렬
    },
    // DeckDetailPage의 backBtn 스타일과 유사
    secondaryBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#161616", // 데모용 색상
        border: "1px solid #2a2a2a",
        color: "#eee",
        padding: "10px 16px",
        borderRadius: "8px",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: "14px",
    },
    main: {
        maxWidth: 980,
        margin: "0 auto",
        // padding: "0 20px" // pageWrapper에 패딩이 있으므로 제거
    },
    cardBox: {
        background: "linear-gradient(180deg,#111,#0a0a0a)",
        border: "1px solid #2b2b2b",
        borderRadius: 16,
        padding: "18px 18px 12px",
        minHeight: 420,
        height: "65vh", // 높이 고정
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
        alignItems: "flex-start", // 좌측 정렬
    },
    textBlock: {
        width: "100%",
        maxWidth: 860,
        textAlign: "left",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        color: "#eee",
        fontSize: "1.2rem", // 조금 더 크게
        lineHeight: "1.7rem",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", // Q/A는 고정폭
    },
    tipBlock: {
        marginTop: 16,
        padding: 12,
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid #2a2a2a",
        borderRadius: 8,
        color: "#cdd1d6",
        fontSize: "1rem",
        lineHeight: "1.5rem",
        width: "100%",
        fontFamily: "inherit", // 팁은 일반 폰트
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

    // --- 새로 추가된 스타일 ---
    controls: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: 980,
        margin: "16px auto 0",
    },
    progressText: {
        color: "#9aa0a6",
        fontSize: ".9rem",
        fontFamily: "ui-monospace, monospace",
    },
    navBtn: { // secondaryBtn과 유사하나 조금 더 작게
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#161616",
        border: "1px solid #2a2a2a",
        color: "#eee",
        padding: "8px 14px",
        borderRadius: "8px",
        fontWeight: 600,
        cursor: "pointer",
        fontSize: "13px",
    }
};