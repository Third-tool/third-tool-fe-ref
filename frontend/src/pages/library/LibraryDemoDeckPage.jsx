// src/pages/LibraryDemoDeckPage.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const lift = { whileHover: { y: -2 }, whileTap: { scale: 0.98 } };
const fade = (d = 0, y = 8) => ({
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, delay: d, ease: "easeOut" } },
});

const DEMO_DECKS = {
    "regex-eng": {
        title: "English Regular Expressions",
        desc: "Common regex patterns for validation & preprocessing in English text",
        cover: "regex-eng",
        cards: [
            {
                q: "Integer (optional sign)",
                a: "/^[+-]?\\d+$/",
                tip: "Validate integer inputs such as IDs, counts, or offsets."
            },
            {
                q: "Email (RFC-lite)",
                a: "/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/",
                tip: "Simple front-end email validation with a minimum 2-character domain."
            },
            {
                q: "URL (http/https)",
                a: "/^(https?):\\/\\/[^\\s\\/$.?#].[^\\s]*$/i",
                tip: "Require http or https at the beginning and ignore case with the i flag."
            },
            {
                q: "US phone (simple)",
                a: "/^\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$/",
                tip: "Allow optional parentheses and separators while keeping a basic US phone pattern."
            },
            {
                q: "Slug (kebab-case)",
                a: "/^[a-z0-9]+(?:-[a-z0-9]+)*$/",
                tip: "Generate a URL-friendly identifier using lowercase letters, numbers, and hyphens."
            },
            {
                q: "ISO date (YYYY-MM-DD)",
                a: "/^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$/",
                tip: "Validate dates with correct ranges for month and day."
            },
            {
                q: "Alphabetic only",
                a: "/^[A-Za-z]+$/",
                tip: "Allow only English alphabet letters, no spaces or symbols."
            },
            {
                q: "Collapse spaces (find)",
                a: "/\\s+/g",
                tip: "Find runs of whitespace characters to collapse them into a single space."
            },
        ],
        tags: ["Regex", "Validation", "Text-Processing"],
    },

    "mcat-miles": {
        title: "MCAT Milesdown",
        desc: "High-yield biochemistry and physiology concepts distilled into quick cards.",
        cover: "mcat-miles",
        cards: [
            {
                q: "What is the effect of a competitive inhibitor on Michaelis–Menten kinetics?",
                a: "Km increases, Vmax stays the same.",
                tip: "The inhibitor competes with substrate for the active site, lowering apparent affinity."
            },
            {
                q: "What is the effect of a noncompetitive inhibitor on Michaelis–Menten kinetics?",
                a: "Vmax decreases, Km stays the same.",
                tip: "The inhibitor binds at a site other than the active site and reduces the effective enzyme amount."
            },
            {
                q: "What factors shift the hemoglobin O2 dissociation curve to the right?",
                a: "Increased CO2, increased H+ (lower pH), increased temperature, and increased 2,3-BPG.",
                tip: "A right shift means hemoglobin releases oxygen more easily in active tissues."
            },
            {
                q: "What is the main transporter in the thick ascending limb of the nephron?",
                a: "NKCC2: Na+/K+/2Cl- reabsorption; segment is impermeable to water.",
                tip: "This segment helps generate the medullary osmotic gradient."
            },
            {
                q: "In a neuronal action potential, what ions drive depolarization and repolarization?",
                a: "Depolarization: sodium influx; repolarization: potassium efflux.",
                tip: "Hyperpolarization occurs when potassium channels remain open longer than needed."
            },
            {
                q: "Name the key enzymes unique to gluconeogenesis.",
                a: "Pyruvate carboxylase, PEPCK, fructose-1,6-bisphosphatase, glucose-6-phosphatase.",
                tip: "These enzymes bypass the three irreversible steps of glycolysis."
            },
            {
                q: "Write the Hardy–Weinberg equilibrium equation.",
                a: "p^2 + 2pq + q^2 = 1, with p + q = 1.",
                tip: "The model assumes random mating, large population size, and no mutation, migration, or selection."
            },
            {
                q: "What is the effect of aldosterone on the nephron?",
                a: "It increases sodium reabsorption and increases potassium secretion in the collecting duct.",
                tip: "Its net effect is to raise blood pressure and extracellular fluid volume."
            },
        ],
        tags: ["Biochem", "Physiology", "MCAT"],
    },
};

const imgSrc = (seed, w = 960, h = 420) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

export default function LibraryDemoDeckPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const deck = DEMO_DECKS[slug];

    if (!deck) {
        return (
            <div style={{ color: "white", padding: 24 }}>
                존재하지 않는 데모 덱입니다. <button onClick={() => navigate("/library")} style={sx.linkBtn}>← 라이브러리로</button>
            </div>
        );
    }

    return (
        <div style={sx.container}>
            {/* 헤더 */}
            <header style={sx.header}>
                <div style={sx.brand}><span style={{ color: "#d32f2f" }}>●</span> <strong>The Third Tool</strong></div>
                <motion.button {...lift} style={sx.backBtn} onClick={() => navigate("/library")}>← Library</motion.button>
            </header>

            {/* 히어로 */}
            <motion.section {...fade(0.02)} style={sx.hero}>
                <img src={imgSrc(deck.cover)} alt={deck.title} style={sx.heroImg} />
                <div style={sx.heroText}>
                    <h1 style={sx.title}>{deck.title}</h1>
                    <p style={sx.desc}>{deck.desc}</p>
                    <div style={sx.tags}>
                        {deck.tags.map((t) => <span key={t} style={sx.tag}>{t}</span>)}
                    </div>
                </div>
            </motion.section>

            {/* 카드 리스트 */}
            <main style={sx.cardsWrap}>
                {deck.cards.map((c, i) => (
                    <motion.div key={i} {...fade(0.04 + i * 0.02)} whileHover={{ y: -2, backgroundColor: "#232323" }} style={sx.card}>
                        <div>
                            <h3 style={sx.q}>{c.q}</h3>
                            <p style={sx.a}><span style={sx.kbd}>Answer</span> {c.a}</p>
                            {c.tip && <p style={sx.tip}>💡 {c.tip}</p>}
                        </div>

                        {/* ✅ [수정] onClick 핸들러 변경 */}
                        <button
                            style={sx.learnBtn}
                            onClick={() => navigate(`/library/demo/${slug}/learn?start=${i}`)}
                        >
                            학습하기
                        </button>
                    </motion.div>
                ))}
            </main>
        </div>
    );
}

const sx = {
    container: { background: "#0b0b0b", color: "#fff", minHeight: "100vh", paddingBottom: 80 },
    header: {
        position: "sticky", top: 0, zIndex: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 28px",
        background: "rgba(20,20,20,0.6)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
    },
    brand: { display: "flex", alignItems: "center", gap: 8, fontWeight: 800 },
    backBtn: {
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
        color: "#fff", padding: "8px 12px", borderRadius: 10, cursor: "pointer",
    },

    hero: { maxWidth: 1200, margin: "14px auto 0", padding: "0 24px", display: "grid", gap: 14, gridTemplateColumns: "1.2fr 0.8fr", alignItems: "center" },
    heroImg: { width: "100%", height: 300, objectFit: "cover", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)" },
    heroText: { padding: "6px 4px" },
    title: { margin: "0 0 6px" },
    desc: { margin: "0 0 10px", color: "#cdd1d6" },
    tags: { display: "flex", gap: 8, flexWrap: "wrap" },
    tag: { background: "#1c1c1c", border: "1px solid #2a2a2a", padding: "4px 10px", borderRadius: 999, fontSize: 12 },

    cardsWrap: { maxWidth: 1200, margin: "16px auto 0", padding: "0 24px", display: "grid", gap: 12 },
    card: {
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
        background: "linear-gradient(180deg, #141414, #1b1b1b)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 14,
    },
    q: { margin: "0 0 6px", fontSize: "1rem" },
    a: { margin: "0 0 6px", color: "#b8bec4", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" },
    kbd: {
        background: "#202020", border: "1px solid #2a2a2a", borderRadius: 6, padding: "2px 6px",
        fontSize: 12, marginRight: 8, color: "#eaeaea",
    },
    tip: { margin: 0, color: "#9aa0a6", fontSize: ".9rem" },
    learnBtn: {
        background: "#d32f2f", border: "none", color: "#fff", padding: "10px 14px", borderRadius: 10,
        cursor: "pointer", fontWeight: 700,
    },
    linkBtn: {
        background: "transparent", border: "1px solid #2a2a2a", color: "#c7c7c7",
        padding: "6px 10px", borderRadius: 8, cursor: "pointer",
    },
};