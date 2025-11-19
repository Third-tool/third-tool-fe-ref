import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchWithAccess } from "../../utils/authFetch.js";
import DeckCreateModal from "./DeckCreateModal.jsx";
import DailyProgressModal from "./DailyProgressModal.jsx";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;
const ACCENT = "#f66957"; // 새 디자인의 Accent 색상

const fadeIn = (d = 0, y = 10, t = 0.35) => ({
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0, transition: { duration: t, ease: "easeOut", delay: d } },
});
const lift = { whileHover: { y: -2, scale: 1.01 }, whileTap: { scale: 0.98 } };

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
    Plus: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    ),
};

export default function DeckListPage() {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get("mode") || "THREE_DAY";
    const highlightDeckId = Number(searchParams.get("highlightDeckId") || 0);
    const navigate = useNavigate();

    const [decks, setDecks] = useState([]);
    const [subDecks, setSubDecks] = useState({});
    const [expandedDecks, setExpandedDecks] = useState({});
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [targetDeck, setTargetDeck] = useState(null);

    const [editDeck, setEditDeck] = useState(null);
    const [newName, setNewName] = useState("");

    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, deck: null });

    const rowRefs = useRef(new Map());

    useEffect(() => {
        loadTopDecks();
    }, []);

    async function loadTopDecks() {
        try {
            const res = await fetchWithAccess(`${BASE_URL}/api/decks`);
            const data = await res.json();
            setDecks(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("덱 목록 불러오기 실패");
        }
    }

    async function loadSubDecks(deckId) {
        try {
            const res = await fetchWithAccess(`${BASE_URL}/api/decks/${deckId}/sub-decks`);
            const data = await res.json();
            setSubDecks((prev) => ({ ...prev, [deckId]: Array.isArray(data) ? data : [] }));
        } catch (err) {
            console.error(err);
        }
    }

    const toggleSubDecks = (deckId, e) => {
        e?.stopPropagation();
        setExpandedDecks((prev) => ({ ...prev, [deckId]: !prev[deckId] }));
        if (!subDecks[deckId]) loadSubDecks(deckId);
    };

    const goToDetail = (deckId) => {
        navigate(`/decks/${deckId}?mode=${mode}`);
    };

    const openSubDeckModal = (deck, e) => {
        e.stopPropagation();
        setTargetDeck(deck);
        setShowModal(true);
    };
    const openRootDeckModal = () => {
        setTargetDeck(null);
        setShowModal(true);
    };

    async function updateDeckName(deckId, name) {
        try {
            const res = await fetchWithAccess(`${BASE_URL}/api/decks/${deckId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) throw new Error("덱 수정 실패");
            await loadTopDecks();
            alert("덱 이름이 수정되었습니다 ✅");
        } catch (err) {
            alert("수정 실패: " + err.message);
        }
    }

    const handleContextMenu = (e, deck) => {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.pageX, y: e.pageY, deck });
    };
    const closeContextMenu = () => setContextMenu({ visible: false, x: 0, y: 0, deck: null });
    const openEditModal = () => {
        setNewName(contextMenu.deck.name);
        setEditDeck(contextMenu.deck);
        closeContextMenu();
    };
    const handleEditSubmit = async () => {
        await updateDeckName(editDeck.id, newName);
        setEditDeck(null);
    };

    useEffect(() => {
        if (!highlightDeckId || decks.length === 0) return;

        const tryReveal = async () => {
            const rootHit = decks.find((d) => d.id === highlightDeckId);
            if (rootHit) {
                setTimeout(() => scrollAndPulse(highlightDeckId), 50);
                return;
            }
            for (const d of decks) {
                setExpandedDecks((prev) => ({ ...prev, [d.id]: true }));
                if (!subDecks[d.id]) {
                    await loadSubDecks(d.id);
                }
                const child = (subDecks[d.id] || []).find((c) => c.id === highlightDeckId);
                if (child) {
                    setTimeout(() => scrollAndPulse(highlightDeckId), 80);
                    return;
                }
            }
        };

        tryReveal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightDeckId, decks, subDecks]);

    const scrollAndPulse = (deckId) => {
        const el = rowRefs.current.get(deckId);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("pulse-hi");
        setTimeout(() => el.classList.remove("pulse-hi"), 1600);
    };

    // 하이라이트 애니메이션 <style> 태그 주입
    useEffect(() => {
        if (typeof document === "undefined") return;
        if (document.getElementById("decklist-highlight-style")) return;
        const css = `
      .pulse-hi{
        box-shadow: 0 0 0 0 rgba(246, 105, 87, 0.65); /* ACCENT 색상 */
        animation: pulseHi 1.2s ease-out 1;
        border-color: rgba(246, 105, 87, 0.65) !important;
        background: linear-gradient(180deg,#171717,#121212);
      }
      @keyframes pulseHi{
        0%{ box-shadow: 0 0 0 0 rgba(246, 105, 87, 0.65) }
        100%{ box-shadow: 0 0 0 18px rgba(246, 105, 87, 0) }
      }
    `;
        const el = document.createElement("style");
        el.id = "decklist-highlight-style";
        el.innerHTML = css;
        document.head.appendChild(el);
    }, []);

    return (
        <div style={sx.pageShell} onClick={closeContextMenu}>

            <main style={sx.main}>
                <div style={sx.pageHeader}>
                    <h1 style={sx.h1}>
                        <span style={sx.titleIcon}>
                            {mode === "THREE_DAY" ? <Icons.Lightning /> : <Icons.Infinity />}
                        </span>
                        {mode === "THREE_DAY" ? "3 Day Project" : "Permanent Project"}
                    </h1>
                    <motion.button {...lift} style={sx.createBtn} onClick={openRootDeckModal}>
                        <Icons.Plus />
                        <span style={{ marginLeft: '8px' }}>Create</span>
                    </motion.button>
                </div>

                <section style={sx.panel} aria-label="deck list panel">
                    <div style={sx.panelHeader}>
                        <h2 style={sx.h2}>Home</h2>
                        {highlightDeckId ? <span style={{ color: "#cbd1d6", fontSize: ".9rem" }}>찾는 덱을 강조 표시했어요</span> : null}
                    </div>

                    {decks.length === 0 && <p style={sx.emptyText}>덱이 없습니다.</p>}

                    <ul style={sx.list}>
                        {decks.map((deck, i) => (
                            <li key={deck.id} style={sx.rowWrap}>
                                <DeckRow
                                    deck={deck}
                                    depth={0}
                                    isExpanded={!!expandedDecks[deck.id]}
                                    onToggle={toggleSubDecks}
                                    onOpen={goToDetail}
                                    onAddSub={openSubDeckModal}
                                    onContextMenu={handleContextMenu}
                                    rowRefs={rowRefs}
                                />
                                {!!expandedDecks[deck.id] && (
                                    <SubDecks
                                        parentId={deck.id}
                                        subDecks={subDecks}
                                        expandedDecks={expandedDecks}
                                        onToggle={toggleSubDecks}
                                        onOpen={goToDetail}
                                        onAddSub={openSubDeckModal}
                                        onContextMenu={handleContextMenu}
                                        loadSubDecks={loadSubDecks}
                                        rowRefs={rowRefs}
                                    />
                                )}
                                {i !== decks.length - 1 && <div style={sx.divider} />}
                            </li>
                        ))}
                    </ul>
                </section>
            </main>

            {/* 모달들 */}
            <DeckCreateModal
                isOpen={showModal}
                onClose={(shouldReload) => {
                    setShowModal(false);
                    if (shouldReload) loadTopDecks();
                }}
                parentDeck={targetDeck?.name || null}
                parentDeckId={targetDeck?.id || null}
            />

            {editDeck && (
                <div style={sx.modalOverlay} onClick={() => setEditDeck(null)}>
                    <div style={sx.modalBox} onClick={(e) => e.stopPropagation()}>
                        <h3>덱 이름 수정</h3>
                        <input value={newName} onChange={(e) => setNewName(e.target.value)} style={sx.input} />
                        <div style={sx.modalBtns}>
                            <button style={sx.primaryBtn} onClick={handleEditSubmit}>저장</button>
                            <button style={sx.cancelBtn} onClick={() => setEditDeck(null)}>취소</button>
                        </div>
                    </div>
                </div>
            )}

            {contextMenu.visible && (
                <ul style={{ ...sx.contextMenu, top: contextMenu.y, left: contextMenu.x }} onClick={(e) => e.stopPropagation()}>
                    <li style={sx.contextMenuItem} onClick={openEditModal}>✏️ Edit</li>
                    <li style={sx.contextMenuItem} onClick={() => alert("추후 기능 예정")}>📄 Duplicate</li>
                    <li style={sx.contextMenuItem} onClick={() => alert("삭제 기능 연결 예정")}>🗑️ Delete</li>
                </ul>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}
            <DailyProgressModal />
        </div>
    );
}

/* 하위 컴포넌트 */
function DeckRow({ deck, depth, isExpanded, onToggle, onOpen, onAddSub, onContextMenu, rowRefs }) {
    const todayCount = deck.todayCount ?? deck.cardCountToday ?? deck.cardCount ?? 0;

    return (
        <motion.div
            {...lift}
            {...fadeIn(0.02)}
            ref={(el) => { if (el) rowRefs.current.set(deck.id, el); }}
            id={`deck-row-${deck.id}`}
            onClick={() => onOpen(deck.id)}
            onContextMenu={(e) => onContextMenu(e, deck)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") onOpen(deck.id); }}
            style={{ ...sx.row, paddingLeft: 20 + depth * 18 }}
        >
            <div style={sx.rowLeft}>
                <div style={sx.dot} aria-hidden />
                <div>
                    <div style={sx.rowTitle}>{deck.name}</div>
                    <div style={sx.subline}>Cards for today: {todayCount}</div>
                </div>
            </div>

            <div style={sx.rowRight} onClick={(e) => e.stopPropagation()}>
                {deck.shared && <span title="Shared" style={sx.sharedIcon}>👥</span>}

                <motion.button {...lift} style={sx.rowIconBtn} title="하위 덱 추가" onClick={(e) => onAddSub(deck, e)}>+</motion.button>

                <motion.button
                    {...lift}
                    style={sx.rowIconBtn}
                    title={isExpanded ? "접기" : "펼치기"}
                    onClick={(e) => onToggle(deck.id, e)}
                    aria-expanded={isExpanded}
                >
                    {isExpanded ? "▴" : "▾"}
                </motion.button>

                <button style={sx.chevBtn} aria-label="열기" onClick={() => onOpen(deck.id)}>›</button>
            </div>
        </motion.div>
    );
}

function SubDecks({
                      parentId,
                      subDecks,
                      expandedDecks,
                      onToggle,
                      onOpen,
                      onAddSub,
                      onContextMenu,
                      loadSubDecks,
                      rowRefs,
                  }) {
    const children = subDecks[parentId] || [];

    useEffect(() => {
        if (!subDecks[parentId]) loadSubDecks(parentId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parentId]);

    if (!children.length) {
        return <div style={{ ...sx.subEmpty, paddingLeft: 20 + 1 * 18 }}>하위 덱 없음</div>;
    }

    return (
        <ul style={sx.subList}>
            {children.map((d) => (
                <li key={d.id}>
                    <DeckRow
                        deck={d}
                        depth={1}
                        isExpanded={!!expandedDecks[d.id]}
                        onToggle={onToggle}
                        onOpen={onOpen}
                        onAddSub={onAddSub}
                        onContextMenu={onContextMenu}
                        rowRefs={rowRefs}
                    />
                    {!!expandedDecks[d.id] && (
                        <SubDecks
                            parentId={d.id}
                            subDecks={subDecks}
                            expandedDecks={expandedDecks}
                            onToggle={onToggle}
                            onOpen={onOpen}
                            onAddSub={onAddSub}
                            onContextMenu={onContextMenu}
                            loadSubDecks={loadSubDecks}
                            rowRefs={rowRefs}
                        />
                    )}
                </li>
            ))}
        </ul>
    );
}

/* 스타일 */
const sx = {
    pageShell: {
        position: "relative",
        paddingBottom: "100px"
    },
    main: {
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "0" // .page-content가 24px 패딩을 제공
    },
    pageHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
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
    createBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: ACCENT,
        border: "none",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: "8px",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: "14px",
    },
    panel: {
        backgroundColor: "#121212",
        border: "1px solid #1e1e1e",
        borderRadius: "24px",
        padding: "16px",
        boxShadow: "0 10px 28px rgba(0,0,0,0.25)"
    },
    panelHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 8px 12px"
    },
    h2: {
        margin: 0,
        fontSize: "20px",
        letterSpacing: "0.2px"
    },
    list: {
        margin: 0,
        padding: 0,
        listStyle: "none"
    },
    subList: {
        margin: 0,
        padding: 0,
        listStyle: "none"
    },
    rowWrap: {
        margin: 0,
        padding: 0
    },
    row: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        minHeight: "64px",
        padding: "14px 16px",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "background .2s ease",
        border: "1px solid transparent",
    },
    rowLeft: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minWidth: 0
    },
    rowRight: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexShrink: 0,
    },
    rowTitle: {
        fontWeight: 700,
        fontSize: "16px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "520px"
    },
    subline: {
        color: "#9aa0a6",
        fontSize: "13px",
        marginTop: "2px"
    },
    dot: {
        width: "22px",
        height: "22px",
        borderRadius: "999px",
        backgroundColor: "#1e1e1e",
        border: "1px solid #2a2a2a"
    },
    sharedIcon: {
        color: "#7cc1ff",
        fontSize: "18px",
        marginRight: "2px"
    },
    rowIconBtn: {
        width: 34,
        height: 34,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",

        background: "rgba(255,255,255,0.06)",
        border: "none",
        outline: "none",
        color: "#fff",
        padding: "4px 8px",
        borderRadius: "8px",
        cursor: "pointer"
    },
    chevBtn: {
        background: "transparent",
        border: "none",
        color: "#cfd5db",
        fontSize: "40px",
        lineHeight: 1,
        padding: "2px 6px",
        cursor: "pointer"
    },
    divider: {
        height: "1px",
        background: "rgba(255,255,255,0.06)",
        margin: "2px 0 2px 20px",
        borderRadius: "1px"
    },
    subEmpty: {
        color: "#80868b",
        fontSize: "13px",
        padding: "6px 0 10px"
    },
    emptyText: {
        textAlign: "center",
        color: "#9aa0a6",
        padding: "24px"
    },
    modalOverlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modalBox: {
        background: "#1b1b1b",
        padding: "20px",
        borderRadius: "12px",
        width: "320px",
        textAlign: "center"
    },
    input: {
        width: "100%",
        padding: "8px",
        borderRadius: "6px",
        border: "1px solid #333",
        background: "#2a2a2a",
        color: "#fff",
        margin: "10px 0",
    },
    modalBtns: {
        display: "flex",
        gap: "8px",
        marginTop: "10px",
        justifyContent: "center"
    },
    primaryBtn: {
        background: ACCENT,
        border: "none",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: "6px",
        cursor: "pointer"
    },
    cancelBtn: {
        background: "#444",
        border: "none",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: "6px",
        cursor: "pointer"
    },
    contextMenu: {
        position: "absolute",
        background: "#222",
        color: "#fff",
        listStyle: "none",
        padding: "6px 0",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        zIndex: 9999,
        minWidth: "140px",
    },
    contextMenuItem: {
        padding: "8px 12px",
        cursor: "pointer",
    },
};