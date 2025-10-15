import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error(await res.text() || "로그인 실패");
            const data = await res.json();

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            navigate("/home");
        } catch (err) {
            setError("로그인 실패: " + err.message);
        }
    }

    const handleKakaoLogin = () => {
        const redirectUri = "http://localhost:5173/oauth/kakao/callback";
        const clientId = "596ba62433bf82278eeb36aa0b90974a";
        window.location.href =
            `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=code`;
    };

    const handleNaverLogin = () => {
        const redirectUri = "http://localhost:5173/oauth/naver/callback";
        const clientId = "KWQRiLrLcSIBgX9guEa_";
        window.location.href =
            `https://nid.naver.com/oauth2.0/authorize?client_id=${clientId}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=code&state=test`;
    };

    return (
        <div style={s.container}>
            {/* 🔹 브랜드 로고 */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={s.logoBox}
            >
                <div style={s.logoCircle}>TT</div>
                <h1 style={s.logoTitle}>The Third Tool</h1>
            </motion.div>

            {/* 🔹 로그인 카드 */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                style={s.card}
            >
                <h2 style={s.title}>로그인</h2>

                <form onSubmit={handleLogin} style={s.form}>
                    <input
                        name="username"
                        placeholder="아이디"
                        value={form.username}
                        onChange={handleChange}
                        style={s.input}
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="비밀번호"
                        value={form.password}
                        onChange={handleChange}
                        style={s.input}
                    />
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        style={s.loginBtn}
                    >
                        로그인
                    </motion.button>
                </form>

                {error && <p style={s.errorText}>{error}</p>}

                <div style={s.dividerBox}>
                    <div style={s.divider}></div>
                    <span style={s.dividerText}>또는</span>
                    <div style={s.divider}></div>
                </div>

                {/* 🔹 소셜 로그인 */}
                <div style={s.socialBox}>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleKakaoLogin}
                        style={s.kakaoBtn}
                    >
                        카카오로 로그인
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleNaverLogin}
                        style={s.naverBtn}
                    >
                        네이버로 로그인
                    </motion.button>
                </div>

                <p style={s.bottomText}>
                    계정이 없나요?{" "}
                    <Link to="/join" style={s.link}>
                        회원가입
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}

const s = {
    container: {
        background: "radial-gradient(circle at top, #111, #000)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "Pretendard, sans-serif",
    },
    logoBox: {
        display: "flex",
        alignItems: "center",
        marginBottom: 30,
        gap: 10,
    },
    logoCircle: {
        background: "#ff3b30",
        borderRadius: "50%",
        width: 45,
        height: 45,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
    },
    logoTitle: { fontSize: "1.4rem", fontWeight: "600" },
    card: {
        background: "linear-gradient(180deg, #141414, #1b1b1b)",
        padding: "40px 50px",
        borderRadius: "16px",
        boxShadow: "0 0 20px rgba(255,255,255,0.05), 0 0 40px rgba(255,255,255,0.03)",
        width: 360,
        textAlign: "center",
    },
    title: {
        fontSize: "1.4rem",
        color: "#fff",
        marginBottom: 25,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginBottom: 20,
    },
    input: {
        padding: "12px",
        borderRadius: 10,
        border: "1px solid #333",
        background: "#1f1f1f",
        color: "#fff",
        fontSize: "0.95rem",
        outline: "none",
        transition: "border 0.2s",
    },
    loginBtn: {
        background: "#ff3b30",
        border: "none",
        padding: "12px",
        borderRadius: 10,
        color: "#fff",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "1rem",
        marginTop: 5,
    },
    errorText: { color: "#ff4d4f", fontSize: "0.85rem", marginTop: 10 },
    dividerBox: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginTop: 20,
        marginBottom: 10,
    },
    divider: {
        flex: 1,
        height: "1px",
        background: "#333",
    },
    dividerText: { color: "#777", fontSize: "0.8rem" },
    socialBox: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginTop: 10,
    },
    kakaoBtn: {
        backgroundColor: "#FEE500",
        color: "#3C1E1E",
        border: "none",
        padding: "10px 0",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: "600",
    },
    naverBtn: {
        backgroundColor: "#03C75A",
        border: "none",
        color: "white",
        padding: "10px 0",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: "600",
    },
    bottomText: {
        color: "#aaa",
        fontSize: "0.85rem",
        marginTop: 25,
    },
    link: { color: "#ff3b30", textDecoration: "none", fontWeight: "600" },
};