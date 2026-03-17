import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle, CheckCircle2, XCircle, Check } from "lucide-react";

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

function FormField({ label, name, type = "text", value, onChange, autoComplete, placeholder, hint, badge, onBadgeClick }) {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <label htmlFor={name} className="text-xs font-medium text-[#a0a0a0] tracking-wide uppercase">
                    {label}
                </label>
                {badge}
            </div>
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

function PasswordStrength({ password }) {
    const checks = [
        { label: "8자 이상", pass: password.length >= 8 },
        { label: "영문 포함", pass: /[a-zA-Z]/.test(password) },
        { label: "숫자 포함", pass: /[0-9]/.test(password) },
    ];

    if (!password) return null;

    return (
        <div className="flex items-center gap-3 mt-0.5">
            {checks.map((c) => (
                <span
                    key={c.label}
                    className={`flex items-center gap-1 text-[11px] transition-colors ${
                        c.pass ? "text-emerald-400" : "text-[#505050]"
                    }`}
                >
          <span
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  c.pass ? "bg-emerald-400" : "bg-[#3a3a3a]"
              }`}
          />
                    {c.label}
        </span>
            ))}
        </div>
    );
}

export default function JoinPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        nickname: "",
        email: "",
    });
    const [agree, setAgree] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [exist, setExist] = useState(null);
    const [checkingExist, setCheckingExist] = useState(false);

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        if (e.target.name === "username") setExist(null);
    };

    function validate() {
        const uname = form.username.trim();
        if (!uname) return "이메일을 입력해 주세요.";
        if (!/\S+@\S+\.\S+/.test(uname)) return "이메일 형식으로 입력해 주세요.";
        if (form.nickname.trim().length < 2) return "닉네임은 2자 이상 입력해 주세요.";
        if (form.password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
        if (form.password !== form.confirmPassword) return "비밀번호가 일치하지 않습니다.";
        if (form.email && !/\S+@\S+\.\S+/.test(form.email.trim())) return "이메일 형식을 확인해 주세요.";
        if (!agree) return "이용 약관 및 개인정보 처리에 동의해 주세요.";
        if (!BASE_URL) return "BASE_URL이 설정되지 않았습니다.";
        if (exist === true) return "이미 사용 중인 이메일입니다.";
        return null;
    }

    async function checkExist() {
        setError("");
        setCheckingExist(true);
        try {
            if (!BASE_URL) throw new Error("BASE_URL 누락");
            const userField = import.meta.env.VITE_AUTH_USERNAME_FIELD || "username";
            const res = await fetch(`${BASE_URL}/user/exist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [userField]: form.username.trim() }),
            });
            const raw = await res.clone().text();
            if (!res.ok) {
                let d; try { d = JSON.parse(raw); } catch { d = raw; }
                throw new Error((d && d.message) || d || `HTTP ${res.status}`);
            }
            let data; try { data = JSON.parse(raw); } catch { data = raw; }
            setExist(data === true);
        } catch (err) {
            setError("중복 검사 실패: " + (err?.message ?? err));
        } finally {
            setCheckingExist(false);
        }
    }

    async function handleJoin(e) {
        e.preventDefault();
        setError("");
        const v = validate();
        if (v) { setError(v); return; }

        try {
            setLoading(true);
            const userField = import.meta.env.VITE_AUTH_USERNAME_FIELD || "username";
            const payload = {
                [userField]: form.username.trim(),
                password: form.password,
                nickname: form.nickname.trim(),
                email: form.email.trim() || undefined,
            };
            const res = await fetch(`${BASE_URL}/user`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const raw = await res.clone().text();
            if (!res.ok) {
                let d; try { d = JSON.parse(raw); } catch { d = raw; }
                throw new Error((d && d.message) || d || `HTTP ${res.status}`);
            }
            try {
                const data = JSON.parse(raw);
                if (data?.accessToken) localStorage.setItem("accessToken", data.accessToken);
                if (data?.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
            } catch (_) {}
            navigate("/home");
        } catch (err) {
            setError(err?.message ?? String(err));
        } finally {
            setLoading(false);
        }
    }

    const handleKakaoStart = () => {
        const clientId = import.meta.env.VITE_KAKAO_REST_KEY;
        const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI || `${window.location.origin}/oauth/kakao/callback`;
        if (!clientId) { setError("Kakao REST_KEY 누락: VITE_KAKAO_REST_KEY"); return; }
        window.location.href =
            `https://kauth.kakao.com/oauth/authorize?response_type=code` +
            `&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    };

    const handleNaverStart = () => {
        const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_NAVER_REDIRECT_URI || `${window.location.origin}/oauth/naver/callback`;
        if (!clientId) { setError("Naver CLIENT_ID 누락: VITE_NAVER_CLIENT_ID"); return; }
        const state = genState();
        try { sessionStorage.setItem("naver_oauth_state", state); } catch {}
        window.location.href =
            `https://nid.naver.com/oauth2.0/authorize?response_type=code` +
            `&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&state=${encodeURIComponent(state)}`;
    };

    const passwordsMatch = form.confirmPassword && form.password === form.confirmPassword;
    const passwordsMismatch = form.confirmPassword && form.password !== form.confirmPassword;

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* background accents */}
            <div
                className="absolute pointer-events-none"
                style={{
                    width: 520,
                    height: 520,
                    borderRadius: "50%",
                    background: "radial-gradient(closest-side, rgba(229,57,53,.1), transparent 70%)",
                    filter: "blur(40px)",
                    top: -200,
                    right: -140,
                }}
            />
            <div
                className="absolute pointer-events-none"
                style={{
                    width: 280,
                    height: 280,
                    borderRadius: "50%",
                    background: "radial-gradient(closest-side, rgba(229,57,53,.05), transparent 70%)",
                    filter: "blur(40px)",
                    bottom: -80,
                    left: -60,
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[440px] relative"
            >
                {/* Brand */}
                <div className="mb-8 text-center">
          <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-[#e53935] mb-3">
            ThirdTool
          </span>
                    <h1 className="text-[28px] font-black text-white tracking-tight leading-none">
                        학습을 시작하세요
                    </h1>
                    <p className="mt-2 text-sm text-[#606060]">무료 계정을 만들고 카드 학습을 시작하세요</p>
                </div>

                {/* Social first — quick start */}
                <div
                    className="rounded-2xl border border-[#1e1e1e] bg-[#111315]/90 backdrop-blur-md mb-3"
                    style={{ boxShadow: "0 8px 32px rgba(0,0,0,.4), 0 1px 0 rgba(255,255,255,.03) inset" }}
                >
                    <div className="px-6 py-5">
                        <p className="text-[11px] text-[#404040] text-center tracking-widest uppercase mb-4">소셜 계정으로 빠르게 시작</p>
                        <div className="flex flex-col gap-2.5">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.985 }}
                                onClick={handleNaverStart}
                                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl
                  bg-transparent border border-[#252525] text-[#d0d0d0]
                  hover:border-[#353535] hover:bg-[#151515]
                  transition-all duration-150 font-semibold text-[14px]"
                            >
                <span className="w-7 h-7 rounded-lg bg-[#03C75A] flex items-center justify-center shrink-0">
                  <NaverIcon />
                </span>
                                <span className="flex-1 text-left">네이버로 시작하기</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.985 }}
                                onClick={handleKakaoStart}
                                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl
                  bg-transparent border border-[#252525] text-[#d0d0d0]
                  hover:border-[#353535] hover:bg-[#151515]
                  transition-all duration-150 font-semibold text-[14px]"
                            >
                <span className="w-7 h-7 rounded-lg bg-[#FEE500] flex items-center justify-center shrink-0">
                  <span className="text-[#3A1D1D]"><KakaoIcon /></span>
                </span>
                                <span className="flex-1 text-left">카카오로 시작하기</span>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Email signup card */}
                <div
                    className="rounded-2xl border border-[#1e1e1e] bg-[#111315]/90 backdrop-blur-md"
                    style={{ boxShadow: "0 24px 64px rgba(0,0,0,.6), 0 1px 0 rgba(255,255,255,.04) inset" }}
                >
                    <div className="px-8 pt-7 pb-2">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="flex-1 h-px bg-[#1e1e1e]" />
                            <span className="text-[11px] text-[#404040] tracking-widest uppercase">이메일로 가입</span>
                            <div className="flex-1 h-px bg-[#1e1e1e]" />
                        </div>
                    </div>

                    <form onSubmit={handleJoin} className="px-8 pb-6 flex flex-col gap-4">
                        {/* Email + duplicate check */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="username" className="text-xs font-medium text-[#a0a0a0] tracking-wide uppercase">
                                    이메일 <span className="text-[#e53935] normal-case tracking-normal font-normal">*</span>
                                </label>
                                {exist !== null && (
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={String(exist)}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`flex items-center gap-1 text-[11px] font-medium ${
                                                exist ? "text-[#ff6b6b]" : "text-emerald-400"
                                            }`}
                                        >
                                            {exist
                                                ? <><XCircle size={11} /> 이미 사용 중</>
                                                : <><CheckCircle2 size={11} /> 사용 가능</>
                                            }
                                        </motion.span>
                                    </AnimatePresence>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    id="username"
                                    name="username"
                                    type="email"
                                    value={form.username}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    placeholder="your@email.com"
                                    className="flex-1 bg-[#111315] border border-[#2a2a2a] text-[#f3f3f3] placeholder-[#404040]
                    px-4 py-3.5 rounded-xl text-sm outline-none
                    focus:border-[#e53935] focus:ring-2 focus:ring-[#e53935]/15
                    transition-all duration-150"
                                />
                                <button
                                    type="button"
                                    onClick={checkExist}
                                    disabled={checkingExist || !form.username}
                                    className="px-3.5 rounded-xl border border-[#2a2a2a] bg-[#181818]
                    text-[#a0a0a0] hover:text-[#e0e0e0] hover:border-[#404040]
                    text-[12px] font-semibold whitespace-nowrap
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-150"
                                >
                                    {checkingExist ? "..." : "중복 확인"}
                                </button>
                            </div>
                        </div>

                        <FormField
                            label="닉네임"
                            name="nickname"
                            value={form.nickname}
                            onChange={handleChange}
                            autoComplete="nickname"
                            placeholder="홍길동"
                            hint="2자 이상 입력해 주세요"
                        />

                        <FormField
                            label="연락용 이메일 (선택)"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            placeholder="contact@email.com"
                        />

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="password" className="text-xs font-medium text-[#a0a0a0] tracking-wide uppercase">
                                비밀번호
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    placeholder="8자 이상"
                                    className="w-full bg-[#111315] border border-[#2a2a2a] text-[#f3f3f3] placeholder-[#404040]
                    px-4 py-3.5 rounded-xl text-sm outline-none
                    focus:border-[#e53935] focus:ring-2 focus:ring-[#e53935]/15
                    transition-all duration-150"
                                />
                            </div>
                            <PasswordStrength password={form.password} />
                        </div>

                        {/* Confirm password */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="confirmPassword" className="text-xs font-medium text-[#a0a0a0] tracking-wide uppercase">
                                비밀번호 확인
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className={`w-full bg-[#111315] border text-[#f3f3f3] placeholder-[#404040]
                    px-4 py-3.5 rounded-xl text-sm outline-none
                    focus:ring-2 transition-all duration-150
                    ${passwordsMismatch
                                        ? "border-[#e53935]/60 focus:border-[#e53935] focus:ring-[#e53935]/15"
                                        : passwordsMatch
                                            ? "border-emerald-600/50 focus:border-emerald-500 focus:ring-emerald-500/15"
                                            : "border-[#2a2a2a] focus:border-[#e53935] focus:ring-[#e53935]/15"
                                    }`}
                                />
                                {passwordsMatch && (
                                    <CheckCircle2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                                )}
                            </div>
                            {passwordsMismatch && (
                                <p className="text-[11px] text-[#ff6b6b]">비밀번호가 일치하지 않습니다</p>
                            )}
                        </div>

                        {/* Agree */}
                        <label className="flex items-start gap-2.5 cursor-pointer select-none mt-1">
                            <div
                                onClick={() => setAgree((a) => !a)}
                                className={`mt-0.5 w-4 h-4 rounded shrink-0 border flex items-center justify-center transition-all duration-150 cursor-pointer
                  ${agree
                                    ? "bg-[#e53935] border-[#e53935]"
                                    : "bg-transparent border-[#3a3a3a] hover:border-[#606060]"
                                }`}
                            >
                                {agree && <Check size={10} strokeWidth={3} className="text-white" />}
                            </div>
                            <span className="text-xs text-[#707070] leading-relaxed">
                <span className="text-[#a0a0a0]">이용 약관</span> 및{" "}
                                <span className="text-[#a0a0a0]">개인정보 처리방침</span>에 동의합니다
              </span>
                        </label>

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
                  처리 중...
                </span>
                            ) : "회원가입"}
                        </motion.button>
                    </form>

                    <div className="border-t border-[#1a1a1a] px-8 py-4 text-center">
            <span className="text-xs text-[#505050]">
              이미 계정이 있나요?{" "}
                <Link to="/login" className="text-[#e53935] hover:text-[#ef5350] font-bold transition-colors">
                로그인
              </Link>
            </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
