import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { fetchWithAccess } from "../../utils/authFetch.js";
import CardRankControlModal from "./CardRankControlModal.jsx";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function DeckDetailPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get("mode") || "THREE_DAY";
    const navigate = useNavigate();

    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [page, setPage] = useState(0);
    const [hasNext, setHasNext] = useState(true);
    const [loading, setLoading] = useState(false);

    // (1) 초기 selectedRank 값 변경
    const [selectedRank, setSelectedRank] = useState(null); // ❌ "SILVER" → ✅ null
    const [showRankModal, setShowRankModal] = useState(false);
    const loader = useRef(null);

    /** ✅ 덱 로드 */
    async function loadDeck() {
        try {
            const res = await fetchWithAccess(`${BASE_URL}/api/decks`);
            const data = await res.json();
            const found = data.find((d) => d.id === Number(id));
            setDeck(found);
        } catch (e) {
            console.error("❌ 덱 로드 실패:", e);
        }
    }

    /** ✅ 카드 로드 (무한 스크롤) */
    const loadCards = useCallback(async () => {
        if (!hasNext || loading) return;

        try {
            setLoading(true);
            const res = await fetchWithAccess(
                `${BASE_URL}/api/cards/decks/${id}?mode=${mode}&page=${page}&size=20`
            );
            const data = await res.json();

            if (!data.content) return;
            setCards((prev) => [...prev, ...data.content]);
            setHasNext(!data.last);
        } catch (e) {
            console.error("❌ 카드 로드 실패:", e);
        } finally {
            setLoading(false);
        }
    }, [id, mode, page, hasNext, loading]);

    /** ✅ Rank별 카드 로드 */
    async function loadCardsByRank(rank) {
        try {
            const res = await fetchWithAccess(
                `${BASE_URL}/api/cards/by-rank?deckId=${id}&mode=${mode}&rankName=${rank}`
            );

            // ✅ 응답이 실패(400, 404 등)면 바로 예외 발생
            if (res.status === 204) {
                // 카드 없음
                setCards([]);
                setSelectedRank(rank);
                setHasNext(false);
                return;
            }

            const data = await res.json();

            // ✅ 카드가 없으면 content가 비어 있음
            if (!data.content || data.content.length === 0) {
                setCards([]);
                setSelectedRank(rank);
                setHasNext(false);
                return;
            }

            // ✅ 정상 데이터 처리
            setCards(data.content);
            setHasNext(!data.last);
            setSelectedRank(rank);

        } catch (e) {
            console.error("❌ 랭크별 카드 로드 실패:", e);
            // 예외 발생 시도 '없음' 표시 유지
            setCards([]);
            setSelectedRank(rank);
            setHasNext(false);
        }
    }

    /** ✅ IntersectionObserver (무한 스크롤) */
    useEffect(() => {
        if (!loader.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNext && !loading) {
                    setPage((p) => p + 1);
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(loader.current);
        return () => observer.disconnect();
    }, [hasNext, loading]);

    /** ✅ 모드 변경 시 초기화 */
    useEffect(() => {
        setCards([]);
        setPage(0);
        setHasNext(true);
    }, [mode]);

    /** ✅ 첫 로드 */
    useEffect(() => {
        loadDeck();
    }, [id]);

    /** ✅ 페이지 변경 시 카드 로드 */
    useEffect(() => {
        loadCards();
    }, [page, mode]);

    if (!deck) return <p style={{ color: "white" }}>로딩 중...</p>;

    return (
        <div style={s.container}>
            {/* 🔹 헤더 */}
            <header style={s.header}>
                <div style={s.headerLeft}>
                    <span style={s.logo}>TTT</span>
                    <h2>{mode === "THREE_DAY" ? "3 Day Project" : "Permanent Project"}</h2>
                </div>
                <button onClick={() => navigate(-1)} style={s.backBtn}>
                    ←
                </button>
            </header>

            {/* 🔹 덱 이름 */}
            <div style={s.deckTitle}>{deck.name}</div>

            {/* 🔹 Rank 필터 */}
            <div style={s.rankFilter}>
                {["SILVER", "GOLD", "DIAMOND"].map((rank) => (
                    <button
                        key={rank}
                        onClick={() => loadCardsByRank(rank)}
                        style={{
                            ...s.rankBtn,
                            backgroundColor: selectedRank === rank ? "#d32f2f" : "#2a2a2a", // 선택 시만 색상 적용
                            opacity: selectedRank ? 1 : 0.7, // 선택 전엔 살짝 흐리게
                        }}
                    >
                        {rank}
                    </button>
                ))}
                <button onClick={() => setShowRankModal(true)} style={s.editRankBtn}>
                    ⚙️ Rank 설정
                </button>
            </div>

            {/* 🔹 카드 리스트 */}
            <div style={s.cardList}>

                {selectedRank && cards.length === 0 && !loading && (
                    <div style={{ textAlign: "center", color: "#777", marginTop: "40px" }}>
                        <p>📭 해당 Rank에 카드가 없습니다. 힝구~~ㅠㅠ</p>
                    </div>
                )}

                {cards.map((card,index) => {
                    const previewImg =
                        card.images?.find((img) => img.imageType === "QUESTION")?.imageUrl ||
                        card.images?.[0]?.imageUrl ||
                        null;

                    return (
                        <div
                            key={`${card.id}-${index}`}
                            style={s.cardItem}
                            onClick={() =>
                                navigate(
                                    `/learning/three-day?deckId=${id}&cardId=${card.id}&mode=${mode}&rankName=${selectedRank}`
                                )
                            }
                        >
                            <div style={s.cardText}>
                                <h4 style={s.cardTitle}>{card.question}</h4>
                                <p style={s.cardDesc}>{card.answer}</p>
                            </div>

                            {previewImg ? (
                                <img
                                    src={previewImg}
                                    alt="card thumbnail"
                                    style={s.cardThumb}
                                />
                            ) : (
                                <div style={s.cardThumbPlaceholder}>🗒️</div>
                            )}
                        </div>
                    );
                })}

                {/* 🔹 로딩 표시 */}
                {loading && <p style={{ textAlign: "center", color: "#aaa" }}>Loading...</p>}
                <div ref={loader} style={{ height: 50 }} />
            </div>

            {/* 🔹 카드 추가 버튼 */}
            <button
                style={s.addCardBtn}
                onClick={() => navigate(`/decks/${id}/cards/new?mode=${mode}`)}
            >
                + 카드 추가
            </button>

            {/* 🔹 Rank 수정 모달 */}
            {showRankModal && <CardRankControlModal onClose={() => setShowRankModal(false)} />}
        </div>
    );
}

const s = {
    container: {
        backgroundColor: "#0f0f0f",
        color: "white",
        minHeight: "100vh",
        padding: "20px 30px",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #333",
        marginBottom: 20,
    },
    headerLeft: { display: "flex", alignItems: "center", gap: 10 },
    logo: { fontWeight: "bold", fontSize: "1.2rem", color: "#d32f2f" },
    backBtn: {
        background: "none",
        border: "none",
        color: "white",
        fontSize: "1.3rem",
        cursor: "pointer",
    },
    deckTitle: { fontSize: "1.2rem", fontWeight: "600", marginBottom: 15 },
    rankFilter: { display: "flex", gap: 10, marginBottom: 25 },
    rankBtn: {
        border: "none",
        padding: "8px 14px",
        borderRadius: 8,
        color: "white",
        cursor: "pointer",
    },
    editRankBtn: {
        marginLeft: "auto",
        background: "#444",
        border: "none",
        borderRadius: 8,
        padding: "8px 12px",
        color: "white",
        cursor: "pointer",
    },
    cardList: { display: "flex", flexDirection: "column", gap: 15 },
    cardItem: {
        backgroundColor: "#1f1f1f",
        borderRadius: 10,
        padding: "14px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 15,
        cursor: "pointer",
        transition: "background 0.2s",
    },
    cardItemHover: {
        backgroundColor: "#2b2b2b",
    },
    cardText: { flex: 1, overflow: "hidden" },
    cardTitle: {
        margin: 0,
        fontSize: "1rem",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    cardDesc: {
        margin: "4px 0 0",
        fontSize: "0.85rem",
        color: "#aaa",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    cardThumb: {
        width: 60,
        height: 60,
        borderRadius: 8,
        objectFit: "cover",
        flexShrink: 0,
    },
    cardThumbPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: "#2a2a2a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#888",
        fontSize: "1.2rem",
    },
    addCardBtn: {
        position: "fixed",
        bottom: 30,
        right: 30,
        backgroundColor: "#d32f2f",
        border: "none",
        color: "white",
        padding: "14px 25px",
        borderRadius: 30,
        fontSize: "1rem",
        cursor: "pointer",
    },
};