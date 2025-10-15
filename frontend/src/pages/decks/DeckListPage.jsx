import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { fetchWithAccess } from "../../utils/authFetch.js";
import DeckCreateModal from "./DeckCreateModal.jsx";
import DailyProgressModal from "./DailyProgressModal.jsx";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function DeckListPage() {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get("mode") || "THREE_DAY";
    const navigate = useNavigate();

    const [decks, setDecks] = useState([]);
    const [subDecks, setSubDecks] = useState({});
    const [expandedDecks, setExpandedDecks] = useState({});
    const [error, setError] = useState("");

    // ✅ 모달 상태
    const [showModal, setShowModal] = useState(false);
    const [targetDeck, setTargetDeck] = useState(null);

    // ✅ 수정 모달 상태
    const [editDeck, setEditDeck] = useState(null);
    const [newName, setNewName] = useState("");

    // ✅ 컨텍스트 메뉴 상태
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, deck: null });

    useEffect(() => {
        loadTopDecks();
    }, []);

    async function loadTopDecks() {
        try {
            const res = await fetchWithAccess(`${BASE_URL}/api/decks`);
            const data = await res.json();
            setDecks(data);
        } catch (err) {
            console.error(err);
            setError("덱 목록 불러오기 실패");
        }
    }

    // ✅ 하위 덱 로드
    async function loadSubDecks(deckId) {
        try {
            const res = await fetchWithAccess(`${BASE_URL}/api/decks/${deckId}/sub-decks`);
            const data = await res.json();
            setSubDecks((prev) => ({ ...prev, [deckId]: data }));
        } catch (err) {
            console.error(err);
        }
    }

    const toggleSubDecks = (deckId) => {
        setExpandedDecks((prev) => ({
            ...prev,
            [deckId]: !prev[deckId],
        }));
        if (!subDecks[deckId]) loadSubDecks(deckId);
    };

    const goToDetail = (deckId) => navigate(`/decks/${deckId}?mode=${mode}`);

    // ✅ 서브덱 생성 모달 열기 (parentId 존재)
    const openSubDeckModal = (deck) => {
        setTargetDeck(deck);
        setShowModal(true);
    };

    // ✅ 루트덱 생성 모달 열기 (parentId 없음)
    const openRootDeckModal = () => {
        setTargetDeck(null);
        setShowModal(true);
    };

    /** ✅ 덱 이름 수정 요청 */
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
            console.error(err);
            alert("수정 실패: " + err.message);
        }
    }

    /** ✅ 오른쪽 클릭 메뉴 표시 */
    const handleContextMenu = (e, deck) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.pageX,
            y: e.pageY,
            deck,
        });
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
        setNewName("");
    };

    return (
        <div style={s.container} onClick={closeContextMenu}>
            {/* 헤더 */}
            <header style={s.header}>
                <div style={s.logoBox}>
                    <span style={s.logo}>TTT</span>
                    <h2>{mode === "THREE_DAY" ? "3 Day Project" : "Permanent Project"}</h2>
                </div>
            </header>

            {/* 본문 */}
            <main>
                {decks.length === 0 && <p>덱이 없습니다.</p>}
                {decks.map((deck) => (
                    <DeckNode
                        key={deck.id}
                        deck={deck}
                        subDecks={subDecks}
                        expandedDecks={expandedDecks}
                        onToggle={toggleSubDecks}
                        onDetail={goToDetail}
                        onAddSubDeck={openSubDeckModal}
                        onContextMenu={handleContextMenu}
                    />
                ))}
            </main>

            {/* 루트 덱 추가 버튼 */}
            <button style={s.addBtn} onClick={openRootDeckModal}>
                ➕ 덱 추가
            </button>

            {/* 덱 생성 모달 */}
            <DeckCreateModal
                isOpen={showModal}
                onClose={(shouldReload) => {
                    setShowModal(false);
                    if (shouldReload) loadTopDecks();
                }}
                parentDeck={targetDeck?.name || null}
                parentDeckId={targetDeck?.id || null}

            />

            {/* 오른쪽 클릭 메뉴 */}
            {contextMenu.visible && (
                <ul
                    style={{
                        ...s.contextMenu,
                        top: contextMenu.y,
                        left: contextMenu.x,
                    }}
                >
                    <li onClick={openEditModal}>✏️ Edit</li>
                    <li onClick={() => alert("추후 기능 예정")}>📄 Duplicate</li>
                    <li onClick={() => alert("삭제 기능 연결 예정")}>🗑️ Delete</li>
                </ul>
            )}

            {/* 덱 이름 수정 모달 */}
            {editDeck && (
                <div style={s.editModal}>
                    <div style={s.modalContent}>
                        <h3>덱 이름 수정</h3>
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            style={s.input}
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={handleEditSubmit} style={s.saveBtn}>저장</button>
                            <button onClick={() => setEditDeck(null)} style={s.cancelBtn}>취소</button>
                        </div>
                    </div>
                </div>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}

            <DailyProgressModal />
        </div>
    );
}

/* ✅ 재귀형 덱 노드 */
function DeckNode({
                      deck,
                      subDecks,
                      expandedDecks,
                      onToggle,
                      onDetail,
                      onAddSubDeck,
                      onContextMenu,
                      depth = 0,
                  }) {
    const children = subDecks[deck.id] || [];
    const isExpanded = expandedDecks[deck.id];

    return (
        <div
            style={{ ...s.deckCard, marginLeft: depth * 20 }}
            onContextMenu={(e) => onContextMenu(e, deck)}
        >
            <div style={s.deckTop}>
                <div onClick={() => onDetail(deck.id)} style={s.deckName}>
                    <h4>{deck.name}</h4>
                </div>
                <div style={s.deckBtns}>
                    <button onClick={() => onAddSubDeck(deck)} style={s.plusBtn}>➕</button>
                    <button onClick={() => onToggle(deck.id)} style={s.arrowBtn}>
                        {isExpanded ? "▲" : "▼"}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div style={s.subDeckBox}>
                    {children.length ? (
                        children.map((sub) => (
                            <DeckNode
                                key={sub.id}
                                deck={sub}
                                subDecks={subDecks}
                                expandedDecks={expandedDecks}
                                onToggle={onToggle}
                                onDetail={onDetail}
                                onAddSubDeck={onAddSubDeck}
                                onContextMenu={onContextMenu}
                                depth={depth + 1}
                            />
                        ))
                    ) : (
                        <p style={s.noSubDeck}>하위 덱 없음</p>
                    )}
                </div>
            )}
        </div>
    );
}

/* 🎨 스타일 */
const s = {
    container: { backgroundColor: "#0f0f0f", color: "white", minHeight: "100vh", padding: "20px 30px" },
    header: { display: "flex", justifyContent: "space-between", marginBottom: 20 },
    logoBox: { display: "flex", alignItems: "center", gap: 10 },
    logo: { fontWeight: "bold", fontSize: "1.2rem", color: "#d32f2f" },
    deckCard: { backgroundColor: "#1a1a1a", borderRadius: 10, padding: "15px 20px", marginBottom: 10 },
    deckTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    deckName: { cursor: "pointer" },
    deckBtns: { display: "flex", gap: 6 },
    plusBtn: { background: "none", border: "1px solid #333", color: "white", cursor: "pointer", borderRadius: 6, padding: "2px 6px" },
    arrowBtn: { background: "none", color: "white", border: "none", cursor: "pointer", fontSize: "1.2rem" },
    subDeckBox: { marginTop: 10, borderTop: "1px solid #333", paddingTop: 8 },
    noSubDeck: { color: "#777", fontSize: "0.8rem" },
    addBtn: { position: "fixed", bottom: 30, right: 30, backgroundColor: "#d32f2f", border: "none", color: "white", padding: "14px 25px", borderRadius: 30, fontSize: "1rem", cursor: "pointer" },
    contextMenu: { position: "absolute", backgroundColor: "#222", color: "white", listStyle: "none", padding: "6px 0", borderRadius: 8, boxShadow: "0 4px 8px rgba(0,0,0,0.3)", zIndex: 9999 },
    editModal: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" },
    modalContent: { backgroundColor: "#1f1f1f", padding: 20, borderRadius: 10, width: 300, textAlign: "center" },
    input: { width: "100%", padding: 8, margin: "10px 0", borderRadius: 6, border: "1px solid #333", backgroundColor: "#2a2a2a", color: "white" },
    saveBtn: { backgroundColor: "#4CAF50", border: "none", color: "white", padding: "8px 12px", borderRadius: 6, cursor: "pointer" },
    cancelBtn: { backgroundColor: "#555", border: "none", color: "white", padding: "8px 12px", borderRadius: 6, cursor: "pointer" },
};