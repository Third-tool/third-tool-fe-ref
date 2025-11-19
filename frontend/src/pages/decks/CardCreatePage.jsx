// src/pages/cards/CardCreatePage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithAccess } from "../../utils/authFetch.js";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;
const ACCENT = "#f66957";
const EDITOR_MIN_H = "clamp(220px, 34vh, 420px)";

/* ───────── Icons ───────── */
const Icons = {
    Back: (p) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
            <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Home: (p) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}>
            <path d="M3 9l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor" strokeWidth="2" />
            <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
    Check: (p) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Image: (p) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}>
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="8.5" cy="8.5" r="1.6" stroke="currentColor" strokeWidth="1.6" />
            <path d="M21 16l-5-5-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Bold: (p) => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" {...p}>
            <path d="M13 6H7v12h7a4 4 0 0 0 0-8H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Italic: (p) => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" {...p}>
            <path d="M19 4h-9M14 20H5M15 4l-6 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Under: (p) => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" {...p}>
            <path d="M6 4v6a6 6 0 1 0 12 0V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    ),
    Code: (p) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}>
            <path d="M8 16l-4-4 4-4M16 8l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Link: (p) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}>
            <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M14 11a5 5 0 0 0-7.07 0L5.5 12.43a5 5 0 1 0 7.07 7.07L14 19" stroke="currentColor" strokeWidth="1.8" />
        </svg>
    ),
    ArrowL: (p) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}>
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    ArrowR: (p) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}>
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
};

/* ───────── motion helpers ───────── */
const fade = (d = 0, y = 10, t = 0.3) => ({
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0, transition: { duration: t, ease: "easeOut", delay: d } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.2 } },
});
const lift = { whileHover: { y: -2, scale: 1.01 }, whileTap: { scale: 0.98 } };
const hoverCard = { whileHover: { y: -2, rotate: -0.15, boxShadow: "0 8px 22px rgba(0,0,0,.35)" } };
const hoverSoft = { whileHover: { y: -1, scale: 1.005 } };

/* ───────── Toolbar ───────── */
function Toolbar({ onPickImage, fileInputId }) {
    return (
        <motion.div {...hoverSoft} style={sx.toolbar}>
            <button type="button" style={sx.toolBtn}><Icons.Bold /></button>
            <button type="button" style={sx.toolBtn}><Icons.Italic /></button>
            <button type="button" style={sx.toolBtn}><Icons.Under /></button>
            <span style={sx.divider} />
            <button type="button" style={sx.toolBtn}><Icons.Code /></button>
            <button type="button" style={sx.toolBtn}><Icons.Link /></button>
            <span style={sx.divider} />
            <label htmlFor={fileInputId} style={{ ...sx.toolBtn, cursor: "pointer" }}>
                <Icons.Image />
            </label>
            <input id={fileInputId} type="file" accept="image/*" onChange={onPickImage} style={{ display: "none" }} />
        </motion.div>
    );
}

/* ───────── Drop/Preview (▶ Ctrl/Cmd+V 붙여넣기 지원) ───────── */
function Attachment({ preview, onRemove, onDrop, onDragOver, onPaste }) {
    const boxRef = useRef(null);
    const handleContextMenu = (e) => {
        e.preventDefault();
        onRemove();
    };
    const focusBox = () => boxRef.current?.focus();

    return (
        <motion.div
            {...hoverSoft}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onPaste={onPaste}
            tabIndex={0}                 // ▶ 포커스 가능
            ref={boxRef}
            onClick={focusBox}           // 클릭 시 포커스 → 바로 붙여넣기 가능
            style={sx.drop}
            title="여기를 클릭 후 Ctrl/Cmd+V로 이미지 붙여넣기 가능"
        >
            <AnimatePresence mode="wait">
                {preview ? (
                    <motion.div
                        key="has"
                        {...fade(0.02)}
                        style={sx.previewBox}
                        onContextMenu={handleContextMenu}
                        title="Right-click to remove image"
                    >
                        <img src={preview} alt="preview" style={sx.previewImg} onError={(e) => (e.currentTarget.style.display = "none")} />
                        <div style={sx.previewActions}>
                            <button type="button" style={sx.ghostBtn} onClick={onRemove}>Remove</button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="empty" {...fade(0.02)} style={sx.dropCenter}>
                        <Icons.Image />
                        <p style={sx.dropText}>Drag & Drop / 클릭 후 Ctrl/Cmd+V 로 붙여넣기 / 상단 아이콘으로 업로드</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ───────── 중앙 플레이스홀더가 있는 textarea ───────── */
function EditableArea({ value, onChange, maxLength, placeholder, textareaRef }) {
    const innerRef = textareaRef ?? React.useRef(null);
    const showHint = !value?.length;

    return (
        <div style={sx.textareaWrap}>
      <textarea
          ref={innerRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder=""
          style={sx.textarea}
          maxLength={maxLength}
      />
            {showHint && (
                <div style={sx.placeholderCenter} onClick={() => innerRef.current?.focus()}>
                    {placeholder}
                </div>
            )}
        </div>
    );
}

export default function CardCreatePage() {
    const { deckId } = useParams();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get("mode") || "THREE_DAY";
    const navigate = useNavigate();

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [questionImage, setQuestionImage] = useState(null);
    const [answerImage, setAnswerImage] = useState(null);
    const [qPreview, setQPreview] = useState(null);
    const [aPreview, setAPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [savedTick, setSavedTick] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [step, setStep] = useState(0); // 0: Front, 1: Back

    const frontRef = useRef(null);

    /* 단축키 */
    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                document.getElementById("card-submit-top")?.click() ||
                document.getElementById("card-submit-bottom")?.click();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        if (savedTick > 0 && frontRef.current) frontRef.current.focus();
    }, [savedTick]);

    const setImgAndPreview = (type, file) => {
        if (!file || !file.type?.startsWith?.("image/")) return false;
        if (type === "Q") {
            setQuestionImage(file);
            setQPreview(URL.createObjectURL(file));
        } else {
            setAnswerImage(file);
            setAPreview(URL.createObjectURL(file));
        }
        return true;
    };

    const pickImage = (type) => (e) => {
        const file = e.target.files?.[0];
        setImgAndPreview(type, file);
    };

    const onDrop = (type) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        setImgAndPreview(type, file);
    };

    /* ✅ Ctrl/Cmd + V 붙여넣기 (dropzone에 포커스되어 있을 때 동작) */
    const onPaste = (type) => (e) => {
        const items = e.clipboardData?.items || [];
        for (const it of items) {
            if (it.kind === "file" && it.type?.startsWith("image/")) {
                const file = it.getAsFile();
                if (file) {
                    e.preventDefault();
                    setImgAndPreview(type, file);
                    break;
                }
            }
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        const q = question.trim();
        const a = answer.trim();
        if (!q || !a) {
            setError("Question과 Answer를 모두 입력해 주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("question", q);
        formData.append("answer", a);
        if (questionImage) formData.append("questionImages", questionImage);
        if (answerImage) formData.append("answerImages", answerImage);

        try {
            setSubmitting(true);
            const res = await fetchWithAccess(`${BASE_URL}/api/cards/decks/${deckId}`, { method: "POST", body: formData });
            if (!res.ok) throw new Error((await res.text().catch(() => "")) || "Card create failed");

            // 저장 후 계속 입력
            setQuestion("");
            setAnswer("");
            setQuestionImage(null);
            setAnswerImage(null);
            setQPreview(null);
            setAPreview(null);
            setStep(0);
            setSavedTick((n) => n + 1);
        } catch (err) {
            setError(`카드 생성 실패: ${err.message || err}`);
        } finally {
            setSubmitting(false);
        }
    }

    const exitToDeck = () => navigate(`/decks/${deckId}?mode=${mode}`);

    return (
        <div style={sx.page}>
            {/* 헤더 */}
            <motion.header {...fade(0.02)} style={sx.header}>
                <div style={sx.breadcrumbs}>
                    <button onClick={exitToDeck} style={sx.bcrumbBtn} title="Exit to deck"><Icons.Back /></button>
                    <Link to="/home" style={sx.bcrumbLink}><Icons.Home style={{ marginRight: 6 }} />Home</Link>
                    <span style={sx.sep}>/</span>
                    <span style={sx.dim}>Deck</span>
                    <span style={sx.sep}>/</span>
                    <span style={{ color: "#fff", fontWeight: 700 }}>Add new card</span>
                </div>

                <div style={sx.headerRight}>
                    <span style={sx.modeBadge}>{mode === "THREE_DAY" ? "3DAY" : "PERMANENT"}</span>
                    <div style={sx.stepTabs}>
                        <button onClick={() => setStep(0)} style={{ ...sx.stepBtn, ...(step === 0 ? sx.stepActive : {}) }}>Question</button>
                        <button onClick={() => setStep(1)} style={{ ...sx.stepBtn, ...(step === 1 ? sx.stepActive : {}) }}>Answer</button>
                    </div>
                    <motion.button
                        id="card-submit-top"
                        {...lift}
                        onClick={(e) => { e.preventDefault(); handleSubmit(e); }}
                        disabled={submitting}
                        style={{ ...sx.primary, opacity: submitting ? .7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
                        title="Save (Ctrl/Cmd + Enter)"
                    >
                        <Icons.Check style={{ marginRight: 8 }} /> {submitting ? "Saving…" : "Save"}
                    </motion.button>
                    <motion.button type="button" {...lift} onClick={exitToDeck} style={sx.secondary} title="Exit to deck">
                        Exit
                    </motion.button>
                </div>
            </motion.header>

            {/* 저장 토스트 */}
            <AnimatePresence>
                {savedTick > 0 && (
                    <motion.div
                        key={savedTick}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        style={sx.toast}
                        role="status"
                    >
                        카드가 저장되었습니다. 계속 추가하세요!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 폼 */}
            <motion.form {...fade(0.05)} onSubmit={handleSubmit} style={sx.form}>
                {/* 슬라이더 내비 */}
                <div style={sx.sliderNav}>
                    <motion.button type="button" {...lift} disabled={step === 0} onClick={() => setStep(0)} style={{ ...sx.navBtn, opacity: step === 0 ? .35 : 1 }} aria-label="Front">
                        <Icons.ArrowL />
                    </motion.button>

                    <div style={sx.stepDots}>
                        <span style={{ ...sx.dot, ...(step === 0 ? sx.dotOn : {}) }} />
                        <span style={{ ...sx.dot, ...(step === 1 ? sx.dotOn : {}) }} />
                    </div>

                    <motion.button type="button" {...lift} disabled={step === 1} onClick={() => setStep(1)} style={{ ...sx.navBtn, opacity: step === 1 ? .35 : 1 }} aria-label="Back">
                        <Icons.ArrowR />
                    </motion.button>
                </div>

                {/* 뷰포트 + 트랙 */}
                <div style={sx.viewport}>
                    <motion.div
                        style={sx.track}
                        animate={{ x: step === 0 ? "0%" : "calc(-100% - 12px)" }}
                        transition={{ type: "spring", stiffness: 220, damping: 26 }}
                    >
                        {/* Front */}
                        <motion.section {...hoverCard} style={sx.editorCard}>
                            <h3 style={sx.label}>Front side</h3>
                            <EditableArea
                                textareaRef={frontRef}
                                value={question}
                                onChange={setQuestion}
                                maxLength={1000}
                                placeholder="여기에 쓰시면 됩니다."
                            />
                            <Toolbar onPickImage={pickImage("Q")} fileInputId="q-file-input" />
                            <Attachment
                                preview={qPreview}
                                onRemove={() => { setQuestionImage(null); setQPreview(null); }}
                                onDrop={onDrop("Q")}
                                onDragOver={onDragOver}
                                onPaste={onPaste("Q")}      // ✅ 붙여넣기 핸들러
                            />
                            <div style={sx.metaRow}><span style={sx.counter}>{question.length}/1000</span></div>
                        </motion.section>

                        {/* Back */}
                        <motion.section {...hoverCard} style={sx.editorCard}>
                            <h3 style={sx.label}>Back side</h3>
                            <EditableArea
                                value={answer}
                                onChange={setAnswer}
                                maxLength={2000}
                                placeholder="여기에 쓰시면 됩니다."
                            />
                            <Toolbar onPickImage={pickImage("A")} fileInputId="a-file-input" />
                            <Attachment
                                preview={aPreview}
                                onRemove={() => { setAnswerImage(null); setAPreview(null); }}
                                onDrop={onDrop("A")}
                                onDragOver={onDragOver}
                                onPaste={onPaste("A")}      // ✅ 붙여넣기 핸들러
                            />
                            <div style={sx.metaRow}><span style={sx.counter}>{answer.length}/2000</span></div>
                        </motion.section>
                    </motion.div>
                </div>

                {/* Reverse & Bottom actions */}
                <div style={sx.footerRow}>
                    <label style={sx.reverse}>
                        <input type="checkbox" checked={reverse} onChange={(e) => setReverse(e.target.checked)} style={{ display: "none" }} />
                        <span style={{ ...sx.switch, ...(reverse ? sx.switchOn : {}) }} aria-hidden />
                        <span style={{ marginLeft: 10 }}>Reverse cards</span>
                    </label>

                    <div style={{ display: "flex", gap: 10 }}>
                        <motion.button type="button" {...lift} style={sx.secondary} onClick={exitToDeck}>Exit</motion.button>
                        <motion.button id="card-submit-bottom" type="submit" {...lift} disabled={submitting} style={{ ...sx.primary, opacity: submitting ? .7 : 1 }}>
                            {submitting ? "Saving…" : "Save"}
                        </motion.button>
                    </div>
                </div>

                <AnimatePresence>
                    {error && <motion.div {...fade(0, 6, 0.2)} style={sx.error}>{error}</motion.div>}
                </AnimatePresence>
            </motion.form>
        </div>
    );
}

/* ───────── styles ───────── */
const sx = {
    page: { position: "relative", width: "100%" },

    header: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        margin: "0 auto 18px", gap: 12, flexWrap: "wrap",
        maxWidth: 920, padding: "0 12px",
    },
    breadcrumbs: { display: "flex", alignItems: "center", gap: 10, color: "#c8c8c8" },
    bcrumbBtn: {
        display: "grid", placeItems: "center",
        width: 34, height: 34, borderRadius: 10, border: "1px solid #333", background: "#1a1a1a",
        color: "#eee", cursor: "pointer"
    },
    bcrumbLink: { display: "flex", alignItems: "center", color: "#eee", textDecoration: "none", padding: "4px 6px", borderRadius: 6 },
    sep: { opacity: .5 }, dim: { color: "#a6a6a6" },

    headerRight: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
    modeBadge: {
        background: "rgba(246,105,87,.12)", color: ACCENT, border: `1px solid rgba(246,105,87,.32)`,
        padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: .3
    },

    stepTabs: { display: "flex", gap: 6, background: "#191919", border: "1px solid #2b2b2b", padding: 4, borderRadius: 999 },
    stepBtn: { background: "transparent", color: "#cfcfcf", border: "none", padding: "6px 12px", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: 12 },
    stepActive: { background: "#2a2a2a", color: "#fff" },

    form: { display: "flex", flexDirection: "column", gap: 16, maxWidth: 920, padding: "0 12px", margin: "0 auto" },

    /* toast */
    toast: {
        maxWidth: 920, margin: "0 auto 12px", padding: "10px 12px",
        background: "rgba(34,197,94,.14)", border: "1px solid rgba(34,197,94,.35)",
        color: "#b9ffcc", borderRadius: 10, fontSize: 14,
    },

    /* slider */
    sliderNav: { display: "flex", alignItems: "center", justifyContent: "space-between" },
    navBtn: {
        width: 36, height: 36, borderRadius: 12, border: "1px solid #333", background: "#1a1a1a",
        color: "#fff", display: "grid", placeItems: "center", cursor: "pointer"
    },
    stepDots: { display: "flex", gap: 8, alignItems: "center" },
    dot: { width: 8, height: 8, borderRadius: 999, background: "#3a3a3a" },
    dotOn: { background: ACCENT },

    viewport: { position: "relative", width: "100%", overflow: "hidden", borderRadius: 14 },
    track: {
        display: "grid",
        gridTemplateColumns: "100% 100%",
        columnGap: 12,
        width: "calc(200% + 12px)",
    },

    editorCard: {
        background: "#1b1b1b",
        border: "1px solid #2e2e2e",
        borderRadius: 14,
        padding: 14,
        boxShadow: "0 0 0 1px rgba(0,0,0,.2) inset",
    },
    label: { margin: "4px 0 10px", color: "#cfcfcf", fontSize: 14, fontWeight: 700 },

    /* textarea + 중앙 플레이스홀더 */
    textareaWrap: { position: "relative",
        minHeight: EDITOR_MIN_H,
        maxWidth: "850px",
        margin: "0",
    },
    placeholderCenter: {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "#7e7e7e",
        fontSize: 15,
        padding: "0 12px",
        pointerEvents: "auto",
    },
    textarea: {
        width: "100%",
        maxWidth: "850px",
        margin: "0",
        minHeight: EDITOR_MIN_H,
        background: "#111",
        color: "#f2f2f2",
        border: "1px solid #303030",
        borderRadius: 10,
        padding: "12px 12px",
        outline: "none",
        resize: "vertical",
        fontSize: 15,
    },

    toolbar: {
        marginTop: 10,
        background: "#0f0f10",
        border: "1px solid #2b2b2b",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "8px 10px",
        color: "#f0f0f0"
    },
    toolBtn: {
        display: "grid",
        placeItems: "center",
        width: 28, height: 28,
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,.08)",
        background: "rgba(255,255,255,.03)",
        color: "#fff",
        cursor: "pointer"
    },
    divider: { width: 1, height: 18, background: "rgba(255,255,255,.1)", margin: "0 4px" },

    /* dropzone */
    drop: {
        position: "relative",
        marginTop: 10,
        background: "#121212",
        border: "1px dashed #333",
        borderRadius: 12,
        minHeight: EDITOR_MIN_H,
        color: "#a9a9a9",
        outline: "none",
        maxWidth: "850px",     // 원하는 폭
        marginLeft: 0,         // 왼쪽 밀착
        marginRight: "auto",   // 오른쪽 자동 여백
    },
    dropCenter: {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        padding: "0 12px",
        userSelect: "none",
    },
    dropText: { marginTop: 6, fontSize: 13, color: "#a9a9a9" },

    previewBox: { position: "relative", width: "100%" },
    previewImg: {
        width: "100%",
        height: "auto",
        aspectRatio: "16 / 9",
        maxHeight: "min(44vh, 420px)",
        objectFit: "cover",
        borderRadius: 10,
        border: "1px solid #2e2e2e",
        background: "#0e0e0e",
        display: "block",
    },
    previewActions: { position: "absolute", right: 8, bottom: 8, display: "flex", gap: 6 },
    ghostBtn: {
        background: "rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,.2)",
        color: "#fff", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13, backdropFilter: "blur(4px)"
    },

    metaRow: { display: "flex", justifyContent: "flex-end", marginTop: 8 },
    counter: { color: "#9aa7ad", fontSize: 12 },

    footerRow: {
        marginTop: 8,
        borderTop: "1px solid #2e2e2e",
        paddingTop: 16,
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap"
    },
    reverse: { display: "flex", alignItems: "center", color: "#cfcfcf", fontSize: 14 },
    switch: { width: 42, height: 24, borderRadius: 999, background: "#2a2a2a", border: "1px solid #3a3a3a" },
    switchOn: { background: ACCENT, border: `1px solid ${ACCENT}` },

    primary: {
        display: "flex", alignItems: "center", gap: 8,
        background: ACCENT, color: "#fff",
        border: "none", borderRadius: 10,
        padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer"
    },
    secondary: {
        background: "#232323", color: "#f2f2f2",
        border: "1px solid #333", borderRadius: 10,
        padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer"
    },
    error: {
        marginTop: 10,
        background: "rgba(255,82,82,.12)",
        border: "1px solid rgba(255,82,82,.32)",
        color: "#ffb3b3",
        padding: "10px 12px",
        borderRadius: 10,
        fontSize: 14,
    },
};
