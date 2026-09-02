import { useState } from "react";

export default function CatalogPreview({ onBack, onCheckout }: { onBack?: () => void; onCheckout?: () => void }) {
    const [activeTab, setActiveTab] = useState<"hindi" | "english">("hindi");
    const [published, setPublished] = useState(false);

    return (
        <div
            className="size-full flex items-center justify-center"
            style={{ background: "#F5EFE7", fontFamily: "'Poppins', sans-serif" }}
        >
            {/* Phone shell */}
            <div
                className="relative flex flex-col overflow-hidden"
                style={{
                    width: "min(390px, 100vw)",
                    height: "min(844px, 100vh)",
                    background: "#FFFBF7",
                    borderRadius: "clamp(0px, 2vw, 28px)",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
                }}
            >
                {/* Status bar */}
                <div
                    className="flex items-center justify-between px-6 pt-3 pb-1 flex-shrink-0"
                    style={{ background: "#6B3A2A" }}
                >
                    <span className="text-xs font-medium text-white/90">9:41</span>
                    <div className="flex items-center gap-2">
                        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                            <rect x="0" y="3" width="3" height="9" rx="1" fill="white" fillOpacity="0.4" />
                            <rect x="4.5" y="2" width="3" height="10" rx="1" fill="white" fillOpacity="0.6" />
                            <rect x="9" y="0" width="3" height="12" rx="1" fill="white" fillOpacity="0.9" />
                            <rect x="13.5" y="0" width="2.5" height="12" rx="1" fill="white" />
                        </svg>
                        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                            <path d="M8 2.5C5.5 2.5 3.2 3.5 1.5 5.2L0 3.7C2.1 1.4 5 0 8 0s5.9 1.4 8 3.7l-1.5 1.5C12.8 3.5 10.5 2.5 8 2.5z" fill="white" />
                            <path d="M8 6C6.3 6 4.8 6.7 3.7 7.8L2.2 6.3C3.7 4.9 5.7 4 8 4s4.3.9 5.8 2.3L12.3 7.8C11.2 6.7 9.7 6 8 6z" fill="white" fillOpacity="0.8" />
                            <circle cx="8" cy="10.5" r="1.5" fill="white" />
                        </svg>
                        <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
                            <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="white" strokeOpacity="0.5" />
                            <rect x="2" y="2" width="16" height="9" rx="2" fill="white" />
                            <path d="M24 4.5v4a2 2 0 000-4z" fill="white" fillOpacity="0.5" />
                        </svg>
                    </div>
                </div>

                {/* Top App Bar */}
                <div
                    className="flex items-center px-4 py-3 gap-3 flex-shrink-0"
                    style={{ background: "#6B3A2A" }}
                >
                    <button
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.12)" }}
                        onClick={onBack}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1
                            className="text-lg font-bold text-white tracking-wide"
                            style={{ fontFamily: "'Noto Serif', serif" }}
                        >
                            Preview Listing
                        </h1>
                        <p className="text-xs text-white/60 -mt-0.5">AI-generated catalog</p>
                    </div>
                    <button
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.12)" }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="8" r="3" stroke="white" strokeWidth="2" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable content */}
                <div
                    className="flex-1 overflow-y-auto"
                    style={{ scrollbarWidth: "none", paddingBottom: 100 }}
                >
                    {/* Product Image */}
                    <div
                        className="mx-5 mt-5 rounded-3xl overflow-hidden relative"
                        style={{ height: 240, background: "#F0EBE3" }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1604264726154-26480e76f4e1?w=500&h=360&fit=crop&auto=format"
                            alt="Handcrafted decorative clay pot"
                            className="w-full h-full object-cover"
                            style={{ mixBlendMode: "multiply" }}
                        />
                        {/* AI generated tag */}
                        <div
                            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                            style={{ background: "rgba(255,255,255,0.92)", color: "#6B3A2A", backdropFilter: "blur(8px)" }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="#C4886B">
                                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                            </svg>
                            AI Enhanced
                        </div>
                        {/* Image counter dots */}
                        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="rounded-full" style={{
                                    width: i === 0 ? 20 : 6,
                                    height: 6,
                                    background: i === 0 ? "#6B3A2A" : "rgba(255,255,255,0.7)",
                                    transition: "width 0.2s",
                                }} />
                            ))}
                        </div>
                    </div>

                    {/* Product Details Card */}
                    <div className="mx-5 mt-4 space-y-3">
                        {/* ONDC Badge */}
                        <div className="flex items-center gap-2">
                            <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide"
                                style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED", border: "1.5px solid rgba(124,58,237,0.25)" }}
                            >
                                ✨ ONDC Ready
                            </span>
                            <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                                style={{ background: "rgba(22,163,74,0.1)", color: "#16A34A", border: "1.5px solid rgba(22,163,74,0.25)" }}
                            >
                                ● Live Preview
                            </span>
                        </div>

                        {/* Title block */}
                        <div>
                            <h2
                                className="text-2xl font-bold leading-tight"
                                style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}
                            >
                                सजावटी मिट्टी का घड़ा
                            </h2>
                            <p className="text-sm font-medium mt-0.5" style={{ color: "#9C6644" }}>
                                Handcrafted Decorative Clay Pot
                            </p>
                        </div>

                        {/* Seller info */}
                        <div className="flex items-center gap-2">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                style={{ background: "#6B3A2A" }}
                            >
                                R
                            </div>
                            <span className="text-xs" style={{ color: "#9C6644" }}>
                                Radha Devi · Rajasthan Artisan
                            </span>
                            <div className="flex items-center gap-0.5 ml-auto">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= 4 ? "#F59E0B" : "#E5E7EB"}>
                                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                                    </svg>
                                ))}
                                <span className="text-xs ml-1" style={{ color: "#9C6644" }}>4.0</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: 1, background: "rgba(196,136,107,0.2)" }} />

                        {/* Pricing */}
                        <div
                            className="rounded-2xl p-4 flex items-center justify-between"
                            style={{ background: "linear-gradient(135deg, #FFF8F3 0%, #FEF0E4 100%)", border: "1.5px solid rgba(196,136,107,0.2)" }}
                        >
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span
                                        className="text-3xl font-bold"
                                        style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}
                                    >
                                        ₹150
                                    </span>
                                    <span
                                        className="text-base font-medium line-through"
                                        style={{ color: "#B07050" }}
                                    >
                                        ₹250
                                    </span>
                                </div>
                                <p className="text-xs mt-0.5" style={{ color: "#9C6644" }}>
                                    Incl. of all taxes · Free delivery
                                </p>
                            </div>
                            <div
                                className="flex flex-col items-center justify-center rounded-2xl px-4 py-2.5 text-center"
                                style={{ background: "rgba(22,163,74,0.1)", border: "1.5px solid rgba(22,163,74,0.25)" }}
                            >
                                <span className="text-lg font-bold" style={{ color: "#16A34A" }}>40%</span>
                                <span className="text-xs font-medium leading-tight" style={{ color: "#16A34A" }}>Profit for<br />Artisan</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: 1, background: "rgba(196,136,107,0.2)" }} />

                        {/* Tabs */}
                        <div>
                            <div className="flex rounded-xl overflow-hidden" style={{ background: "rgba(196,136,107,0.1)", padding: 3 }}>
                                <button
                                    onClick={() => setActiveTab("hindi")}
                                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                                    style={{
                                        background: activeTab === "hindi" ? "#6B3A2A" : "transparent",
                                        color: activeTab === "hindi" ? "white" : "#9C6644",
                                        boxShadow: activeTab === "hindi" ? "0 2px 8px rgba(107,58,42,0.25)" : "none",
                                    }}
                                >
                                    हिंदी विवरण
                                </button>
                                <button
                                    onClick={() => setActiveTab("english")}
                                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                                    style={{
                                        background: activeTab === "english" ? "#6B3A2A" : "transparent",
                                        color: activeTab === "english" ? "white" : "#9C6644",
                                        boxShadow: activeTab === "english" ? "0 2px 8px rgba(107,58,42,0.25)" : "none",
                                    }}
                                >
                                    English Copy
                                </button>
                            </div>

                            {/* Tab content */}
                            <div
                                className="mt-3 rounded-2xl p-4 text-sm leading-relaxed"
                                style={{ background: "#FFF8F3", border: "1.5px solid rgba(196,136,107,0.15)", color: "#5A2E12" }}
                            >
                                {activeTab === "hindi" ? (
                                    <>
                                        <p style={{ fontFamily: "'Noto Serif', serif", lineHeight: 1.8 }}>
                                            यह मिट्टी का घड़ा राजस्थान के कुशल कुम्हार कारीगरों द्वारा हाथ से बनाया गया है।
                                            परंपरागत तकनीक और प्राकृतिक मिट्टी का उपयोग करके इसे तैयार किया गया है।
                                        </p>
                                        <ul className="mt-3 space-y-1.5">
                                            {["सामग्री: प्राकृतिक मिट्टी", "ऊँचाई: 25 सेमी", "वजन: 600 ग्राम", "देखभाल: सूखे कपड़े से साफ करें"].map((item) => (
                                                <li key={item} className="flex items-start gap-2">
                                                    <span style={{ color: "#C4886B" }}>•</span>
                                                    <span style={{ fontFamily: "'Noto Serif', serif" }}>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <>
                                        <p style={{ lineHeight: 1.8 }}>
                                            A beautifully hand-thrown decorative clay pot crafted by master potters from Rajasthan.
                                            Made using traditional wheel-throwing techniques with locally sourced terracotta clay.
                                        </p>
                                        <ul className="mt-3 space-y-1.5">
                                            {["Material: Natural terracotta clay", "Height: 25 cm", "Weight: 600g", "Care: Wipe with dry cloth"].map((item) => (
                                                <li key={item} className="flex items-start gap-2">
                                                    <span style={{ color: "#C4886B" }}>•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* SEO / keywords chip row */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#9C6644" }}>
                                AI-Generated Tags
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {["मिट्टी के बर्तन", "Pottery", "Handmade", "Eco-friendly", "Rajasthan", "Home Décor", "Gift"].map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 rounded-full text-xs font-medium"
                                        style={{ background: "rgba(196,136,107,0.12)", color: "#6B3A2A", border: "1px solid rgba(196,136,107,0.3)" }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Bottom Bar */}
                <div
                    className="absolute bottom-0 left-0 right-0 flex-shrink-0 px-5 pt-3 pb-8"
                    style={{
                        background: "linear-gradient(to top, #FFFBF7 70%, transparent)",
                        backdropFilter: "blur(2px)",
                    }}
                >
                    {published ? (
                        <div
                            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold"
                            style={{ background: "rgba(22,163,74,0.12)", color: "#16A34A", border: "1.5px solid rgba(22,163,74,0.3)" }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17l-5-5" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Published to ONDC!
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                className="flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-sm transition-all duration-200 active:scale-95"
                                style={{
                                    flex: "0 0 auto",
                                    width: 110,
                                    background: "transparent",
                                    color: "#6B3A2A",
                                    border: "2px solid #6B3A2A",
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#6B3A2A" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#6B3A2A" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                Edit
                            </button>
                            <button
                                onClick={() => { setPublished(true); setTimeout(() => onCheckout?.(), 600); }}
                                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-sm transition-all duration-200 active:scale-[0.97]"
                                style={{
                                    background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                                    color: "white",
                                    boxShadow: "0 8px 28px rgba(107,58,42,0.38)",
                                }}
                            >
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                    <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Approve &amp; Publish
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
