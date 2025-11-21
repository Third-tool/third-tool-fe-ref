// =============================
// src/pages/NaverRedirectPage.jsx
// =============================
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function NaverRedirectPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state"); // 네이버는 state 필수

        if (!code) {
            alert("인가 코드가 없습니다.");
            navigate("/login");
            return;
        }

        // 간단한 CSRF 체크: 로그인 페이지에서 저장한 state 비교
        try {
            const original = sessionStorage.getItem("naver_oauth_state");
            if (original && state && original !== state) {
                alert("OAuth state 불일치. 다시 시도해주세요.");
                navigate("/login");
                return;
            }
        } catch {}

        async function exchangeCodeForToken() {
            try {
                const res = await fetch(`${BASE_URL}/social/login/naver`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code, state }),
                });

                if (!res.ok) throw new Error("토큰 발급 실패");

                const data = await res.json();
                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);

                navigate("/home");
            } catch (err) {
                alert("로그인 실패: " + err.message);
                navigate("/login");
            }
        }

        exchangeCodeForToken();
    }, [navigate, searchParams]);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                color: "white",
                backgroundColor: "#121212",
            }}
        >
            <h3>네이버 로그인 처리 중...</h3>
        </div>
    );
}
