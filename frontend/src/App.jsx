import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// 🔹 공통 페이지
import StartPage from "./pages/StartPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import JoinPage from "./pages/JoinPage.jsx";
import HomePage from "./pages/HomePage.jsx";

// 🔹 소셜 로그인 Redirect
import KakaoRedirectPage from "./pages/KakaoRedirectPage.jsx";
import NaverRedirectPage from "./pages/NaverRedirectPage.jsx";

// 🔹 덱 관련 페이지
import DeckListPage from "./pages/decks/DeckListPage.jsx";
import DeckDetailPage from "./pages/decks/DeckDetailPage.jsx";
import DeckRecentPage from "./pages/decks/DeckRecentPage.jsx";
import CardCreatePage from "./pages/decks/CardCreatePage.jsx";

// 🔹 학습 관련 페이지
import ThreeDayLearningPage from "./pages/learning/ThreeDayLearningPage.jsx";

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("accessToken"));
    const location = useLocation();

    useEffect(() => {
        const handleStorageChange = () => {
            setIsLoggedIn(!!localStorage.getItem("accessToken"));
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    useEffect(() => {
        if (localStorage.getItem("accessToken")) setIsLoggedIn(true);
    }, [location]);

    return (
        <Routes>
            {/* ✅ 비로그인 접근 가능 */}
            <Route path="/" element={<StartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/oauth/kakao/callback" element={<KakaoRedirectPage />} />
            <Route path="/oauth/naver/callback" element={<NaverRedirectPage />} />

            {/* ✅ 로그인 이후 */}
            {isLoggedIn ? (
                <>
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<HomePage />} />

                    {/* 🔹 덱 */}
                    <Route path="/decks" element={<DeckListPage />} />
                    <Route path="/decks/:id" element={<DeckDetailPage />} />
                    <Route path="/decks/recent" element={<DeckRecentPage />} />
                    <Route path="/decks/:deckId/cards/new" element={<CardCreatePage />} />

                    {/* 🔹 학습 (3일 프로젝트) */}
                    <Route path="/learning/three-day" element={<ThreeDayLearningPage />} />

                    {/* 🔹 예비: 잘못된 경로 → 홈 */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
                </>
            ) : (
                <Route path="*" element={<Navigate to="/login" replace />} />
            )}
        </Routes>
    );
}