import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { fetchWithAccess } from "../../utils/authFetch.js";
import CardRankControlModal from "./CardRankControlModal.jsx";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;
const ACCENT = "#f66957"; // 새 Accent 색상

// 새 디자인 컨셉에 맞는 SVG 아이콘
const Icons = {
    Lightning: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
    ),
    Infinity: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 12c-3.1 0-6.1-2.2-8.3-5C1.1 4.5 1 2 1 2s.5-1.5 2.7-1C5.9 0 9 2.2 12 2.2s6.1-2.2 8.3-5C22.9 4.5 23 2 23 2s-.5-1.5-2.7-1C18.1 0 15 2.2 12 2.2z"></path>
            <path d="M12 12c3.1 0 6.1 2.2 8.3 5C22.9 19.5 23 22 23 22s-.5 1.5-2.7 1C18.1 24 15 21.8 12 21.8s-6.1 2.2-8.3 5C1.1 19.5 1 22 1 22s.5 1.5 2.7 1C5.9 24 9 21.8 12 21.8z"></path>
        </svg>
    ),
    ArrowLeft: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
    ),
};

/* ── utils */
function buildQuery(base, params = {}) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "" || v === "null") return;
        sp.set(k, v);
    });
    const qs = sp.toString();
    return qs ? `${base}?${qs}` : base;
}
const fadeUp = (delay = 0, y = 8, dur = 0.35) => ({
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0, transition: { duration: dur, ease: "easeOut", delay } },
    exit: { opacity: 0, y: -y, transition: { duration: 0.25 } },
});
const hoverLift = { whileHover: { y: -2, scale: 1.01, transition: { duration: 0.15 } }, whileTap: { scale: 0.98 } };

/* ── 빈 상태 뷰 */
function EmptyState({ rank, onAddClick }) {
    const rankLabel = rank && rank !== "ALL" ? `${rank} 랭크` : "현재 덱";
    return (
        <motion.div
            {...fadeUp(0.05, 10)}
            style={{
                position: "relative",
                padding: "56px 22px 64px",
                borderRadius: 16,
                background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
                overflow: "hidden",
            }}
        >
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                <div
                    style={{
                        position: "absolute",
                        top: -140,
                        right: -80,
                        width: 360,
                        height: 360,
                        borderRadius: "50%",
                        filter: "blur(120px)",
                        background: `rgba(255, 255, 255, 0.1)`, // ✅ [수정] 빨간색 빛 제거
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        left: -120,
                        bottom: -120,
                        width: 420,
                        height: 420,
                        borderRadius: "50%",
                        filter: "blur(140px)",
                        background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), rgba(0,0,0,0))",
                    }}
                />
            </div>

            <motion.div {...fadeUp(0.05)} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, transition: { delay: 0.1, duration: 0.35 } }}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 68,
                        height: 68,
                        borderRadius: 14,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                        marginBottom: 12,
                        backdropFilter: "blur(6px)",
                    }}
                >
                    <span style={{ fontSize: 28 }}>✨</span>
                </motion.div>

                <h3 style={{ margin: "8px 0 8px", fontWeight: 700, fontSize: "1.18rem" }}>{rankLabel}에는 카드가 없어요</h3>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.6)" }}>첫 카드를 만들어 감을 잡아볼까요?</p>

                <motion.button
                    {...hoverLift}
                    onClick={onAddClick}
                    style={{
                        marginTop: 18,
                        backgroundColor: ACCENT, // ACCENT 색상
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        padding: "12px 16px",
                        cursor: "pointer",
                        boxShadow: `0 12px 28px rgba(0, 0, 0, 0.3)`, // ✅ [수정] 빨간색 빛(그림자) 제거
                    }}
                    whileHover={{ y: -2, boxShadow: `0 18px 46px rgba(0, 0, 0, 0.35)` }} // ✅ [수정] 빨간색 빛(그림자) 제거
                    whileTap={{ scale: 0.98 }}
                >
                    + 카드 추가
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

/* ── Shorts 카드 */
function ShortCard({ card, toHref, rankBadge, index, onClick }) {
    const questionImg =
        card.thumbnailUrl ||
        card.images?.find((img) => img.imageType === "QUESTION")?.imageUrl ||
        card.images?.[0]?.imageUrl ||
        card.images?.find((img) => img.imageType === "ANSWER")?.imageUrl ||
        null;

    const answerPreview = (card.answer || "").toString().replace(/\s+/g, " ").slice(0, 60);

    return (
        <motion.article
            key={`${card.id}-${index}`}
            {...fadeUp(0.02 + Math.min(index * 0.02, 0.2), 14, 0.32)}
            {...hoverLift}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick()}
            style={stShort.card}
            title={card.question}
        >
            <div style={stShort.thumbWrap}>
                {questionImg ? (
                    <img
                        src={questionImg}
                        alt="card"
                        loading="lazy"
                        style={stShort.thumb}
                        onError={(e) => {
                            e.currentTarget.src =
                                "https://third-tool-s3-server.s3.ap-northeast-2.amazonaws.com/common/no-image.jpg";
                        }}
                    />
                ) : (
                    <div style={stShort.thumbFallback}>🖼️</div>
                )}

                {rankBadge && <div style={stShort.rankBadge}>{rankBadge}</div>}

                <div style={stShort.bottomGrad}>
                    <div style={stShort.qText} title={card.question}>
                        {card.question}
                    </div>
                </div>
            </div>

            {answerPreview && (
                <div style={stShort.caption} title={card.answer}>
                    {answerPreview}
                    {card.answer && card.answer.length > 60 ? "…" : ""}
                </div>
            )}
        </motion.article>
    );
}

export default function DeckDetailPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get("mode") || "THREE_DAY";
    const isPermanent = mode === "PERMANENT";
    const navigate = useNavigate();

    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [page, setPage] = useState(0);
    const [hasNext, setHasNext] = useState(true);
    const [loading, setLoading] = useState(false);

    const [selectedRank, setSelectedRank] = useState(isPermanent ? "ALL" : "ALL");
    const [showRankModal, setShowRankModal] = useState(false);
    const loader = useRef(null);

    /* ✅ 덱 정보 — 단건 조회 */
    async function loadDeck() {
        try {
            const res = await fetchWithAccess(`${BASE_URL}/api/decks/${id}`);
            if (!res.ok) {
                setDeck(null);
                return;
            }
            const data = await res.json();
            setDeck(data);
        } catch (e) {
            console.error("❌ 덱 로드 실패:", e);
            setDeck(null);
        }
    }

    /* 카드 로드 */
    const loadCards = useCallback(
        async (reset = false) => {
            if (!hasNext || loading) return;
            setLoading(true);
            try {
                let url;
                if (isPermanent) {
                    url = buildQuery(`${BASE_URL}/api/cards/decks/${id}`, { mode: "PERMANENT", page, size: 20 });
                } else if (selectedRank && selectedRank !== "ALL") {
                    url = buildQuery(`${BASE_URL}/api/cards/by-rank`, {
                        deckId: id,
                        mode: "THREE_DAY",
                        rankName: selectedRank,
                        page,
                        size: 20,
                    });
                } else {
                    url = buildQuery(`${BASE_URL}/api/cards/decks/${id}`, { mode: "THREE_DAY", page, size: 20 });
                }

                const res = await fetchWithAccess(url);
                if (res.status === 204) {
                    if (reset) setCards([]);
                    setHasNext(false);
                    return;
                }

                const data = await res.json();
                if (!data || !data.content) {
                    if (reset) setCards([]);
                    setHasNext(false);
                    return;
                }

                setCards((prev) => (reset ? data.content : [...prev, ...data.content]));
                setHasNext(!data.last);
            } catch (e) {
                console.error("❌ 카드 로드 실패:", e);
            } finally {
                setLoading(false);
            }
        },
        [id, isPermanent, selectedRank, page, hasNext, loading]
    );

    function loadCardsByRank(rank) {
        if (isPermanent) return;
        const nextRank = selectedRank === rank ? "ALL" : rank;
        setSelectedRank(nextRank);
        setCards([]);
        setPage(0);
        setHasNext(true);
    }

    /* 무한 스크롤 */
    useEffect(() => {
        if (!loader.current) return;
        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNext && !loading) setPage((p) => p + 1);
            },
            { threshold: 0.5 }
        );
        obs.observe(loader.current);
        return () => obs.disconnect();
    }, [hasNext, loading]);

    /* 초기화 */
    useEffect(() => {
        if (isPermanent) setSelectedRank("ALL");
        setCards([]);
        setPage(0);
        setHasNext(true);
    }, [mode, selectedRank, id, isPermanent]);

    useEffect(() => { loadDeck(); }, [id]);

    useEffect(() => {
        if (page === 0) loadCards(true);
        else loadCards(false);
    }, [page, loadCards]);

    const deckName = deck?.name ?? "(loading...)";
    const rankButtons = ["ALL", "SILVER", "GOLD", "DIAMOND"];

    return (
        <div style={s.pageShell}>
            {/* 🔒 전역 <style> 태그 제거 */}

            {/* 배경 */}
            <div style={s.bg}>
                <div style={s.bgGlowA} />
                <div style={s.bgGlowB} />
            </div>

            {/* 헤더 (DeckListPage와 동일한 스타일로 변경) */}
            <motion.div {...fadeUp(0.02)} style={s.pageHeader}>
                <h1 style={s.h1}>
                    <span style={s.titleIcon}>
                        {isPermanent ? <Icons.Infinity /> : <Icons.Lightning />}
                    </span>
                    {isPermanent ? "Permanent Project" : "3 Day Project"}
                </h1>
                <motion.button {...hoverLift} onClick={() => navigate(-1)} style={s.backBtn}>
                    <Icons.ArrowLeft />
                    <span style={{ marginLeft: '8px' }}>Back</span>
                </motion.button>
            </motion.div>

            {/* 덱 타이틀 */}
            <motion.div {...fadeUp(0.06)} style={s.deckTitle}>{deckName}</motion.div>

            {/* Rank 필터 */}
            {!isPermanent && (
                <motion.div {...fadeUp(0.08)} style={s.rankFilter}>
                    {rankButtons.map((rank) => (
                        <motion.button
                            key={rank}
                            {...hoverLift}
                            onClick={() => loadCardsByRank(rank)}
                            style={{
                                ...s.rankBtn,
                                backgroundColor: selectedRank === rank ? ACCENT : "#2a2a2a", // ACCENT 색상
                                opacity: selectedRank !== rank && selectedRank !== "ALL" && rank !== "ALL" ? 0.6 : 1,
                                boxShadow: selectedRank === rank ? `0 10px 24px rgba(0, 0, 0, 0.25)` : "none", // ✅ [수정] 빨간색 빛(그림자) 제거
                            }}
                            whileHover={{
                                y: -2,
                                boxShadow: selectedRank === rank ? `0 16px 42px rgba(0, 0, 0, 0.3)` : "0 10px 24px rgba(0,0,0,0.25)", // ✅ [수정] 빨간색 빛(그림자) 제거
                            }}
                        >
                            {rank === "ALL" ? "전체" : rank}
                        </motion.button>
                    ))}
                    <motion.button {...hoverLift} onClick={() => setShowRankModal(true)} style={s.editRankBtn}>⚙️ Rank 설정</motion.button>
                </motion.div>
            )}

            {/* 카드 그리드 */}
            <section style={stShort.grid}>
                <AnimatePresence mode="popLayout">
                    {cards.map((card, index) => {
                        const params = new URLSearchParams({ deckId: id, cardId: card.id, mode });
                        if (!isPermanent && selectedRank && selectedRank !== "ALL") params.set("rankName", selectedRank);
                        const toHref = isPermanent
                            ? `/learning/permanent?${params.toString()}`
                            : `/learning/three-day?${params.toString()}`;

                        const rankBadge = !isPermanent && selectedRank !== "ALL" ? selectedRank : null;
                        return (
                            <ShortCard
                                key={`${card.id}-${index}`}
                                card={card}
                                toHref={toHref}
                                rankBadge={rankBadge}
                                index={index}
                                onClick={() => navigate(toHref)}
                            />
                        );
                    })}
                </AnimatePresence>

                {loading && Array.from({ length: 6 }).map((_, i) => <div key={`sk-${i}`} style={stShort.skeleton} />)}
            </section>

            {/* 빈 상태 */}
            {!loading && cards.length === 0 && (
                <EmptyState rank={isPermanent ? "ALL" : selectedRank} onAddClick={() => navigate(`/decks/${id}/cards/new?mode=${mode}`)} />
            )}

            <div ref={loader} style={{ height: 56 }} />

            {/* 카드 추가 버튼 */}
            <motion.button
                {...hoverLift}
                onClick={() => navigate(`/decks/${id}/cards/new?mode=${mode}`)}
                style={s.addCardBtn}
                whileHover={{ y: -2, boxShadow: `0 24px 60px rgba(0, 0, 0, 0.35)` }} // ✅ [수정] 빨간색 빛(그림자) 제거
            >
                + 카드 추가
            </motion.button>

            {!isPermanent && showRankModal && <CardRankControlModal onClose={() => setShowRankModal(false)} />}
        </div>
    );
}

/* ── 페이지 스타일 */
const s = {
    pageShell: {
        position: "relative",
        color: "white",
        minHeight: "100vh",
        width: "100%",
        paddingBottom: "100px",
        // ProtectedLayout의 .page-content가 padding: 24px를 제공하므로, 여기서는 제거
    },
    bg: { position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }, // zIndex를 -1로 낮춰 콘텐츠 뒤로
    bgGlowA: {
        position: "absolute",
        top: -180,
        left: -120,
        width: 520,
        height: 520,
        borderRadius: "50%",
        filter: "blur(140px)",
        background: "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.04), rgba(0,0,0,0))",
    },
    bgGlowB: {
        position: "absolute",
        bottom: -220,
        right: -160,
        width: 560,
        height: 560,
        borderRadius: "50%",
        filter: "blur(160px)",
        background: `rgba(255, 255, 255, 0.05)`, // ✅ [수정] 빨간색 빛 제거
    },
    // (기존 header, headerLeft, logo 제거)
    // --- 새 헤더 스타일 (DeckListPage와 동일) ---
    pageHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px", // 덱 타이틀과의 간격
    },
    h1: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontSize: "28px",
        fontWeight: 700,
        color: "var(--text-primary)",
        margin: 0,
    },
    titleIcon: {
        display: "grid",
        placeItems: "center",
        color: "var(--text-secondary)",
    },
    backBtn: { // 뒤로가기 버튼 스타일
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
    // ---
    deckTitle: {
        position: "relative",
        zIndex: 1,
        fontSize: "1.2rem",
        fontWeight: 600,
        marginBottom: 14,
        color: "var(--text-secondary)", // 덱 이름은 부가 정보로
    },
    rankFilter: {
        position: "relative",
        zIndex: 1,
        display: "flex",
        gap: 10,
        marginBottom: 18,
        flexWrap: "wrap"
    },
    rankBtn: {
        border: "none",
        padding: "8px 14px",
        borderRadius: 10,
        color: "white",
        cursor: "pointer"
    },
    editRankBtn: {
        marginLeft: "auto",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: "8px 12px",
        color: "white",
        cursor: "pointer",
    },
    addCardBtn: {
        position: "fixed",
        bottom: 28,
        right: 28,
        backgroundColor: ACCENT, // ACCENT 색상
        border: "none",
        color: "white",
        padding: "14px 22px",
        borderRadius: 16,
        fontSize: "1rem",
        cursor: "pointer",
        boxShadow: `0 16px 40px rgba(0, 0, 0, 0.3)`, // ✅ [수정] 빨간색 빛(그림자) 제거
        zIndex: 2,
    },
};

/* ── Shorts 그리드/카드 스타일 */
const stShort = {
    grid: {
        position: "relative",
        zIndex: 1,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 14,
    },
    card: {
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg,#141414,#171717)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
    },
    thumbWrap: { position: "relative", width: "100%", aspectRatio: "9 / 16", background: "#1b1b1b" },
    thumb: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
    thumbFallback: {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
        color: "#888",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    rankBadge: {
        position: "absolute",
        top: 8,
        left: 8,
        padding: "4px 8px",
        fontSize: 12,
        fontWeight: 700,
        color: "#fff",
        borderRadius: 999,
        background: "rgba(0,0,0,0.55)",
        border: "1px solid rgba(255,255,255,0.16)",
        backdropFilter: "blur(4px)",
    },
    bottomGrad: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "10px 10px 12px",
        background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.75) 100%)",
    },
    qText: {
        fontSize: 14,
        lineHeight: "18px",
        fontWeight: 700,
        color: "#fff",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    caption: {
        padding: "8px 10px 10px",
        color: "#b5bbc2",
        fontSize: 12,
        lineHeight: "16px",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
        minHeight: 32,
    },
    skeleton: {
        aspectRatio: "9 / 16",
        borderRadius: 16,
        background: "linear-gradient(90deg,#141414 25%,#1a1a1a 37%,#141414 63%)",
        backgroundSize: "400% 100%",
        animation: "shimmer 1.2s infinite",
    },
};

/* 전역 키프레임 주입 (중복 방지) */
if (typeof document !== "undefined" && !document.getElementById("ttt-shimmer-keyframes")) {
    const style = document.createElement("style");
    style.id = "ttt-shimmer-keyframes";
    style.innerHTML = `@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`;
    document.head.appendChild(style);
}