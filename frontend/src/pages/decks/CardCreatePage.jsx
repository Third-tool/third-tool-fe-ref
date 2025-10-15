// CardCreatePage.jsx
import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { fetchWithAccess } from "../../utils/authFetch.js";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function CardCreatePage() {
    const { deckId } = useParams();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get("mode") || "THREE_DAY";
    const navigate = useNavigate();

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [questionImage, setQuestionImage] = useState(null);
    const [answerImage, setAnswerImage] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("question", question);
        formData.append("answer", answer);
        if (questionImage) formData.append("questionImage", questionImage);
        if (answerImage) formData.append("answerImage", answerImage);

        await fetchWithAccess(`${BASE_URL}/api/cards/decks/${deckId}`, {
            method: "POST",
            body: formData,
        });

        alert("카드가 추가되었습니다 ✅");
        navigate(`/decks/${deckId}?mode=${mode}`);
    }

    return (
        <div style={s.container}>
            <header style={s.header}>
                <button onClick={() => navigate(-1)} style={s.backBtn}>
                    ←
                </button>
                <h2>카드 추가</h2>
            </header>

            <form onSubmit={handleSubmit} style={s.form}>
                <div style={s.field}>
                    <label>💡 Question</label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="카드에 대한 질문을 입력하세요"
                        style={s.textarea}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setQuestionImage(e.target.files[0])}
                        style={s.fileInput}
                    />
                </div>

                <div style={s.field}>
                    <label>☁️ Answer</label>
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="카드에 대한 답변을 입력하세요"
                        style={s.textarea}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAnswerImage(e.target.files[0])}
                        style={s.fileInput}
                    />
                </div>

                <button type="submit" style={s.submitBtn}>
                    Submit
                </button>
            </form>
        </div>
    );
}

const s = {
    container: { backgroundColor: "#0f0f0f", color: "white", minHeight: "100vh", padding: "20px 30px" },
    header: { display: "flex", alignItems: "center", gap: 10, marginBottom: 20 },
    backBtn: { background: "none", border: "none", color: "white", fontSize: "1.3rem", cursor: "pointer" },
    form: { display: "flex", flexDirection: "column", gap: 20 },
    field: { backgroundColor: "#1f1f1f", padding: 15, borderRadius: 10 },
    textarea: { width: "100%", height: 100, background: "#2a2a2a", color: "white", border: "none", borderRadius: 6, padding: 10 },
    fileInput: { marginTop: 10 },
    submitBtn: { backgroundColor: "#d32f2f", border: "none", color: "white", padding: "12px", borderRadius: 8, cursor: "pointer" },
};