import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function KakaoRedirectPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const code = searchParams.get("code");
        if (!code) {
            alert("인가 코드가 없습니다.");
            navigate("/login");
            return;
        }

        async function exchangeCodeForToken() {
            try {
                const res = await fetch(`${BASE_URL}/social/login/kakao`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                });

                if (!res.ok) throw new Error("토큰 발급 실패");

                const data = await res.json();
                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);

                alert("카카오 로그인 성공!");
                navigate("/home");
            } catch (err) {
                alert("로그인 실패: " + err.message);
                navigate("/login");
            }
        }

        exchangeCodeForToken();
    }, [navigate, searchParams]);

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            color: "white",
            backgroundColor: "#121212",
        }}>
            <h3>카카오 로그인 처리 중...</h3>
        </div>
    );
}