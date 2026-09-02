import { useState } from "react"

const CATEGORIES = [
    { hi: "मिट्टी", en: "Pottery" },
    { hi: "बुनाई", en: "Weaving" },
    { hi: "लकड़ी", en: "Woodwork" },
    { hi: "पेंटिंग", en: "Painting" },
]

const WAVE_HEIGHTS = [10, 18, 26, 16, 22, 12, 20, 14, 24, 10]

export default function KalakritiScreen() {
    const [photo, setPhoto] = useState<null | "camera" | "gallery">(null)
    const [activeCategory, setActiveCategory] = useState(0)
    const [isRecording, setIsRecording] = useState(false)
    const [voiceText, setVoiceText] = useState("")
    const [showNotif, setShowNotif] = useState(true)

    const handleMic = () => {
        if (isRecording) {
            setIsRecording(false)
            if (!voiceText)
                setVoiceText("यह हाथ से बनाया हुआ मिट्टी का घड़ा है। इसकी कीमत डेढ़ सौ रुपये है।")
        } else {
            setIsRecording(true)
        }
    }

    return (
        <div
            className="size-full flex items-center justify-center"
            style={{ background: "#EDE0D4", fontFamily: "'Poppins', sans-serif" }}
        >
            {/* ── Phone Shell ── */}
            <div
                className="relative flex flex-col overflow-hidden"
                style={{
                    width: "min(390px, 100vw)",
                    height: "min(844px, 100vh)",
                    background: "#FFFBF7",
                    borderRadius: "clamp(0px, 2vw, 28px)",
                    boxShadow:
                        "0 32px 80px rgba(61,31,15,0.22), 0 4px 20px rgba(0,0,0,0.1)",
                }}
            >
                {/* ── Status Bar ── */}
                <div
                    className="flex items-center justify-between px-6 pt-3 pb-1 flex-shrink-0"
                    style={{ background: "#6B3A2A" }}
                >
                    <span
                        className="text-xs font-semibold text-white/90"
                        style={{ letterSpacing: "0.04em" }}
                    >
                        9:41
                    </span>
                    <div className="flex items-center gap-2.5">
                        {/* Signal bars */}
                        <div className="flex items-end gap-px">
                            {[4, 6, 9, 12].map((h, i) => (
                                <div
                                    key={i}
                                    className="w-1 rounded-sm"
                                    style={{
                                        height: h,
                                        background: `rgba(255,255,255,${0.35 + i * 0.2})`,
                                    }}
                                />
                            ))}
                        </div>
                        {/* WiFi */}
                        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
                            <path
                                d="M7.5 8.5a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                fill="white"
                            />
                            <path
                                d="M3.2 5.8A6 6 0 0111.8 5.8"
                                stroke="white"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                                fill="none"
                            />
                            <path
                                d="M0.8 3.2A9.6 9.6 0 0114.2 3.2"
                                stroke="white"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                                fill="none"
                                strokeOpacity="0.6"
                            />
                        </svg>
                        {/* Battery */}
                        <div className="flex items-center gap-0.5">
                            <div
                                className="relative rounded"
                                style={{
                                    width: 22,
                                    height: 11,
                                    border: "1.5px solid rgba(255,255,255,0.55)",
                                }}
                            >
                                <div
                                    className="absolute inset-0.5 rounded-sm"
                                    style={{ background: "white", width: "72%" }}
                                />
                            </div>
                            <div
                                className="rounded-r-sm"
                                style={{
                                    width: 3,
                                    height: 5,
                                    background: "rgba(255,255,255,0.5)",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Top App Bar ── */}
                <div
                    className="flex items-center px-4 pb-4 pt-2 gap-3 flex-shrink-0"
                    style={{ background: "#6B3A2A" }}
                >
                    {/* Logo mark */}
                    <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: "rgba(255,255,255,0.15)",
                            border: "1px solid rgba(255,255,255,0.2)",
                        }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 3C10 5 7 6 5 9c-2 3-1 7 2 9s7 2 9 0c2-2 3-5 2-8-1-3-4-5-6-7z"
                                fill="rgba(255,255,255,0.9)"
                            />
                            <path
                                d="M12 3c2 2 5 4 6 7"
                                stroke="rgba(255,255,255,0.5)"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    <div className="flex-1">
                        <h1
                            className="text-xl font-bold text-white leading-tight"
                            style={{
                                fontFamily: "'Noto Serif', serif",
                                letterSpacing: "0.01em",
                            }}
                        >
                            Kalakriti
                        </h1>
                        <p className="text-xs text-white/65 -mt-0.5">
                            कारीगर साथी · Artisan Partner
                        </p>
                    </div>

                    {/* Bell + Avatar */}
                    <div className="flex items-center gap-2">
                        {/* Notification bell */}
                        <button
                            className="relative w-9 h-9 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.12)" }}
                            onClick={() => setShowNotif(false)}
                        >
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M13.73 21a2 2 0 01-3.46 0"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                            {showNotif && (
                                <span
                                    className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2"
                                    style={{ background: "#F97316", borderColor: "#6B3A2A" }}
                                />
                            )}
                        </button>

                        {/* Avatar */}
                        <button
                            className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm"
                            style={{
                                background: "linear-gradient(135deg, #D97706 0%, #92400E 100%)",
                                border: "2px solid rgba(255,255,255,0.35)",
                                color: "white",
                                flexShrink: 0,
                            }}
                        >
                            R
                        </button>
                    </div>
                </div>

                {/* ── Scrollable Content ── */}
                <div
                    className="flex-1 overflow-y-auto px-5 pt-5 space-y-5"
                    style={{ scrollbarWidth: "none", paddingBottom: 104 }}
                >
                    {/* Header */}
                    <div>
                        <span
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-2"
                            style={{ background: "rgba(107,58,42,0.1)", color: "#6B3A2A" }}
                        >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="#6B3A2A">
                                <circle cx="5" cy="5" r="5" />
                            </svg>
                            नया लिस्टिंग
                        </span>
                        <h2
                            className="text-2xl font-bold"
                            style={{
                                color: "#3D1F0F",
                                fontFamily: "'Noto Serif', serif",
                                lineHeight: 1.3,
                            }}
                        >
                            नया सामान जोड़ें
                        </h2>
                        <p className="text-sm mt-0.5" style={{ color: "#9C6644" }}>
                            फोटो और आवाज़ से कैटलॉग बनाएं
                        </p>
                    </div>

                    {/* ── Photo Upload Box ── */}
                    <div
                        className="relative rounded-3xl overflow-hidden"
                        style={{
                            border: photo ? "none" : "2.5px dashed #C4886B",
                            background: photo ? "transparent" : "rgba(196,136,107,0.06)",
                            minHeight: 210,
                        }}
                    >
                        {photo ? (
                            /* ── Photo Preview ── */
                            <>
                                <img
                                    src="https://images.unsplash.com/photo-1604264726154-26480e76f4e1?w=500&h=300&fit=crop&auto=format"
                                    alt="Handcrafted clay pot"
                                    className="w-full object-cover"
                                    style={{
                                        height: 210,
                                        mixBlendMode: "multiply",
                                        background: "#F0EBE3",
                                    }}
                                />
                                <div
                                    className="absolute inset-0"
                                    style={{ background: "rgba(61,31,15,0.12)" }}
                                />

                                {/* Edit / Crop chip */}
                                <button
                                    className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm transition-all active:scale-95"
                                    style={{
                                        background: "rgba(255,255,255,0.92)",
                                        color: "#6B3A2A",
                                        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                                    }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                                            stroke="#6B3A2A"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                                            stroke="#6B3A2A"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    एडिट करें / Crop
                                </button>

                                {/* Retake chip */}
                                <button
                                    onClick={() => setPhoto(null)}
                                    className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm active:scale-95"
                                    style={{
                                        background: "rgba(255,255,255,0.88)",
                                        color: "#6B3A2A",
                                    }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <polyline
                                            points="1 4 1 10 7 10"
                                            stroke="#6B3A2A"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M3.51 15a9 9 0 102.13-9.36L1 10"
                                            stroke="#6B3A2A"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    दोबारा लें
                                </button>

                                {/* Success badge */}
                                <div
                                    className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                                    style={{ background: "rgba(22,163,74,0.9)", color: "white" }}
                                >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M20 6L9 17l-5-5"
                                            stroke="white"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    फोटो ली ✓
                                </div>
                            </>
                        ) : (
                            /* ── Empty state with two buttons ── */
                            <div className="flex flex-col items-center justify-center gap-4 py-7 px-5">
                                {/* Corner markers */}
                                {[
                                    "top-3 left-3 border-t-2 border-l-2 rounded-tl",
                                    "top-3 right-3 border-t-2 border-r-2 rounded-tr",
                                    "bottom-3 left-3 border-b-2 border-l-2 rounded-bl",
                                    "bottom-3 right-3 border-b-2 border-r-2 rounded-br",
                                ].map((cls) => (
                                    <div
                                        key={cls}
                                        className={`absolute w-6 h-6 ${cls}`}
                                        style={{ borderColor: "#C4886B" }}
                                    />
                                ))}

                                {/* Placeholder icon */}
                                <div
                                    className="w-16 h-16 rounded-3xl flex items-center justify-center"
                                    style={{ background: "rgba(196,136,107,0.14)" }}
                                >
                                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                                            stroke="#9C6644"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <circle
                                            cx="12"
                                            cy="13"
                                            r="4"
                                            stroke="#9C6644"
                                            strokeWidth="1.8"
                                        />
                                    </svg>
                                </div>

                                <p
                                    className="text-xs font-medium text-center"
                                    style={{ color: "#9C6644" }}
                                >
                                    सामान की साफ़ फोटो लें
                                </p>

                                {/* Two action buttons */}
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => setPhoto("camera")}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 active:scale-[0.97]"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                                            color: "white",
                                            boxShadow: "0 6px 20px rgba(107,58,42,0.32)",
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                                                stroke="white"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <circle
                                                cx="12"
                                                cy="13"
                                                r="4"
                                                stroke="white"
                                                strokeWidth="1.8"
                                            />
                                        </svg>
                                        <span style={{ fontFamily: "'Noto Serif', serif" }}>
                                            कैमरा से फोटो लें
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setPhoto("gallery")}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 active:scale-[0.97]"
                                        style={{
                                            background: "rgba(196,136,107,0.1)",
                                            color: "#6B3A2A",
                                            border: "1.5px solid rgba(107,58,42,0.3)",
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <rect
                                                x="3"
                                                y="3"
                                                width="18"
                                                height="18"
                                                rx="3"
                                                stroke="#6B3A2A"
                                                strokeWidth="1.8"
                                            />
                                            <circle cx="8.5" cy="8.5" r="1.5" fill="#6B3A2A" />
                                            <path
                                                d="M21 15l-5-5L5 21"
                                                stroke="#6B3A2A"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <span style={{ fontFamily: "'Noto Serif', serif" }}>
                                            गैलरी से चुनें
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Voice Input ── */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <rect x="9" y="2" width="6" height="11" rx="3" fill="#6B3A2A" />
                                <path
                                    d="M5 11a7 7 0 0014 0"
                                    stroke="#6B3A2A"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <line
                                    x1="12"
                                    y1="18"
                                    x2="12"
                                    y2="22"
                                    stroke="#6B3A2A"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <line
                                    x1="9"
                                    y1="22"
                                    x2="15"
                                    y2="22"
                                    stroke="#6B3A2A"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <p
                                className="text-base font-bold"
                                style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}
                            >
                                बोलकर विवरण दें
                            </p>
                        </div>

                        <div className="flex gap-3 items-end">
                            {/* Text area */}
                            <div
                                className="flex-1 relative rounded-2xl transition-all duration-200"
                                style={{
                                    background: "#FFF8F3",
                                    border: isRecording
                                        ? "2px solid #6B3A2A"
                                        : "1.5px solid #E0C0A8",
                                    minHeight: 118,
                                    boxShadow: isRecording
                                        ? "0 0 0 4px rgba(107,58,42,0.08)"
                                        : "none",
                                }}
                            >
                                <textarea
                                    className="w-full resize-none p-4 text-sm outline-none bg-transparent leading-relaxed"
                                    style={{
                                        color: "#3D1F0F",
                                        minHeight: 118,
                                        fontFamily: "'Noto Serif', serif",
                                    }}
                                    placeholder="माइक दबाकर बोलें — 'यह मिट्टी का घड़ा है, हाथ से बना है...'"
                                    value={voiceText}
                                    onChange={(e) => setVoiceText(e.target.value)}
                                />

                                {/* Live waveform */}
                                {isRecording && (
                                    <div
                                        className="absolute bottom-3 left-4 right-16 flex items-end gap-1 overflow-hidden"
                                        style={{ height: 28 }}
                                    >
                                        {WAVE_HEIGHTS.map((h, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 rounded-full animate-bounce"
                                                style={{
                                                    height: h,
                                                    background: `rgba(107,58,42,${0.4 + (i % 3) * 0.2})`,
                                                    animationDelay: `${i * 0.07}s`,
                                                    animationDuration: "0.55s",
                                                }}
                                            />
                                        ))}
                                        <span
                                            className="absolute right-0 text-xs font-semibold whitespace-nowrap"
                                            style={{ color: "#6B3A2A", bottom: 6 }}
                                        >
                                            सुन रहे हैं…
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Mic FAB */}
                            <div className="relative flex-shrink-0">
                                {/* Pulse rings */}
                                {isRecording && (
                                    <>
                                        <span
                                            className="absolute inset-0 rounded-full animate-ping"
                                            style={{
                                                background: "rgba(107,58,42,0.18)",
                                                animationDuration: "1s",
                                            }}
                                        />
                                        <span
                                            className="absolute inset-0 rounded-full animate-ping"
                                            style={{
                                                background: "rgba(107,58,42,0.10)",
                                                animationDuration: "1.5s",
                                                animationDelay: "0.3s",
                                            }}
                                        />
                                    </>
                                )}
                                <button
                                    onClick={handleMic}
                                    className="relative rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
                                    style={{
                                        width: 64,
                                        height: 64,
                                        background: isRecording
                                            ? "linear-gradient(135deg, #C4886B 0%, #8B4513 100%)"
                                            : "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                                        boxShadow: isRecording
                                            ? "0 0 0 3px rgba(107,58,42,0.3), 0 8px 24px rgba(107,58,42,0.45)"
                                            : "0 8px 24px rgba(107,58,42,0.38)",
                                        transform: isRecording ? "scale(1.1)" : "scale(1)",
                                    }}
                                >
                                    {isRecording ? (
                                        /* Stop icon */
                                        <div
                                            className="w-5 h-5 rounded"
                                            style={{ background: "white" }}
                                        />
                                    ) : (
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                            <rect
                                                x="9"
                                                y="2"
                                                width="6"
                                                height="11"
                                                rx="3"
                                                fill="white"
                                            />
                                            <path
                                                d="M5 11a7 7 0 0014 0"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                            <line
                                                x1="12"
                                                y1="18"
                                                x2="12"
                                                y2="22"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                            <line
                                                x1="9"
                                                y1="22"
                                                x2="15"
                                                y2="22"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Category Pills ── */}
                    <div>
                        <p
                            className="text-base font-bold mb-3"
                            style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}
                        >
                            सामान किस तरह का है?
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                            {CATEGORIES.map(({ hi, en }, i) => {
                                const active = activeCategory === i
                                return (
                                    <button
                                        key={en}
                                        onClick={() => setActiveCategory(i)}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-150 active:scale-95"
                                        style={{
                                            background: active ? "#6B3A2A" : "rgba(196,136,107,0.09)",
                                            border: active
                                                ? "2px solid #6B3A2A"
                                                : "1.5px solid rgba(196,136,107,0.4)",
                                            boxShadow: active
                                                ? "0 4px 16px rgba(107,58,42,0.28)"
                                                : "none",
                                        }}
                                    >
                                        <span
                                            className="text-sm font-bold"
                                            style={{
                                                color: active ? "white" : "#3D1F0F",
                                                fontFamily: "'Noto Serif', serif",
                                            }}
                                        >
                                            {hi}
                                        </span>
                                        <span
                                            className="text-xs font-medium"
                                            style={{
                                                color: active ? "rgba(255,255,255,0.7)" : "#9C6644",
                                                fontFamily: "'Poppins', sans-serif",
                                            }}
                                        >
                                            {en}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Sticky Bottom Bar ── */}
                <div
                    className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 flex-shrink-0"
                    style={{
                        background: "linear-gradient(to top, #FFFBF7 72%, transparent)",
                    }}
                >
                    <button
                        className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-bold text-base transition-all duration-200 active:scale-[0.97]"
                        style={{
                            background: "linear-gradient(135deg, #92400E 0%, #6B3A2A 100%)",
                            color: "white",
                            boxShadow: "0 10px 32px rgba(107,58,42,0.42)",
                            letterSpacing: "0.02em",
                        }}
                    >
                        {/* Sparkle */}
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"
                                fill="rgba(255,255,255,0.92)"
                            />
                        </svg>
                        <span style={{ fontFamily: "'Noto Serif', serif" }}>
                            AI कैटलॉग तैयार करें
                        </span>
                    </button>
                    <p
                        className="text-center text-xs mt-2"
                        style={{ color: "#B07050", fontFamily: "'Noto Serif', serif" }}
                    >
                        AI आपका विवरण, कीमत और श्रेणी बनाएगा
                    </p>
                </div>
            </div>
        </div>
    )
}
