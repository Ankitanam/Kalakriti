import React, { useState } from "react";
import { useLanguage } from "./context/LanguageContext";
import { getDisplayTitle, getLocalizedProductContent, LocalizedContentMap } from "./utils/artisanAiService";

export interface CatalogData {
  title_hi: string;
  title_en: string;
  title_local?: string;
  suggested_price: number;
  imageUrl?: string;
  imageSignature?: string;
  artisan_name?: string;
  artisan_region?: string;
  quick_summary_hi?: string;
  quick_summary_en?: string;
  quick_summary_local?: string;
  story_hi?: string;
  story_en?: string;
  story_local?: string;
  highlights_hi?: string[];
  highlights_en?: string[];
  highlights_local?: string[];
  specs_hi?: Array<{ label: string; value: string }>;
  specs_en?: Array<{ label: string; value: string }>;
  specs_local?: Array<{ label: string; value: string }>;
  tags?: string[];
  language?: string;
  localizedContent?: LocalizedContentMap;
}

export interface CatalogPreviewProps {
  data: CatalogData;
  onBack: () => void;
  onCheckout: () => void;
  onEdit?: () => void;
}

export default function CatalogPreview({
  data,
  onBack,
  onCheckout,
  onEdit,
}: CatalogPreviewProps) {
  const { t, currentLang, languages } = useLanguage();
  const activeLangMeta = languages?.find((l) => l.code === currentLang) || {
    code: "hi",
    nativeName: "हिन्दी",
    englishName: "Hindi",
    speechLang: "hi-IN",
  };

  const isNative = currentLang !== "en";
  const localized = getLocalizedProductContent(data, currentLang);

  return (
    <div
      className="size-full flex items-center justify-center"
      style={{ background: "#EDE0D4", fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Mobile Shell */}
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
        {/* Status Bar */}
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
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition cursor-pointer"
            style={{ background: "rgba(255,255,255,0.12)" }}
            title={t("go_back")}
            aria-label={t("go_back")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex-1">
            <h1
              className="text-xl font-bold text-white tracking-wide"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              {t("preview_listing")}
            </h1>
            <p className="text-xs text-white/70 -mt-0.5">Kalakriti AI Catalog</p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
          style={{ scrollbarWidth: "none", paddingBottom: 110 }}
        >
          {/* ========================================================================= */}
          {/* 📸 1. मुख्य अपलोड की गई फोटो (HERO PRODUCT IMAGE)                        */}
          {/* ========================================================================= */}
          <div className="relative w-full h-64 rounded-3xl overflow-hidden shadow-md bg-stone-100 border border-[#C4886B]/30 flex-shrink-0">
            <img
              src={data.imageUrl || "https://images.unsplash.com/photo-1604264726154-26480e76f4e1?w=500"}
              alt={data.title_en || "Product Preview"}
              className="w-full h-full object-cover"
            />
            {/* AI Enhanced Badge */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-[#6B3A2A] shadow-xs flex items-center gap-1.5 border border-[#C4886B]/20">
              <span>{t("ai_enhanced_photo")}</span>
            </div>
            {/* ONDC Certified Badge */}
            <div className="absolute top-3 right-3 bg-emerald-700 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs flex items-center gap-1">
              <span>{t("ondc_verified_badge")}</span>
            </div>
            {/* Region Tag */}
            {data.artisan_region && (
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs font-medium px-3 py-1 rounded-full">
                📍 {data.artisan_region}
              </div>
            )}
          </div>

          {/* 🏷️ Product Title Card (Prominent Localized Craft Name) */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#C4886B]/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B4513]">
                {activeLangMeta.nativeName} Craft
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                ONDC Verified
              </span>
            </div>
            <h3
              className="text-base font-bold text-[#3D1F0F] leading-snug"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              {localized.title || getDisplayTitle(data, currentLang)}
            </h3>
            {isNative && data.title_en && (
              <p className="text-[11px] text-[#8B4513] font-medium pt-0.5">
                {data.title_en}
              </p>
            )}
          </div>

          {/* 2. Artisan Trust Header */}
          <div className="flex items-center justify-between py-1 border-b border-[#C4886B]/20">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs"
                style={{ background: "#6B3A2A" }}
              >
                {data.artisan_name ? data.artisan_name[0] : (localized.artisan_name ? localized.artisan_name[0] : "K")}
              </div>
              <div>
                <p className="text-xs font-bold text-[#3D1F0F]">
                  {data.artisan_name || localized.artisan_name || t("craft_artisan_default")} · {data.artisan_region || localized.artisan_region || t("craft_region_default")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold">
              <span>★★★★☆</span>
              <span className="text-stone-600 text-[11px]">4.0</span>
            </div>
          </div>

          {/* 3. Price Card */}
          <div
            className="rounded-2xl p-4 flex items-center justify-between shadow-xs border"
            style={{
              background: "#FFF",
              borderColor: "rgba(196,136,107,0.3)",
            }}
          >
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#3D1F0F]">
                  ₹{data.suggested_price}
                </span>
                <span className="text-sm text-stone-400 line-through">
                  ₹{Math.round((Number(data.suggested_price) || 199) * 1.6)}
                </span>
              </div>
              <p className="text-[11px] text-[#8B4513] mt-0.5 font-medium">
                Incl. of all taxes · Free delivery
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2 text-center">
              <span className="text-sm font-extrabold text-emerald-800 block leading-tight">
                {t("savings_badge")}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                {t("direct_artisan_benefit")}
              </span>
            </div>
          </div>

          {/* 4. Unified Single-Language Description Header */}
          <div
            className="px-4 py-2.5 rounded-2xl flex items-center justify-between border shadow-2xs"
            style={{
              background: "#F5EBE1",
              borderColor: "rgba(196,136,107,0.25)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">📜</span>
              <span className="text-xs font-bold text-[#6B3A2A]" style={{ fontFamily: "'Noto Serif', serif" }}>
                {t("artisan_description_tab")}
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
              {t("ondc_verified_badge")}
            </span>
          </div>

          {/* 5. Quick Headline Hook */}
          <div
            className="p-3.5 rounded-2xl border bg-white"
            style={{ borderColor: "rgba(196,136,107,0.3)" }}
          >
            <p
              className="text-xs font-semibold text-[#3D1F0F] leading-relaxed"
              style={{ fontFamily: isNative ? "'Noto Serif', serif" : "'Poppins', sans-serif" }}
            >
              {localized.quick_summary || (isNative ? "पारंपरिक तकनीकों द्वारा हस्तनिर्मित प्रामाणिक भारतीय शिल्प।" : "Authentic handmade Indian handicraft crafted using generational techniques.")}
            </p>
          </div>

          {/* 6. 🏺 विरासत व शिल्प कथा (The Heritage Story) */}
          <div
            className="rounded-2xl p-4 border relative overflow-hidden space-y-2 shadow-xs"
            style={{
              background: "linear-gradient(135deg, #FFF8F2 0%, #FDF2E7 100%)",
              borderColor: "#E6C5B0",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🏺</span>
              <h4
                className="text-xs font-bold uppercase tracking-wider text-[#6B3A2A]"
                style={{ fontFamily: "'Noto Serif', serif" }}
              >
                {isNative ? t("heritage_story_title") : "Heritage & Craft Legacy"}
              </h4>
            </div>

            <p className="text-xs text-[#522919] leading-relaxed font-normal">
              {localized.story}
            </p>
          </div>

          {/* 7. ✨ शिल्प की मुख्य विशेषताएं (Key Highlights) */}
          <div
            className="rounded-2xl p-4 border bg-white space-y-2.5 shadow-xs"
            style={{ borderColor: "rgba(196,136,107,0.3)" }}
          >
            <h4
              className="text-xs font-bold uppercase tracking-wider text-[#8B4513] flex items-center gap-1.5"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              <span>✨</span>
              <span>{isNative ? t("key_highlights_title") : "Craft Highlights"}</span>
            </h4>

            <div className="space-y-1.5">
              {(localized.highlights && localized.highlights.length > 0 ? localized.highlights : (isNative ? ["100% हस्तनिर्मित एवं पर्यावरण-अनुकूल", "पारंपरिक शिल्पकारों द्वारा प्रामाणिक निर्माण", "गृह सज्जा, पूजा एवं सांस्कृतिक उपहार हेतु उपयुक्त"] : ["100% Handcrafted from organic, sustainable materials", "Direct from generational rural artisan clusters", "Ideal for aesthetic home decor & mindful gifting"])).map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[#3D1F0F]">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 8. 📋 विनिर्देश तालिका (Specifications Table) */}
          <div
            className="rounded-2xl overflow-hidden border bg-white shadow-xs"
            style={{ borderColor: "rgba(196,136,107,0.3)" }}
          >
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAF3EC] border-b border-[#C4886B]/20">
              <span
                className="text-xs font-bold text-[#3D1F0F] flex items-center gap-1.5"
                style={{ fontFamily: "'Noto Serif', serif" }}
              >
                <span>📋</span>
                <span>{isNative ? t("specs_table_title") : "Product Specifications"}</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                {t("ondc_verified_badge")}
              </span>
            </div>

            <div className="divide-y divide-[#C4886B]/15 text-xs">
              {(localized.specs && localized.specs.length > 0 ? localized.specs : (data.specs_en || []))?.map((spec, index) => (
                <div key={index} className="grid grid-cols-2 px-4 py-2.5">
                  <span className="font-semibold text-[#8B4513]">{spec.label}</span>
                  <span className="text-[#3D1F0F] font-medium text-right">{spec.value}</span>
                </div>
              )) || (
                <div className="px-4 py-3 text-center text-xs text-stone-500">
                  {t("specs_not_available")}
                </div>
              )}
            </div>
          </div>

          {/* 9. AI-Generated Tags */}
          <div className="space-y-2 pt-1">
            <p className="text-[10px] font-bold text-[#9C6644] uppercase tracking-wider">
              AI-GENERATED TAGS
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.tags && data.tags.length > 0 ? (
                data.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full text-xs font-medium border bg-[#FAF5EE] text-[#6B3A2A]"
                    style={{ borderColor: "rgba(196,136,107,0.35)" }}
                  >
                    #{tag.replace(/^#/, "")}
                  </span>
                ))
              ) : (
                <>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-[#FAF5EE] text-[#6B3A2A] border-[#C4886B]/35">
                    #Handmade
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-[#FAF5EE] text-[#6B3A2A] border-[#C4886B]/35">
                    #Kalakriti
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-[#FAF5EE] text-[#6B3A2A] border-[#C4886B]/35">
                    #ONDC Verified
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div
          className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-4 flex gap-3 flex-shrink-0"
          style={{ background: "linear-gradient(to top, #FFFBF7 85%, transparent)" }}
        >
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="py-3.5 px-5 rounded-2xl font-bold text-xs border text-[#6B3A2A] bg-white active:scale-95 transition cursor-pointer shadow-xs"
              style={{ borderColor: "rgba(196,136,107,0.5)" }}
            >
              {t("edit_button")}
            </button>
          )}
          <button
            type="button"
            onClick={onCheckout}
            className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-xs text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
              boxShadow: "0 8px 24px rgba(107,58,42,0.3)",
            }}
          >
            <span>🚀</span>
            <span>{t("approve_and_publish")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}