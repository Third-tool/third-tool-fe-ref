import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export default function JoinPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "",
        password: "",
        nickname: "",
        email: "",
    });
    const [error, setError] = useState("");
    const [exist, setExist] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    async function checkExist() {
        try {
            const res = await fetch(`${BASE_URL}/user/exist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: form.username }),
            });
            const data = await res.json();
            setExist(data);
            alert(data ? "이미 존재하는 아이디입니다." : "사용 가능한 아이디입니다.");
        } catch {
            setError("중복 검사 실패");
        }
    }

    async function handleJoin(e) {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch(`${BASE_URL}/user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("회원가입 실패");
            alert("회원가입 성공! 로그인 페이지로 이동합니다.");
            navigate("/login");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div style={styles.container}>
            <h2>회원가입</h2>
            <form onSubmit={handleJoin} style={styles.form}>
                <input
                    name="username"
                    placeholder="아이디"
                    value={form.username}
                    onChange={handleChange}
                />
                <button type="button" onClick={checkExist}>중복 확인</button>
                <input
                    name="password"
                    type="password"
                    placeholder="비밀번호"
                    value={form.password}
                    onChange={handleChange}
                />
                <input
                    name="nickname"
                    placeholder="닉네임"
                    value={form.nickname}
                    onChange={handleChange}
                />
                <input
                    name="email"
                    placeholder="이메일"
                    value={form.email}
                    onChange={handleChange}
                />
                <button type="submit">회원가입</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <p>
                이미 계정이 있나요? <Link to="/login">로그인</Link>
            </p>
        </div>
    );
}

const styles = {
    container: { display: "flex", flexDirection: "column", alignItems: "center", padding: 40 },
    form: { display: "flex", flexDirection: "column", gap: 8, width: 250 },
};