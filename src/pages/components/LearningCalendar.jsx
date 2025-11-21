import React from "react";
import { motion } from "framer-motion";

export default function LearningCalendar() {
    const today = new Date();

    return (
        <div style={s.container}>
            <div style={s.header}>
                <h3>📅 학습 캘린더</h3>
                <span style={s.month}>
                    {today.toLocaleString("en-US", { month: "long" })} {today.getFullYear()}
                </span>
            </div>
            <div style={s.grid}>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} style={s.dayLabel}>
                        {d}
                    </div>
                ))}
                {Array.from({ length: 31 }, (_, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.15 }}
                        style={{
                            ...s.dayCell,
                            background:
                                i + 1 === today.getDate() ? "#ff3b30" : "transparent",
                            color: i + 1 === today.getDate() ? "#fff" : "#bbb",
                            border:
                                i + 1 === today.getDate()
                                    ? "none"
                                    : "1px solid #222",
                        }}
                    >
                        {i + 1}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

const s = {
    container: {
        padding: "10px",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#fff",
        marginBottom: "15px",
    },
    month: { color: "#888", fontSize: "0.9rem" },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "5px",
    },
    dayLabel: {
        textAlign: "center",
        color: "#999",
        fontSize: "0.85rem",
        marginBottom: "5px",
    },
    dayCell: {
        textAlign: "center",
        borderRadius: "8px",
        height: "32px",
        lineHeight: "32px",
        cursor: "pointer",
        transition: "0.3s",
    },
};