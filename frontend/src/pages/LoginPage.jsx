import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");

    /** ✅ 입력 변경 핸들러 */
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    /** ✅ 일반 로그인 */
    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "로그인 실패");
            }

            const data = await res.json();
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            alert("로그인 성공!");
            navigate("/home");
        } catch (err) {
            setError("로그인 실패: " + err.message);
        }
    }

    /** ✅ 카카오 로그인: SDK → 인가 코드 발급 후 redirect */
    const handleKakaoLogin = () => {
        const redirectUri = "http://localhost:5173/oauth/kakao/callback";
        const clientId = "596ba62433bf82278eeb36aa0b90974a"; // 카카오 REST API 키
        const kakaoAuthUrl =
            `https://kauth.kakao.com/oauth/authorize?` +
            `client_id=${clientId}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=code`;
        window.location.href = kakaoAuthUrl;
    };

    /** ✅ 네이버 로그인도 동일한 구조로 확장 가능 */
    const handleNaverLogin = () => {
        const redirectUri = "http://localhost:5173/oauth/naver/callback";
        const clientId = "KWQRiLrLcSIBgX9guEa_"; // 네이버 Client ID
        const naverAuthUrl =
            `https://nid.naver.com/oauth2.0/authorize?` +
            `client_id=${clientId}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=code&state=test`;
        window.location.href = naverAuthUrl;
    };

    return (
        <div style={styles.container}>
            <h2 style={{ marginBottom: 20 }}>로그인</h2>

            {/* ✅ 일반 로그인 폼 */}
            <form onSubmit={handleLogin} style={styles.form}>
                <input
                    name="username"
                    placeholder="아이디"
                    value={form.username}
                    onChange={handleChange}
                    style={styles.input}
                />
                <input
                    name="password"
                    type="password"
                    placeholder="비밀번호"
                    value={form.password}
                    onChange={handleChange}
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>
                    로그인
                </button>
            </form>

            {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

            {/* ✅ 소셜 로그인 버튼들 */}
            <div style={styles.socialBox}>
                <p>또는 소셜 로그인</p>
                <button onClick={handleKakaoLogin} style={styles.kakaoBtn}>
                    카카오로 로그인
                </button>
                <button onClick={handleNaverLogin} style={styles.naverBtn}>
                    네이버로 로그인
                </button>
            </div>

            <p style={{ marginTop: 20 }}>
                계정이 없나요? <Link to="/join">회원가입</Link>
            </p>
        </div>
    );
}

/* 🎨 스타일 */
const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#121212",
        color: "white",
        fontFamily: "sans-serif",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: 260,
    },
    input: {
        padding: 10,
        borderRadius: 5,
        border: "1px solid #333",
        backgroundColor: "#1f1f1f",
        color: "white",
    },
    button: {
        padding: 10,
        borderRadius: 5,
        border: "none",
        backgroundColor: "#4CAF50",
        color: "white",
        cursor: "pointer",
        marginTop: 5,
    },
    socialBox: {
        marginTop: 30,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "center",
    },
    kakaoBtn: {
        backgroundColor: "#FEE500",
        border: "none",
        padding: "8px 16px",
        borderRadius: 5,
        cursor: "pointer",
    },
    naverBtn: {
        backgroundColor: "#03C75A",
        border: "none",
        color: "white",
        padding: "8px 16px",
        borderRadius: 5,
        cursor: "pointer",
    },
};