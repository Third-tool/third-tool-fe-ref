import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BrandLogoLockup from "../brand/BrandLogoLockup.jsx";

/* ===== 스타일 (컴포넌트 밖) ===== */
const MAX_W = 1200; // 중앙 컨테이너 최대 너비
const sx = {
    header: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: 84, // ⬆ 헤더 높이 키움(72 → 84)
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // 중앙 컨테이너를 가운데로
        zIndex: 2000,
        background: "#000",
        color: "#fff",
        transition: "all .25s ease",
        WebkitBackdropFilter: "saturate(120%) blur(6px)",
        backdropFilter: "saturate(120%) blur(6px)",
    },
    row: {
        width: "100%",
        maxWidth: MAX_W,             // ⬅ 가장자리로 밀리는 문제 해결
        padding: "0 0px",           // 좌우 여백
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    brandBtn: {
        display: "flex",
        alignItems: "center",
        background: "transparent",
        border: 0,
        padding: 0,
        cursor: "pointer",
        marginLeft: 6,              // ⬅ 로고를 살짝 오른쪽으로 이동
    },
    rightMenu: {
        display: "flex",
        alignItems: "center",
        gap: 18,
        marginRight: 8,              // ⬅ 버튼이 너무 오른쪽 끝으로 가지 않도록
    },
    cta: {
        background: "linear-gradient(180deg, #ff3d3d, #e52929)",
        color: "#fff",
        border: "none",
        borderRadius: 999,
        padding: "10px 20px",
        fontWeight: 800,
        fontSize: "0.96rem",
        cursor: "pointer",
        boxShadow: "0 3px 10px rgba(229,41,41,.32)",
    },
    link: {
        background: "transparent",
        border: "none",
        color: "#fff",
        fontWeight: 600,
        fontSize: "0.94rem",
        cursor: "pointer",
        opacity: 0.92,
    },
    // 모바일 대응
    "@media (max-width: 640px)": {
        header: { height: 72 },
        row: { padding: "0 14px" },
    },
};

export default function LandingHeader() {
    const nav = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // ⬆ 로고 가로/세로 모두 커지게: 높이 기준으로 확대
    const logoSize = scrolled ? 60 : 80; // (기존 28/36 → 36/48로 키움)

    return (
        <AnimatePresence>
            <motion.header
                initial={{ y: -36, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -36, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{
                    ...sx.header,
                    background: scrolled ? "rgba(0,0,0,0.92)" : "#000",
                    boxShadow: scrolled ? "0 2px 10px rgba(0,0,0,0.55)" : "none",
                }}
            >
                <div style={sx.row}>
                    {/* 왼쪽: 로고 (사진을 더 오른쪽으로 + 더 크게) */}
                    <button onClick={() => nav("/")} aria-label="홈으로" style={sx.brandBtn}>
                        <BrandLogoLockup size={logoSize} />
                    </button>

                    {/* 오른쪽: 버튼들이 가장자리로 붙지 않도록 컨테이너 내에서 정렬 */}
                    <nav style={sx.rightMenu}>
                        <button style={sx.link} onClick={() => nav("/login")}>로그인</button>
                        <button style={sx.cta} onClick={() => nav("/join")}>지금 가입</button>
                    </nav>
                </div>
            </motion.header>
        </AnimatePresence>
    );
}
