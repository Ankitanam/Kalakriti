// src/CatalogPreview.tsx
import { useState } from "react";

export default function CatalogPreview({ onBack, onCheckout, photoUrl, voiceText }: { onBack?: () => void; onCheckout?: () => void; photoUrl?: string | null; voiceText?: string }) {
    export interface CatalogData {
        imageUrl?: string;
        title_hi?: string;
        title_en?: string;
        description_hi?: string;
        description_en?: string;
        quick_summary_hi?: string;
        quick_summary_en?: string;
        specs_hi?: Array<{ label: string; value: string }>;
        specs_en?: Array<{ label: string; value: string }>;
        suggested_price?: number;
        artisan_name?: string;
        artisan_region?: string;
        tags?: string[];
    }

    interface CatalogPreviewProps {
        data?: CatalogData | null;
        onBack?: () => void;
        onCheckout?: () => void;
    }

    export default function CatalogPreview({ data, onBack, onCheckout }: CatalogPreviewProps) {
        const [activeTab, setActiveTab] = useState<"hindi" | "english">("hindi");
        const [published, setPublished] = useState(false);

        // ── Smart Dynamic Fallbacks ──
        const titleHi = data?.title_hi || "मधुबनी सूर्य लोककला पेंटिंग";
        const titleEn = data?.title_en || "Handmade Madhubani Sun Art (Unframed)";
        const price = data?.suggested_price || 299;
        const originalPrice = Math.round(price * 1.6); // Competitive strike-through price
        const artisanName = data?.artisan_name || "माधुरी देवी";
        const artisanRegion = data?.artisan_region || "मिथिला, बिहार Artisan";
        const imageUrl = data?.imageUrl || "https://images.unsplash.com/photo-1604264726154-26480e76f4e1?w=500";

        const tags = data?.tags && data.tags.length > 0
            ? data.tags
            : ["मधुबनी", "हस्तशिल्प", "ONDC Direct", "Affordable", "Handmade"];

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
                            <span className="text-xs text-white/80">5G</span>
                            <div className="w-5 h-2.5 border border-white/60 rounded-sm p-0.5">
                                <div className="h-full bg-white w-4/5 rounded-xs" />
                            </div>
                        </div>
                    </div>

                    {/* Top App Bar */}
                    <div
                        className="flex items-center px-4 py-3 gap-3 flex-shrink-0"
                        style={{ background: "#6B3A2A" }}
                    >
                        <button
                            type="button"
                            className="w-10 h-10 rounded-full flex items-center justify-center transition active:scale-95"
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
                            type="button"
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
                            className="mx-5 mt-5 rounded-3xl overflow-hidden relative shadow-sm"
                            style={{ height: 250, background: "#F0EBE3" }}
                        >
                            <img
                                src={photoUrl || "https://images.unsplash.com/photo-1604264726154-26480e76f4e1?w=500&h=360&fit=crop&auto=format"}
                                alt="Handcrafted decorative clay pot"
                                src={imageUrl}
                                alt={titleEn}
                                className="w-full h-full object-cover"
                            />
                            <div
                                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                                style={{ background: "rgba(255,255,255,0.92)", color: "#6B3A2A", backdropFilter: "blur(8px)" }}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="#C4886B">
                                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                                </svg>
                                AI Enhanced
                            </div>
                        </div>

                        {/* Product Details Card */}
                        <div className="mx-5 mt-4 space-y-3">
                            {/* ONDC Badges */}
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
                                    {titleHi}
                                </h2>
                                <p className="text-sm font-medium mt-0.5" style={{ color: "#9C6644" }}>
                                    {titleEn}
                                </p>
                            </div>

                            {/* Seller info */}
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                    style={{ background: "#6B3A2A" }}
                                >
                                    {artisanName.charAt(0)}
                                </div>
                                <span className="text-xs" style={{ color: "#9C6644" }}>
                                    {artisanName} · {artisanRegion}
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
                                            ₹{price}
                                        </span>
                                        <span
                                            className="text-base font-medium line-through"
                                            style={{ color: "#B07050" }}
                                        >
                                            ₹{originalPrice}
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

                            {/* ── Tabs & Pointwise Tabular Specs ── */}
                            <div>
                                <div className="flex rounded-xl overflow-hidden mb-3" style={{ background: "rgba(196,136,107,0.1)", padding: 3 }}>
                                    <button
                                        type="button"
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
                                        type="button"
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

                                {/* Summary sentence */}
                                <p className="text-xs font-medium text-[#5A2E12] mb-3 px-1 leading-relaxed">
                                    {activeTab === "hindi"
                                        ? (data?.quick_summary_hi || data?.description_hi || "हस्तनिर्मित प्रामाणिक भारतीय लोककला।")
                                        : (data?.quick_summary_en || data?.description_en || "Authentic handmade Indian craft by rural creators.")}
                                </p>

                                {/* ── Pointwise Tabular Specifications ── */}
                                <div
                                    className="rounded-2xl overflow-hidden shadow-xs"
                                    style={{ border: "1.5px solid rgba(196,136,107,0.25)", background: "#FFFBF7" }}
                                >
                                    {activeTab === "hindi" ? (
                                        <>
                                            <p style={{ fontFamily: "'Noto Serif', serif", lineHeight: 1.8 }}>
                                                {voiceText ? `🎙️ आपने कहा: "${voiceText}"` : "यह मिट्टी का घड़ा राजस्थान के कुशल कुम्हार कारीगरों द्वारा हाथ से बनाया गया है। परंपरागत तकनीक और प्राकृतिक मिट्टी का उपयोग करके इसे तैयार किया गया है।"}
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
                                    <div className="px-3.5 py-2.5 border-b flex items-center justify-between" style={{ background: "rgba(107,58,42,0.06)", borderColor: "rgba(196,136,107,0.2)" }}>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B3A2A]">
                                            {activeTab === "hindi" ? "📋 उत्पाद विवरण (Specs)" : "📋 Product Details"}
                                        </span>
                                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                            ONDC सत्यापित
                                        </span>
                                    </div>

                                    <div className="divide-y text-xs" style={{ borderColor: "rgba(196,136,107,0.15)" }}>
                                        {(activeTab === "hindi"
                                            ? (data?.specs_hi || [
                                                { label: "कला शैली", value: "मधुबनी / मिथिला लोककला" },
                                                { label: "सामग्री", value: "हस्तनिर्मित कागज़ + प्राकृतिक रंग" },
                                                { label: "आकार", value: "A4 शीट (~8x11 इंच)" },
                                                { label: "फ्रेम", value: "बिना फ्रेम (सुरक्षित रोल पैकिंग)" },
                                                { label: "उपयोग", value: "दीवार सज्जा, लिविंग रूम, उपहार" }
                                            ])
                                            : (data?.specs_en || [
                                                { label: "Art Form", value: "Mithila / Madhubani Folk Art" },
                                                { label: "Material", value: "Handmade Paper & Eco Dyes" },
                                                { label: "Size", value: "A4 Sheet (~8x11 inches)" },
                                                { label: "Framing", value: "Unframed (Safe Roll Packing)" },
                                                { label: "Best For", value: "Wall Decor, Study, Cultural Gift" }
                                            ])
                                        ).map((spec: { label: string; value: string }, idx: number) => (
                                            <div
                                                key={idx}
                                                className="grid grid-cols-12 px-3.5 py-2.5 items-center transition hover:bg-[#FFF4EC]"
                                                style={{ background: idx % 2 === 0 ? "#FFFFFF" : "#FFFBF7" }}
                                            >
                                                <span className="col-span-4 font-semibold text-[#8B4513] text-[11px]">
                                                    {spec.label}
                                                </span>
                                                <span className="col-span-8 text-[#3D1F0F] font-medium leading-snug">
                                                    {spec.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* AI-Generated Tags */}
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest mb-2 mt-4" style={{ color: "#9C6644" }}>
                                    AI-Generated Tags
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag: string) => (
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
                                    type="button"
                                    onClick={onBack}
                                    className="flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-sm transition-all duration-200 active:scale-95"
                                    style={{
                                        flex: "0 0 auto",
                                        width: 110,
                                        background: "transparent",
                                        color: "#6B3A2A",
                                        border: "2px solid #6B3A2A",
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setPublished(true); setTimeout(() => onCheckout?.(), 600); }}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-sm transition-all duration-200 active:scale-[0.97]"
                                    style={{
                                        background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                                        color: "white",
                                        boxShadow: "0 8px 28px rgba(107,58,42,0.38)",
                                    }}
                                >
                                    Approve &amp; Publish
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }