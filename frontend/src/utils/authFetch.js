// src/utils/authFetch.js
const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

if (!BASE_URL) {
    console.warn("⚠️ VITE_BACKEND_API_BASE_URL 가 설정되지 않았습니다.");
}

/** 🔄 Refresh 토큰으로 AccessToken 재발급 */
export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("RefreshToken이 없습니다.");

    const response = await fetch(`${BASE_URL}/jwt/refresh`, {
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

/** ✅ AccessToken 자동 부착 + 401 시 자동 Refresh 처리 */
export async function fetchWithAccess(pathOrUrl, options = {}) {
    // path(`/api/...`) 를 넘겨도 되고, 완전한 url(`https://...`)을 넘겨도 되게 처리
    const isAbsolute = /^https?:\/\//i.test(pathOrUrl);
    const url = isAbsolute ? pathOrUrl : `${BASE_URL}${pathOrUrl}`;

    let accessToken = localStorage.getItem("accessToken");
    if (!options.headers) options.headers = {};

    options.headers["Authorization"] = `Bearer ${accessToken}`;

    // FormData가 아니면 Content-Type 기본 JSON
    if (!(options.body instanceof FormData)) {
        options.headers["Content-Type"] = options.headers["Content-Type"] || "application/json";
    } else {
        delete options.headers["Content-Type"];
    }

    let response = await fetch(url, options);

    if (response.status === 401) {
        let errorData = null;
        try {
            errorData = await response.clone().json();
        } catch (_) {}

        const message = errorData?.message?.toLowerCase() || "";
        const isExpired = message.includes("expired") || message.includes("만료");

        if (isExpired) {
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
            console.error("❌ 인증 실패: 토큰 만료는 아니고, 권한 오류 등");
            throw new Error("401 Unauthorized: Access denied");
        }
    }

    if (!response.ok) {
        throw new Error(`HTTP 오류: ${response.status}`);
    }

    return response;
}
