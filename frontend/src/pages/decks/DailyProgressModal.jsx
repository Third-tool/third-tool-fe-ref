import React, { useState, useEffect } from "react";
import { fetchWithAccess } from "../../utils/authFetch.js";
import { BarChart2 } from "lucide-react"; // 📊 아이콘
const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function DailyProgressModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [progress, setProgress] = useState({ silverCount: 0, goldCount: 0, diamondCount: 0 });
    const [loading, setLoading] = useState(false);

    const toggleModal = async () => {
        if (!isOpen) {
            setLoading(true);
            try {
                const res = await fetchWithAccess(`${BASE_URL}/api/learning/progress/today`);
                if (res.ok) {
                    const data = await res.json();
                    setProgress(data);
                }
            } catch (e) {
                console.error("Failed to load progress", e);
            } finally {
                setLoading(false);
            }
        }
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* ✅ 우측 하단 플로팅 버튼 */}
            <button onClick={toggleModal} style={styles.floatingButton}>
                <BarChart2 size={20} />
            </button>

            {/* ✅ 모달 */}
            {isOpen && (
                <div style={styles.overlay} onClick={toggleModal}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 style={styles.title}>📘 Daily Learning Progress</h3>

                        {loading ? (
                            <p style={styles.loading}>Loading...</p>
                        ) : (
                            <div style={styles.statsContainer}>
                                <div style={styles.statBox}>
                                    <p style={styles.rankName}>🥈 Silver</p>
                                    <p style={styles.rankValue}>{progress.silverCount}</p>
                                </div>
                                <div style={styles.statBox}>
                                    <p style={styles.rankName}>🥇 Gold</p>
                                    <p style={styles.rankValue}>{progress.goldCount}</p>
                                </div>
                                <div style={styles.statBox}>
                                    <p style={styles.rankName}>💎 Diamond</p>
                                    <p style={styles.rankValue}>{progress.diamondCount}</p>
                                </div>
                            </div>
                        )}

                        <button style={styles.closeBtn} onClick={toggleModal}>
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

const styles = {
    floatingButton: {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        backgroundColor: "#e53935",
        color: "white",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        cursor: "pointer",
        transition: "transform 0.2s",
        zIndex: 9999,
    },
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(2px)",
    },
    modal: {
        backgroundColor: "#1e1e1e",
        borderRadius: 12,
        padding: "25px 30px",
        color: "white",
        width: "300px",
        textAlign: "center",
        boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
    },
    title: {
        marginBottom: 15,
        fontSize: "1.2rem",
        borderBottom: "1px solid #444",
        paddingBottom: 8,
    },
    statsContainer: {
        display: "flex",
        justifyContent: "space-around",
        marginTop: 10,
        marginBottom: 20,
    },
    statBox: {
        textAlign: "center",
        backgroundColor: "#2c2c2c",
        padding: "10px 14px",
        borderRadius: 8,
        minWidth: "70px",
        transition: "background 0.2s",
    },
    rankName: {
        fontSize: "0.85rem",
        color: "#ccc",
        marginBottom: 5,
    },
    rankValue: {
        fontSize: "1.2rem",
        fontWeight: "bold",
        color: "#f5f5f5",
    },
    loading: {
        color: "#bbb",
        fontStyle: "italic",
    },
    closeBtn: {
        width: "100%",
        padding: "8px",
        borderRadius: 6,
        backgroundColor: "#e53935",
        border: "none",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
    },
};