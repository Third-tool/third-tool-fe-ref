
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
    options.headers["Authorization"] = `Bearer ${accessToken}`;
    options.headers["Content-Type"] = options.headers["Content-Type"] || "application/json";

    let response = await fetch(url, options);

    // ✅ 401 응답 시에만 refresh 로직 고려
    if (response.status === 401) {
        // 서버에서 만료 사유를 구분하기 위해 JSON 메시지 추출
        let errorData = null;
        try {
            errorData = await response.clone().json();
        } catch (_) {
            // body가 비어있을 수도 있음
        }

        const message = errorData?.message?.toLowerCase() || "";

        // ✅ 진짜 만료된 경우에만 refresh 시도
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
