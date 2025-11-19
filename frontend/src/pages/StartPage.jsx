// src/pages/StartPage.jsx
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, useScroll, useTransform, useMotionTemplate } from "framer-motion";

import SlideProblem from "../components/slides/SlideProblem.jsx";
import SlideSingleQuote from "../components/slides/SlideSingleQuote.jsx";
import SlideFinalThirdTool from "../components/slides/SlideFinalThirdTool.jsx";
import SlideHow from "../components/slides/SlideHow.jsx";
import SlideWhy from "../components/slides/SlideWhy.jsx";
import FixedCTA from "../components/FixedCTA.jsx";

/* -------------------- Grid backdrop (기존) -------------------- */
function GridBackdrop() {
    const GRID_SIZE = 64;
    const LINE = "rgba(255,255,255,.08)";
    const BOLD = "rgba(255,255,255,.12)";
    return (
        <div style={bd.root} aria-hidden>
            <div
                style={{
                    ...bd.grid,
                    backgroundImage: `
            linear-gradient(${LINE} 1px, transparent 1px),
            linear-gradient(90deg, ${LINE} 1px, transparent 1px)
          `,
                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                }}
            />
            <div
                style={{
                    ...bd.grid,
                    opacity: 0.9,
                    backgroundImage: `
            linear-gradient(${BOLD} 1px, transparent 1px),
            linear-gradient(90deg, ${BOLD} 1px, transparent 1px)
          `,
                    backgroundSize: `${GRID_SIZE * 4}px ${GRID_SIZE * 4}px`,
                }}
            />
            <div style={bd.bottomFade} />
            <div style={bd.vignette} />
        </div>
    );
}

const bd = {
    root: { position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", background: "#000", pointerEvents: "none" },
    grid: { position: "absolute", inset: 0, height: "100vh", backgroundPosition: "0 0, 0 0", transform: "translateZ(0)" },
    bottomFade: {
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(0,0,0,.84) 85%, rgba(0,0,0,1) 100%)"
    },
    vignette: {
        position: "absolute", inset: 0,
        background: "radial-gradient(120% 120% at 50% 50%, rgba(0,0,0,0) 65%, rgba(0,0,0,.35) 100%)"
    },
};

/* -------------------- styles -------------------- */
const BRAND_RED = "#f66957";
const wrap = {
    wrapper: { position: "relative", height: "100vh", overflowY: "auto", scrollSnapType: "y mandatory", zIndex: 2 }, // zIndex 2: 콘텐츠
    section: { scrollSnapAlign: "start" },
};
const hero = {
    container: {
        position: "relative",
        minHeight: "100vh",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        padding: "36px 56px",
        color: "#fff",
        overflow: "hidden",
    },
    topRow: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: "14px", letterSpacing: ".06em", color: "rgba(255,255,255,.9)", zIndex: 3,
    },
    bigTitleWrap: { alignSelf: "center", zIndex: 3, maxWidth: 920, marginTop: "2vh" },
    bigLine: {
        margin: 0, lineHeight: 0.88, fontWeight: 900, letterSpacing: "-.01em",
        fontSize: "clamp(4rem, 18vw, 13rem)", color: BRAND_RED, textTransform: "uppercase",
    },
    bottomRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, zIndex: 3 },
    presented: { fontWeight: 800, fontSize: "14px", letterSpacing: ".04em", color: "rgba(255,255,255,.95)" },
    rightCol: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 },
    promo: { display: "grid", gap: 8, marginBottom: 4, textAlign: "right" },
    promoOver: { fontStyle: "italic", fontSize: 14, letterSpacing: ".08em", color: "rgba(255,255,255,.9)" },
    promoBig: { margin: 0, fontWeight: 900, letterSpacing: "-.01em", fontSize: "clamp(1.4rem, 2.6vw, 2.4rem)", color: BRAND_RED, lineHeight: 1.05 },
    promoLead: { margin: 0, maxWidth: 520, color: "rgba(255,255,255,.92)", fontSize: "14px", lineHeight: 1.6 },
    actionRow: { display: "flex", alignItems: "center", gap: 12 },
    arrow: { width: 56, height: 56 },
};

/* -------------------- page -------------------- */
export default function StartPage() {
    const nav = useNavigate();

    // 스크롤 컨테이너 ref (window가 아니라 내부 스크롤)
    const scrollRef = useRef(null);
    const { scrollYProgress } = useScroll({ container: scrollRef });

    // ✅ start.png (Vite 권장 URL)
    const bgUrl = new URL("../assets/start/start.png", import.meta.url).href;

    // ✅ 0 → 1/3 → 2/3 만큼 아래로 이동 (px 대신 vh 사용)
    const y = useTransform(scrollYProgress, [0, 0.5, 1], ["0vh", "33vh", "66vh"]);
    // ✅ Blur 12px → 6px → 0px
    const blurPx = useTransform(scrollYProgress, [0, 0.5, 1], [12, 6, 0]);
    const filter = useMotionTemplate`blur(${blurPx}px)`;
    // ✅ 살짝 더 또렷해지는 느낌을 위해 opacity도 약간 가중
    const opacity = useTransform(scrollYProgress, [0, 1], [0.16, 0.24]);

    // 두 번째 슬라이드 센티넬로 CTA 표시 제어
    const problemRef = useRef(null);
    const problemInViewOnce = useInView(problemRef, { root: scrollRef, rootMargin: "0px 0px -50% 0px", amount: 0.6, once: true });
    const [ctaShown, setCtaShown] = useState(false);
    useEffect(() => { if (problemInViewOnce && !ctaShown) setCtaShown(true); }, [problemInViewOnce, ctaShown]);

    const [hoverTitle, setHoverTitle] = useState(false);
    const year = new Date().getFullYear();

    const renderTitle = (text) => (
        <div
            style={{
                display: "flex", gap: "0.05em", justifyContent: "start", flexWrap: "wrap",
                fontSize: "clamp(4rem, 18vw, 13rem)", fontWeight: 900, lineHeight: 0.88,
                color: BRAND_RED, textTransform: "uppercase", letterSpacing: "-.01em", userSelect: "none",
            }}
            onMouseEnter={() => setHoverTitle(true)}
            onMouseLeave={() => setHoverTitle(false)}
        >
            {text.split("").map((ch, i) => (
                <motion.span
                    key={i}
                    initial={{ y: 0 }}
                    animate={hoverTitle ? { y: -6, transition: { delay: i * 0.04, type: "spring", stiffness: 260, damping: 18 } } : { y: 0 }}
                    style={{ display: "inline-block", willChange: "transform" }}
                >
                    {ch}
                </motion.span>
            ))}
        </div>
    );

    return (
        <>
            <style>{`
        .start-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .start-scroll::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>

            {/* 🔳 그리드 (z=0) */}
            <GridBackdrop />

            {/* 🖼️ 고정 배경 이미지 (z=1) — 스크롤에 따라 위치/블러/투명도 변화 */}
            <motion.div
                aria-hidden
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 1,              // 콘텐츠(z=2) 아래, 그리드(z=0) 위
                    backgroundImage: `url(${bgUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    y,
                    filter,
                    opacity,
                    pointerEvents: "none",
                }}
            />

            <div ref={scrollRef} className="start-scroll" style={wrap.wrapper}>
                {/* HERO */}
                <section style={wrap.section}>
                    <div style={hero.container}>
                        <div style={hero.topRow}>
                            <span>{year}</span>
                            <span>www.the-third-tool.com</span>
                        </div>

                        <div style={hero.bigTitleWrap}>
                            <motion.h1 style={hero.bigLine} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                                {renderTitle("THIRD")}
                            </motion.h1>
                            <div style={{ height: 8 }} />
                            <motion.h1 style={hero.bigLine} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                                {renderTitle("TOOL")}
                            </motion.h1>
                        </div>

                        <div style={hero.bottomRow}>
                            <div style={hero.presented}>DIRECTED BY : TEAM THIRD TOOL</div>

                            <div style={hero.rightCol}>
                                <div style={hero.promo}>
                                    <span style={hero.promoOver}>HELLO, WE ARE</span>
                                    <h3 style={hero.promoBig}>망각 방지를 위한</h3>
                                    <h3 style={hero.promoBig}>세 번째 도구</h3>
                                    <p style={hero.promoLead}>
                                        빠르게 잊혀지는 시대 속에서, <strong>기억을 오래 남기는 학습 시스템</strong>을 만듭니다.
                                        연필과 공책 다음, 당신의 기억을 책임질 도구 — <em>Third Tool</em>.
                                    </p>
                                </div>

                                <div style={hero.actionRow}>
                                    <motion.button
                                        onClick={() => nav("/login")}
                                        style={{ padding: "10px 18px", background: "transparent", border: "2px solid " + BRAND_RED, color: "#fff", borderRadius: 12, fontWeight: 800, letterSpacing: ".02em" }}
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        Get Started
                                    </motion.button>

                                    <motion.svg viewBox="0 0 24 24" style={hero.arrow} initial={{ opacity: 0, rotate: -8, x: 10, y: 10 }} animate={{ opacity: 1, rotate: 0, x: 0, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }}>
                                        <path d="M4 20 L20 4 M20 4 L20 12 M20 4 L12 4" stroke={BRAND_RED} strokeWidth="2.8" fill="none" strokeLinecap="square" />
                                    </motion.svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 센티넬 */}
                <div ref={problemRef}>
                    <SlideProblem />
                </div>

                {/* ✅ 새 멘트 반영 */}
                <SlideSingleQuote
                    quote={`넘치는 정보 쌓고만 있나요,\n\n아니면 남기고 있나요?`}
                />

                <SlideHow />
                <SlideWhy />
                <SlideFinalThirdTool />
                <FixedCTA visible={ctaShown} label="지금 시작하기" />
            </div>
        </>
    );
}
