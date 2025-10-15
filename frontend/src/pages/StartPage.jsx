import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function StartPage() {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            {/* 🔹 왼쪽 소개 영역 */}
            <motion.div
                style={styles.leftPanel}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
            >
                <motion.h1
                    style={styles.logo}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    The Third Tool
                </motion.h1>

                <motion.h3
                    style={styles.subtitle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    망각 방지를 위한 세 번째 도구
                </motion.h3>

                <motion.p
                    style={styles.description}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                >
                    빠르게 잊혀지는 시대 속에서,{" "}
                    <strong>기억을 오래 남기는 학습 시스템</strong>을 만듭니다.
                    연필과 공책 다음, 당신의 기억을 책임질 도구 — <em>The Third Tool</em>.
                </motion.p>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={styles.startButton}
                    onClick={() => navigate("/login")}
                >
                    Get Started →
                </motion.button>
            </motion.div>

            {/* 🔹 오른쪽 비주얼 영역 */}
            <div style={styles.rightPanel}>
                {["3 Day Project", "영구 프로젝트"].map((title, idx) => (
                    <motion.div
                        key={idx}
                        style={styles.previewBox}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + idx * 0.3 }}
                        whileHover={{ scale: 1.03 }}
                    >
                        <p style={styles.previewTitle}>{title}</p>
                        <p style={styles.previewText}>
                            {idx === 0 ? "Review: 3회 차" : "마지막 학습: 5일 전"}
                        </p>
                    </motion.div>
                ))}

                {/* ✅ 부드럽게 떠 있는 Progress 박스 */}
                <motion.div
                    style={styles.progressBox}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: 1,
                        y: [0, -5, 0],
                    }}
                    transition={{
                        delay: 1.6,
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <p>🥈 Silver: 10/11</p>
                    <p>🥇 Gold: 7/5</p>
                    <p>💎 Diamond: 2/2</p>
                </motion.div>
            </div>
        </div>
    );
}

/* 🎨 스타일 */
const styles = {
    container: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: "100vh",
        padding: "60px 100px",
        backgroundColor: "#0f0f0f",
        color: "white",
        fontFamily: "'Pretendard', sans-serif",
    },
    leftPanel: {
        flex: 1.2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 25,
    },
    logo: {
        fontSize: "2.4rem",
        fontWeight: "700",
        color: "#ff2b2b",
    },
    subtitle: {
        fontSize: "1.2rem",
        color: "#aaa",
        marginBottom: 10,
    },
    description: {
        fontSize: "1rem",
        color: "#ccc",
        lineHeight: 1.6,
        maxWidth: "80%",
    },
    startButton: {
        marginTop: 20,
        padding: "12px 28px",
        backgroundColor: "#e53935",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: "1.1rem",
        fontWeight: "600",
        width: "fit-content",
        transition: "0.3s",
    },
    rightPanel: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 15,
    },
    previewBox: {
        backgroundColor: "#1b1b1b",
        padding: "18px 24px",
        borderRadius: 12,
        width: "280px",
        transition: "0.2s",
    },
    previewTitle: { fontSize: "1.1rem", fontWeight: "600", margin: 0 },
    previewText: { fontSize: "0.9rem", color: "#aaa", marginTop: 4 },
    progressBox: {
        marginTop: 20,
        backgroundColor: "#2a2a2a",
        padding: "16px 20px",
        borderRadius: 10,
        color: "#ddd",
        fontSize: "0.9rem",
        width: "200px",
        textAlign: "center",
    },
};
