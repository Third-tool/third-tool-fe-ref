// [수정] useState, useEffect 임포트
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import './SidebarNav.css';
// [추가] fetchWithAccess 임포트
import { fetchWithAccess } from '../../utils/authFetch.js';

// 아이콘 SVG (변경 없음)
const I = {
    Home: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    ),
    Library: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
    ),
    Deck: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
    ),
    Recent: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
    ),
    Help: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    ),
    Chat: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-7.15a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
    ),
    Moon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    ),
    Settings: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1 .51H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.82.33z"></path>
        </svg>
    ),
    Toggle: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    ),
};

const ACCENT = "#f66957";
// [추가] BASE_URL
const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function SidebarNav({ isCollapsed, onToggle }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path) => location.pathname === path || (path !== '/home' && location.pathname.startsWith(path));

    // [추가] 가장 최근 덱 상태
    const [recentDeck, setRecentDeck] = useState(null);

    // [추가] 최근 덱 정보 가져오기
    useEffect(() => {
        fetchRecentDeck();
        // 의존성 배열을 비워 마운트 시 1회만 실행
    }, []);

    async function fetchRecentDeck() {
        try {
            const res = await fetchWithAccess(`${BASE_URL}/api/decks/recent/top`);
            if (res.status === 204 || !res.ok) {
                setRecentDeck(null);
            } else {
                setRecentDeck(await res.json()); // { id, name, thumbnailUrl, ... }
            }
        } catch (e) {
            console.error("사이드바 최근 덱 정보 로드 실패:", e);
            setRecentDeck(null);
        }
    }

    // [추가] 최근 덱으로 바로 이동하는 핸들러
    const handleRecentClick = async (mode) => {
        if (recentDeck && recentDeck.id) {
            // ✅ 1. 덱 정보가 있으면: touch API 호출 후 DeckDetail로 이동
            try {
                await fetchWithAccess(`${BASE_URL}/api/decks/${recentDeck.id}/touch`, {
                    method: 'POST'
                });
            } catch (e) {
                console.error("Touch API 호출 실패:", e);
                // 실패해도 이동은 계속
            }
            navigate(`/decks/${recentDeck.id}?mode=${mode}`);

        } else {
            // ✅ 2. 덱 정보가 없으면 (null): 기존 DeckList 페이지(/decks/recent)로 이동
            navigate('/decks/recent');
        }
    };


    const W = isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)';

    return (
        <motion.aside
            className="sidebar"
            animate={{ width: W }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
        >
            <div className="sidebar-header">
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.span
                            className="sidebar-logo"
                            style={{ color: ACCENT }}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => navigate('/home')}
                        >
                            THIRD TOOL
                        </motion.span>
                    )}
                </AnimatePresence>
                <button className="sidebar-toggle" onClick={onToggle}>
                    <I.Toggle />
                </button>
            </div>

            <div className="sidebar-content">
                <nav className="sidebar-nav">
                    <WorkspaceButton collapsed={isCollapsed} />

                    <SideItem label="홈" Icon={I.Home} collapsed={isCollapsed} active={isActive('/home')} onClick={() => navigate('/home')} />
                    <SideItem label="라이브러리" Icon={I.Library} collapsed={isCollapsed} active={isActive('/library')} onClick={() => navigate('/library')} />
                    <SideItem label="덱" Icon={I.Deck} collapsed={isCollapsed} active={isActive('/decks') && !location.pathname.includes('/decks/recent')} onClick={() => navigate('/decks')} />

                    {/* [삭제] 기존 "최근" 아이템 */}
                    {/* <SideItem label="최근" Icon={I.Recent} collapsed={isCollapsed} active={isActive('/decks/recent')} onClick={() => navigate('/decks/recent')} /> */}

                    {/* [추가] 분리된 "최근" 아이템 2개 */}
                    <SideItem
                        label="최근 (3day)"
                        Icon={I.Recent} // 아이콘은 '최근'으로 통일
                        collapsed={isCollapsed}
                        // '최근' 목록 페이지와 활성 상태를 공유
                        active={isActive('/decks/recent')}
                        onClick={() => handleRecentClick('THREE_DAY')}
                    />
                    <SideItem
                        label="최근 (permanent)"
                        Icon={I.Recent} // 아이콘은 '최근'으로 통일
                        collapsed={isCollapsed}
                        // 이 버튼은 특정 활성 경로가 없음 (클릭 시 이동)
                        active={false}
                        onClick={() => handleRecentClick('PERMANENT')}
                    />

                    <div className="nav-separator" />

                </nav>

                <div className="sidebar-footer">
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                className="plan-box"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1, transition: { delay: 0.1 }}}
                                exit={{ height: 0, opacity: 0, transition: { duration: 0.1 } }}
                            >
                                <div className="plan-title">요금제 알아보기</div>
                                <div className="plan-desc">더 많은 기능 잠금 해제하기</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="bottom-icons">
                        <button className="icon-btn" title="고객센터"><I.Help /></button>
                        <button className="icon-btn" title="커뮤니티"><I.Chat /></button>
                        <button className="icon-btn" title="테마"><I.Moon /></button>
                        <button className="icon-btn" title="설정"><I.Settings /></button>
                    </div>
                </div>
            </div>
        </motion.aside>
    );
};

// --- 사이드바 하위 컴포넌트 ---
const WorkspaceButton = ({ collapsed }) => (
    <button className={`ws-btn ${collapsed ? 'collapsed' : ''}`}>
        <span className="ws-badge">P</span>
        <AnimatePresence>
            {!collapsed && (
                <motion.span
                    className="ws-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.1 } }}
                    exit={{ opacity: 0 }}
                >
                    Personal
                </motion.span>
            )}
        </AnimatePresence>
        <AnimatePresence>
            {!collapsed && (
                <motion.span
                    className="ws-caret"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.1 } }}
                    exit={{ opacity: 0 }}
                >
                    ▾
                </motion.span>
            )}
        </AnimatePresence>
    </button>
);

const SideItem = ({ label, Icon, active, collapsed, onClick }) => (
    <button
        className={`side-item ${active ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`}
        title={collapsed ? label : undefined}
        onClick={onClick}
    >
        <span className="side-item-icon"><Icon /></span>
        <AnimatePresence>
            {!collapsed && (
                <motion.span
                    className="side-item-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.1 } }}
                    exit={{ opacity: 0 }}
                >
                    {label}
                </motion.span>
            )}
        </AnimatePresence>
    </button>
);

const SectionHeader = ({ label, collapsed }) => (
    <AnimatePresence>
        {!collapsed && (
            <motion.div
                className="section-header"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.1 } }}
                exit={{ opacity: 0 }}
            >
                <span className="section-title">{label}</span>
            </motion.div>
        )}
    </AnimatePresence>
);