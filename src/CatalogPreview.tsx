// src/CatalogPreview.tsx
import { useState } from "react";

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
    quantity?: number;
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

    const titleHi = data?.title_hi || "हस्तनिर्मित पारंपरिक उत्पाद";
    const titleEn = data?.title_en || "Handcrafted Traditional Product";
    const price = data?.suggested_price || 199;
    const originalPrice = Math.round(price * 1.6);
    const artisanName = data?.artisan_name || "माधुरी देवी";
    const artisanRegion = data?.artisan_region || "कारीगर क्लस्टर, भारत";
    const imageUrl = data?.imageUrl || "https://images.unsplash.com/photo-1604264726154-26480e76f4e1?w=500";

    const tags = data?.tags && data.tags.length > 0
        ? data.tags
        : ["हस्तशिल्प", "Handmade", "ONDC Direct", "Kalakriti"];

    // Dynamic Summary & Description based on AI output
    const summaryHi = data?.quick_summary_hi || data?.description_hi || "कुशल कारीगरों द्वारा पारंपरिक कला से तैयार किया गया प्रामाणिक उत्पाद।";
    const summaryEn = data?.quick_summary_en || data?.description_en || "Authentic handcrafted piece made with care using heritage methods.";

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
                        className="w-10 h-10 rounded-full flex items-center justify-center transition active:scale-95 text-white"
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
                        <p className="text-xs text-white/60 -mt-0.5">Kalakriti AI Catalog</p>
                    </div>
                </div>

                {/* Scrollable content */}
                <div
                    className="flex-1 overflow-y-auto"
                    style={{ scrollbarWidth: "none", paddingBottom: 110 }}
                >
                    {/* Product Image */}
                    <div
                        className="mx-4 mt-4 rounded-3xl overflow-hidden relative shadow-sm"
                        style={{ height: 260, background: "#F0EBE3" }}
                    >
                        <img
                            src={imageUrl}
                            alt={titleEn}
                            className="w-full h-full object-cover"
                        />
                        <div
                            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                            style={{ background: "rgba(255,255,255,0.92)", color: "#6B3A2A" }}
                        >
                            ★ AI Enhanced
                        </div>
                    </div>

                    {/* Product Details Card */}
                    <div className="mx-4 mt-4 space-y-3">
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
                            <span className="text-xs font-medium" style={{ color: "#9C6644" }}>
                                {artisanName} · {artisanRegion}
                            </span>
                            <div className="flex items-center gap-0.5 ml-auto">
                                <span className="text-amber-500 text-xs">★★★★☆</span>
                                <span className="text-xs ml-1 text-[#9C6644]">4.0</span>
                            </div>
                        </div>

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
                                        className="text-base font-medium line-through text-stone-400"
                                    >
                                        ₹{originalPrice}
                                    </span>
                                </div>
                                <p className="text-xs mt-0.5 text-stone-500">
                                    Incl. of all taxes · Free delivery
                                </p>
                            </div>
                            <div
                                className="flex flex-col items-center justify-center rounded-2xl px-4 py-2 text-center bg-emerald-50 border border-emerald-200"
                            >
                                <span className="text-base font-bold text-emerald-700">40% बचत</span>
                                <span className="text-[10px] font-medium text-emerald-800">कारीगर को सीधा लाभ</span>
                            </div>
                        </div>

                        {/* ── Dynamic Tabs & Specifications (NO Hardcoded Pot text!) ── */}
                        <div>
                            <div className="flex rounded-xl overflow-hidden mb-3" style={{ background: "rgba(196,136,107,0.1)", padding: 3 }}>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("hindi")}
                                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                                    style={{
                                        background: activeTab === "hindi" ? "#6B3A2A" : "transparent",
                                        color: activeTab === "hindi" ? "white" : "#9C6644",
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
                                    }}
                                >
                                    English Copy
                                </button>
                            </div>

                            {/* Dynamic AI Summary paragraph */}
                            <div className="p-3.5 rounded-2xl mb-3 bg-[#FFFBF7] border border-[#F3E2D5]">
                                <p className="text-xs text-[#5A2E12] leading-relaxed font-medium">
                                    {activeTab === "hindi" ? summaryHi : summaryEn}
                                </p>
                            </div>

                            {/* ── Tabular Specifications ── */}
                            <div 
                                className="rounded-2xl overflow-hidden shadow-xs border" 
                                style={{ borderColor: "rgba(196,136,107,0.25)", background: "#FFFBF7" }}
                            >
                                <div className="px-3.5 py-2.5 border-b flex items-center justify-between bg-[#F8EDE5]" style={{ borderColor: "rgba(196,136,107,0.2)" }}>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B3A2A]">
                                        {activeTab === "hindi" ? "📋 उत्पाद विवरण (SPECS)" : "📋 Product Details"}
                                    </span>
                                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300">
                                        ONDC सत्यापित
                                    </span>
                                </div>

                                <div className="divide-y text-xs" style={{ borderColor: "rgba(196,136,107,0.15)" }}>
                                    {(activeTab === "hindi" 
                                        ? (data?.specs_hi || [
                                            { label: "कला / शिल्प", value: titleHi },
                                            { label: "सामग्री", value: "प्राकृतिक हस्तशिल्प सामग्री" },
                                            { label: "उपयोग", value: "सजावट एवं उपहार" }
                                        ])
                                        : (data?.specs_en || [
                                            { label: "Craft Form", value: titleEn },
                                            { label: "Material", value: "Natural Artisanal Material" },
                                            { label: "Best For", value: "Home Decor & Gifting" }
                                        ])
                                    ).map((spec: { label: string; value: string }, idx: number) => (
                                        <div 
                                            key={idx} 
                                            className="grid grid-cols-12 px-3.5 py-2.5 items-center"
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
                            <p className="text-xs font-semibold uppercase tracking-widest mb-2 mt-4 text-[#9C6644]">
                                AI-Generated Tags
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag: string) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 rounded-full text-xs font-medium bg-[#F5EDE6] text-[#6B3A2A] border border-[#E0CCBE]"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Bottom Bar */}
                <div
                    className="absolute bottom-0 left-0 right-0 flex-shrink-0 px-4 pt-3 pb-7"
                    style={{
                        background: "linear-gradient(to top, #FFFBF7 75%, transparent)",
                    }}
                >
                    {published ? (
                        <div
                            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                        >
                            ✓ ONDC नेटवर्क पर प्रकाशित!
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onBack}
                                className="w-28 py-3.5 rounded-2xl font-bold text-sm border-2 border-[#6B3A2A] text-[#6B3A2A] active:scale-95 transition"
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setPublished(true);
                                    setTimeout(() => onCheckout?.(), 600);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-sm text-white shadow-lg active:scale-[0.98] transition"
                                style={{
                                    background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                                }}
                            >
                                🚀 Approve &amp; Publish
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}