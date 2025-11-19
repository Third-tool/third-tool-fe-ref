
export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("RefreshToken이 없습니다.");

    const response = await fetch("http://localhost:8080/jwt/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error("AccessToken 갱신 실패");

    const data = await response.json();
    console.log("🔁 AccessToken 갱신 완료:", data);

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    return data.accessToken;
}

// ✅ AccessToken 자동 부착 + 만료 시에만 자동 Refresh 처리
export async function fetchWithAccess(url, options = {}) {
    let accessToken = localStorage.getItem("accessToken");
    if (!options.headers) options.headers = {};

    // ✅ Authorization 헤더 추가
    options.headers["Authorization"] = `Bearer ${accessToken}`;

    // ✅ FormData일 경우 Content-Type 제거 (브라우저가 자동 설정)
    if (!(options.body instanceof FormData)) {
        options.headers["Content-Type"] = options.headers["Content-Type"] || "application/json";
    } else {
        // 혹시라도 상위에서 세팅된 Content-Type이 있으면 제거
        delete options.headers["Content-Type"];
    }

    let response = await fetch(url, options);

    // ✅ 401 응답 시 Refresh 시도
    if (response.status === 401) {
        let errorData = null;
        try {
            errorData = await response.clone().json();
        } catch (_) {}

        const message = errorData?.message?.toLowerCase() || "";
        if (message.includes("expired") || message.includes("만료")) {
            try {
                console.warn("⚠️ AccessToken 만료 → Refresh 시도 중...");
                accessToken = await refreshAccessToken();
                options.headers["Authorization"] = `Bearer ${accessToken}`;
                response = await fetch(url, options);
            } catch (err) {
                console.error("❌ RefreshToken도 만료됨:", err);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
            }
        } else {
            console.error("❌ 인증 실패: 토큰 만료 아님 (권한 오류 또는 잘못된 토큰)");
            throw new Error("401 Unauthorized: Access denied");
        }
    }

    if (!response.ok) {
        throw new Error(`HTTP 오류: ${response.status}`);
    }

    return response;
}
