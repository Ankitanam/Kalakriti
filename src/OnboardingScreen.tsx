// src/OnboardingScreen.tsx
import { useState } from "react";

type Stage = "landing" | "otp";
export type UserRole = "seller" | "buyer";

interface OnboardingScreenProps {
  onLogin?: (role: UserRole) => void;
  initialRole?: UserRole; // 👈 Line 8 के नीचे यह जोड़ें
}

export default function OnboardingScreen({ onLogin, initialRole = "seller" }: OnboardingScreenProps) {
  const [role, setRole] = useState<UserRole>(initialRole); // 👈 "seller" की जगह initialRole करें
  const [stage, setStage] = useState<Stage>("landing");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [focusedOtp, setFocusedOtp] = useState<number | null>(null);

  const isBuyer = role === "buyer";

  // Dynamic Theme Colors based on Role
  const theme = {
    bg: isBuyer ? "#F5F3FF" : "#FDF8F5",
    phoneBg: isBuyer ? "#FAF5FF" : "#FFFBF7",
    primary: isBuyer ? "#5B21B6" : "#6B3A2A",
    accent: isBuyer ? "#7C3AED" : "#8B4513",
    border: isBuyer ? "rgba(124, 58, 237, 0.35)" : "rgba(196, 136, 107, 0.45)",
    textDark: isBuyer ? "#2E1065" : "#3D1F0F",
    textMuted: isBuyer ? "#6D28D9" : "#8B4513",
    btnGradient: isBuyer
      ? "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)"
      : "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
    shadow: isBuyer
      ? "0 10px 28px rgba(91, 33, 182, 0.35)"
      : "0 10px 28px rgba(107, 58, 42, 0.38)",
    heroImg: isBuyer
      ? "https://images.unsplash.com/photo-1776336512006-8637d32a06da?q=80&w=800&auto=format&fit=crop" // 🛍️ Buyer Image
      : "https://plus.unsplash.com/premium_photo-1673395434835-19ec34a81583?q=80&w=800&auto=format&fit=crop", // 🏺 Seller Image// Artisan Potter Wheel
  };

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

  const handleCompleteLogin = () => {
    if (onLogin) onLogin(role);
  };

  return (
    <div
      className="size-full flex items-center justify-center transition-colors duration-300"
      style={{ background: isBuyer ? "#EDE9FE" : "#EDE0D4", fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Phone shell */}
      <div
        className="relative flex flex-col overflow-hidden transition-all duration-300"
        style={{
          width: "min(390px, 100vw)",
          height: "min(844px, 100vh)",
          background: theme.phoneBg,
          borderRadius: "clamp(0px, 2vw, 28px)",
          boxShadow: isBuyer 
            ? "0 32px 80px rgba(76, 29, 149, 0.25), 0 4px 20px rgba(0,0,0,0.08)"
            : "0 32px 80px rgba(61, 31, 15, 0.22), 0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1 flex-shrink-0 relative z-20">
          <span className="text-xs font-semibold" style={{ color: theme.primary, letterSpacing: "0.04em" }}>
            9:41
          </span>
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold" style={{ color: theme.primary }}>5G</span>
            <div
              className="relative rounded"
              style={{ width: 22, height: 11, border: `1.5px solid ${theme.primary}66` }}
            >
              <div
                className="absolute inset-0.5 rounded-xs"
                style={{ background: theme.primary, width: "75%" }}
              />
            </div>
          </div>
        </div>

        {/* ─────────────── LANDING STAGE ─────────────── */}
        {stage === "landing" && (
          <div className="flex-1 flex flex-col overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            {/* ── True-to-Life Hero Photo Banner ── */}
            <div className="relative flex-shrink-0 overflow-hidden" style={{ height: 260 }}>
              <img
                src={theme.heroImg}
                alt="Indian Craft Banner"
                className="w-full h-full object-cover transition-all duration-500"
              />
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background: isBuyer
                    ? "linear-gradient(180deg, rgba(46,16,101,0.5) 0%, rgba(46,16,101,0.1) 40%, #FAF5FF 100%)"
                    : "linear-gradient(180deg, rgba(61,31,15,0.45) 0%, rgba(61,31,15,0.15) 40%, #FDF8F5 100%)",
                }}
              />

              {/* Logo / Brand Header */}
              <div className="absolute top-4 left-5 flex items-center gap-2 z-10">
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg text-white"
                  style={{
                    background: theme.btnGradient,
                    border: "1.5px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <span className="text-base">{isBuyer ? "🛍️" : "🏺"}</span>
                </div>
                <div>
                  <span
                    className="text-lg font-bold text-white tracking-wide block leading-none drop-shadow-md"
                    style={{ fontFamily: "'Noto Serif', serif" }}
                  >
                    Kalakriti
                  </span>
                  <span className="text-[10px] text-amber-200 font-medium tracking-wider uppercase block mt-0.5">
                    {isBuyer ? "ONDC Buyer Mall" : "कारीगर साथी"}
                  </span>
                </div>
              </div>

              {/* ONDC Badge top-right */}
              <div
                className="absolute top-4 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md z-10 bg-white/95"
                style={{ color: theme.primary, border: `1px solid ${theme.border}` }}
              >
                <span>✨</span>
                <span>{isBuyer ? "ONDC Buyer" : "ONDC Seller"}</span>
              </div>

              {/* Cultural Tagline */}
              <div className="absolute bottom-3 left-5 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                <span className="text-amber-400 text-xs">✦</span>
                <span className="text-white text-[11px] font-medium">
                  {isBuyer ? "सीधे गांव के कारीगरों से खरीदें" : "100% प्रामाणिक भारतीय हस्तशिल्प"}
                </span>
              </div>
            </div>

            {/* ── Content Card ── */}
            <div className="flex-1 flex flex-col px-6 pt-2 pb-4">
              
              {/* ── ROLE SWITCHER (विक्रेता vs खरीदार) ── */}
              <div
                className="p-1 rounded-2xl flex mb-4 shadow-inner"
                style={{ background: isBuyer ? "#EDE9FE" : "#EDE0D4" }}
              >
                <button
                  type="button"
                  onClick={() => setRole("seller")}
                  className="flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  style={{
                    background: !isBuyer ? "#6B3A2A" : "transparent",
                    color: !isBuyer ? "white" : "#6B3A2A",
                    boxShadow: !isBuyer ? "0 2px 8px rgba(107, 58, 42, 0.3)" : "none",
                  }}
                >
                  <span>🏺</span>
                  <span>मैं कारीगर हूँ (Seller)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("buyer")}
                  className="flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  style={{
                    background: isBuyer ? "#5B21B6" : "transparent",
                    color: isBuyer ? "white" : "#5B21B6",
                    boxShadow: isBuyer ? "0 2px 8px rgba(91, 33, 182, 0.35)" : "none",
                  }}
                >
                  <span>🛍️</span>
                  <span>मैं खरीदार हूँ (Buyer)</span>
                </button>
              </div>

              {/* Welcome Heading */}
              <div className="mb-4">
                <h1
                  className="text-2xl font-bold leading-tight mb-1"
                  style={{ color: theme.textDark, fontFamily: "'Noto Serif', serif" }}
                >
                  {isBuyer ? "हस्तकला बाज़ार में आपका स्वागत है" : "कलाकृति में आपका स्वागत है"}
                </h1>
                <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>
                  {isBuyer
                    ? "Paytm व PhonePe जैसे ONDC नेटवर्क से सीधे ग्रामीण कारीगरों से खरीदें"
                    : "अपनी कला को सीधे देश भर के बाज़ार और ONDC नेटवर्क से जोड़ें"}
                </p>
              </div>

              {/* Mobile Input */}
              <div className="mb-3.5">
                <label
                  className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider"
                  style={{ color: theme.primary }}
                >
                  मोबाइल नंबर
                </label>
                <div
                  className="flex items-center rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    border: mobile ? `2px solid ${theme.primary}` : `1.5px solid ${theme.border}`,
                    background: "#FFFFFF",
                  }}
                >
                  <div
                    className="flex items-center gap-2 px-3.5 py-3.5 flex-shrink-0"
                    style={{ borderRight: `1.5px solid ${theme.border}` }}
                  >
                    <div className="flex flex-col overflow-hidden rounded-xs flex-shrink-0 shadow-xs" style={{ width: 22, height: 15 }}>
                      <div style={{ flex: 1, background: "#FF9933" }} />
                      <div style={{ flex: 1, background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", border: "1px solid #000080" }} />
                      </div>
                      <div style={{ flex: 1, background: "#138808" }} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">+91</span>
                  </div>

                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    placeholder="10 अंकों का मोबाइल नंबर"
                    className="flex-1 px-4 py-3.5 text-base outline-none bg-transparent text-slate-900"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  />

                  {mobile.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setMobile("")}
                      className="px-3.5 py-3.5 text-stone-400 hover:text-stone-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* OTP Action Button */}
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
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-base text-white shadow-md active:scale-[0.98] transition disabled:opacity-50 mb-3"
                style={{
                  background: theme.btnGradient,
                  boxShadow: mobile.length === 10 ? theme.shadow : "none",
                  cursor: mobile.length === 10 ? "pointer" : "not-allowed",
                }}
              >
                <span style={{ fontFamily: "'Noto Serif', serif" }}>
                  {isBuyer ? "खरीदारी शुरू करें (Get OTP)" : "OTP प्राप्त करें"}
                </span>
                <span>➔</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-[11px] font-semibold text-stone-400 px-2 py-0.5 rounded-full bg-stone-100">
                  या
                </span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              {/* Google Sign-in */}
              <button
                type="button"
                onClick={handleCompleteLogin}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-3 font-semibold text-sm transition-all active:scale-[0.98] mb-3 bg-white border border-stone-200 shadow-xs hover:shadow-md text-slate-800"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Google से जारी रखें</span>
              </button>

              {/* Trust Badge */}
              <div
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl mt-auto"
                style={{
                  background: isBuyer ? "#F3E8FF" : "#DCFCE7",
                  border: isBuyer ? "1px solid #DDD6FE" : "1px solid #BBF7D0",
                }}
              >
                <span className="text-xs">{isBuyer ? "🛡️" : "✓"}</span>
                <span className="text-[11px] font-semibold" style={{ color: isBuyer ? "#5B21B6" : "#15803D" }}>
                  {isBuyer ? "ONDC सत्यापित खरीदार पोर्टल · 100% सुरक्षित भुगतान" : "ONDC नेटवर्क द्वारा प्रमाणित · 100% सुरक्षित"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────── OTP STAGE ─────────────── */}
        {stage === "otp" && (
          <div className="flex-1 flex flex-col px-6 pt-6" style={{ overflow: "hidden" }}>
            {/* Back */}
            <button
              type="button"
              onClick={() => setStage("landing")}
              className="flex items-center gap-1.5 mb-6 self-start active:scale-95 transition"
              style={{ color: theme.primary }}
            >
              <span className="text-sm font-bold">←</span>
              <span className="text-xs font-semibold" style={{ fontFamily: "'Noto Serif', serif" }}>वापस जाएं</span>
            </button>

            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-xs"
                style={{ background: isBuyer ? "#EDE9FE" : "#FEE2E2", border: `1px solid ${theme.border}` }}
              >
                {isBuyer ? "🛍️" : "📱"}
              </div>
              <h2 className="text-xl font-bold" style={{ color: theme.textDark, fontFamily: "'Noto Serif', serif" }}>
                OTP दर्ज करें
              </h2>
              <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                +91 {mobile.slice(0, 5)}••••• पर भेजा गया कोड
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
                    background: digit ? (isBuyer ? "#EDE9FE" : "#FFF0E6") : "#FFFFFF",
                    border: focusedOtp === i
                      ? `2.5px solid ${theme.primary}`
                      : digit
                      ? `2px solid ${theme.primary}80`
                      : `1.5px solid ${theme.border}`,
                    color: theme.textDark,
                  }}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={() => {
                if (otp.every((d) => d)) {
                  handleCompleteLogin();
                }
              }}
              disabled={!otp.every((d) => d)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold text-base text-white shadow-lg transition-all active:scale-[0.98] mt-3 disabled:opacity-50"
              style={{ background: theme.btnGradient }}
            >
              <span>{isBuyer ? "✓ बाज़ार में प्रवेश करें" : "✓ OTP सत्यापित करें"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}