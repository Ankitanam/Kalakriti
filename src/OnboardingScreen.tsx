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
                    className="flex items-center justify-between px-6 pt-3 pb-1 flex-shrink-0"
                    style={{ background: "#FDF8F5" }}
                >
                    <span className="text-xs font-semibold" style={{ color: "#6B3A2A", letterSpacing: "0.04em" }}>9:41</span>
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

                        {/* Illustration area */}
                        <div className="relative flex-shrink-0" style={{ height: 280 }}>
                            {/* Warm gradient sky */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: "linear-gradient(175deg, #F5E6D3 0%, #EDD5BC 55%, #E8CAA8 100%)",
                                }}
                            />

                            {/* Decorative arch behind artisan */}
                            <div
                                className="absolute"
                                style={{
                                    width: 200,
                                    height: 200,
                                    borderRadius: "50%",
                                    background: "rgba(196,136,107,0.18)",
                                    top: 40,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                }}
                            />
                            <div
                                className="absolute"
                                style={{
                                    width: 160,
                                    height: 160,
                                    borderRadius: "50%",
                                    background: "rgba(196,136,107,0.14)",
                                    top: 60,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                }}
                            />

                            {/* Artisan illustration — SVG scene */}
                            <svg
                                className="absolute"
                                style={{ bottom: 0, left: "50%", transform: "translateX(-50%)" }}
                                width="260"
                                height="220"
                                viewBox="0 0 260 220"
                                fill="none"
                            >
                                {/* Ground / mat */}
                                <ellipse cx="130" cy="210" rx="110" ry="14" fill="rgba(107,58,42,0.12)" />
                                <rect x="50" y="190" width="160" height="20" rx="4" fill="#C4886B" fillOpacity="0.25" />
                                {/* Stripes on mat */}
                                {[65, 85, 105, 125, 145, 165, 185].map((x) => (
                                    <rect key={x} x={x} y="190" width="5" height="20" rx="2" fill="#9C6644" fillOpacity="0.2" />
                                ))}

                                {/* Pottery wheel base */}
                                <ellipse cx="130" cy="190" rx="38" ry="9" fill="#8B4513" fillOpacity="0.45" />
                                <ellipse cx="130" cy="185" rx="34" ry="7" fill="#9C6644" fillOpacity="0.55" />

                                {/* Clay pot being shaped */}
                                <ellipse cx="130" cy="160" rx="20" ry="8" fill="#C4886B" fillOpacity="0.6" />
                                <path d="M110 160 Q108 140 116 128 Q122 118 130 116 Q138 118 144 128 Q152 140 150 160 Z" fill="#C4886B" />
                                <ellipse cx="130" cy="116" rx="14" ry="5" fill="#B07050" />
                                {/* Highlight on pot */}
                                <ellipse cx="124" cy="138" rx="4" ry="10" fill="rgba(255,255,255,0.25)" transform="rotate(-10 124 138)" />

                                {/* Artisan body */}
                                {/* Legs (sitting cross-legged) */}
                                <path d="M98 192 Q92 185 100 178 Q108 172 115 178 L122 190 Z" fill="#9C6644" />
                                <path d="M162 192 Q168 185 160 178 Q152 172 145 178 L138 190 Z" fill="#9C6644" />
                                {/* Torso */}
                                <rect x="108" y="148" width="44" height="38" rx="12" fill="#8B4513" />
                                {/* Dupatta / shawl accent */}
                                <path d="M108 155 Q100 160 96 172 Q108 165 112 158 Z" fill="#C4886B" fillOpacity="0.8" />
                                <path d="M152 155 Q160 160 164 172 Q152 165 148 158 Z" fill="#C4886B" fillOpacity="0.8" />

                                {/* Arms reaching toward pot */}
                                {/* Left arm */}
                                <path d="M112 158 Q104 162 108 172 Q116 178 122 170 L118 162 Z" fill="#B07050" />
                                {/* Right arm */}
                                <path d="M148 158 Q156 162 152 172 Q144 178 138 170 L142 162 Z" fill="#B07050" />
                                {/* Hands on pot */}
                                <ellipse cx="113" cy="168" rx="7" ry="5" fill="#C4886B" transform="rotate(-20 113 168)" />
                                <ellipse cx="147" cy="168" rx="7" ry="5" fill="#C4886B" transform="rotate(20 147 168)" />

                                {/* Neck */}
                                <rect x="125" y="140" width="10" height="12" rx="5" fill="#C4886B" />
                                {/* Head */}
                                <ellipse cx="130" cy="132" rx="19" ry="20" fill="#C4886B" />
                                {/* Hair (bun) */}
                                <ellipse cx="130" cy="113" rx="14" ry="8" fill="#3D1F0F" />
                                <ellipse cx="130" cy="110" rx="8" ry="6" fill="#5A2E12" />
                                <circle cx="130" cy="108" r="4" fill="#9C6644" fillOpacity="0.5" />
                                {/* Bindi */}
                                <circle cx="130" cy="126" r="2" fill="#C0392B" fillOpacity="0.9" />
                                {/* Eyes */}
                                <ellipse cx="124" cy="130" rx="2.5" ry="2.8" fill="#3D1F0F" />
                                <ellipse cx="136" cy="130" rx="2.5" ry="2.8" fill="#3D1F0F" />
                                <circle cx="125" cy="129" r="1" fill="white" />
                                <circle cx="137" cy="129" r="1" fill="white" />
                                {/* Earring */}
                                <circle cx="111" cy="133" r="2" fill="#D97706" />
                                <circle cx="149" cy="133" r="2" fill="#D97706" />
                                {/* Smile */}
                                <path d="M126 136 Q130 139 134 136" stroke="#5A2E12" strokeWidth="1.5" strokeLinecap="round" fill="none" />

                                {/* Decorative pots in background */}
                                <ellipse cx="72" cy="188" rx="12" ry="5" fill="#9C6644" fillOpacity="0.4" />
                                <path d="M60 188 Q58 174 64 167 Q68 162 72 161 Q76 162 80 167 Q86 174 84 188 Z" fill="#B07050" fillOpacity="0.55" />
                                <ellipse cx="188" cy="185" rx="9" ry="4" fill="#9C6644" fillOpacity="0.35" />
                                <path d="M179 185 Q177 174 182 168 Q185 164 188 163 Q191 164 194 168 Q199 174 197 185 Z" fill="#B07050" fillOpacity="0.45" />

                                {/* Floating sparkles */}
                                {[[50, 80], [200, 60], [220, 100], [40, 130]].map(([x, y], i) => (
                                    <g key={i} opacity="0.6">
                                        <circle cx={x} cy={y} r="2.5" fill="#D97706" />
                                        <line x1={x - 5} y1={y} x2={x + 5} y2={y} stroke="#D97706" strokeWidth="1" />
                                        <line x1={x} y1={y - 5} x2={x} y2={y + 5} stroke="#D97706" strokeWidth="1" />
                                    </g>
                                ))}
                            </svg>

                            {/* ONDC badge floating top-right */}
                            <div
                                className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                                style={{ background: "rgba(255,255,255,0.88)", color: "#7C3AED", backdropFilter: "blur(6px)", border: "1px solid rgba(124,58,237,0.2)" }}
                            >
                                ✨ ONDC Ready
                            </div>

                            {/* App logo top-left */}
                            <div className="absolute top-5 left-5 flex items-center gap-2">
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: "#6B3A2A", boxShadow: "0 4px 12px rgba(107,58,42,0.35)" }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 3C10 5 7 6 5 9c-2 3-1 7 2 9s7 2 9 0c2-2 3-5 2-8-1-3-4-5-6-7z" fill="rgba(255,255,255,0.95)" />
                                    </svg>
                                </div>
                                <span
                                    className="text-base font-bold"
                                    style={{ color: "#6B3A2A", fontFamily: "'Noto Serif', serif" }}
                                >
                                    Kalakriti
                                </span>
                            </div>
                        </div>

                        {/* ── Content card ── */}
                        <div className="flex-1 flex flex-col px-6 pt-6 pb-4">
                            {/* Welcome text */}
                            <div className="mb-6">
                                <h1
                                    className="text-2xl font-bold leading-snug mb-2"
                                    style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}
                                >
                                    कलाकृति में<br />आपका स्वागत है
                                </h1>
                                <p className="text-sm leading-relaxed" style={{ color: "#9C6644" }}>
                                    अपनी कला को सीधे बाज़ार और ONDC से जोड़ें
                                </p>
                            </div>

                            {/* Mobile input */}
                            <div className="mb-4">
                                <label
                                    className="block text-xs font-semibold mb-1.5 uppercase tracking-widest"
                                    style={{ color: "#6B3A2A" }}
                                >
                                    मोबाइल नंबर
                                </label>
                                <div
                                    className="flex items-center rounded-2xl overflow-hidden transition-all duration-200"
                                    style={{
                                        border: mobile ? "2px solid #6B3A2A" : "1.5px solid rgba(196,136,107,0.5)",
                                        background: "#FFFBF7",
                                        boxShadow: mobile ? "0 0 0 4px rgba(107,58,42,0.08)" : "none",
                                    }}
                                >
                                    {/* Flag + prefix */}
                                    <div
                                        className="flex items-center gap-2 px-4 py-4 flex-shrink-0"
                                        style={{ borderRight: "1.5px solid rgba(196,136,107,0.3)" }}
                                    >
                                        {/* Indian flag */}
                                        <div className="flex flex-col overflow-hidden rounded-sm flex-shrink-0" style={{ width: 24, height: 16 }}>
                                            <div style={{ flex: 1, background: "#FF9933" }} />
                                            <div style={{ flex: 1, background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <div style={{ width: 7, height: 7, borderRadius: "50%", border: "1px solid #000080" }} />
                                            </div>
                                            <div style={{ flex: 1, background: "#138808" }} />
                                        </div>
                                        <span className="text-sm font-bold" style={{ color: "#3D1F0F" }}>+91</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                            <path d="M6 9l6 6 6-6" stroke="#9C6644" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>

                                    <input
                                        type="tel"
                                        maxLength={10}
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                                        placeholder="मोबाइल नंबर दर्ज करें"
                                        className="flex-1 px-4 py-4 text-base outline-none bg-transparent"
                                        style={{
                                            color: "#3D1F0F",
                                            fontFamily: mobile ? "'Poppins', sans-serif" : "'Noto Serif', serif",
                                        }}
                                    />

                                    {/* Clear button */}
                                    {mobile.length > 0 && (
                                        <button
                                            onClick={() => setMobile("")}
                                            className="px-4 py-4"
                                            style={{ color: "#C4886B" }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" fill="rgba(196,136,107,0.15)" />
                                                <path d="M15 9l-6 6M9 9l6 6" stroke="#9C6644" strokeWidth="1.8" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                {mobile.length > 0 && mobile.length < 10 && (
                                    <p className="text-xs mt-1.5 ml-1" style={{ color: "#C4886B" }}>
                                        {10 - mobile.length} अंक और दर्ज करें
                                    </p>
                                )}
                                {mobile.length === 10 && (
                                    <p className="text-xs mt-1.5 ml-1 flex items-center gap-1" style={{ color: "#16A34A" }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                            <path d="M20 6L9 17l-5-5" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        नंबर सही है
                                    </p>
                                )}
                            </div>

                            {/* OTP button */}
                            <button
                                onClick={() => {
                                    if (mobile.length === 10) {
                                        const testOtp = Math.floor(100000 + Math.random() * 900000);
                                        alert(`TEST MODE: Your OTP is ${testOtp}`);
                                        setStage("otp");
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-bold text-base transition-all duration-200 active:scale-[0.97] mb-5"
                                style={{
                                    background: mobile.length === 10
                                        ? "linear-gradient(135deg, #92400E 0%, #6B3A2A 100%)"
                                        : "rgba(196,136,107,0.35)",
                                    color: mobile.length === 10 ? "white" : "#C4886B",
                                    boxShadow: mobile.length === 10 ? "0 10px 32px rgba(107,58,42,0.42)" : "none",
                                    cursor: mobile.length === 10 ? "pointer" : "not-allowed",
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <rect x="5" y="11" width="14" height="10" rx="2"
                                        stroke={mobile.length === 10 ? "white" : "#C4886B"} strokeWidth="1.8" />
                                    <path d="M8 11V7a4 4 0 018 0v4"
                                        stroke={mobile.length === 10 ? "white" : "#C4886B"} strokeWidth="1.8" strokeLinecap="round" />
                                </svg>
                                <span style={{ fontFamily: "'Noto Serif', serif" }}>OTP प्राप्त करें</span>
                            </button>

                            {/* OR divider */}
                            <div className="flex items-center gap-4 mb-5">
                                <div className="flex-1" style={{ height: 1, background: "rgba(196,136,107,0.3)" }} />
                                <span
                                    className="text-xs font-semibold px-3 py-1 rounded-full"
                                    style={{ color: "#9C6644", background: "rgba(196,136,107,0.1)" }}
                                >
                                    या
                                </span>
                                <div className="flex-1" style={{ height: 1, background: "rgba(196,136,107,0.3)" }} />
                            </div>

                            {/* Google sign-in */}
                            <button
                                onClick={() => {
                                    alert("Google Sign-In Successful! Logging in...");
                                    if (onLogin) onLogin();
                                }}
                                className="w-full flex items-center justify-center gap-3 rounded-2xl py-3.5 font-semibold text-sm transition-all duration-200 active:scale-[0.97] mb-4"
                                style={{
                                    background: "#FFFBF7",
                                    color: "#3D1F0F",
                                    border: "1.5px solid rgba(196,136,107,0.4)",
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                                }}
                            >
                                {/* Google G */}
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span style={{ fontFamily: "'Noto Serif', serif" }}>Google से साइन इन करें</span>
                            </button>

                            <p className="text-center text-xs" style={{ color: "#C4886B" }}>
                                साइन इन करके आप हमारी{" "}
                                <span style={{ color: "#6B3A2A", textDecoration: "underline", cursor: "pointer" }}>
                                    शर्तें और गोपनीयता नीति
                                </span>{" "}
                                से सहमत हैं
                            </p>
                        </div>

                        {/* Trust badge */}
                        <div
                            className="flex-shrink-0 flex items-center justify-center gap-2 py-3 mx-6 mb-5 rounded-2xl"
                            style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)" }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" fill="rgba(22,163,74,0.15)" stroke="#16A34A" strokeWidth="1.8" strokeLinejoin="round" />
                                <path d="M9 12l2 2 4-4" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-xs font-semibold" style={{ color: "#16A34A" }}>
                                ONDC नेटवर्क द्वारा प्रमाणित
                            </span>
                            <span className="text-xs" style={{ color: "rgba(22,163,74,0.6)" }}>|</span>
                            <span className="text-xs font-medium" style={{ color: "#16A34A" }}>100% सुरक्षित</span>
                        </div>
                    </div>
                )}

                {/* ─────────────── OTP STAGE ─────────────── */}
                {stage === "otp" && (
                    <div className="flex-1 flex flex-col px-6 pt-8" style={{ overflow: "hidden" }}>
                        {/* Back */}
                        <button
                            onClick={() => setStage("landing")}
                            className="flex items-center gap-2 mb-8 self-start"
                            style={{ color: "#6B3A2A" }}
                        >
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center"
                                style={{ background: "rgba(107,58,42,0.08)" }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M15 18l-6-6 6-6" stroke="#6B3A2A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold" style={{ fontFamily: "'Noto Serif', serif" }}>वापस जाएं</span>
                        </button>

                        {/* OTP illustration */}
                        <div className="flex justify-center mb-6">
                            <div
                                className="relative w-28 h-28 rounded-3xl flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, #FEF0E4 0%, #F5DEC8 100%)", border: "2px solid rgba(196,136,107,0.3)" }}
                            >
                                {/* Phone body */}
                                <svg width="60" height="72" viewBox="0 0 60 72" fill="none">
                                    <rect x="8" y="4" width="44" height="64" rx="8" fill="#6B3A2A" fillOpacity="0.15" stroke="#9C6644" strokeWidth="2" />
                                    <rect x="14" y="12" width="32" height="44" rx="4" fill="#FFF8F3" />
                                    {/* Message lines */}
                                    <rect x="18" y="18" width="24" height="3" rx="1.5" fill="#C4886B" fillOpacity="0.5" />
                                    <rect x="20" y="25" width="20" height="3" rx="1.5" fill="#C4886B" fillOpacity="0.3" />
                                    {/* OTP digits */}
                                    {[0, 1, 2, 3, 4, 5].map((_, i) => (
                                        <rect key={i} x={16 + i * 5} y="36" width="4" height="6" rx="1" fill={i < 3 ? "#6B3A2A" : "rgba(196,136,107,0.3)"} />
                                    ))}
                                    <circle cx="30" cy="62" r="3" fill="#9C6644" fillOpacity="0.4" />
                                </svg>
                                {/* Pulse ring */}
                                <div
                                    className="absolute -inset-3 rounded-3xl animate-ping"
                                    style={{ border: "2px solid rgba(107,58,42,0.15)", animationDuration: "2s" }}
                                />
                            </div>
                        </div>

                        <h2
                            className="text-2xl font-bold mb-2 text-center"
                            style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}
                        >
                            OTP दर्ज करें
                        </h2>
                        <p className="text-sm text-center mb-1" style={{ color: "#9C6644" }}>
                            हमने आपके नंबर पर OTP भेजा है
                        </p>
                        <p className="text-base font-bold text-center mb-8" style={{ color: "#6B3A2A", fontFamily: "'Noto Serif', serif" }}>
                            +91 {mobile.slice(0, 5)}·····
                        </p>

                        {/* OTP boxes */}
                        <div className="flex gap-3 justify-center mb-3">
                            {otp.map((digit, i) => (
                                <div key={i} className="relative">
                                    <input
                                        id={`otp-${i}`}
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKey(i, e)}
                                        onFocus={() => setFocusedOtp(i)}
                                        onBlur={() => setFocusedOtp(null)}
                                        className="w-12 h-14 text-center text-xl font-bold rounded-2xl outline-none transition-all duration-200"
                                        style={{
                                            background: digit ? "#FFF0E6" : "#FFFBF7",
                                            border: focusedOtp === i
                                                ? "2.5px solid #6B3A2A"
                                                : digit
                                                    ? "2px solid rgba(107,58,42,0.5)"
                                                    : "1.5px solid rgba(196,136,107,0.4)",
                                            color: "#3D1F0F",
                                            boxShadow: focusedOtp === i ? "0 0 0 4px rgba(107,58,42,0.1)" : "none",
                                            fontFamily: "'Poppins', sans-serif",
                                        }}
                                    />
                                    {/* Underline dot when filled */}
                                    {digit && (
                                        <div
                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                                            style={{ background: "#6B3A2A" }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Resend */}
                        <div className="flex items-center justify-center gap-1 mb-8">
                            <span className="text-xs" style={{ color: "#9C6644" }}>OTP नहीं मिला?</span>
                            <button className="text-xs font-bold" style={{ color: "#6B3A2A" }}>
                                दोबारा भेजें
                            </button>
                            <span className="text-xs" style={{ color: "#C4886B" }}>(30s)</span>
                        </div>

                        {/* Verify button */}
                        <button
                            onClick={() => {
                                if (otp.every((d) => d)) { // Checks if all 6 boxes are filled
                                    alert("Verification Successful! Logging you in...");
                                    if (onLogin) onLogin(); // Tells the main app to move to the dashboard
                                }
                            }}
                            className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-bold text-base transition-all duration-200 active:scale-[0.97]"
                            style={{
                                background: otp.every((d) => d)
                                    ? "linear-gradient(135deg, #92400E 0%, #6B3A2A 100%)"
                                    : "rgba(196,136,107,0.3)",
                                color: otp.every((d) => d) ? "white" : "#C4886B",
                                boxShadow: otp.every((d) => d) ? "0 10px 32px rgba(107,58,42,0.42)" : "none",
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17l-5-5"
                                    stroke={otp.every((d) => d) ? "white" : "#C4886B"}
                                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span style={{ fontFamily: "'Noto Serif', serif" }}>OTP सत्यापित करें</span>
                        </button>

                        {/* Trust badge */}
                        <div
                            className="flex items-center justify-center gap-2 mt-6 py-3 rounded-2xl"
                            style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" fill="rgba(22,163,74,0.15)" stroke="#16A34A" strokeWidth="1.8" strokeLinejoin="round" />
                                <path d="M9 12l2 2 4-4" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-xs font-semibold" style={{ color: "#16A34A" }}>
                                ONDC नेटवर्क द्वारा प्रमाणित
                            </span>
                            <span className="text-xs" style={{ color: "rgba(22,163,74,0.5)" }}>|</span>
                            <span className="text-xs font-medium" style={{ color: "#16A34A" }}>100% सुरक्षित</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
