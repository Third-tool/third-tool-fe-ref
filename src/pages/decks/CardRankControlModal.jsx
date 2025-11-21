// src/pages/decks/CardRankControlModal.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchWithAccess } from "../../utils/authFetch.js";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function CardRankControlModal({ onClose }) {
    const [boundaries, setBoundaries] = useState({
        silverGoldBoundary: 100,
        goldDiamondBoundary: 200,
        diamondMax: 300,
    });

    const [loading, setLoading] = useState(false);

    // ✅ 초기값 로드 (현재 로그인 사용자 기준)
    useEffect(() => {
        (async () => {
            try {
                const res = await fetchWithAccess(`${BASE_URL}/api/card-ranks/users/me`);
                if (!res.ok) {
                    console.error("❌ rank load failed:", res.status);
                    return;
                }

                const data = await res.json();
                const silver = data.find((r) => r.name === "SILVER");
                const gold = data.find((r) => r.name === "GOLD");
                const diamond = data.find((r) => r.name === "DIAMOND");

                setBoundaries({
                    silverGoldBoundary: silver?.maxScore ?? 100,
                    goldDiamondBoundary: gold?.maxScore ?? 200,
                    diamondMax: diamond?.maxScore ?? 300,
                });
            } catch (e) {
                console.error("❌ rank load error", e);
            }
        })();
    }, []);

    // ✅ 슬라이더 값 변경 핸들러
    const handleChange = (field, value) => {
        setBoundaries((prev) => ({
            ...prev,
            [field]: Math.max(0, Number(value)),
        }));
    };

    // ✅ 저장 버튼 클릭 시 API 요청
    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAccess(`${BASE_URL}/api/card-ranks/users/me/boundaries`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(boundaries),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            alert("✅ 랭크 설정이 저장되었습니다.");
            onClose();
        } catch (e) {
            console.error("❌ rank update error", e);
            alert("랭크 설정 저장 실패");
        } finally {
            setLoading(false);
        }
    };

    const { silverGoldBoundary, goldDiamondBoundary, diamondMax } = boundaries;

    // ✅ 시각화: 슬라이드 바 길이 비율 계산
    const total = diamondMax || 1;
    const silverPct = (silverGoldBoundary / total) * 100;
    const goldPct = ((goldDiamondBoundary - silverGoldBoundary) / total) * 100;
    const diamondPct = ((diamondMax - goldDiamondBoundary) / total) * 100;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.overlay}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                style={styles.modal}
            >
                <h3 style={styles.title}>Rank 설정</h3>

                {/* 시각화 바 */}
                <div style={styles.barContainer}>
                    <div style={{ ...styles.barSection, background: "#b0bec5", width: `${silverPct}%` }}>
                        SILVER
                    </div>
                    <div style={{ ...styles.barSection, background: "#ffd54f", width: `${goldPct}%` }}>
                        GOLD
                    </div>
                    <div style={{ ...styles.barSection, background: "#90caf9", width: `${diamondPct}%` }}>
                        DIAMOND
                    </div>
                </div>

                {/* 경계값 조절 */}
                <div style={styles.sliderGroup}>
                    <label>🩶 Silver - Gold 경계</label>
                    <input
                        type="range"
                        min="0"
                        max={goldDiamondBoundary - 1}
                        value={silverGoldBoundary}
                        onChange={(e) => handleChange("silverGoldBoundary", e.target.value)}
                    />
                    <span>{silverGoldBoundary}</span>
                </div>

                <div style={styles.sliderGroup}>
                    <label>💛 Gold - Diamond 경계</label>
                    <input
                        type="range"
                        min={silverGoldBoundary + 1}
                        max={diamondMax - 1}
                        value={goldDiamondBoundary}
                        onChange={(e) => handleChange("goldDiamondBoundary", e.target.value)}
                    />
                    <span>{goldDiamondBoundary}</span>
                </div>

                <div style={styles.sliderGroup}>
                    <label>💎 Diamond 최대 점수</label>
                    <input
                        type="number"
                        value={diamondMax}
                        min={goldDiamondBoundary + 1}
                        max="9999"
                        onChange={(e) => handleChange("diamondMax", e.target.value)}
                    />
                </div>

                {/* 버튼 */}
                <div style={styles.footer}>
                    <button onClick={onClose} style={styles.cancelBtn}>
                        닫기
                    </button>
                    <button onClick={handleSave} style={styles.saveBtn} disabled={loading}>
                        {loading ? "저장 중..." : "저장"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
    },
    modal: {
        background: "#1b1b1b",
        borderRadius: 16,
        padding: 24,
        width: 400,
        color: "white",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 16px 50px rgba(0,0,0,0.4)",
    },
    title: { marginTop: 0, textAlign: "center" },
    barContainer: {
        display: "flex",
        height: 30,
        borderRadius: 8,
        overflow: "hidden",
        margin: "10px 0 20px",
    },
    barSection: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 600,
        color: "#000",
    },
    sliderGroup: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        margin: "10px 0",
    },
    footer: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: 20,
        gap: 10,
    },
    saveBtn: {
        background: "#d32f2f",
        color: "white",
        border: "none",
        borderRadius: 8,
        padding: "8px 14px",
        cursor: "pointer",
    },
    cancelBtn: {
        background: "rgba(255,255,255,0.1)",
        border: "none",
        borderRadius: 8,
        padding: "8px 14px",
        color: "#ccc",
        cursor: "pointer",
    },
};
