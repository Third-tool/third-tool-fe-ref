    import React, { useState } from "react";
    import { fetchWithAccess } from "../../utils/authFetch.js";

    const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

    const AVAILABLE_ALGORITHMS = [
        { value: "SM2", label: "SM2 Algorithm" },
        { value: "LEITNER", label: "Leitner Algorithm" },
    ];

    export default function DeckCreateModal({ isOpen, onClose, parentDeck, parentDeckId = null}) {
        const [deckName, setDeckName] = useState("");
        const [selectedAlgorithm, setSelectedAlgorithm] = useState("SM2");
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");

        if (!isOpen) return null;

        const handleCreate = async () => {
            if (!deckName.trim()) {
                setError("덱 이름을 입력하세요.");
                return;
            }

            setLoading(true);
            setError("");

            const body = parentDeckId
                ? { name: deckName.trim(), parentDeckId } // ✅ 하위덱
                : { name: deckName.trim(), scoringAlgorithmType: selectedAlgorithm }; // ✅ 루트덱

            try {
                const res = await fetchWithAccess(`${BASE_URL}/api/decks`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });

                if (!res.ok) throw new Error("덱 생성 실패");
                alert("✅ 덱 생성 완료!");
                setDeckName("");
                onClose(true);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        return (
            <div style={styles.overlay}>
                <div style={styles.modal}>
                    <div style={styles.header}>
                        <h3 style={{ margin: 0 }}>
                            {parentDeckId ? "New Subdeck" : "New Root Deck"}
                        </h3>
                        <button onClick={() => onClose(false)} style={styles.closeBtn}>✕</button>
                    </div>

                    <p style={styles.subtitle}>
                        {parentDeckId
                            ? <>Subdeck for <span style={{ fontWeight: "bold" }}>{parentDeck}</span></>
                            : "Create a new root deck"}
                    </p>

                    <input
                        type="text"
                        placeholder="Deck name"
                        value={deckName}
                        onChange={(e) => setDeckName(e.target.value)}
                        style={styles.input}
                    />

                    <select
                        value={selectedAlgorithm}
                        onChange={(e) => setSelectedAlgorithm(e.target.value)}
                        disabled={!!parentDeckId}
                        style={{
                            ...styles.select,
                            backgroundColor: parentDeckId ? "#222" : "#111",
                            cursor: parentDeckId ? "not-allowed" : "pointer",
                            opacity: parentDeckId ? 0.5 : 1,
                        }}
                    >
                        {AVAILABLE_ALGORITHMS.map((algo) => (
                            <option key={algo.value} value={algo.value}>
                                {algo.label}
                            </option>
                        ))}
                    </select>

                    <button onClick={handleCreate} style={styles.createBtn} disabled={loading}>
                        {loading ? "Creating..." : parentDeckId ? "Create subdeck" : "Create deck"}
                    </button>

                    {error && <p style={styles.error}>{error}</p>}
                </div>
            </div>
        );
    }

    const styles = {
        overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
        modal: { backgroundColor: "#1f1f1f", borderRadius: 12, padding: "25px 30px", width: 320, color: "white", boxShadow: "0 8px 16px rgba(0,0,0,0.5)", position: "relative", textAlign: "center" },
        header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
        closeBtn: { background: "none", border: "none", color: "#aaa", fontSize: "1rem", cursor: "pointer" },
        subtitle: { color: "#ccc", fontSize: "0.9rem", marginBottom: 15 },
        input: { width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #333", backgroundColor: "#111", color: "white", marginBottom: 10 },
        select: { width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #333", backgroundColor: "#111", color: "white", marginBottom: 15, cursor: "pointer" },
        createBtn: { width: "100%", padding: "10px", borderRadius: 6, backgroundColor: "#d32f2f", border: "none", color: "white", cursor: "pointer", fontWeight: "bold", transition: "0.2s" },
        error: { color: "red", marginTop: 10, fontSize: "0.85rem" },
    };