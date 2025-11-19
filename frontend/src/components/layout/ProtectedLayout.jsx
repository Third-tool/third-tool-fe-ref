// src/components/layout/ProtectedLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNav from './SidebarNav.jsx';
import AppHeader from './AppHeader.jsx';
import '../../index.css';

export default function ProtectedLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="app-layout">
            <SidebarNav
                isCollapsed={isCollapsed}
                onToggle={() => setIsCollapsed(!isCollapsed)}
            />

            <div
                className={`main-content-area ${isCollapsed ? 'collapsed' : ''}`}
            >
                <header className="main-header">
                    {/* 👇 여기에 isSidebarCollapsed prop을 전달합니다. */}
                    <AppHeader isSidebarCollapsed={isCollapsed} />
                </header>

                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}