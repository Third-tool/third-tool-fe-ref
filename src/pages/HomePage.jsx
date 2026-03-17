// src/pages/HomePage.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DailyProgressModal from "./decks/DailyProgressModal.jsx";
import { fetchWithAccess } from "../utils/authFetch.js";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;
const ACCENT = "#f66957";

const fadeIn = (d = 0, y = 10, t = 0.35) => ({
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0, transition: { duration: t, delay: d, ease: "easeOut" } },
    viewport: { once: true, margin: "-80px" },
});

/* ───────── 유틸 ───────── */
function toPercentScore(list) {
    const nums = list.map((r) => Number(r.priorityScore ?? 0));
    const max = Math.max(1, ...nums);
    return list.map((r) => {
        let raw = Number(r.priorityScore ?? 0);
        let pct = raw <= 1 ? raw * 100 : (raw / max) * 100;
        return Math.round(Math.max(0, Math.min(100, pct)));
    });
}

/* ───────── 카드 컴포넌트들 ───────── */
function ToolCardLeft({ title, Icon, onClick, badge, disabled = false, sub }) {
    const motionProps = disabled ? { whileHover: {}, onClick: () => {} } : { whileHover: { backgroundColor: "var(--bg-hover)", y: -5 }, onClick };
    const cardStyle = disabled ? { ...sx.cardLeft, cursor: "not-allowed", opacity: 0.6 } : sx.cardLeft;

    return (
        <motion.div style={cardStyle} {...motionProps} {...fadeIn(0.1)} transition={{ duration: 0.15 }}>
            {!disabled && badge && (
                <span
                    style={{
                        ...sx.toolBadge,
                        backgroundColor: badge.color === ACCENT ? ACCENT : "#3a5a9a",
                        color: badge.color === ACCENT ? "#ffffff" : "#cde0ff",
                    }}
                >
                    {badge.text}
                </span>
            )}
            <div style={sx.leftIcon}>{Icon && <Icon />}</div>
            <div style={sx.leftTextBlock}>
                <h4 style={sx.leftTitle}>{disabled ? "아직 준비중입니다.." : title}</h4>
                {sub && <p style={sx.leftSub}>{sub}</p>}
            </div>
        </motion.div>
    );
}

function ContinueCard({ deck, mode, onClick, disabled }) {
    const title = mode === "THREE_DAY" ? "Continue (3day)" : "Continue (permanent)";
    const WhiteLightning = () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
    const WhiteInfinity = () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
                d="M9.5 9.5c-1.2-1.3-2.4-2-3.9-2C3 7.5 1.5 9 1.5 11s1.5 3.5 4.1 3.5c1.5 0 2.7-.7 3.9-2l2-2 2 2c1.2 1.3 2.4 2 3.9 2 2.6 0 4.1-1.5 4.1-3.5S21 7.5 18.4 7.5c-1.5 0-2.7-.7-3.9 2l-2 2-2-2Z"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    const motionProps = disabled ? { whileHover: {}, onClick: () => {} } : { whileHover: { y: -5 }, onClick };
    const cardStyle = disabled ? { ...sx.cardLeft, cursor: "not-allowed", opacity: 0.6 } : sx.cardLeft;

    return (
        <motion.div style={cardStyle} {...motionProps} {...fadeIn(0.1)} transition={{ duration: 0.15 }}>
            <div style={{ ...sx.leftIcon, color: "#fff" }}>{mode === "THREE_DAY" ? <WhiteLightning /> : <WhiteInfinity />}</div>
            <div style={sx.leftTextBlock}>
                <h4 style={sx.leftTitle}>{title}</h4>
                <p style={sx.leftSub}>{deck ? deck.name : "최근 학습 기록 없음"}</p>
                {disabled && <span style={sx.disabledNote}>(학습 기록 없음)</span>}
            </div>
        </motion.div>
    );
}

/* ───────── DeckTile (썸네일 + 추천 사유) ───────── */
function DeckTile({ title, score, onClick, thumbnailUrl, reason }) {
    const brief = reason ? (reason.length > 70 ? reason.slice(0, 70) + "..." : reason) : "";
    return (
        <motion.div style={sx.tile} onClick={onClick} whileHover={{ y: -5, backgroundColor: "var(--bg-card)" }} transition={{ duration: 0.15 }}>
            <div style={sx.tileThumb}>
                {thumbnailUrl ? <img src={thumbnailUrl} alt={`${title} thumbnail`} style={sx.tileThumbImg} /> : <span style={sx.tileThumbFallback}>🖼️</span>}
            </div>

            <div style={sx.tileMeta}>
                <strong style={sx.tileTitle}>{title}</strong>
                <div style={sx.tileBarOuter}>
                    <div style={{ ...sx.tileBarInner, width: `${Math.max(0, Math.min(100, score))}%` }} />
                </div>
                <span style={sx.tileScore}>{Math.max(0, Math.min(100, score))}% 추천</span>
                {brief && <p style={sx.tileReason}>{brief}</p>}
            </div>
        </motion.div>
    );
}

export default function HomePage() {
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState([]); // [{deckId, deckName, score, thumbnailUrl, reason}]
    const [recentDeck, setRecentDeck] = useState(null);
    const carouselRef = useRef(null);

    useEffect(() => {
        fetchRecommendations();
        fetchRecentDeck();
    }, []);

    /* 배경 처리 */
    useEffect(() => {
        const el = document.querySelector(".page-content");
        if (!el) return;
        const originalStyles = {
            backgroundImage: el.style.backgroundImage,
            backgroundAttachment: el.style.backgroundAttachment,
            backgroundSize: el.style.backgroundSize,
            backgroundPosition: el.style.backgroundPosition,
            backgroundRepeat: el.style.backgroundRepeat,
        };
        const imageUrl = "/home_background.jpg";
        const overlay = "linear-gradient(rgba(16,16,16,.85), rgba(16,16,16,.85))";
        el.style.backgroundImage = `${overlay}, url("${imageUrl}")`;
        el.style.backgroundAttachment = "fixed";
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center center";
        el.style.backgroundRepeat = "no-repeat";
        return () => {
            el.style.backgroundImage = originalStyles.backgroundImage;
            el.style.backgroundAttachment = originalStyles.backgroundAttachment;
            el.style.backgroundSize = originalStyles.backgroundSize;
            el.style.backgroundPosition = originalStyles.backgroundPosition;
            el.style.backgroundRepeat = originalStyles.backgroundRepeat;
        };
    }, []);

    /** ✅ 추천덱 3개 + explain(reason) 병행 호출 */
    async function fetchRecommendations() {
        try {
            const res = await fetchWithAccess(`${BASE_URL}/api/recommendations/decks?limit=3`);
            if (!res.ok) {
                setRecommendations([]);
                return;
            }
            const raw = await res.json(); // List<DeckRecommendation>
            const percents = toPercentScore(raw);

            const base = raw.map((r, idx) => ({
                deckId: r.deckId,
                deckName: r.deckName ?? r.name ?? "무제 덱",
                score: percents[idx],
                thumbnailUrl: r.thumbnailUrl ?? null,
                reason: r.reason ?? "",
            }));

            const withExplain = await Promise.all(
                base.map(async (d) => {
                    try {
                        const ex = await fetchWithAccess(`${BASE_URL}/api/recommendations/decks/${d.deckId}/explain`);
                        if (ex.ok) {
                            const { reason } = await ex.json(); // { deckId, reason }
                            return { ...d, reason: reason || d.reason };
                        }
                    } catch (_) {}
                    return d;
                })
            );

            setRecommendations(withExplain.slice(0, 3));
        } catch (e) {
            console.error("추천 데이터 불러오기 실패:", e);
            setRecommendations([]);
        }
    }

    async function fetchRecentDeck() {
        try {
            const res = await fetchWithAccess(`${BASE_URL}/api/decks/recent/top`);
            if (res.status === 204) {
                setRecentDeck(null);
                return;
            }
            if (res.ok) {
                const d = await res.json();
                setRecentDeck(d); // {id, name, thumbnailUrl? ...}
            } else setRecentDeck(null);
        } catch (e) {
            console.error("최근 덱 정보 불러오기 실패:", e);
            setRecentDeck(null);
        }
    }

    const goToDeckPage = (mode) => navigate(`/decks?mode=${mode}`);

    const handleRecentClick = async (mode) => {
        if (!recentDeck?.id) {
            navigate(`/decks?mode=${mode}`);
            return;
        }
        try {
            await fetchWithAccess(`${BASE_URL}/api/decks/${recentDeck.id}/touch`, { method: "POST" });
        } catch {}
        navigate(`/decks/${recentDeck.id}?mode=${mode}`);
    };

    const tags = useMemo(() => ["Java", "Spring", "Network", "OOP", "DB", "Docker", "Kubernetes", "Security", "Kafka", "Elastic"], []);
    const contentMaxWidth = "1200px";

    const Icons = {
        Lightning: () => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
        ),
        Infinity: () => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 12c-3.1 0-6.1-2.2-8.3-5C1.1 4.5 1 2 1 2s.5-1.5 2.7-1C5.9 0 9 2.2 12 2.2s6.1-2.2 8.3-5C22.9 4.5 23 2 23 2s-.5-1.5-2.7-1C18.1 0 15 2.2 12 2.2z"></path>
                <path d="M12 12c3.1 0 6.1 2.2 8.3 5C22.9 19.5 23 22 23 22s-.5 1.5-2.7 1C18.1 24 15 21.8 12 21.8s-6.1 2.2-8.3 5C1.1 19.5 1 22 1 22s.5 1.5 2.7 1C5.9 24 9 21.8 12 21.8z"></path>
            </svg>
        ),
        Search: () => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
        ),
        Spaces: () => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
        ),
        Image: () => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
        ),
        Video: () => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
        ),
        Edit: () => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path>
            </svg>
        ),
    };

    const scroll = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = 250;
            carouselRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <div style={sx.page}>
            {/* 1. 타이틀 */}
            <div style={{ ...sx.sectionHeader, maxWidth: contentMaxWidth }}>
                <h2 style={sx.sectionHeaderText}>오늘 무엇을 만들고 싶으세요?</h2>
                <button style={sx.seeAllButton}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M3 3h2v2H3V3zm0 6h2v2H3V9zm0-3h2v2H3V6zM6 3h2v2H6V3zm0 6h2v2H6V9zm0-3h2v2H6V6zM9 3h2v2H9V3zm0 6h2v2H9V9zm0-3h2v2H9V6zm3 3h2v2h-2V6zm0-3h2v2h-2V3zm0 6h2v2h-2V9z"></path>
                    </svg>
                    <span>모든 툴</span>
                </button>
            </div>

            {/* 2. 툴 카드 캐러셀 */}
            <div style={{ ...sx.toolsCarouselWrapper, maxWidth: contentMaxWidth }}>
                <button style={{ ...sx.scrollButton, left: 0 }} onClick={() => scroll("left")}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                <section style={sx.toolsCarousel} className="no-scrollbar" ref={carouselRef}>
                    <ToolCardLeft title="3 Day (단기 집중)" Icon={Icons.Lightning} onClick={() => goToDeckPage("THREE_DAY")} badge={{ text: "추천", color: ACCENT }} />
                    <ToolCardLeft title="Permanent (장기 보존)" Icon={Icons.Infinity} onClick={() => goToDeckPage("PERMANENT")} />

                    <ContinueCard deck={recentDeck} mode="THREE_DAY" onClick={() => handleRecentClick("THREE_DAY")} disabled={!recentDeck} />
                    <ContinueCard deck={recentDeck} mode="PERMANENT" onClick={() => handleRecentClick("PERMANENT")} disabled={!recentDeck} />

                    <ToolCardLeft Icon={Icons.Image} title="Image Generator" sub="아직 준비중입니다.." disabled />
                    <ToolCardLeft Icon={Icons.Video} title="Video Generator" sub="아직 준비중입니다.." disabled />
                    <ToolCardLeft Icon={Icons.Edit} title="Image Editor" sub="아직 준비중입니다.." disabled />
                    <ToolCardLeft Icon={Icons.Search} title="Search" sub="아직 준비중입니다.." disabled />
                    <ToolCardLeft Icon={Icons.Spaces} title="Spaces" sub="NEW" disabled />
                </section>

                <button style={{ ...sx.scrollButton, right: 0 }} onClick={() => scroll("right")}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>

            {/* 3. 태그 */}
            <section style={{ ...sx.tagsSection, maxWidth: contentMaxWidth }}>
                <h3 style={sx.sectionTitle}>Tags</h3>
                <div style={sx.tagRow} className="no-scrollbar">
                    {tags.map((t) => (
                        <motion.button
                            key={t}
                            style={sx.chip}
                            onClick={() => navigate(`/library?tag=${encodeURIComponent(t)}`)}
                            whileHover={{ y: -3, backgroundColor: "var(--bg-hover)" }}
                            transition={{ duration: 0.15 }}
                        >
                            {t}
                        </motion.button>
                    ))}
                </div>
            </section>

            {/* 4. 덱 — 추천덱 한 줄 캐러셀 */}
            <main style={{ ...sx.feedWrap, maxWidth: contentMaxWidth }}>
                <motion.section {...fadeIn(0.06)} style={sx.feedSection}>
                    <div style={sx.feedHead}>
                        <h3 style={sx.h3}>추천 덱</h3>
                    </div>
                    <div style={sx.cardsRow} className="no-scrollbar">
                        {(recommendations.length > 0
                                ? recommendations
                                : Array.from({ length: 3 }).map((_, i) => ({
                                    deckId: i,
                                    deckName: `추천 덱 ${i + 1}`,
                                    score: 60 + (i % 4) * 8,
                                    thumbnailUrl: null,
                                    reason: "",
                                }))
                        ).map((r, i) => (
                            <DeckTile
                                key={r.deckId || i}
                                title={r.deckName}
                                score={r.score ?? 72}
                                onClick={() => r.deckId && navigate(`/decks/${r.deckId}?mode=THREE_DAY`)}
                                thumbnailUrl={r.thumbnailUrl}
                                reason={r.reason}
                            />
                        ))}
                    </div>
                </motion.section>
            </main>

            {/* 6. 캘린더 */}
            <motion.section {...fadeIn(0.08)} style={{ ...sx.calendarSection, maxWidth: contentMaxWidth }}>
                <div style={sx.feedHead}>
                    <h3 style={sx.h3}>학습 캘린더</h3>
                    <button style={sx.linkBtn} onClick={() => navigate("/library")}>
                        기록 보기
                    </button>
                </div>
                <div style={sx.calendarWrapper}>
                    <LearningCalendar />
                </div>
            </motion.section>

            {/* 7. footer */}
            <footer style={{ ...sx.footerCopy, maxWidth: contentMaxWidth }}>
                <span style={sx.hello}>HELLO, WE ARE</span>
                <h4 style={sx.pitch}>
                    망각 방지를 위한
                    <br />
                    세 번째 도구
                </h4>
                <p style={sx.smallCopy}>
                    빠르게 잊혀지는 시대 속에서, 기억을 오래 남기는 학습 시스템을 만듭니다. 연필과 공책 다음, 당신의 기억을 책임질 도구 — <i>Third Tool</i>.
                </p>
            </footer>

            <DailyProgressModal />
        </div>
    );
}

/* ───────── styles ───────── */
const sx = {
    page: { color: "var(--text-primary)", minHeight: "100%", paddingBottom: 120, overflowX: "hidden" },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        margin: "0 auto 24px",
        padding: "0 2px",
    },
    sectionHeaderText: { fontSize: "28px", fontWeight: 700, color: "var(--text-primary)" },
    seeAllButton: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        color: "var(--text-secondary)",
        padding: "8px 12px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 500,
    },

    toolsCarouselWrapper: { position: "relative", margin: "0 auto 48px", padding: "0 2px" },
    toolsCarousel: { display: "flex", gap: 12, overflowX: "auto", padding: "0 0 4px" },
    scrollButton: {
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        backgroundColor: "rgba(44,44,44,0.8)",
        border: "1px solid var(--border-color)",
        borderRadius: "50%",
        width: 40,
        height: 40,
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        zIndex: 10,
        color: "var(--text-secondary)",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
    },

    cardLeft: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 10,
        minWidth: 220,
        height: 110,
        padding: "16px",
        flexShrink: 0,
        backgroundColor: "var(--bg-card)",
        borderRadius: 12,
        border: "1px solid var(--border-color)",
        position: "relative",
        cursor: "pointer",
    },
    leftIcon: { color: "var(--text-primary)", display: "grid", placeItems: "center", width: 26, height: 26 },
    leftTextBlock: { display: "grid", gap: 2 },
    leftTitle: { fontSize: 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2, textAlign: "left" },
    leftSub: { fontSize: 12, color: "var(--text-secondary)" },

    toolBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        color: "#cde0ff",
        backgroundColor: "#3a5a9a",
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 6px",
        borderRadius: 4,
    },
    disabledNote: { fontSize: 11, color: "var(--text-secondary)", fontWeight: 400, marginTop: 2 },

    tagsSection: { margin: "0 auto 32px", padding: "0 2px" },
    sectionTitle: { fontSize: 20, fontWeight: 600, marginBottom: 16, color: "var(--text-primary)" },
    tagRow: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 },
    chip: {
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        color: "var(--text-secondary)",
        padding: "8px 14px",
        borderRadius: 16,
        cursor: "pointer",
        fontSize: ".92rem",
        whiteSpace: "nowrap",
    },

    feedWrap: { margin: "0 auto", padding: "0 2px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 },
    feedSection: { borderRadius: 14, padding: 0 },
    feedHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    h3: { margin: 0, fontSize: 20, fontWeight: 600, color: "var(--text-primary)" },
    linkBtn: { background: "none", border: "none", color: ACCENT, cursor: "pointer", fontWeight: 600 },

    // 🔥 추천 덱 한 줄 캐러셀
    cardsRow: {
        display: "flex",
        gap: 16,
        overflowX: "auto",
        paddingBottom: 4,
    },

    // 예전 grid (현재 미사용이지만 남겨둠)
    cardsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 },

    tile: {
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        display: "grid",
        gridTemplateRows: "160px 1fr",
        minWidth: 260,
    },
    tileThumb: { background: "var(--bg-main)", position: "relative", overflow: "hidden" },
    tileThumbImg: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" },
    tileThumbFallback: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: 48,
        color: "var(--text-secondary)",
        opacity: 0.3,
    },
    tileMeta: { padding: 12, display: "grid", gap: 8 },
    tileTitle: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 600, color: "var(--text-primary)" },
    tileBarOuter: { background: "var(--bg-main)", borderRadius: 8, height: 8, overflow: "hidden" },
    tileBarInner: { background: ACCENT, height: "100%", borderRadius: 8 },
    tileScore: { fontSize: ".86rem", color: "var(--text-secondary)" },
    tileReason: { fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4, marginTop: 4, whiteSpace: "normal" },

    calendarSection: { margin: "48px auto 0", padding: "0 2px" },
    calendarWrapper: { background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24 },

    footerCopy: { margin: "48px auto 0", textAlign: "right", borderTop: "1px solid var(--border-color)", padding: 32 },
    hello: { color: "var(--text-secondary)", fontSize: 12 },
    pitch: { margin: "8px 0 0", color: ACCENT, fontWeight: 900, lineHeight: 1.1, fontSize: "clamp(20px,3vw,34px)" },
    smallCopy: { marginTop: 8, color: "var(--text-primary)", fontSize: 14 },
};
