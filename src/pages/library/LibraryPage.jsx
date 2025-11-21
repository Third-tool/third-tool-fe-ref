import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

/* helpers */
const lift = { whileHover: { y: -2, scale: 1.01 }, whileTap: { scale: 0.98 } };
const fade = (d = 0) => ({
    initial: { opacity: 0, y: 8 },
    whileInView: { opacity: 1, y: 0, transition: { duration: 0.35, delay: d } },
    viewport: { once: true },
});
const imgSrc = (seed, w = 480, h = 320) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

/* fake sections */
const FAKE_SECTIONS = [
    {
        key: "popular",
        title: "Popular",
        items: [
            { name: "English Regular Expressions", rating: 4.8, views: 1812, cards: 598, seed: "regex-eng" },
            { name: "MCAT Milesdown", rating: 4.9, views: 540, cards: 2884, seed: "mcat-miles" },
            { name: "Basic Hiragana", rating: 4.9, views: 1039, cards: 46, seed: "jp-hiragana" },
            { name: "Python Patterns", rating: 4.7, views: 890, cards: 340, seed: "py-patterns" },
            { name: "Data Structures (Java)", rating: 4.8, views: 1320, cards: 420, seed: "ds-java" },
            { name: "Docker & K8s 101", rating: 4.6, views: 760, cards: 380, seed: "dock-k8s" },
        ],
    },
    {
        key: "german",
        title: "German",
        items: [
            { name: "A1 Nomen Plural", rating: 4.7, views: 410, cards: 250, seed: "de-a1-plural" },
            { name: "B1 Redewendungen", rating: 4.6, views: 168, cards: 300, seed: "de-b1-idioms" },
            { name: "Trennbare Verben", rating: 4.8, views: 220, cards: 180, seed: "de-separable" },
            { name: "Konjunktiv II", rating: 4.7, views: 180, cards: 140, seed: "de-konj2" },
            { name: "Artikel-Trainer", rating: 4.5, views: 520, cards: 210, seed: "de-articles" },
        ],
    },
    {
        key: "java",
        title: "Java / Spring",
        items: [
            { name: "Spring Security Essentials", rating: 4.8, views: 920, cards: 160, seed: "spring-security" },
            { name: "JPA Query Mastery", rating: 4.7, views: 740, cards: 210, seed: "jpa-query" },
            { name: "Effective OOP in Java", rating: 4.9, views: 1500, cards: 300, seed: "java-oop" },
            { name: "Test-Driven Dev (Junit5)", rating: 4.6, views: 660, cards: 140, seed: "tdd-junit" },
            { name: "Spring Boot 3 Recipes", rating: 4.8, views: 1130, cards: 260, seed: "sb3-recipes" },
        ],
    },
    {
        key: "algorithms",
        title: "Algorithms",
        items: [
            { name: "Graph Theory Kit", rating: 4.7, views: 720, cards: 180, seed: "algo-graph" },
            { name: "DP Patterns", rating: 4.8, views: 1010, cards: 240, seed: "algo-dp" },
            { name: "Greedy Patterns", rating: 4.6, views: 600, cards: 150, seed: "algo-greedy" },
            { name: "Sorting & Searching", rating: 4.7, views: 860, cards: 200, seed: "algo-sort" },
            { name: "Binary Tree Drills", rating: 4.5, views: 540, cards: 120, seed: "algo-tree" },
        ],
    },
    {
        key: "english",
        title: "English",
        items: [
            { name: "TOEIC RC 1000", rating: 4.7, views: 2300, cards: 1000, seed: "toeic-rc" },
            { name: "Business Email Phrases", rating: 4.8, views: 1200, cards: 320, seed: "biz-email" },
            { name: "IELTS Writing Task 2", rating: 4.6, views: 880, cards: 260, seed: "ielts-task2" },
            { name: "Phrasal Verbs Pack", rating: 4.7, views: 980, cards: 220, seed: "phrasal-verbs" },
        ],
    },
    {
        key: "data",
        title: "Data Science",
        items: [
            { name: "Pandas Cookbook", rating: 4.8, views: 960, cards: 210, seed: "pandas-cook" },
            { name: "SQL 200 Drills", rating: 4.7, views: 1100, cards: 200, seed: "sql-200" },
            { name: "Stats for ML", rating: 4.6, views: 640, cards: 160, seed: "stats-ml" },
            { name: "Visualization Best Practices", rating: 4.5, views: 420, cards: 120, seed: "viz-best" },
        ],
    },
];

/* deck card */
function DeckCard({ title, thumbSeed, rating, views, cards, disabled = true, onClick }) {
    return (
        <motion.div {...lift} style={st.card} onClick={disabled ? undefined : onClick}>
            <div style={st.thumbWrap}>
                <img
                    src={imgSrc(thumbSeed)}
                    alt={title}
                    style={st.thumb}
                    onError={(e) => {
                        e.currentTarget.src =
                            "https://third-tool-s3-server.s3.ap-northeast-2.amazonaws.com/common/no-image.jpg";
                    }}
                    loading="lazy"
                />
            </div>

            <div style={st.cardBody}>
                <div style={st.deckTitle} title={title}>{title}</div>
                <div style={st.metaRow}>
                    <div style={st.metaPill}>★ {rating.toFixed(1)}</div>
                    <div style={st.metaPill}>👀 {views.toLocaleString()}</div>
                    <div style={st.metaPill}>🧩 {cards}</div>
                </div>

                <div style={st.actions}>
                    <button
                        style={{ ...st.ghostBtn, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .6 : 1 }}
                        disabled={disabled}
                        onClick={disabled ? undefined : onClick}
                    >
                        미리보기
                    </button>
                    <button
                        style={{ ...st.primaryBtn, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .6 : 1 }}
                        disabled={disabled}
                        onClick={disabled ? undefined : onClick}
                    >
                        가져오기
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

/* horizontal section */
function HSection({ title, items, enableFirstTwo = false }) {
    const ref = useRef(null);
    const navigate = useNavigate();
    const scrollBy = (dir) => {
        if (!ref.current) return;
        const w = ref.current.clientWidth;
        ref.current.scrollBy({ left: dir * Math.max(320, Math.floor(w * 0.9)), behavior: "smooth" });
    };

    const clickHandlers = [
        () => navigate("/library/demo/regex-eng"),
        () => navigate("/library/demo/mcat-miles"),
    ];

    return (
        <motion.section {...fade(0.02)} style={{ marginBottom: 26 }}>
            <div style={st.rowHead}>
                <h2 style={st.rowTitle}>{title}</h2>
                <div style={st.rowBtns}>
                    <button style={st.circleBtn} onClick={() => scrollBy(-1)}>‹</button>
                    <button style={st.circleBtn} onClick={() => scrollBy(1)}>›</button>
                </div>
            </div>

            <div ref={ref} style={st.hScroll} className="no-scrollbar">
                {items.map((it, i) => {
                    const canClick = enableFirstTwo && (i === 0 || i === 1);
                    return (
                        <DeckCard
                            key={`${title}-${i}`}
                            title={it.name}
                            thumbSeed={it.seed}
                            rating={it.rating}
                            views={it.views}
                            cards={it.cards}
                            disabled={!canClick}
                            onClick={canClick ? clickHandlers[i] : undefined}
                        />
                    );
                })}
            </div>
        </motion.section>
    );
}

/* main */
export default function LibraryPage() {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const sentinelRef = useRef(null);
    const navigate = useNavigate();

    const fetchPage = useCallback(async (p = 0) => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const accessToken = localStorage.getItem("accessToken");
            const res = await fetch(`${BASE_URL}/api/library/feed?page=${p}&size=18`, {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            });
            if (!res.ok) throw new Error("failed to load");
            const data = await res.json();
            setItems(prev => (p === 0 ? data.content : [...prev, ...data.content]));
            setHasMore(!data.last);
            setPage(data.number + 1);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore]);

    useEffect(() => { fetchPage(0); }, [fetchPage]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const io = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) fetchPage(page);
        }, { rootMargin: "800px 0px" });
        io.observe(el);
        return () => io.disconnect();
    }, [page, fetchPage]);

    return (
        <div style={st.pageShell}>
            {/* 전역 여백/배경/오버플로우 강제 */}
            <style>{`
        html, body { margin:0!important; padding:0!important; background:#000!important; overflow-x:hidden!important; }
        #root { background:#000!important; }
        .no-scrollbar{ scrollbar-width:none; } .no-scrollbar::-webkit-scrollbar{ display:none; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

            {/* 헤더 */}
            <div style={st.headerRow}>
                <h1 style={st.title}>📚 Library</h1>
                <div style={st.headerRight}>
                    <span style={st.metaText}>{items.length} decks</span>
                </div>
            </div>

            {/* 섹션 */}
            {FAKE_SECTIONS.map(sec => (
                <HSection
                    key={sec.key}
                    title={sec.title}
                    items={sec.items}
                    enableFirstTwo={sec.key === "popular"}
                />
            ))}

            <div style={st.sep} />

            {/* All decks */}
            <motion.h2 {...fade(0.02)} style={st.sectionTitle}>All decks</motion.h2>
            <motion.div
                style={st.grid}
                initial="hidden"
                animate="show"
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.045, delayChildren: 0.05 } } }}
            >
                {items.map((d, i) => (
                    <motion.div key={d.libraryEntryId ?? `${d.deckName}-${i}`} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
                        <DeckCard
                            title={d.deckName}
                            thumbSeed={d.deckName}
                            rating={4.7}
                            views={800}
                            cards={d.cardCount ?? 120}
                            disabled={!(i === 0 || i === 1)}
                            onClick={
                                i === 0
                                    ? () => navigate("/library/demo/regex-eng")
                                    : i === 1
                                        ? () => navigate("/library/demo/mcat-miles")
                                        : undefined
                            }
                        />
                    </motion.div>
                ))}
                {loading && Array.from({ length: 6 }).map((_, i) => <div key={`sk-${i}`} style={st.skeleton} />)}
            </motion.div>

            <div ref={sentinelRef} style={{ height: 1 }} />

            {/* 하단 리뷰 블록 */}
            <motion.div {...fade(0.06)} style={st.reviewBlock}>
                <div style={st.scoreLeft}>
                    <div style={st.bigScore}>4.9</div>
                    <div style={st.scoreSub}>2123 ratings</div>
                </div>
                <div style={st.barsRight}>
                    {[5, 4, 3, 2, 1].map((v, idx) => (
                        <div key={idx} style={st.barRow}>
                            <span style={st.barLabel}>{v}★</span>
                            <div style={st.barTrack}><div style={st.barFill(idx)} /></div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

/* styles */
const st = {
    pageShell: { background: "#000", minHeight: "100vh", color: "#fff", padding: "24px 36px", fontFamily: "Pretendard, ui-sans-serif, system-ui", width: "100%", overflowX: "hidden" },
    headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
    title: { fontSize: 24, fontWeight: 700, letterSpacing: 0.2 },
    headerRight: { display: "flex", gap: 12, alignItems: "center" },
    metaText: { color: "#9aa0a6", fontSize: 13 },

    rowHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, marginTop: 18 },
    rowTitle: { margin: 0, fontSize: 18, color: "#ddd" },
    rowBtns: { display: "flex", gap: 8 },
    circleBtn: { width: 34, height: 34, borderRadius: 34, background: "#161616", color: "#fff", border: "1px solid #2a2a2a", cursor: "pointer" },

    hScroll: { display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(320px, 1fr)", gap: 16, overflowX: "auto" },

    card: { background: "linear-gradient(180deg, #141414 0%, #171717 100%)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", display: "grid", gridTemplateRows: "180px 1fr", minWidth: 320 },
    thumbWrap: { position: "relative" },
    thumb: { width: "100%", height: 180, objectFit: "cover", display: "block" },
    cardBody: { padding: 12, display: "grid", gap: 10 },
    deckTitle: { fontWeight: 600, fontSize: 15, lineHeight: "20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    metaRow: { display: "flex", gap: 8 },
    metaPill: { fontSize: 12, color: "#cfcfcf", background: "#1e1e1e", border: "1px solid #2a2a2a", padding: "4px 8px", borderRadius: 999 },
    actions: { display: "flex", gap: 8, justifyContent: "flex-end" },
    ghostBtn: { background: "transparent", border: "1px solid #2e2e2e", color: "#c7c7c7", padding: "6px 10px", borderRadius: 10, fontSize: 12 },
    primaryBtn: { background: "#ff3b30", border: "none", color: "#fff", padding: "6px 12px", borderRadius: 10, fontSize: 12 },

    sep: { height: 1, background: "#1a1a1a", margin: "12px 0 6px" },
    sectionTitle: { margin: "8px 0 14px", fontSize: 18, color: "#ddd" },

    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 },
    skeleton: { height: 260, borderRadius: 14, background: "linear-gradient(90deg, #141414 25%, #1a1a1a 37%, #141414 63%)", backgroundSize: "400% 100%", animation: "shimmer 1.2s infinite" },

    reviewBlock: { marginTop: 28, padding: 18, background: "#121212", borderRadius: 16, display: "grid", gridTemplateColumns: "220px 1fr", gap: 18, border: "1px solid #1e1e1e" },
    bigScore: { fontSize: 56, fontWeight: 800, color: "#fff" },
    scoreSub: { color: "#a8afb7", marginTop: 4 },
    scoreLeft: { alignSelf: "center" },
    barsRight: { display: "flex", flexDirection: "column", gap: 8 },
    barRow: { display: "grid", gridTemplateColumns: "40px 1fr", alignItems: "center", gap: 8 },
    barLabel: { color: "#ccc", fontSize: 12, textAlign: "right" },
    barTrack: { background: "#1d1d1d", height: 8, borderRadius: 6, overflow: "hidden" },
    barFill: (idx) => ({ width: `${[78, 36, 12, 5, 3][idx]}%`, height: "100%", background: "#ff3b30" }),
};
