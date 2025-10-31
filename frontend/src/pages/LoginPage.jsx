// frontend/src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [remember, setRemember] = useState(
        typeof localStorage !== "undefined" && !!localStorage.getItem("rememberUsername")
    );

    useEffect(() => {
        try {
            const saved = localStorage.getItem("rememberUsername");
            if (saved) setForm((f) => ({ ...f, username: saved }));
        } catch (_) {}
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    async function handleLogin(e) {
        e.preventDefault();
        setError("");

        try {
            if (!BASE_URL) throw new Error("BASE_URL 누락");

            const userField = import.meta.env.VITE_AUTH_USERNAME_FIELD || "username";
            const payload = { [userField]: form.username, password: form.password };

            const res = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const raw = await res.clone().text();
            if (!res.ok) {
                let detail;
                try { detail = JSON.parse(raw); } catch { detail = raw; }
                throw new Error((detail && detail.message) || detail || `HTTP ${res.status}`);
            }

            let data = null;
            try { data = JSON.parse(raw); } catch {}
            if (data?.accessToken) localStorage.setItem("accessToken", data.accessToken);
            if (data?.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

            try {
                if (remember) localStorage.setItem("rememberUsername", form.username);
                else localStorage.removeItem("rememberUsername");
            } catch (_) {}

            navigate("/home");
        } catch (err) {
            setError(`로그인 실패: ${err?.message ?? err}`);
            console.error("[LOGIN] error:", err);
        }
    }

    const handleKakaoLogin = () => {
        window.location.href = `${BASE_URL}/oauth2/authorization/kakao`;
    };
    const handleNaverLogin = () => {
        window.location.href = `${BASE_URL}/oauth2/authorization/naver`;
    };

    return (
        <div style={ui.page}>
            <div style={ui.bgGlow} />

            <div style={ui.cardWrap}>
                <div style={ui.card}>
                    <h1 style={ui.title}>Login</h1>

                    <form onSubmit={handleLogin} style={ui.form}>
                        <input
                            name="username"
                            placeholder="Email"
                            value={form.username}
                            onChange={handleChange}
                            style={ui.input}
                            autoComplete="username"
                            onFocus={(e) => Object.assign(e.target.style, ui.inputFocus)}
                            onBlur={(e) => Object.assign(e.target.style, { borderColor: "#262728", boxShadow: "none" })}
                        />
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            style={ui.input}
                            autoComplete="current-password"
                            onFocus={(e) => Object.assign(e.target.style, ui.inputFocus)}
                            onBlur={(e) => Object.assign(e.target.style, { borderColor: "#262728", boxShadow: "none" })}
                        />

                        <label style={ui.rememberRow}>
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                style={ui.checkbox}
                            />
                            아이디 저장하기
                        </label>

                        {error && <div style={ui.error}>{error}</div>}

                        <motion.button
                            type="submit"
                            style={ui.loginBtn}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Login
                        </motion.button>
                    </form>

                    <div style={ui.dividerRow}>
                        <div style={ui.divider} />
                        <span style={ui.dividerText}>또는</span>
                        <div style={ui.divider} />
                    </div>

                    {/* 소셜 로그인 – 검정 메인톤, 좌측 아이콘, 아웃라인 라운드 버튼 */}
                    <div style={ui.socialBox}>
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNaverLogin}
                            style={ui.socialBtn}
                        >
              <span style={ui.iconWrap} aria-hidden>
                {/* Naver N (모노) */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 5h6.6l3.4 5.1V5H19v14h-6.6L9 13.9V19H5V5z" fill="#FFFFFF"/>
                </svg>
              </span>
                            네이버로 로그인하기
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleKakaoLogin}
                            style={ui.socialBtn}
                        >
              <span style={ui.iconWrap} aria-hidden>
                {/* Kakao 말풍선 (모노) */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4c-4.97 0-9 3.13-9 7 0 2.53 1.72 4.75 4.3 5.98L6 21l3.02-2.02c.95.18 1.96.27 2.98.27 4.97 0 9-3.13 9-7s-4.03-7-9-7z" fill="#FFFFFF"/>
                </svg>
              </span>
                            카카오톡으로 로그인하기
                        </motion.button>
                    </div>

                    <div style={ui.bottomText}>
                        계정이 없나요?{" "}
                        <Link to="/signup" style={ui.link}>
                            회원가입
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

const ui = {
    // ====== Black & Red Modern Theme ======
    page: {
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0a0a 0%, #0f0f10 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        color: "#eaeaea",
        position: "relative",
        overflow: "hidden",
    },
    bgGlow: {
        position: "absolute",
        width: 520,
        height: 520,
        borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(229,57,53,.18), rgba(229,57,53,0) 70%)",
        filter: "blur(20px)",
        top: -120,
        right: -120,
        pointerEvents: "none",
    },
    cardWrap: { width: "100%", maxWidth: 520 },
    card: {
        background: "rgba(18,18,18,.85)",
        backdropFilter: "saturate(120%) blur(6px)",
        borderRadius: 20,
        border: "1px solid #242424",
        padding: 32,
        boxShadow: "0 14px 40px rgba(0,0,0,.45)",
    },
    title: { fontSize: 34, fontWeight: 900, color: "#fff", margin: "6px 0 20px", letterSpacing: -0.3 },
    form: { display: "flex", flexDirection: "column", gap: 12 },
    input: {
        background: "#111315",
        border: "1px solid #262728",
        color: "#f3f3f3",
        padding: "14px 16px",
        borderRadius: 14,
        outline: "none",
        fontSize: 14,
        transition: "border-color .15s ease, box-shadow .15s ease",
        boxShadow: "inset 0 0 0 0 rgba(229,57,53,0)",
    },
    inputFocus: { borderColor: "#e53935", boxShadow: "0 0 0 3px rgba(229,57,53,.15)" },
    rememberRow: { display: "flex", alignItems: "center", gap: 8, color: "#bdbdbd", margin: "6px 0 4px", fontSize: 14 },
    checkbox: { width: 16, height: 16, accentColor: "#e53935" },
    error: {
        color: "#ff6b6b",
        background: "#2a0f10",
        border: "1px solid #4a1f21",
        padding: "8px 10px",
        borderRadius: 10,
        fontSize: 13,
    },
    loginBtn: {
        marginTop: 8,
        background: "linear-gradient(135deg, #ff4b44, #e53935)",
        color: "#fff",
        border: "none",
        padding: "14px 0",
        borderRadius: 14,
        cursor: "pointer",
        fontWeight: 900,
        fontSize: 16,
        boxShadow: "0 8px 24px rgba(229,57,53,.35)",
    },
    dividerRow: { display: "flex", alignItems: "center", gap: 12, marginTop: 18 },
    divider: { flex: 1, height: 1, background: "#262626" },
    dividerText: { color: "#9a9a9a", fontSize: 12, letterSpacing: ".02em" },

    // ---- Social Buttons (black main, outlined, rounded, left icon) ----
    socialBox: { display: "flex", flexDirection: "column", gap: 12, marginTop: 14 },
    socialBtn: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        justifyContent: "flex-start",
        background: "#111315",
        color: "#f0f0f0",
        border: "1px solid #2a2a2a",
        padding: "14px 16px",
        borderRadius: 16,
        cursor: "pointer",
        fontWeight: 800,
        fontSize: 15,
        transition: "border-color .15s ease, background .15s ease, transform .06s ease",
    },
    iconWrap: {
        width: 28,
        height: 28,
        minWidth: 28,
        minHeight: 28,
        borderRadius: 8,
        background: "#1a1a1a",
        border: "1px solid #2a2a2a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    bottomText: { color: "#bdbdbd", fontSize: 13, marginTop: 18, textAlign: "center" },
    link: { color: "#ff4d4d", textDecoration: "none", fontWeight: 900 },
};
