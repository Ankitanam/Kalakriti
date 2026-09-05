// src/OnboardingScreen.tsx
import { useState } from "react";

type Stage = "landing" | "otp";

export default function OnboardingScreen({ onLogin }: { onLogin?: () => void }) {
    const [stage, setStage] = useState<Stage>("landing");
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [focusedOtp, setFocusedOtp] = useState<number | null>(null);

    const handleOtpChange = (i: number, val: string) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...otp];
        next[i] = val;
        setOtp(next);
        if (val && i < 5) {
            document.getElementById(`otp-${i + 1}`)?.focus();
        }
    };

    const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[i] && i > 0) {
            document.getElementById(`otp-${i - 1}`)?.focus();
        }
    };

    return (
        <div
            className="size-full flex items-center justify-center"
            style={{ background: "#EDE0D4", fontFamily: "'Poppins', sans-serif" }}
        >
            {/* Phone shell */}
            <div
                className="relative flex flex-col overflow-hidden"
                style={{
                    width: "min(390px, 100vw)",
                    height: "min(844px, 100vh)",
                    background: "#FDF8F5",
                    borderRadius: "clamp(0px, 2vw, 28px)",
                    boxShadow: "0 32px 80px rgba(61,31,15,0.22), 0 4px 20px rgba(0,0,0,0.1)",
                }}
            >
                {/* Status bar */}
                <div
                    className="flex items-center justify-between px-6 pt-3 pb-1 flex-shrink-0 relative z-20"
                    style={{ background: "transparent" }}
                >
                    <span className="text-xs font-semibold text-[#6B3A2A]" style={{ letterSpacing: "0.04em" }}>9:41</span>
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-end gap-px">
                            {[4, 6, 9, 12].map((h, i) => (
                                <div key={i} className="w-1 rounded-sm" style={{ height: h, background: `rgba(107,58,42,${0.25 + i * 0.22})` }} />
                            ))}
                        </div>
                        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
                            <path d="M7.5 8.5a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" fill="#6B3A2A" />
                            <path d="M3.2 5.8A6 6 0 0111.8 5.8" stroke="#6B3A2A" strokeWidth="1.4" strokeLinecap="round" fill="none" strokeOpacity="0.7" />
                            <path d="M0.8 3.2A9.6 9.6 0 0114.2 3.2" stroke="#6B3A2A" strokeWidth="1.4" strokeLinecap="round" fill="none" strokeOpacity="0.35" />
                        </svg>
                        <div className="flex items-center gap-0.5">
                            <div className="relative rounded" style={{ width: 22, height: 11, border: "1.5px solid rgba(107,58,42,0.4)" }}>
                                <div className="absolute inset-0.5 rounded-sm" style={{ background: "#6B3A2A", width: "72%" }} />
                            </div>
                            <div className="rounded-r-sm" style={{ width: 3, height: 5, background: "rgba(107,58,42,0.35)" }} />
                        </div>
                    </div>
                </div>

                {/* ─────────────── LANDING STAGE ─────────────── */}
                {stage === "landing" && (
                    <div className="flex-1 flex flex-col overflow-y-auto" style={{ scrollbarWidth: "none" }}>

                        {/* ── True-To-Life Hero Banner ── */}
                        <div className="relative flex-shrink-0 overflow-hidden" style={{ height: 285 }}>
                            {/* High-Resolution Authentic Indian Artisan Photo */}
                            <img
                                src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80"
                                alt="Master Indian Artisan working on pottery wheel"
                                className="w-full h-full object-cover"
                            />
                            
                            {/* Warm Golden Hour & Earthen Gradient Overlay */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: "linear-gradient(180deg, rgba(61,31,15,0.45) 0%, rgba(61,31,15,0.15) 40%, #FDF8F5 100%)",
                                }}
                            />

                            {/* ── Authentic Handcrafted Logo Mark ── */}
                            <div className="absolute top-4 left-5 flex items-center gap-2.5 z-10">
                                <div
                                    className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                                    style={{
                                        background: "linear-gradient(135deg, #8B4513 0%, #522718 100%)",
                                        border: "1.5px solid rgba(255,255,255,0.3)",
                                    }}
                                >
                                    {/* Traditional Indian Craft / Kalash Emblem */}
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M12 2.5C12 2.5 10.5 4.5 9 6H15C13.5 4.5 12 2.5 12 2.5Z"
                                            fill="#F59E0B"
                                        />
                                        <path
                                            d="M7 8H17M6 11C6 15 8.5 19.5 12 19.5C15.5 19.5 18 15 18 11C18 9 17 8 17 8H7C7 8 6 9 6 11Z"
                                            stroke="white"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M9 13.5C9 15 10.3 16.5 12 16.5C13.7 16.5 15 15 15 13.5"
                                            stroke="#F59E0B"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <span
                                        className="text-lg font-bold text-white tracking-wide block leading-none drop-shadow-md"
                                        style={{ fontFamily: "'Noto Serif', serif" }}
                                    >
                                        Kalakriti
                                    </span>
                                    <span className="text-[10px] text-amber-200/90 font-medium tracking-wider uppercase block mt-0.5">
                                        कारीगर साथी
                                    </span>
                                </div>
                            </div>

                            {/* ONDC Badge top-right */}
                            <div
                                className="absolute top-4 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md z-10"
                                style={{
                                    background: "rgba(255,255,255,0.92)",
                                    color: "#6B3A2A",
                                    backdropFilter: "blur(8px)",
                                    border: "1px solid rgba(196,136,107,0.35)",
                                }}
                            >
                                <span className="text-purple-600">✨</span>
                                <span className="text-purple-800">ONDC Ready</span>
                            </div>

                            {/* Cultural Tagline Pill on bottom-left of photo */}
                            <div className="absolute bottom-3 left-5 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                <span className="text-amber-400 text-xs">✦</span>
                                <span className="text-white/95 text-[11px] font-medium tracking-wide">
                                    100% प्रामाणिक भारतीय हस्तशिल्प
                                </span>
                            </div>
                        </div>

                        {/* ── Content Card ── */}
                        <div className="flex-1 flex flex-col px-6 pt-3 pb-4">
                            {/* Welcome Heading */}
                            <div className="mb-5">
                                <h1
                                    className="text-2xl font-bold leading-tight mb-1.5"
                                    style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}
                                >
                                    कलाकृति में<br />आपका स्वागत है
                                </h1>
                                <p className="text-xs leading-relaxed" style={{ color: "#8B4513" }}>
                                    अपनी कला को सीधे देश भर के बाज़ार और ONDC नेटवर्क से जोड़ें
                                </p>
                            </div>

                            {/* Mobile input */}
                            <div className="mb-4">
                                <label
                                    className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider"
                                    style={{ color: "#6B3A2A" }}
                                >
                                    मोबाइल नंबर
                                </label>
                                <div
                                    className="flex items-center rounded-2xl overflow-hidden transition-all duration-200"
                                    style={{
                                        border: mobile ? "2px solid #6B3A2A" : "1.5px solid rgba(196,136,107,0.45)",
                                        background: "#FFFBF7",
                                        boxShadow: mobile ? "0 0 0 4px rgba(107,58,42,0.08)" : "none",
                                    }}
                                >
                                    {/* Indian flag + prefix */}
                                    <div
                                        className="flex items-center gap-2 px-3.5 py-3.5 flex-shrink-0"
                                        style={{ borderRight: "1.5px solid rgba(196,136,107,0.25)" }}
                                    >
                                        <div className="flex flex-col overflow-hidden rounded-xs flex-shrink-0 shadow-xs" style={{ width: 22, height: 15 }}>
                                            <div style={{ flex: 1, background: "#FF9933" }} />
                                            <div style={{ flex: 1, background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <div style={{ width: 5, height: 5, borderRadius: "50%", border: "1px solid #000080" }} />
                                            </div>
                                            <div style={{ flex: 1, background: "#138808" }} />
                                        </div>
                                        <span className="text-sm font-bold text-[#3D1F0F]">+91</span>
                                    </div>

                                    <input
                                        type="tel"
                                        maxLength={10}
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                                        placeholder="10 अंकों का नंबर दर्ज करें"
                                        className="flex-1 px-4 py-3.5 text-base outline-none bg-transparent"
                                        style={{
                                            color: "#3D1F0F",
                                            fontFamily: "'Poppins', sans-serif",
                                        }}
                                    />

                                    {/* Clear button */}
                                    {mobile.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setMobile("")}
                                            className="px-3.5 py-3.5 text-[#C4886B] active:scale-90 transition"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {mobile.length === 10 && (
                                    <p className="text-xs mt-1.5 ml-1 flex items-center gap-1 font-semibold text-emerald-700">
                                        ✓ नंबर सही है
                                    </p>
                                )}
                            </div>

                            {/* OTP Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (mobile.length === 10) {
                                        const testOtp = Math.floor(100000 + Math.random() * 900000);
                                        alert(`डेमो OTP: ${testOtp}`);
                                        setStage("otp");
                                    }
                                }}
                                disabled={mobile.length !== 10}
                                className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 font-bold text-base transition-all active:scale-[0.98] mb-4 disabled:opacity-50"
                                style={{
                                    background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                                    color: "white",
                                    boxShadow: mobile.length === 10 ? "0 10px 28px rgba(107,58,42,0.38)" : "none",
                                    cursor: mobile.length === 10 ? "pointer" : "not-allowed",
                                }}
                            >
                                <span style={{ fontFamily: "'Noto Serif', serif" }}>OTP प्राप्त करें</span>
                                <span>➔</span>
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-1 h-px bg-stone-200" />
                                <span className="text-[11px] font-semibold text-[#9C6644] px-2 py-0.5 rounded-full bg-stone-100">
                                    या
                                </span>
                                <div className="flex-1 h-px bg-stone-200" />
                            </div>

                            {/* Google Sign-In */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (onLogin) onLogin();
                                }}
                                className="w-full flex items-center justify-center gap-3 rounded-2xl py-3.5 font-semibold text-sm transition-all active:scale-[0.98] mb-4 bg-white border border-[#E0C0A8] shadow-xs hover:shadow-md"
                                style={{ color: "#3D1F0F" }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Google से साइन इन करें</span>
                            </button>

                            {/* Trust Badge */}
                            <div
                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl mt-auto"
                                style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)" }}
                            >
                                <span className="text-emerald-700 text-xs">🛡️</span>
                                <span className="text-[11px] font-semibold text-emerald-800">
                                    ONDC नेटवर्क द्वारा प्रमाणित · 100% सुरक्षित
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─────────────── OTP STAGE ─────────────── */}
                {stage === "otp" && (
                    <div className="flex-1 flex flex-col px-6 pt-8" style={{ overflow: "hidden" }}>
                        {/* Back */}
                        <button
                            type="button"
                            onClick={() => setStage("landing")}
                            className="flex items-center gap-2 mb-6 self-start text-[#6B3A2A] active:scale-95 transition"
                        >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-stone-100">
                                ❮
                            </div>
                            <span className="text-xs font-semibold" style={{ fontFamily: "'Noto Serif', serif" }}>
                                वापस जाएं
                            </span>
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-3xl bg-amber-100/70 border border-amber-300 flex items-center justify-center text-2xl mx-auto mb-3 shadow-xs">
                                📱
                            </div>
                            <h2 className="text-xl font-bold text-[#3D1F0F]" style={{ fontFamily: "'Noto Serif', serif" }}>
                                OTP दर्ज करें
                            </h2>
                            <p className="text-xs text-[#8B4513] mt-1">
                                +91 {mobile.slice(0, 5)}••••• पर भेजा गया 6-अंकों का कोड
                            </p>
                        </div>

                        {/* OTP Boxes */}
                        <div className="flex gap-2 justify-center mb-4">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    id={`otp-${i}`}
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKey(i, e)}
                                    onFocus={() => setFocusedOtp(i)}
                                    onBlur={() => setFocusedOtp(null)}
                                    className="w-12 h-14 text-center text-xl font-bold rounded-2xl outline-none transition-all"
                                    style={{
                                        background: digit ? "#FFF0E6" : "#FFFBF7",
                                        border: focusedOtp === i
                                            ? "2.5px solid #6B3A2A"
                                            : digit
                                                ? "2px solid rgba(107,58,42,0.5)"
                                                : "1.5px solid rgba(196,136,107,0.4)",
                                        color: "#3D1F0F",
                                    }}
                                />
                            ))}
                        </div>

                        {/* Verify Button */}
                        <button
                            type="button"
                            onClick={() => {
                                if (otp.every((d) => d)) {
                                    if (onLogin) onLogin();
                                }
                            }}
                            disabled={!otp.every((d) => d)}
                            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold text-base text-white shadow-lg transition-all active:scale-[0.98] mt-3 disabled:opacity-50"
                            style={{
                                background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                            }}
                        >
                            <span>✓ OTP सत्यापित करें</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}