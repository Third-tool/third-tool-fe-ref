// frontend/src/pages/JoinPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

// 🔐 네이버용 state 생성
function genState(len = 16) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let s = "";
    for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}

export default function JoinPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",       // 로그인 아이디 (이메일)
        password: "",
        confirmPassword: "",
        nickname: "",       // ✅ 닉네임 (백엔드 DTO에 맞춤)
        email: "",          // 선택: 연락용 이메일
    });
    const [agree, setAgree] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [exist, setExist] = useState(null); // true: 이미 존재, false: 사용 가능

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    // 간단 검증
    function validate() {
        const unameField = import.meta.env.VITE_AUTH_USERNAME_FIELD || "username";
        const uname = form.username.trim();
        const pwd = form.password;
        const pwd2 = form.confirmPassword;

        if (!uname) return "아이디(이메일)을 입력해 주세요.";
        const looksLikeEmail = /\S+@\S+\.\S+/.test(uname);
        if (!looksLikeEmail) return "아이디는 이메일 형식으로 입력해 주세요.";

        if (form.nickname.trim().length < 2)
            return "닉네임은 2자 이상 입력해 주세요.";

        if (pwd.length < 8)
            return "비밀번호는 8자 이상이어야 합니다.";

        if (pwd !== pwd2)
            return "비밀번호가 일치하지 않습니다.";

        // 선택 이메일 검증 (입력한 경우만)
        if (form.email && !/\S+@\S+\.\S+/.test(form.email.trim()))
            return "이메일 형식을 확인해 주세요.";

        if (!agree)
            return "이용 약관 및 개인정보 처리에 동의해 주세요.";

        if (!BASE_URL)
            return "BASE_URL 누락";

        // (선택) 이미 존재하는 아이디면 가입 막기
        if (exist === true)
            return "이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.";

        return null;
    }

    // 아이디 중복 확인
    async function checkExist() {
        setError("");
        try {
            if (!BASE_URL) throw new Error("BASE_URL 누락");
            const userField = import.meta.env.VITE_AUTH_USERNAME_FIELD || "username";
            const payload = { [userField]: form.username.trim() };

            const res = await fetch(`${BASE_URL}/user/exist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const raw = await res.clone().text();
            if (!res.ok) {
                let detail;
                try { detail = JSON.parse(raw); } catch { detail = raw; }
                throw new Error((detail && detail.message) || detail || `HTTP ${res.status}`);
            }

            let data;
            try { data = JSON.parse(raw); } catch { data = raw; }

            // 백엔드에서 Boolean(true/false) 반환
            const exists = data === true;
            setExist(exists);
            alert(exists ? "이미 존재하는 아이디입니다." : "사용 가능한 아이디입니다.");
        } catch (err) {
            console.error("[USER EXIST] error:", err);
            setError("중복 검사 실패: " + (err?.message ?? err));
        }
    }

    // 회원가입
    async function handleJoin(e) {
        e.preventDefault();
        setError("");

        const v = validate();
        if (v) {
            setError(v);
            return;
        }

        try {
            setLoading(true);

            const userField = import.meta.env.VITE_AUTH_USERNAME_FIELD || "username";
            const payload = {
                [userField]: form.username.trim(),
                password: form.password,
                nickname: form.nickname.trim(),         // ✅ 백엔드 DTO 필드명으로 전송
                email: form.email.trim() || undefined,  // 선택값
            };

            const res = await fetch(`${BASE_URL}/user`, {
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

            // 서버가 토큰을 바로 내려주는 경우 저장 (현재는 id만 주지만 혹시 몰라 유지)
            try {
                const data = JSON.parse(raw);
                if (data?.accessToken) localStorage.setItem("accessToken", data.accessToken);
                if (data?.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
            } catch (_) {}

            navigate("/home");
        } catch (err) {
            console.error("[SIGNUP] error:", err);
            setError(`회원가입 실패: ${err?.message ?? err}`);
        } finally {
            setLoading(false);
        }
    }

    // ✅ 카카오: 공식 인가 페이지로 리디렉트
    const handleKakaoStart = () => {
        const clientId = import.meta.env.VITE_KAKAO_REST_KEY;
        const redirectEnv = import.meta.env.VITE_KAKAO_REDIRECT_URI;
        const redirectUri = redirectEnv || `http://localhost:5173/oauth/kakao/callback`;

        if (!clientId) {
            setError("Kakao REST_KEY 누락: VITE_KAKAO_REST_KEY");
            return;
        }

        const url =
            `https://kauth.kakao.com/oauth/authorize` +
            `?response_type=code` +
            `&client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}`;

        window.location.href = url;
    };

    // ✅ 네이버: 공식 인가 페이지로 리디렉트
    const handleNaverStart = () => {
        const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
        const redirectEnv = import.meta.env.VITE_NAVER_REDIRECT_URI;
        const redirectUri = redirectEnv || `http://localhost:5173/oauth/naver/callback`;

        if (!clientId) {
            setError("Naver CLIENT_ID 누락: VITE_NAVER_CLIENT_ID");
            return;
        }

        const state = genState();
        try { sessionStorage.setItem("naver_oauth_state", state); } catch {}

        const url =
            `https://nid.naver.com/oauth2.0/authorize` +
            `?response_type=code` +
            `&client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&state=${encodeURIComponent(state)}`;

        window.location.href = url;
    };

    return (
        <div style={ui.page}>
            <div style={ui.bgGlow} />

            <div style={ui.cardWrap}>
                <div style={ui.card}>
                    <h1 style={ui.title}>Sign Up</h1>

                    <form onSubmit={handleJoin} style={ui.form}>
                        {/* 아이디(이메일) + 중복 확인 */}
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                                name="username"
                                placeholder="Email"
                                value={form.username}
                                onChange={handleChange}
                                style={{ ...ui.input, flex: 1 }}
                                autoComplete="email"
                                onFocus={(e) => Object.assign(e.target.style, ui.inputFocus)}
                                onBlur={(e) =>
                                    Object.assign(e.target.style, {
                                        borderColor: "#262728",
                                        boxShadow: "none",
                                    })
                                }
                            />
                            <button
                                type="button"
                                onClick={checkExist}
                                style={{
                                    padding: "0 14px",
                                    borderRadius: 12,
                                    border: "1px solid #444",
                                    background: "#181818",
                                    color: "#f0f0f0",
                                    fontSize: 12,
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                중복 확인
                            </button>
                        </div>

                        {exist !== null && (
                            <div style={{ fontSize: 12, color: exist ? "#ff6b6b" : "#6dd36d" }}>
                                {exist ? "이미 사용 중인 아이디입니다." : "사용 가능한 아이디입니다."}
                            </div>
                        )}

                        {/* ✅ 닉네임 필드 name="nickname" */}
                        <input
                            name="nickname"
                            placeholder="닉네임"
                            value={form.nickname}
                            onChange={handleChange}
                            style={ui.input}
                            autoComplete="nickname"
                            onFocus={(e) => Object.assign(e.target.style, ui.inputFocus)}
                            onBlur={(e) =>
                                Object.assign(e.target.style, {
                                    borderColor: "#262728",
                                    boxShadow: "none",
                                })
                            }
                        />

                        {/* 선택 이메일 */}
                        <input
                            name="email"
                            placeholder="연락용 이메일 (선택)"
                            value={form.email}
                            onChange={handleChange}
                            style={ui.input}
                            autoComplete="email"
                            onFocus={(e) => Object.assign(e.target.style, ui.inputFocus)}
                            onBlur={(e) =>
                                Object.assign(e.target.style, {
                                    borderColor: "#262728",
                                    boxShadow: "none",
                                })
                            }
                        />

                        <input
                            name="password"
                            type="password"
                            placeholder="비밀번호 (8자 이상)"
                            value={form.password}
                            onChange={handleChange}
                            style={ui.input}
                            autoComplete="new-password"
                            onFocus={(e) => Object.assign(e.target.style, ui.inputFocus)}
                            onBlur={(e) =>
                                Object.assign(e.target.style, {
                                    borderColor: "#262728",
                                    boxShadow: "none",
                                })
                            }
                        />
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="비밀번호 확인"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            style={ui.input}
                            autoComplete="new-password"
                            onFocus={(e) => Object.assign(e.target.style, ui.inputFocus)}
                            onBlur={(e) =>
                                Object.assign(e.target.style, {
                                    borderColor: "#262728",
                                    boxShadow: "none",
                                })
                            }
                        />

                        <label style={ui.rememberRow}>
                            <input
                                type="checkbox"
                                checked={agree}
                                onChange={(e) => setAgree(e.target.checked)}
                                style={ui.checkbox}
                            />
                            <span>이용 약관 및 개인정보 처리에 동의합니다</span>
                        </label>

                        {error && <div style={ui.error}>{error}</div>}

                        <motion.button
                            type="submit"
                            style={{ ...ui.loginBtn, opacity: loading ? 0.7 : 1 }}
                            whileHover={{ scale: loading ? 1 : 1.01 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            disabled={loading}
                        >
                            {loading ? "처리 중..." : "회원가입"}
                        </motion.button>
                    </form>

                    <div style={ui.helperText}>또는 아래 방법으로 빠르게 시작하기</div>

                    {/* 소셜 시작 버튼 */}
                    <div style={ui.socialBox}>
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNaverStart}
                            style={ui.socialBtn}
                        >
              <span style={ui.iconWrap} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 5h6.6l3.4 5.1V5H19v14h-6.6L9 13.9V19H5V5z" fill="#FFFFFF" />
                </svg>
              </span>
                            네이버로 시작하기
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleKakaoStart}
                            style={ui.socialBtn}
                        >
              <span style={ui.iconWrap} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                      d="M12 4c-4.97 0-9 3.13-9 7 0 2.53 1.72 4.75 4.3 5.98L6 21l3.02-2.02c.95.18 1.96.27 2.98.27
                         4.97 0 9-3.13 9-7s-4.03-7-9-7z"
                      fill="#FFFFFF"
                  />
                </svg>
              </span>
                            카카오로 시작하기
                        </motion.button>
                    </div>

                    <div style={ui.bottomText}>
                        이미 계정이 있나요?{" "}
                        <Link to="/login" style={ui.link}>
                            로그인
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

const ui = {
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
    rememberRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "#bdbdbd",
        margin: "6px 0 4px",
        fontSize: 14,
        userSelect: "none",
    },
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
    helperText: { color: "#9a9a9a", fontSize: 12, marginTop: 16, textAlign: "center" },
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
