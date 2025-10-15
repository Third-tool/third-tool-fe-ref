import React, { useState } from "react";
import { fetchWithAccess } from "../../utils/authFetch.js";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function CardRankControlModal({ onClose }) {
    const [ranks, setRanks] = useState([
        { name: "SILVER", minScore: 0, maxScore: 99 },
        { name: "GOLD", minScore: 100, maxScore: 150 },
        { name: "DIAMOND", minScore: 151, maxScore: 300 },
    ]);

    const handleChange = (index, field, value) => {
        setRanks((prev) =>
            prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
        );
    };

    async function handleSave() {
        for (const rank of ranks) {
            await fetchWithAccess(`${BASE_URL}/api/card-ranks/users/1`, { // ✅ 실제 로그인 유저 ID로 교체
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(rank),
            });
        }
        alert("랭크 기준이 저장되었습니다 ✅");
        onClose();
    }

    return (
        <div style={s.overlay}>
            <div style={s.modal}>
                <h3>Card Rank 설정</h3>
                {ranks.map((rank, i) => (
                    <div key={rank.name} style={s.rankRow}>
                        <span style={{ width: 80 }}>{rank.name}</span>
                        <input
                            type="number"
                            value={rank.minScore}
                            onChange={(e) => handleChange(i, "minScore", e.target.value)}
                            style={s.input}
                        />
                        ~
                        <input
                            type="number"
                            value={rank.maxScore}
                            onChange={(e) => handleChange(i, "maxScore", e.target.value)}
                            style={s.input}
                        />
                    </div>
                ))}
                <div style={s.btnRow}>
                    <button onClick={handleSave} style={s.saveBtn}>저장</button>
                    <button onClick={onClose} style={s.cancelBtn}>취소</button>
                </div>
            </div>
        </div>
    );
}

const s = {
    overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" },
    modal: { background: "#1f1f1f", color: "white", padding: 20, borderRadius: 10, width: 400 },
    rankRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 },
    input: { width: 70, padding: 4, background: "#2a2a2a", border: "1px solid #333", color: "white", borderRadius: 4 },
    btnRow: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 15 },
    saveBtn: { background: "#d32f2f", border: "none", color: "white", padding: "8px 12px", borderRadius: 6, cursor: "pointer" },
    cancelBtn: { background: "#555", border: "none", color: "white", padding: "8px 12px", borderRadius: 6, cursor: "pointer" },
};