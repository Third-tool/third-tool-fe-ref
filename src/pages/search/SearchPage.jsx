// src/pages/search/SearchPage.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchWithAccess } from "../../utils/authFetch.js";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;
const lift = { whileHover: { y: -2, scale: 1.01 }, whileTap: { scale: 0.98 } };

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const initialKeyword = searchParams.get("keyword") ?? searchParams.get("query") ?? "";
    const [keyword, setKeyword] = useState(initialKeyword);

    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const sentinelRef = useRef(null);

    const resetAndSearch = useCallback((kw) => {
        setItems([]);
        setPage(0);
        setHasMore(true);
        setKeyword(kw);
        setSearchParams({ keyword: kw });
    }, [setSearchParams]);

    const fetchPage = useCallback(async (p = 0) => {
        if (loading || !hasMore) return;
        if (!keyword?.trim()) return;

        setLoading(true);
        try {
            const url = `${BASE_URL}/api/search/cards/search?keyword=${encodeURIComponent(keyword)}&page=${p}&size=24`;
            const res = await fetchWithAccess(url);
            if (!res.ok) throw new Error("search failed");

            const data = await res.json();
            const content = data.content ?? data;

            setItems(prev => (p === 0 ? content : [...prev, ...content]));
            setHasMore(!data.last);
            setPage((data.number ?? p) + 1);
        } catch (e) {
            console.error("❌ 검색 실패:", e);
        } finally {
            setLoading(false);
        }
    }, [keyword, loading, hasMore]);

    useEffect(() => {
        if (!initialKeyword) return;
        setKeyword(initialKeyword);
        setItems([]);
        setPage(0);
        setHasMore(true);
    }, [initialKeyword]);

    useEffect(() => { if (keyword) fetchPage(0); }, [keyword, fetchPage]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const io = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) fetchPage(page);
        }, { rootMargin: "800px 0px" });
        io.observe(el);
        return () => io.disconnect();
    }, [page, fetchPage]);

    const onSubmit = (e) => {
        e.preventDefault();
        resetAndSearch(keyword.trim());
    };

    return (
        <div style={s.container}>
            {/* 🔒 전역 여백/배경/오버플로우 강제 — 하얀 가장자리 제거 */}
            <style>{`
        html, body { margin:0!important; padding:0!important; background:#000!important; overflow-x:hidden!important; }
        #root { background:#000!important; }
        .no-scrollbar{ scrollbar-width:none; } .no-scrollbar::-webkit-scrollbar{ display:none; }
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>



            {/* 결과 그리드 */}
            <main style={s.wrap}>
                <h2 style={s.title}>
                    🔍 Search Results <span style={s.sub}>for “{initialKeyword}”</span>
                </h2>

                <div style={s.grid}>
                    {items.map((c) => (
                        <CardTile
                            key={c.id ?? c.cardId}
                            card={c}
                            onClick={() => navigate(`/learning/search?cardId=${c.id ?? c.cardId}`)}
                        />
                    ))}
                    {loading && Array.from({ length: 8 }).map((_, i) => <div key={`sk-${i}`} style={s.skeleton} />)}
                </div>

                <div ref={sentinelRef} style={{ height: 1 }} />
                {!hasMore && items.length > 0 && <p style={s.endText}>모든 결과를 불러왔어요.</p>}
            </main>
        </div>
    );
}

/* 카드 타일 */
function CardTile({ card, onClick }) {
    const id = card.id ?? card.cardId;
    const question = card.question ?? card.highlightedQuestion ?? "(no question)";
    const thumb =
        card.thumbnailUrl ||
        card.images?.questionImages?.[0]?.imageUrl ||
        card.images?.[0]?.imageUrl ||
        null;

    return (
        <motion.div {...lift} style={s.card} onClick={onClick}>
            <div style={s.thumbWrap}>
                {thumb ? (
                    <img
                        src={thumb}
                        alt="thumb"
                        style={s.thumb}
                        onError={(e) => {
                            e.currentTarget.src =
                                "https://third-tool-s3-server.s3.ap-northeast-2.amazonaws.com/common/no-image.jpg";
                        }}
                    />
                ) : (
                    <div style={s.thumbFallback} />
                )}
            </div>
            <div style={s.meta}>
                <strong style={s.q}>{question}</strong>
                <div style={s.pills}>
                    <span style={s.pill}>#{id}</span>
                    <span style={s.pill}>CARD</span>
                </div>
            </div>
        </motion.div>
    );
}

/* styles */
const s = {
    container: { background: "#000", minHeight: "100vh", color: "#fff", overflowX: "hidden" },
    header: {
        position: "sticky", top: 0, zIndex: 5,
        display: "grid", gridTemplateColumns: "240px 1fr",
        gap: 12, alignItems: "center",
        padding: "14px 24px",
        background: "rgba(20,20,20,0.6)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
    },
    brand: { display: "flex", gap: 8, alignItems: "center", cursor: "pointer", fontWeight: 800 },
    logoDot: { color: "#d32f2f" },
    searchBar: {
        display: "flex", gap: 10, alignItems: "center",
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
        padding: 8, borderRadius: 9999,
    },
    searchInput: {
        flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "1rem",
    },
    searchBtn: { background: "#d32f2f", border: "none", color: "#fff", borderRadius: 9999, padding: "8px 14px", fontWeight: 800, cursor: "pointer" },

    wrap: { maxWidth: 1240, margin: "10px auto 24px", padding: "0 24px" },
    title: { margin: "12px 0 10px", fontSize: 20, fontWeight: 700 },
    sub: { color: "#aeb4b8", fontWeight: 600, marginLeft: 6 },

    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 14,
    },
    card: {
        background: "linear-gradient(180deg, #141414, #1b1b1b)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        cursor: "pointer",
        display: "grid",
        gridTemplateRows: "130px auto",
        overflow: "hidden",
    },
    thumbWrap: { position: "relative" },
    thumb: { width: "100%", height: 130, objectFit: "cover" },
    thumbFallback: { width: "100%", height: 130, background: "#1f1f1f" },

    meta: { padding: 12, display: "grid", gap: 8 },
    q: { fontSize: 14, lineHeight: "20px" },
    pills: { display: "flex", gap: 6, flexWrap: "wrap" },
    pill: {
        fontSize: 12, color: "#cfcfcf", background: "#1e1e1e", border: "1px solid #2a2a2a",
        padding: "3px 8px", borderRadius: 999,
    },

    skeleton: {
        height: 200, borderRadius: 14,
        background: "linear-gradient(90deg, #141414 25%, #1a1a1a 37%, #141414 63%)",
        backgroundSize: "400% 100%", animation: "shimmer 1.2s infinite",
    },
    endText: { color: "#9aa0a6", textAlign: "center", marginTop: 16 },
};

// shimmer keyframes(간단 삽입 — 중복 허용 무해)
const style = document.createElement("style");
style.innerHTML = `@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
if (typeof document !== "undefined") document.head.appendChild(style);
