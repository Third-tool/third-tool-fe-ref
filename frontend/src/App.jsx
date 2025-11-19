// =============================
// src/App.jsx
// =============================
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// 공개 페이지
import StartPage from "./pages/StartPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import JoinPage from "./pages/JoinPage.jsx";

// 소셜 콜백 / 토큰 교환
import KakaoRedirectPage from "./pages/KakaoRedirectPage.jsx";
import NaverRedirectPage from "./pages/NaverRedirectPage.jsx";
import CookieExchangePage from "./pages/CookieExchangePage.jsx";

// 로그인 이후 페이지
import HomePage from "./pages/HomePage.jsx";
import DeckListPage from "./pages/decks/DeckListPage.jsx";
import DeckDetailPage from "./pages/decks/DeckDetailPage.jsx";
import DeckRecentPage from "./pages/decks/DeckRecentPage.jsx";
import CardCreatePage from "./pages/decks/CardCreatePage.jsx";
import ThreeDayLearningPage from "./pages/learning/ThreeDayLearningPage.jsx";
import PermanentLearningPage from "./pages/learning/PermanentLearningPage.jsx";
import SearchLearningPage from "./pages/learning/SearchLearningPage.jsx";
import LibraryPage from "./pages/library/LibraryPage.jsx";
import LibraryDemoDeckPage from "./pages/library/LibraryDemoDeckPage.jsx";
import LibraryDemoLearnPage from "./pages/library/LibraryDemoLearnPage.jsx";
import SearchPage from "./pages/search/SearchPage.jsx";
import ProfileHub from "./pages/me/ProfileHub.jsx";

// 레이아웃
import ProtectedLayout from "./components/layout/ProtectedLayout.jsx";

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("accessToken"));
    const location = useLocation();

    // localStorage 변경에 반응 (다른 탭 포함)
    useEffect(() => {
        const onStorage = () => setIsLoggedIn(!!localStorage.getItem("accessToken"));
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    // 라우트 변경 시 토큰 존재 여부 다시 체크
    useEffect(() => {
        if (localStorage.getItem("accessToken")) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, [location]);

    return (
        <Routes>
            {/* ✅ 루트: 로그인 여부에 따라 StartPage 또는 Home 으로 */}
            <Route
                path="/"
                element={
                    isLoggedIn ? <Navigate to="/home" replace /> : <StartPage />
                }
            />

            {/* ✅ 로그인/회원가입: 로그인 상태면 홈으로 밀어냄 */}
            <Route
                path="/login"
                element={
                    isLoggedIn ? <Navigate to="/home" replace /> : <LoginPage />
                }
            />
            <Route
                path="/join"
                element={
                    isLoggedIn ? <Navigate to="/home" replace /> : <JoinPage />
                }
            />

            {/* ✅ 소셜 로그인 콜백 (로컬 5173 기준) */}
            <Route path="/oauth/kakao/callback" element={<KakaoRedirectPage />} />
            <Route path="/oauth/naver/callback" element={<NaverRedirectPage />} />

            {/* ✅ 세션→JWT 쿠키 교환용 페이지 (필요 시 사용) */}
            <Route path="/cookie-exchange" element={<CookieExchangePage />} />

            {/* ✅ 로그인 이후 보호 라우트 */}
            {isLoggedIn && (
                <Route element={<ProtectedLayout />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/library" element={<LibraryPage />} />
                    <Route path="/library/demo/:slug" element={<LibraryDemoDeckPage />} />
                    <Route path="/library/demo/:slug/learn" element={<LibraryDemoLearnPage />} />
                    <Route path="/me" element={<ProfileHub />} />

                    <Route path="/decks" element={<DeckListPage />} />
                    <Route path="/decks/recent" element={<DeckRecentPage />} />
                    <Route path="/decks/:id" element={<DeckDetailPage />} />
                    <Route path="/decks/:deckId/cards/new" element={<CardCreatePage />} />

                    <Route path="/learning/three-day" element={<ThreeDayLearningPage />} />
                    <Route path="/learning/permanent" element={<PermanentLearningPage />} />
                    <Route path="/learning/search" element={<SearchLearningPage />} />

                    {/* 로그인 상태에서 이상한 URL 들어오면 홈으로 */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Route>
            )}

            {/* ✅ 비로그인 상태에서 보호 URL 접근 시 로그인으로 */}
            {!isLoggedIn && (
                <Route path="*" element={<Navigate to="/login" replace />} />
            )}
        </Routes>
    );
}
