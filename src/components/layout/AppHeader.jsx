import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './AppHeader.css';

const ACCENT = "#f66957";

export default function AppHeader({ isSidebarCollapsed }) {
    const navigate = useNavigate();
    const [kw, setKw] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        const query = kw.trim();
        if (query) {
            navigate(`/search?keyword=${encodeURIComponent(query)}`);
        }
    };

    // 로그아웃 핸들러 추가
    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        // App.jsx의 인증 로직이 다시 실행되도록 /login으로 강제 이동
        navigate("/login", { replace: true });
        // 또는 window.location.reload(); 를 사용하여 앱 전체를 새로고침할 수도 있습니다.
    };

    return (
        <div className="app-header">
            {/* 1. 왼쪽 영역 (로고) */}
            <div className="header-left">
                <AnimatePresence>
                    {isSidebarCollapsed && (
                        <motion.span
                            className="header-logo"
                            style={{ color: ACCENT }}
                            onClick={() => navigate('/home')}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                        >
                            THIRD TOOL
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* 2. 중앙 영역 (검색바) */}
            <form className="search-bar" onSubmit={handleSearch}>
                {/* ... (검색바 코드는 동일) ... */}
                <span className="search-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <input
                    type="text"
                    value={kw}
                    onChange={(e) => setKw(e.target.value)}
                    placeholder="에셋을 검색하거나 지금 바로 창작을 시작해보세요"
                />
                <button type="button" className="search-options-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="12" x2="20" y2="12"></line>
                        <line x1="4" y1="6" x2="20" y2="6"></line>
                        <line x1="4" y1="18" x2="20" y2="18"></line>
                    </svg>
                </button>
            </form>

            {/* 3. 오른쪽 영역 (ME 버튼 + Logout 버튼) */}
            <div className="header-actions">
                <button className="me-btn" onClick={() => navigate("/me")}>
                    ME
                </button>
                {/* 로그아웃 버튼 추가 */}
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}