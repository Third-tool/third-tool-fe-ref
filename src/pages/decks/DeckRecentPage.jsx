import React, { useEffect, useState } from "react";
import { fetchWithAccess } from "../../utils/authFetch.js";
const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function DeckRecentPage() {
    const [recentDecks, setRecentDecks] = useState([]);

    async function loadRecent() {
        const res = await fetchWithAccess(`${BASE_URL}/api/decks/recent`);
        const data = await res.json();
        setRecentDecks(data);
    }

    useEffect(() => loadRecent(), []);

    return (
        <div style={s.container}>
            <h2>🕒 최근 접근 덱</h2>
            {recentDecks.length === 0 ? (
                <p>최근 덱이 없습니다.</p>
            ) : (
                recentDecks.map((d) => (
                    <div key={d.id} style={s.deckCard}>
                        <h4>{d.name}</h4>
                        <p>마지막 접근: {new Date(d.lastAccessed).toLocaleString()}</p>
                    </div>
                ))
            )}
        </div>
    );
}

const s = {
    container: { background: "#121212", color: "white", padding: 30, minHeight: "100vh" },
    deckCard: { background: "#1f1f1f", padding: 20, marginBottom: 10, borderRadius: 8 },
};