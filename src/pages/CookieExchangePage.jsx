import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function CookieExchangePage() {
    const navigate = useNavigate();
    const [message, setMessage] = useState("토큰 교환 중입니다...");

    useEffect(() => {
        async function exchange() {
            try {
                const res = await fetch(`${BASE_URL}/jwt/exchange`, {
                    method: "POST",
                    credentials: "include", // ✅ 쿠키 포함 필수
                    headers: { "Content-Type": "application/json" },
                });

                if (!res.ok) throw new Error("토큰 교환 실패");
                const data = await res.json();

                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);

                setMessage("로그인 완료! 홈으로 이동합니다...");
                setTimeout(() => navigate("/"), 1500);
            } catch {
                setMessage("로그인 처리 중 오류 발생. 다시 시도해주세요.");
            }
        }

        exchange();
    }, [navigate]);

    return (
        <div style={styles.container}>
            <h3>{message}</h3>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
    },
};