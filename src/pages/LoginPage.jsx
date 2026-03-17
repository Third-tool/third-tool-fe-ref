import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

function genState(len = 16) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let s = "";
    for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}

const NaverIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M5 5h6.6l3.4 5.1V5H19v14h-6.6L9 13.9V19H5V5z" fill="currentColor" />
    </svg>
);

const KakaoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 4c-4.97 0-9 3.13-9 7 0 2.53 1.72 4.75 4.3 5.98L6 21l3.02-2.02c.95.18 1.96.27 2.98.27 4.97 0 9-3.13 9-7s-4.03-7-9-7z" fill="currentColor" />
    </svg>
);

function FormField({ label, name, type = "text", value, onChange, autoComplete, placeholder, hint }) {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={name} className="text-xs font-medium text-[#a0a0a0] tracking-wide uppercase">
                {label}
            </label>
            <div className="relative">
                <input
                    id={name}
                    name={name}
                    type={isPassword ? (show ? "text" : "password") : type}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    className="w-full bg-[#111315] border border-[#2a2a2a] text-[#f3f3f3] placeholder-[#404040]
            px-4 py-3.5 rounded-xl text-sm outline-none
            focus:border-[#e53935] focus:ring-2 focus:ring-[#e53935]/15
            transition-all duration-150"
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#505050] hover:text-[#a0a0a0] transition-colors"
                        aria-label={show ? "비밀번호 숨기기" : "비밀번호 표시"}
                    >
                        {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                )}
            </div>
            {hint && <p className="text-xs text-[#505050]">{hint}</p>}
        </div>
    );
}

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [remember, setRemember] = useState(
        typeof localStorage !== "undefined" && !!localStorage.getItem("rememberUsername")
    );

    useEffect(() => {
        try {
            const saved = localStorage.getItem("rememberUsername");
            if (saved) setForm((f) => ({ ...f, username: saved }));
        } catch (_) {}
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (!BASE_URL) throw new Error("BASE_URL이 설정되지 않았습니다");
            const userField = import.meta.env.VITE_AUTH_USERNAME_FIELD || "username";
            const payload = { [userField]: form.username, password: form.password };

            const res = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const raw = await res.clone().text();
            if (!res.ok) {
                let detail;
                try { detail = JSON.parse(raw); } catch { detail = raw; }
                throw new Error((detail && detail.message) || detail || `HTTP ${res.status}`);
            }

            let data = null;
            try { data = JSON.parse(raw); } catch {}
            if (data?.accessToken) localStorage.setItem("accessToken", data.accessToken);
            if (data?.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

            try {
                if (remember) localStorage.setItem("rememberUsername", form.username);
                else localStorage.removeItem("rememberUsername");
            } catch (_) {}

            navigate("/home");
        } catch (err) {
            setError(err?.message ?? String(err));
        } finally {
            setLoading(false);
        }
    }

    const handleKakaoLogin = () => {
        const clientId = import.meta.env.VITE_KAKAO_REST_KEY;
        const redirectUri =
            import.meta.env.VITE_KAKAO_REDIRECT_URI || `${window.location.origin}/oauth/kakao/callback`;
        if (!clientId) { alert("Kakao REST_KEY 누락: VITE_KAKAO_REST_KEY"); return; }
        window.location.href =
            `https://kauth.kakao.com/oauth/authorize?response_type=code` +
            `&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    };

    const handleNaverLogin = () => {
        const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
        const redirectUri =
            import.meta.env.VITE_NAVER_REDIRECT_URI || `${window.location.origin}/oauth/naver/callback`;
        if (!clientId) { alert("Naver CLIENT_ID 누락: VITE_NAVER_CLIENT_ID"); return; }
        const state = genState();
        try { sessionStorage.setItem("naver_oauth_state", state); } catch {}
        window.location.href =
            `https://nid.naver.com/oauth2.0/authorize?response_type=code` +
            `&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&state=${encodeURIComponent(state)}`;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* background accent */}
            <div
                className="absolute pointer-events-none"
                style={{
                    width: 480,
                    height: 480,
                    borderRadius: "50%",
                    background: "radial-gradient(closest-side, rgba(229,57,53,.12), transparent 70%)",
                    filter: "blur(40px)",
                    top: -160,
                    right: -160,
                }}
            />
            <div
                className="absolute pointer-events-none"
                style={{
                    width: 320,
                    height: 320,
                    borderRadius: "50%",
                    background: "radial-gradient(closest-side, rgba(229,57,53,.06), transparent 70%)",
                    filter: "blur(40px)",
                    bottom: -80,
                    left: -80,
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[440px] relative"
            >
                {/* Logo / Brand */}
                <div className="mb-8 text-center">
          <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-[#e53935] mb-3">
            ThirdTool
          </span>
                    <h1 className="text-[28px] font-black text-white tracking-tight leading-none">
                        다시 시작하기
                    </h1>
                    <p className="mt-2 text-sm text-[#606060]">학습을 이어가려면 로그인하세요</p>
                </div>

                <div
                    className="rounded-2xl border border-[#1e1e1e] bg-[#111315]/90 backdrop-blur-md"
                    style={{ boxShadow: "0 24px 64px rgba(0,0,0,.6), 0 1px 0 rgba(255,255,255,.04) inset" }}
                >
                    <div className="p-8">
                        <form onSubmit={handleLogin} className="flex flex-col gap-4">
                            <FormField
                                label="이메일"
                                name="username"
                                type="email"
                                value={form.username}
                                onChange={handleChange}
                                autoComplete="username"
                                placeholder="your@email.com"
                            />
                            <FormField
                                label="비밀번호"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                placeholder="••••••••"
                            />

                            <div className="flex items-center justify-between mt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        className="w-3.5 h-3.5 accent-[#e53935] cursor-pointer"
                                    />
                                    <span className="text-xs text-[#707070]">아이디 저장</span>
                                </label>
                                <button type="button" className="text-xs text-[#707070] hover:text-[#a0a0a0] transition-colors">
                                    비밀번호 찾기
                                </button>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-start gap-2.5 bg-[#1e0d0d] border border-[#3d1515] rounded-xl px-3.5 py-3"
                                    >
                                        <AlertCircle size={14} className="text-[#e53935] mt-0.5 shrink-0" />
                                        <span className="text-xs text-[#ff8a8a] leading-relaxed">{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.015 }}
                                whileTap={{ scale: loading ? 1 : 0.975 }}
                                className="mt-1 w-full py-3.5 rounded-xl font-bold text-[15px] text-white
                  bg-[#e53935] hover:bg-[#ef5350]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-colors duration-150"
                                style={{ boxShadow: loading ? "none" : "0 8px 24px rgba(229,57,53,.3)" }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    로그인 중...
                  </span>
                                ) : "로그인"}
                            </motion.button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-[#1e1e1e]" />
                            <span className="text-[11px] text-[#404040] tracking-widest uppercase">또는</span>
                            <div className="flex-1 h-px bg-[#1e1e1e]" />
                        </div>

                        {/* Social Buttons */}
                        <div className="flex flex-col gap-2.5">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.985 }}
                                onClick={handleNaverLogin}
                                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl
                  bg-transparent border border-[#252525] text-[#d0d0d0]
                  hover:border-[#353535] hover:bg-[#151515]
                  transition-all duration-150 font-semibold text-[14px]"
                            >
                <span className="w-7 h-7 rounded-lg bg-[#03C75A] flex items-center justify-center shrink-0">
                  <NaverIcon />
                </span>
                                <span className="flex-1 text-left">네이버로 로그인</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.985 }}
                                onClick={handleKakaoLogin}
                                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl
                  bg-transparent border border-[#252525] text-[#d0d0d0]
                  hover:border-[#353535] hover:bg-[#151515]
                  transition-all duration-150 font-semibold text-[14px]"
                            >
                <span className="w-7 h-7 rounded-lg bg-[#FEE500] flex items-center justify-center shrink-0">
                  <span className="text-[#3A1D1D]"><KakaoIcon /></span>
                </span>
                                <span className="flex-1 text-left">카카오로 로그인</span>
                            </motion.button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-[#1a1a1a] px-8 py-4 text-center">
            <span className="text-xs text-[#505050]">
              계정이 없나요?{" "}
                <Link to="/join" className="text-[#e53935] hover:text-[#ef5350] font-bold transition-colors">
                무료로 시작하기
              </Link>
            </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
