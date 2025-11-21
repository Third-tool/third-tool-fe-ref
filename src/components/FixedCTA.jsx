import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/** 하단 중앙 고정 CTA */
export default function FixedCTA({
                                     visible = true,
                                     label = "지금 시작하기",
                                     style = {},
                                 }) {
    const navigate = useNavigate();
    if (!visible) return null;

    return (
        <motion.button
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 28, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/login")}
            style={{ ...sx.cta, ...style }}
        >
            {label}
        </motion.button>
    );
}

const CTA_COLOR = "#f66957"; // 기존 색감 유지
const sx = {
    cta: {
        position: "fixed",
        left: "45%",
        bottom: 26,
        transform: "translateX(-60%)",
        zIndex: 80,
        // 버튼 모양 (참고 이미지 느낌: 둥근 사각 + 미세한 입체감)
        padding: "18px 34px",
        border: "none",
        borderRadius: 26,                    // 둥근 사각
        background: CTA_COLOR,               // 동일 색감
        color: "#fff",
        fontWeight: 900,
        fontSize: "1.2rem",
        letterSpacing: ".01em",
        cursor: "pointer",
        boxShadow:
            "0 14px 40px rgba(246,105,87,.35), inset 0 -2px 0 rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.15)",
    },
};
