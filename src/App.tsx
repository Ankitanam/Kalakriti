
import { useLanguage, TranslationKey } from "./context/LanguageContext";
import { useState, useRef, useEffect } from "react";
import CatalogPreview, { CatalogData } from "./CatalogPreview";
import OnboardingScreen from "./OnboardingScreen";
import ArtisanDashboard, { OrderItem } from "./ArtisanDashboard";
import OndcBuyerScreen from "./OndcBuyerScreen";
import ConfirmationModal from "./components/ConfirmationModal";
import { LanguageDropdown } from "./components/LanguageDropdown";
import { CartItem, ConfirmedOrder } from "./utils/becknEngine";
import { areItemsDuplicate, extractCoreKeyword, getDisplayTitle, getLocalizedProductContent, KNOWN_CRAFT_LOCALIZATIONS, LocalizedContentMap } from "./utils/artisanAiService";
import { MicPulseRing, AiScannerOverlay, PageTransition, AnimatedNumber } from "./components/motion/MotionPrimitives";
import { uploadToCloudinaryWithBgRemoval, getCloudinaryTransparentUrl } from "./utils/imageService";
import GameWorld from "./components/GameWorld";
import { TiltCard } from "./components/MouseParallax";
import {
  useBuyerGamification,
  awardXp,
  recordCraftDiscovery,
  recordFairEntry,
  BADGE_DEFINITIONS,
  getLocalizedLevelTitle,
  getLocalizedBadge,
  getLocalizedQuest,
  getNextLevelInfo,
} from "./utils/gamificationService";

// Craft Categories
const CATEGORIES: Array<{ hi: string; en: string; key: TranslationKey }> = [
  { hi: "चित्रकारी", en: "Painting", key: "cat_painting" },
  { hi: "मिट्टी", en: "Pottery", key: "cat_pottery" },
  { hi: "बुनाई", en: "Weaving", key: "cat_weaving" },
  { hi: "लकड़ी", en: "Wood", key: "cat_wood" },
  { hi: "आभूषण", en: "Jewellery", key: "cat_jewellery" },
  { hi: "कढ़ाई", en: "Embroidery", key: "cat_embroidery" },
];

export interface StoreItem extends CatalogData {
  id: string;
  quantity: number;
  publishedAt?: string;
  categoryName?: string;
  category?: string;
}

const INITIAL_SEED: StoreItem[] = [
  {
    id: "seed-1",
    title_hi: "राजस्थानी पारंपरिक कठपुतली जोड़ा",
    title_en: "Rajasthani Traditional Handmade Puppets Pair",
    title_local: "राजस्थानी पारंपरिक हस्तनिर्मित बाहुल्यांची जोडी (कठपुतळी)",
    suggested_price: 349,
    quantity: 3,
    categoryName: "Woodcraft",
    category: "Woodcraft",
    imageUrl: "https://images.unsplash.com/photo-1599818471241-10515152865c?w=500",
    imageSignature: "rajasthani_puppet_pair_seed",
    artisan_name: "शंकर लाल भाट",
    artisan_region: "जयपुर, राजस्थान",
    quick_summary_hi: "कपड़े और लकड़ी से हस्तनिर्मित पारंपरिक राजस्थानी कठपुतली।",
    quick_summary_local: "कापड आणि लाकडापासून बनवलेली अस्सल पारंपरिक राजस्थानी कठपुतळी बाहुली.",
    quick_summary_en: "Authentic handcrafted traditional Rajasthani decorative puppet pair.",
    story_hi: "यह शिल्प राजस्थान की प्राचीन लोक कला और कठपुतली परंपरा की समृद्ध विरासत को दर्शाता है।",
    story_local: "ही हस्तकला राजस्थानच्या प्राचीन लोककलेचा आणि पिढ्यानपिढ्या चालत आलेल्या कठपुतळी परंपरेचा समृद्ध वारसा दर्शवते.",
    story_en: "This craft celebrates centuries of Rajasthani folk heritage and generational puppet theatre artistry.",
    specs_hi: [
      { label: "कला शैली", value: "राजस्थानी कठपुतली शिल्प" },
      { label: "सामग्री", value: "लकड़ी, गोटा-पट्टी व कपड़ा" },
      { label: "आकार", value: "ऊंचाई लगभग 12 इंच" },
      { label: "उपयोग", value: "गृह सज्जा, सांस्कृतिक उपहार" },
    ],
    specs_local: [
      { label: "कला शैली", value: "राजस्थानी कठपुतळी शिल्प" },
      { label: "साहित्य", value: "लाकूड, गोटा-पट्टी व अस्सल कापड" },
      { label: "आकार", value: "उंची साधारण १२ इंच" },
      { label: "वापर", value: "घर सजावट, सांस्कृतिक भेट" },
    ],
    specs_en: [
      { label: "Craft Type", value: "Rajasthani Puppet Craft" },
      { label: "Material", value: "Wood, Traditional Fabrics & Lace" },
      { label: "Size", value: "Height approx. 12 inches" },
      { label: "Best For", value: "Home Aesthetics, Cultural Gifting" },
    ],
    tags: ["Puppets", "Rajasthan", "ONDC Ready"],
    publishedAt: "आज",
    localizedContent: KNOWN_CRAFT_LOCALIZATIONS.puppet,
  },
  {
    id: "seed-2",
    title_hi: "सजावटी हस्तनिर्मित लाल मिट्टी का कलश",
    title_en: "Decorative Handcrafted Red Terracotta Kalash",
    title_local: "सजावटी हस्तनिर्मित लाल मातीचा कलश (घडा)",
    suggested_price: 199,
    quantity: 5,
    categoryName: "Pottery",
    category: "Pottery",
    imageUrl: "https://images.unsplash.com/photo-1604264726154-26480e76f4e1?w=500",
    imageSignature: "red_terracotta_kalash_seed",
    artisan_name: "रमेश प्रजापति",
    artisan_region: "अलवर, राजस्थान",
    quick_summary_hi: "पारंपरिक लाल मिट्टी से बना सुंदर सजावटी कलश।",
    quick_summary_local: "पारंपरिक लाल मातीपासून तयार केलेला सुंदर आणि नक्षीदार कलश.",
    quick_summary_en: "Traditional red clay pot with stone and zari embellishments.",
    story_hi: "शुद्ध प्राकृतिक मिट्टी से कुम्हार के चाक पर गढ़ा गया यह कलश भारतीय परंपरा और पवित्रता का प्रतीक है।",
    story_local: "शुद्ध नैसर्गिक मातीपासून कुंभाराच्या चाकावर घडवलेला हा कलश भारतीय संस्कृती आणि मांगल्याचे प्रतीक आहे.",
    story_en: "Masterfully shaped from pure earthen clay on the traditional potter's wheel, embodying sustainable living.",
    specs_hi: [
      { label: "कला शैली", value: "पारंपरिक टेराकोटा" },
      { label: "सामग्री", value: "100% शुद्ध लाल मिट्टी" },
      { label: "आकार", value: "मध्यम (ऊंचाई ~7 इंच)" },
      { label: "उपयोग", value: "गृह सज्जा, पूजा, त्यौहार" },
    ],
    specs_local: [
      { label: "कला शैली", value: "पारंपरिक टेराकोटा मातीकाम" },
      { label: "साहित्य", value: "१००% शुद्ध लाल माती" },
      { label: "आकार", value: "मध्यम (उंची ~७ इंच)" },
      { label: "वापर", value: "घर सजावट, पूजा व सण" },
    ],
    specs_en: [
      { label: "Craft Type", value: "Terracotta Pottery" },
      { label: "Material", value: "Pure Red Clay" },
      { label: "Size", value: "Medium (~7 inches)" },
      { label: "Best For", value: "Festive Decor, Gifting" },
    ],
    tags: ["Terracotta", "Handmade", "ONDC Ready"],
    publishedAt: "आज",
    localizedContent: KNOWN_CRAFT_LOCALIZATIONS.kalash,
  },
];

const parseSafeQty = (val: any, defaultVal = 1): number => {
  if (val === undefined || val === null || val === "") return defaultVal;
  const num = Number(val);
  return isNaN(num) ? defaultVal : Math.max(0, num);
};

const deduplicateInventory = (items: StoreItem[]): StoreItem[] => {
  const merged: StoreItem[] = [];
  for (const item of items) {
    const existing = merged.find((m) => areItemsDuplicate(m, item));
    if (existing) {
      existing.quantity = Math.max(0, parseSafeQty(existing.quantity, 0) + parseSafeQty(item.quantity, 1));
      if (item.imageUrl && (!existing.imageUrl || existing.imageUrl.startsWith("blob:"))) {
        existing.imageUrl = item.imageUrl;
      }
      if (item.imageSignature && !existing.imageSignature) {
        existing.imageSignature = item.imageSignature;
      }
      if (item.localizedContent) {
        existing.localizedContent = {
          ...(existing.localizedContent || {}),
          ...item.localizedContent,
        };
      }
    } else {
      if (item.id === "seed-1" && !item.localizedContent) {
        item.localizedContent = KNOWN_CRAFT_LOCALIZATIONS.puppet;
      } else if (item.id === "seed-2" && !item.localizedContent) {
        item.localizedContent = KNOWN_CRAFT_LOCALIZATIONS.kalash;
      }
      merged.push({ ...item, quantity: parseSafeQty(item.quantity, 1) });
    }
  }
  return merged;
};

interface MarketplaceProps {
  inventory: StoreItem[];
  onEnterFair: () => void;
  onBack: () => void;
  onAddToCart?: (item: StoreItem) => void;
}

function Marketplace({ inventory, onEnterFair, onBack, onAddToCart }: MarketplaceProps) {
  const { t, currentLang } = useLanguage();
  const gamification = useBuyerGamification();
  const [selectedDetailItem, setSelectedDetailItem] = useState<StoreItem | null>(null);
  const [showGamificationModal, setShowGamificationModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const availableProducts = inventory.filter((item) => item.quantity > 0);

  const handleQuickAdd = (item: StoreItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const liveItem = inventory.find((i) => i.id === item.id) || item;
    const available = Math.max(0, Number(liveItem.quantity ?? 0));
    if (available <= 0) {
      setToastMessage(currentLang === "hi" ? "यह उत्पाद आउट ऑफ स्टॉक है" : "This product is out of stock");
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    const localized = getLocalizedProductContent(item, currentLang);
    if (onAddToCart) {
      onAddToCart(item);
    } else {
      try {
        const saved = localStorage.getItem("kalakriti_cart");
        const currentCart: CartItem[] = saved ? JSON.parse(saved) : [];
        const existing = currentCart.find((c) => c.product.id === item.id);
        if (existing && existing.quantity >= available) {
          setToastMessage(currentLang === "hi" ? `अधिकतम उपलब्ध स्टॉक: ${available}` : `Maximum available stock: ${available}`);
          setTimeout(() => setToastMessage(null), 2500);
          return;
        }
        let updated: CartItem[];
        if (existing) {
          updated = currentCart.map((c) =>
            c.product.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
          );
        } else {
          updated = [...currentCart, { product: item, quantity: 1 }];
        }
        localStorage.setItem("kalakriti_cart", JSON.stringify(updated));
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        console.warn("Cart add error:", err);
      }
    }
    awardXp(50, "Added craft from Marketplace");
    recordCraftDiscovery(item.categoryName || item.title_en || item.title_hi);
    setToastMessage(`✓ Added "${localized.title}" to cart! (+50 XP)`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div
      className="size-full flex items-center justify-center"
      style={{ background: "#EDE9FE", fontFamily: "'Poppins', sans-serif" }}
    >
      <div
        className="relative flex flex-col overflow-hidden bg-[#F8F3ED] text-stone-900"
        style={{
          width: "min(390px, 100vw)",
          height: "min(844px, 100vh)",
          borderRadius: "clamp(0px, 2vw, 28px)",
          boxShadow: "0 25px 60px rgba(76, 29, 149, 0.22)",
        }}
      >
        {/* Status Bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1 text-white bg-[#5B21B6] text-xs font-semibold select-none flex-shrink-0">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-5 h-2.5 border border-white/80 rounded-xs p-0.5">
              <div className="h-full bg-white w-3/4 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* ── HEADER (2 Rows, Non-Colliding Responsive Architecture) ── */}
        <header className="bg-[#5B21B6] px-3.5 py-2 text-white shadow-md flex-shrink-0">
          {/* Row 1: Back + Brand + Language Dropdown */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onBack}
              className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold hover:bg-white/25 transition cursor-pointer flex items-center gap-1 flex-shrink-0 active:scale-95"
              title="Return to Customer Screen"
            >
              <span>{t("marketplace_back_customer")}</span>
            </button>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base">🛍️</span>
              <div className="min-w-0">
                <p className="text-[8px] uppercase tracking-wider text-white/70 leading-none">Kalakriti</p>
                <h1 className="text-xs font-black leading-tight truncate">Marketplace</h1>
              </div>
            </div>

            <div className="flex-shrink-0">
              <LanguageDropdown theme="buyer" />
            </div>
          </div>

          {/* Row 2: Level & XP Pill + Quests Trigger */}
          <div className="mt-1.5 pt-1.5 border-t border-white/15 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowGamificationModal(true)}
              className="flex items-center gap-1 bg-amber-400/25 hover:bg-amber-400/35 text-amber-200 border border-amber-300/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition active:scale-95 shadow-xs"
              title="View Explorer Quests & Badges"
            >
              <span>✨</span>
              <span className="text-white font-extrabold">{t("gamification_level")} {gamification.level}</span>
              <span className="opacity-90">({gamification.xp} {t("gamification_xp")})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowGamificationModal(true)}
              className="flex items-center gap-1 text-[10px] font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full transition cursor-pointer active:scale-95"
            >
              <span>🏆</span>
              <span>{t("marketplace_craft_explorer_quests")} ({gamification.badges.length})</span>
            </button>
          </div>
        </header>

        {/* ── Toast Alert ── */}
        {toastMessage && (
          <div className="absolute top-20 left-3 right-3 z-40 bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <span>🎉</span>
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

        {/* ── MAIN SCROLLABLE CONTENT ── */}
        <main className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3">
          {/* Hero Banner */}
          <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-violet-900 to-purple-700 p-3.5 text-white shadow-md relative">
            <div className="relative z-10">
              <p className="text-[9px] font-bold uppercase tracking-widest text-amber-300">
                {t("marketplace_ondc_ready")} • Indian Crafts
              </p>
              <h2 className="mt-1 text-sm font-black leading-tight">
                {t("marketplace_hero_subtitle")}
              </h2>
              <p className="mt-1 text-white/85 text-[11px] leading-relaxed">
                {t("marketplace_hero_desc")}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onEnterFair}
                  className="rounded-xl bg-white px-3 py-1.5 font-bold text-violet-900 shadow-md hover:bg-amber-50 active:scale-95 transition flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <span>🎪</span>
                  <span>{t("enter_fair_btn")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowGamificationModal(true)}
                  className="rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-2.5 py-1.5 font-semibold text-white transition cursor-pointer flex items-center gap-1 text-xs"
                >
                  <span>🏆</span>
                  <span>{t("marketplace_craft_explorer_quests")}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Section Header */}
          <div className="flex items-center justify-between px-0.5">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-violet-700">
                {t("marketplace_ondc_ready")}
              </p>
              <h3 className="text-sm font-black text-stone-900 leading-tight">
                {t("marketplace_featured_crafts")}
              </h3>
            </div>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-stone-700 shadow-xs border border-stone-200">
              {availableProducts.length} {t("marketplace_products_count")}
            </span>
          </div>

          {/* Product Grid (2 columns on mobile, touch-friendly, localized) */}
          <div className="grid grid-cols-2 gap-2.5">
            {availableProducts.map((item) => {
              const localized = getLocalizedProductContent(item, currentLang);
              return (
                <TiltCard
                  key={item.id}
                  maxTilt={8}
                  scale={1.01}
                  className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-xs border border-stone-200 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  onClick={() => {
                    setSelectedDetailItem(item);
                    recordCraftDiscovery(item.categoryName || item.title_en || item.title_hi);
                  }}
                >
                  <div className="aspect-square bg-stone-100 overflow-hidden relative group">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={localized.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">🎨</div>
                    )}
                    <span className="absolute top-1.5 right-1.5 rounded-full bg-black/60 backdrop-blur-xs px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">
                      {t("marketplace_handmade_tag")}
                    </span>
                  </div>
                  <div className="p-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="line-clamp-2 font-bold text-stone-900 text-xs leading-snug">
                        {localized.title}
                      </h4>
                      <p className="mt-1 text-[9px] text-stone-500 flex items-center gap-1 truncate">
                        <span>📍</span>
                        <span>{item.artisan_region || "India"}</span>
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-stone-100">
                      <div>
                        <span className="text-xs font-black text-stone-900">₹{item.suggested_price}</span>
                        <p className="text-[8px] font-semibold text-emerald-700">
                          {t("marketplace_in_stock")} ({item.quantity})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(item, e)}
                        className="rounded-lg bg-violet-700 hover:bg-violet-800 text-white px-2 py-1 text-[10px] font-bold shadow-xs transition active:scale-95 cursor-pointer"
                        title="Add to ONDC Cart (+ Cart)"
                      >
                        {t("marketplace_add_cart")} {/* + Cart */}
                      </button>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>

          {/* Safe scroll spacing so bottom products are never obscured */}
          <div className="h-16" />
        </main>

        {/* ── PRODUCT DETAILS MODAL (In-Shell) ── */}
        {selectedDetailItem && (() => {
          const detail = getLocalizedProductContent(selectedDetailItem, currentLang);
          return (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
              <div className="bg-white rounded-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto shadow-2xl p-4 relative animate-in fade-in zoom-in-95 duration-200">
                <button
                  type="button"
                  onClick={() => setSelectedDetailItem(null)}
                  className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold flex items-center justify-center cursor-pointer text-xs"
                >
                  ✕
                </button>

                <div className="aspect-video w-full rounded-xl overflow-hidden bg-stone-100 mb-3">
                  {selectedDetailItem.imageUrl ? (
                    <img
                      src={selectedDetailItem.imageUrl}
                      alt={detail.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🎨</div>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
                      {selectedDetailItem.artisan_name || "Indian Master Artisan"} • {selectedDetailItem.artisan_region || "India"}
                    </p>
                    <h3 className="text-base font-black text-stone-900 mt-0.5">
                      {detail.title}
                    </h3>
                  </div>

                  <p className="text-stone-600 text-xs leading-relaxed">
                    {detail.story || detail.quick_summary || "Handcrafted with generational mastery using traditional indigenous methods."}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <div>
                      <span className="text-lg font-black text-stone-900">
                        ₹{selectedDetailItem.suggested_price}
                      </span>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        {t("marketplace_in_stock")}: {selectedDetailItem.quantity}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleQuickAdd(selectedDetailItem);
                        setSelectedDetailItem(null);
                      }}
                      className="rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-bold px-4 py-2 text-xs shadow-md active:scale-95 transition cursor-pointer"
                    >
                      {t("marketplace_add_cart")} 🛒
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── GAMIFICATION QUESTS & BADGES MODAL (In-Shell) ── */}
        {showGamificationModal && (
          <div
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in"
            onClick={() => setShowGamificationModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-sm w-full p-4 max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-200 animate-modal-enter"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">🏆</span>
                  <div>
                    <h3 className="font-black text-stone-900 text-sm">
                      {t("gamification_quests")}
                    </h3>
                    <p className="text-[10px] text-stone-500">
                      {t("gamification_support_rural")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGamificationModal(false)}
                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Level Progress */}
              {(() => {
                const nextInfo = getNextLevelInfo(gamification.level, gamification.xp, t);
                const xpToNextText = t("gamification_xp_to_next")
                  .replace("{count}", String(nextInfo.xpRemaining))
                  .replace("{level}", String(nextInfo.nextLevel));

                return (
                  <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-950 text-white shadow-md border border-purple-800/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-purple-200/90">
                          {t("gamification_level")} {gamification.level}
                        </span>
                        <h4 className="text-base font-black text-amber-300 drop-shadow-xs">
                          {getLocalizedLevelTitle(gamification.level, t)}
                        </h4>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-amber-300 flex items-center justify-end gap-1">
                          <AnimatedNumber value={gamification.xp} />
                          <span className="text-xs font-bold text-white/80">{t("gamification_xp")}</span>
                        </div>
                        <span className="text-[9px] text-purple-200/90 font-medium">
                          {xpToNextText}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2.5">
                      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-amber-300 h-full rounded-full transition-all duration-500 shadow-xs"
                          style={{
                            width: `${nextInfo.progressPercent}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-white/75 mt-1.5 font-medium">
                        <span>{nextInfo.progressPercent}%</span>
                        <span className="truncate max-w-[70%] text-right">
                          <span className="text-amber-200/90 font-semibold">{t("gamification_next_level_label")}</span> {nextInfo.nextLevelTitle} ({t("gamification_level")} {nextInfo.nextLevel})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Discovery Quests */}
              <div className="mt-3.5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>{t("gamification_quests")}</span>
                  </h4>
                  <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                    {gamification.quests.filter((q) => q.completed).length} / {gamification.quests.length} {t("gamification_completed")}
                  </span>
                </div>

                <div className="space-y-2">
                  {gamification.quests.map((q) => {
                    const localizedQ = getLocalizedQuest(q, t);
                    return (
                      <div
                        key={q.id}
                        className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2.5 ${
                          q.completed
                            ? "bg-emerald-50/80 border-emerald-300/80 text-emerald-950 shadow-xs"
                            : "bg-stone-50 border-stone-200/90 text-stone-800"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold truncate">{localizedQ.title}</span>
                            {q.completed ? (
                              <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                                <span>✓</span>
                                <span>{t("gamification_completed")}</span>
                              </span>
                            ) : (
                              <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.5 rounded border border-purple-200">
                                +{q.xpReward} {t("gamification_xp")}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">{localizedQ.description}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className={`text-[11px] font-black px-2 py-1 rounded-lg ${
                            q.completed ? "bg-emerald-100/70 text-emerald-800" : "bg-stone-200/70 text-stone-700"
                          }`}>
                            {q.current} / {q.target}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Badges Section */}
              <div className="mt-3.5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <span>🎖️</span>
                    <span>{t("gamification_earned_badges")}</span>
                  </h4>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {gamification.badges.length} / {Object.keys(BADGE_DEFINITIONS).length}
                  </span>
                </div>

                {/* Earned Badges */}
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(BADGE_DEFINITIONS)
                    .filter((badge) => gamification.badges.includes(badge.id))
                    .map((badge) => {
                      const localizedBadge = getLocalizedBadge(badge.id, t);
                      return (
                        <div
                          key={badge.id}
                          className="p-2.5 rounded-xl border bg-amber-50/80 border-amber-300 shadow-xs flex flex-col justify-between"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-xl drop-shadow-xs">{badge.icon}</span>
                            <span className="text-[11px] font-black text-amber-950 leading-tight truncate">
                              {localizedBadge.name}
                            </span>
                          </div>
                          <p className="text-[9px] text-amber-800/80 mt-1 line-clamp-2 leading-tight">
                            {localizedBadge.description}
                          </p>
                        </div>
                      );
                    })}
                </div>

                {/* Locked Badges */}
                {Object.values(BADGE_DEFINITIONS).some((badge) => !gamification.badges.includes(badge.id)) && (
                  <div className="mt-2.5">
                    <h5 className="text-[9px] font-bold uppercase tracking-wider text-stone-400 mb-1.5 flex items-center gap-1">
                      <span>🔒</span>
                      <span>{t("gamification_locked")}</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(BADGE_DEFINITIONS)
                        .filter((badge) => !gamification.badges.includes(badge.id))
                        .map((badge) => {
                          const localizedBadge = getLocalizedBadge(badge.id, t);
                          return (
                            <div
                              key={badge.id}
                              className="p-2 rounded-xl border bg-stone-50 border-stone-200/70 opacity-60 flex flex-col justify-between"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-base grayscale opacity-60">🔒 {badge.icon}</span>
                                <span className="text-[10px] font-bold text-stone-600 leading-tight truncate">
                                  {localizedBadge.name}
                                </span>
                              </div>
                              <p className="text-[8.5px] text-stone-400 mt-1 line-clamp-2 leading-tight">
                                {localizedBadge.description}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowGamificationModal(false);
                    onEnterFair();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs transition cursor-pointer"
                >
                  {t("enter_fair_btn")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGamificationModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer"
                >
                  {t("marketplace_close")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerSide({
  inventory,
  onOrderConfirmed,
  onLogout,
  onEnterFair,
}: {
  inventory: StoreItem[];
  onOrderConfirmed: (order: ConfirmedOrder, cart: CartItem[]) => void;
  onLogout: () => void;
  onEnterFair?: () => void;
}) {
  return (
    <OndcBuyerScreen
      inventory={inventory}
      onOrderConfirmed={onOrderConfirmed}
      onLogout={onLogout}
      onEnterFair={onEnterFair}
    />
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem("artisan_logged_in") === "true";
    } catch {
      return false;
    }
  });

  const [activeRole, setActiveRole] = useState<"seller" | "buyer">(() => {
    try {
      return (localStorage.getItem("user_role") as "seller" | "buyer") || "seller";
    } catch {
      return "seller";
    }
  });

  const [screen, setScreen] = useState<
  "onboarding" | "capture" | "preview" | "dashboard" | "buyer" | "marketplace"
>(() => {
    try {
      const loggedIn = localStorage.getItem("artisan_logged_in") === "true";
      const savedRole = localStorage.getItem("user_role");
      if (!loggedIn) return "onboarding";
      return savedRole === "buyer" ? "buyer" : "dashboard";
    } catch {
      return "onboarding";
    }
  });
  const [showGame, setShowGame] = useState(false);

  // ── Inventory State (डी-डुप्लीकेशन के साथ ऑटो-क्लीन) ──
  const [inventory, setInventory] = useState<StoreItem[]>(() => {
    try {
      const saved = localStorage.getItem("kalakriti_inventory");
      const raw = saved ? JSON.parse(saved) : INITIAL_SEED;
      const clean = deduplicateInventory(raw);
      localStorage.setItem("kalakriti_inventory", JSON.stringify(clean));
      return clean;
    } catch {
      return INITIAL_SEED;
    }
  });

  // ── Orders State (रीयल-टाइम सिंक) ──
  const [orders, setOrders] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem("kalakriti_orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // विंडो फोकस और स्टोरेज इवेंट्स पर इन्वेंट्री व आर्डर्स को ऑटो-सिंक रखें
  useEffect(() => {
    const handleStorage = () => {
      try {
        const savedInv = localStorage.getItem("kalakriti_inventory");
        if (savedInv) setInventory(JSON.parse(savedInv));

        const savedOrders = localStorage.getItem("kalakriti_orders");
        if (savedOrders) setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.warn("Storage sync error:", e);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleStorage);
    };
  }, []);

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSignature, setImageSignature] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Release active microphone streams if component unmounts
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  const [isRecording, setIsRecording] = useState(false);
  const [micState, setMicState] = useState<"idle" | "listening" | "processing" | "success" | "error">("idle");
  const [voiceText, setVoiceText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<CatalogData | null>(null);

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [manualPriceInput, setManualPriceInput] = useState("");
  // ── 🌐 Multilingual Language Hook & Speech Locale Sync ──
  const { t, speechLang, currentLang, languages } = useLanguage();

  const handleOpenPriceModal = () => {
    if (!selectedFile && !photoUrl) {
      alert(t("select_photo_first_alert"));
      return;
    }
    setShowPriceModal(true);
  };

  const handleLoginSuccess = (role: "seller" | "buyer" = "seller") => {
    localStorage.setItem("artisan_logged_in", "true");
    localStorage.setItem("user_role", role);
    setActiveRole(role);
    setIsLoggedIn(true);

    if (role === "buyer") {
      setScreen("buyer");
    } else {
      setScreen("capture");
    }
  };

  const handleSellerLogout = () => {
    localStorage.removeItem("artisan_logged_in");
    setActiveRole("seller");
    setIsLoggedIn(false);
    setScreen("onboarding");
  };

  const handleLeaveToArtisanLogin = () => {
    setShowBackConfirm(false);
    localStorage.removeItem("artisan_logged_in");
    setActiveRole("seller");
    setIsLoggedIn(false);
    setScreen("onboarding");
  };

  const handleBuyerLogout = () => {
    localStorage.removeItem("artisan_logged_in");
    setActiveRole("buyer");
    setIsLoggedIn(false);
    setScreen("onboarding");
  };

  // ── बायर द्वारा आर्डर करने पर सेलर डैशबोर्ड में लाइव सिंक ──
  const handleOrderConfirmedFromBuyer = (confirmedOrder: ConfirmedOrder, cartItems: CartItem[]) => {
    let freshInventory = inventory;
    try {
      const saved = localStorage.getItem("kalakriti_inventory");
      if (saved) freshInventory = JSON.parse(saved);
    } catch {}

    const updatedInventory = freshInventory.map((invItem) => {
      const cartMatch = cartItems.find((c) => c.product.id === invItem.id);
      if (cartMatch) {
        const remainingQty = Math.max(0, (Number(invItem.quantity) || 0) - cartMatch.quantity);
        return { ...invItem, quantity: remainingQty };
      }
      return invItem;
    });

    setInventory(updatedInventory);
    localStorage.setItem("kalakriti_inventory", JSON.stringify(updatedInventory));

    const currentOrders: OrderItem[] = (() => {
      try {
        return JSON.parse(localStorage.getItem("kalakriti_orders") || "[]");
      } catch {
        return orders;
      }
    })();

    const newArtisanOrders: OrderItem[] = cartItems.map((c) => ({
      orderId: confirmedOrder.orderId,
      productId: c.product.id,
      productTitle: c.product.title_hi || "हस्तशिल्प उत्पाद",
      buyerCity: `${confirmedOrder.deliveryAddress.city} (${confirmedOrder.deliveryAddress.state})`,
      buyerPlatform: "PhonePe Pincode",
      amount: (Number(c.product.suggested_price) || 199) * c.quantity,
      courier: "India Post (डाक घर)",
      status: "Pending",
      orderDate: "अभी-अभी (Just now)",
      quantity: c.quantity,
      sellerName: c.product.artisan_name,
    }));

    const existingFiltered = currentOrders.filter((eo: any) =>
      !newArtisanOrders.some((no) => no.orderId === eo.orderId && (no.productId && eo.productId ? no.productId === eo.productId : no.productTitle === eo.productTitle))
    );
    const updatedOrders = [...newArtisanOrders, ...existingFiltered];
    setOrders(updatedOrders);
    localStorage.setItem("kalakriti_orders", JSON.stringify(updatedOrders));
    window.dispatchEvent(new Event("storage"));
  };

  const handleDispatchOrder = (orderId: string) => {
    const updated = orders.map((o) =>
      o.orderId === orderId ? { ...o, status: "Shipped" as const } : o
    );
    setOrders(updated);
    localStorage.setItem("kalakriti_orders", JSON.stringify(updated));

    try {
      const buyerOrders: ConfirmedOrder[] = JSON.parse(
        localStorage.getItem("kalakriti_buyer_orders") || "[]"
      );
      const updatedBuyerOrders = buyerOrders.map((bo) =>
        bo.orderId === orderId ? { ...bo, status: "In Transit" as const } : bo
      );
      localStorage.setItem("kalakriti_buyer_orders", JSON.stringify(updatedBuyerOrders));
    } catch (e) {
      console.warn("Could not sync buyer tracking:", e);
    }

    alert(t("order_packed_dispatch_alert"));
  };

  // सेलर स्टॉक कंट्रोलर (+ / -): अब स्टॉक 0 तक जा सकता है और आउट ऑफ स्टॉक हो सकता है
  const handleIncreaseQty = (id: string) => {
    const updated = inventory.map((item) =>
      item.id === id ? { ...item, quantity: (Number(item.quantity) || 0) + 1 } : item
    );
    setInventory(updated);
    localStorage.setItem("kalakriti_inventory", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const handleDecreaseQty = (id: string) => {
    const updated = inventory.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(0, (Number(item.quantity) || 0) - 1) }
        : item
    );
    setInventory(updated);
    localStorage.setItem("kalakriti_inventory", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const handleRemoveProduct = (id: string) => {
    if (window.confirm(t("remove_product_confirm"))) {
      const updated = inventory.filter((item) => item.id !== id);
      setInventory(updated);
      localStorage.setItem("kalakriti_inventory", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleUpdateCategory = (newCategory: string) => {
    if (!selectedPreviewItem) return;
    const updated = {
      ...selectedPreviewItem,
      categoryName: newCategory,
      category: newCategory,
    };
    setSelectedPreviewItem(updated);

    // If item exists in inventory, update it as well
    setInventory((prev) => {
      const clean = prev.map((item) =>
        (item.id === (updated as any).id || areItemsDuplicate(item, updated))
          ? { ...item, categoryName: newCategory, category: newCategory }
          : item
      );
      localStorage.setItem("kalakriti_inventory", JSON.stringify(clean));
      window.dispatchEvent(new Event("storage"));
      return clean;
    });
  };

  // 🛡️ नया सामान जोड़ते समय डुप्लीकेट चेक (Issue 2 Permanent Fix)
  const saveProductToInventory = (catalogItem: CatalogData) => {
    // अगर वही फोटो, वही सिग्नेचर या वही सामान पहले से दुकान में है, तो नया कार्ड न बनाएं—स्टॉक बढ़ा दें!
    const existingIndex = inventory.findIndex((item) => areItemsDuplicate(item, catalogItem));

    let updatedList: StoreItem[];
    if (existingIndex > -1) {
      updatedList = inventory.map((item, idx) =>
        idx === existingIndex
          ? {
              ...item,
              categoryName: (catalogItem as any).categoryName || (catalogItem as any).category || item.categoryName || item.category,
              category: (catalogItem as any).category || (catalogItem as any).categoryName || item.category || item.categoryName,
              quantity: (Number(item.quantity) || 0) + (Number((catalogItem as any).quantity) || 1),
              imageUrl: catalogItem.imageUrl || item.imageUrl,
              imageSignature: catalogItem.imageSignature || item.imageSignature,
              localizedContent: {
                ...(item.localizedContent || {}),
                ...(catalogItem.localizedContent || {}),
              },
            }
          : item
      );
    } else {
      const cat = (catalogItem as any).categoryName || (catalogItem as any).category || (selectedCategory !== undefined && CATEGORIES[selectedCategory] ? CATEGORIES[selectedCategory].en : "Handicrafts");
      const newEntry: StoreItem = {
        id: Date.now().toString(),
        ...catalogItem,
        quantity: (catalogItem as any).quantity !== undefined ? Math.max(0, Number((catalogItem as any).quantity) || 0) : 1,
        publishedAt: "आज",
        categoryName: cat,
        category: cat,
        localizedContent: catalogItem.localizedContent || {},
      };
      updatedList = [newEntry, ...inventory];
    }

    const cleanList = deduplicateInventory(updatedList);
    setInventory(cleanList);
    localStorage.setItem("kalakriti_inventory", JSON.stringify(cleanList));
    window.dispatchEvent(new Event("storage"));

    setSelectedFile(null);
    setImageSignature("");
    setPhotoUrl(null);
    setVoiceText("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
  setSelectedFile(file);
  setImageSignature(`${file.name}_${file.size}_${file.lastModified}`);

  const reader = new FileReader();

  reader.onload = () => {
    setPhotoUrl(reader.result as string);
  };

  reader.readAsDataURL(file);
}
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
    });
  };

  const uploadToCloudinary = async (file: File) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return {
        originalUrl: photoUrl || "",
        transparentUrl: photoUrl || "",
        enhancedUrl: photoUrl || "",
      };
    }

    try {
      const result = await uploadToCloudinaryWithBgRemoval(file, {
        cloudName,
        uploadPreset,
      });

      if (!result.success) {
        return {
          originalUrl: photoUrl || "",
          transparentUrl: photoUrl || "",
          enhancedUrl: photoUrl || "",
        };
      }

      return {
        originalUrl: result.originalUrl,
        transparentUrl: result.transparentUrl,
        enhancedUrl: result.transparentUrl,
        publicId: result.publicId,
      };
    } catch {
      return {
        originalUrl: photoUrl || "",
        transparentUrl: photoUrl || "",
        enhancedUrl: photoUrl || "",
      };
    }
  };

  const startAudioRecording = async () => {
    console.log("[VOICE] startAudioRecording requested");
    try {
      // A11: Prevent multiple active streams - terminate any old stream before opening new one
      if (mediaStreamRef.current) {
        console.log("[VOICE] cleaning up prior active stream before opening new one");
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log(`[VOICE] prior track stopped: ${track.label}, readyState: ${track.readyState}`);
        });
        mediaStreamRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
        mediaRecorderRef.current = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("[VOICE] getUserMedia not supported on this device/browser");
        alert(t("voice_permission_denied"));
        setMicState("error");
        setTimeout(() => setMicState("idle"), 1500);
        return;
      }

      console.log("[VOICE] requesting microphone permission...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      console.log(`[VOICE] permission granted, active tracks: ${stream.getTracks().length}`);

      // Determine best supported container MIME type
      let mimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
          mimeType = "audio/ogg;codecs=opus";
        }
      }
      console.log(`[VOICE] negotiated recording MIME type: ${mimeType}`);

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(`[VOICE] dataavailable chunk received: ${event.data.size} bytes, total chunks: ${audioChunksRef.current.length}`);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("[VOICE] mediaRecorder onstop fired");

        // Combine all chunks collected into final Blob
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log(`[VOICE] final audio blob created, chunks count: ${audioChunksRef.current.length}, blob size: ${audioBlob.size} bytes, type: ${audioBlob.type}`);

        // A10: Guaranteed hardware release - stop ALL tracks on the stream directly
        stream.getTracks().forEach((track) => {
          track.stop();
          console.log(`[VOICE] track ${track.label} stopped, readyState: ${track.readyState}`);
        });
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }

        if (audioBlob.size === 0) {
          console.warn("[VOICE] recorded audio blob is empty (0 bytes)");
          setMicState("idle");
          setIsRecording(false);
          return;
        }

        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string)?.split(",")[1];
            if (!base64Audio) {
              console.error("[VOICE] failed to extract base64 from audio blob");
              setMicState("error");
              setTimeout(() => setMicState("idle"), 1500);
              return;
            }

            console.log(`[VOICE] sending audio payload to /api/transcribe-audio, base64Length: ${base64Audio.length}, lang: ${speechLang}`);

            try {
              const response = await fetch("/api/transcribe-audio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  audioBase64: base64Audio,
                  mimeType,
                  languageCode: speechLang,
                }),
              });

              console.log(`[VOICE] server responded with status: ${response.status}`);
              const data = await response.json();

              if (response.ok && data.success) {
                const transcript = (data.transcript || data.text || "").trim();

                if (transcript) {
                  console.log(`[VOICE] transcript received: "${transcript.substring(0, 40)}..."`);
                  console.log("[VOICE] updating textarea (setVoiceText)...");
                  setVoiceText((prev) => {
                    if (!prev || !prev.trim()) {
                      return transcript;
                    }
                    // Safely append to existing text without destroying user edits
                    return `${prev.trim()} ${transcript}`;
                  });
                  setMicState("success");
                  setTimeout(() => setMicState("idle"), 1500);
                } else {
                  console.warn("[VOICE] response contained empty transcript");
                  alert(t("voice_no_speech"));
                  setMicState("idle");
                }
              } else {
                console.error("[VOICE] transcription server returned failure:", data.error || data);
                setMicState("error");
                setTimeout(() => setMicState("idle"), 1500);
              }
            } catch (netErr) {
              console.error("[VOICE] transcription network error:", netErr);
              setMicState("error");
              setTimeout(() => setMicState("idle"), 1500);
            }
          };
        } catch (readErr) {
          console.error("[VOICE] audio FileReader error:", readErr);
          setMicState("error");
          setTimeout(() => setMicState("idle"), 1500);
        }
      };

      mediaRecorder.start(250); // Slice audio in 250ms chunks
      setIsRecording(true);
      setMicState("listening");
      console.log("[VOICE] recording started successfully");
    } catch (err: any) {
      console.error("[VOICE] microphone access denied or error:", err);
      setIsRecording(false);
      setMicState("error");
      alert(t("voice_permission_denied"));
      setTimeout(() => setMicState("idle"), 1500);
    }
  };

  const stopAudioRecording = () => {
    console.log("[VOICE] stopAudioRecording called");
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        // A2: Request any buffered data before calling stop so final dataavailable fires
        mediaRecorderRef.current.requestData();
        console.log("[VOICE] requestData() invoked to flush buffered audio");
      } catch (e) {
        console.warn("[VOICE] requestData notice:", e);
      }
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setMicState("processing");
  };

  const handleMicToggle = () => {
    console.log(`[VOICE] mic button clicked, currently recording: ${isRecording}`);
    if (isRecording) {
      stopAudioRecording();
    } else {
      startAudioRecording();
    }
  };

  // ── AI Catalog Generation ──
  const handleGenerateCatalog = async (customPrice?: number | null) => {
    setShowPriceModal(false);

    try {
      setIsLoading(true);
      let originalImageUrl = photoUrl || "";
      let transparentImageUrl = photoUrl || "";
      let enhancedImageUrl = photoUrl || "";
      let finalImageUrl = photoUrl || "";

      if (selectedFile) {
        // Stage 1: Uploading original artisan photograph
        setLoadingStage(t("ai_status_uploading"));
        const cloudResult = await uploadToCloudinary(selectedFile);
        originalImageUrl = cloudResult.originalUrl || photoUrl || "";

        // Stage 2: Transparent background removal via Cloudinary AI (e_background_removal:fineedges_y,f_png)
        setLoadingStage(t("ai_status_bg_removal"));
        transparentImageUrl = cloudResult.transparentUrl || originalImageUrl;

        // Stage 3: Image Enhancement via Gemini 3.1 Flash Lite Image (Nano Banana 2 Lite, 1K output)
        setLoadingStage(t("ai_status_enhancing"));
        try {
          const base64Data = await fileToBase64(selectedFile);
          const enhanceRes = await fetch("/api/enhance-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: selectedFile.type || "image/jpeg",
              imageUrl: transparentImageUrl || originalImageUrl,
            }),
          });

          if (enhanceRes.ok) {
            const enhanceData = await enhanceRes.json();
            if (enhanceData.success && enhanceData.enhancedUrl) {
              enhancedImageUrl = enhanceData.enhancedUrl;
              console.log("[IMAGE] gemini-3.1-flash-lite-image enhancement applied successfully");
            }
          }
        } catch (enhanceErr) {
          console.warn("[IMAGE] Image enhancement notice, proceeding with transparent cutout:", enhanceErr);
        }

        finalImageUrl = enhancedImageUrl || transparentImageUrl || originalImageUrl;
      }

      setLoadingStage(t("ai_status_understanding"));

      const geminiKey = import.meta.env.VITE_GEMINI_KEY || import.meta.env.VITE_GEMINI_API_KEY;
      const categoryName = CATEGORIES[selectedCategory].en;
      const userNote = voiceText || "हस्तशिल्प उत्पाद";

      // 🌐 भाषा-जागरूक स्थानीयकरण (Active Artisan Language Meta)
      const activeLangMeta = languages?.find((l) => l.code === currentLang) || {
        code: "hi",
        nativeName: "हिन्दी",
        englishName: "Hindi",
        speechLang: "hi-IN",
      };

      setLoadingStage(t("ai_status_generating_name"));

      let generatedData: any = null;

      if (geminiKey) {
        try {
          const pricingInstruction = customPrice
            ? `CRITICAL PRICING: The artisan has manually fixed the selling price at exactly INR ${customPrice}. You MUST output "suggested_price": ${customPrice}.`
            : `Set a fair, competitive market price: Pottery: ₹149 - ₹249, Paintings: ₹249 - ₹399.`;

          const promptText = `
You are an expert Indian Handicrafts and ONDC cultural commerce specialist for Kalakriti.
Carefully inspect the attached photo. Category: "${categoryName}".

ARTISAN SPOKEN CONTEXT & AUTHENTIC TESTIMONY:
The artisan has provided this authentic description: "${userNote}".
CRITICAL CONTEXTUAL GUIDANCE:
- Treat the artisan's spoken words as authentic ground-truth facts regarding the craft's identity, raw materials, crafting technique, cultural/regional origin, and festive/daily purpose (e.g. if the artisan states it is a clay lamp for Diwali or handmade Madhubani painting, reflect that exact craft identity).
- Faithfully integrate these authentic spoken details into the craft title, story, quick summary, specifications, and highlights.
- Do NOT hallucinate conflicting materials or facts that contradict the artisan's direct testimony.

${pricingInstruction}

ARTISAN LANGUAGE PREFERENCE:
The artisan has chosen their native language: ${activeLangMeta.englishName} (${activeLangMeta.nativeName}, ISO code: "${currentLang}").
CRITICAL MULTILINGUAL REQUIREMENT:
You MUST output all artisan-facing fields in fluent, authentic ${activeLangMeta.englishName} script (${activeLangMeta.nativeName}):
- "title_hi": Write an attractive, culturally authentic craft title ENTIRELY in ${activeLangMeta.englishName} script (${activeLangMeta.nativeName}). (Keep the JSON key 'title_hi' for system compatibility, but the text value MUST be in ${activeLangMeta.englishName}).
- "quick_summary_hi": Write 1 enticing hook sentence ENTIRELY in ${activeLangMeta.englishName} script (${activeLangMeta.nativeName}).
- "story_hi": Write 2-3 evocative sentences describing the cultural heritage, artisan generational craftsmanship technique (e.g. natural dyes, potter's wheel, or intricate hand embroidery), and timeless aesthetic value ENTIRELY in authentic ${activeLangMeta.englishName} script (${activeLangMeta.nativeName}).
- "highlights_hi": Array of 3 craft highlights in ${activeLangMeta.englishName} script (${activeLangMeta.nativeName}).
- "specs_hi": Array of 4 specification objects with {"label": "...", "value": "..."} in ${activeLangMeta.englishName} script (${activeLangMeta.nativeName}).
- "title_local": Write an attractive, culturally authentic craft title ENTIRELY in ${activeLangMeta.englishName} script (${activeLangMeta.nativeName}).
- "quick_summary_local": Write 1 enticing hook sentence ENTIRELY in ${activeLangMeta.englishName} script (${activeLangMeta.nativeName}).
- "story_local": Write 2-3 evocative sentences describing the cultural heritage, artisan generational craftsmanship technique (e.g. natural dyes, potter's wheel, or intricate hand embroidery), and timeless aesthetic value ENTIRELY in authentic ${activeLangMeta.englishName} script (${activeLangMeta.nativeName}).
- "highlights_local": Array of 3 craft highlights in ${activeLangMeta.englishName} script (${activeLangMeta.nativeName}).
- "specs_local": Array of 4 specification objects with {"label": "...", "value": "..."} in ${activeLangMeta.englishName} script (${activeLangMeta.nativeName}).

For nationwide ONDC marketplace buyers:
- "title_en", "quick_summary_en", "story_en", "highlights_en", "specs_en": Write evocative, high-converting English copy honoring the craft heritage.

Output ONLY valid JSON matching this schema:
{
  "title_hi": "...",
  "title_local": "...",
  "title_en": "...",
  "suggested_price": ${customPrice || 199},
  "artisan_name": "...",
  "artisan_region": "...",
  "quick_summary_hi": "...",
  "quick_summary_local": "...",
  "quick_summary_en": "...",
  "story_hi": "...",
  "story_local": "...",
  "story_en": "...",
  "highlights_hi": ["...", "...", "..."],
  "highlights_local": ["...", "...", "..."],
  "highlights_en": ["...", "...", "..."],
  "specs_local": [
    { "label": "...", "value": "..." },
    { "label": "...", "value": "..." },
    { "label": "...", "value": "..." },
    { "label": "...", "value": "..." }
  ],
  "specs_hi": [
    { "label": "...", "value": "..." },
    { "label": "...", "value": "..." },
    { "label": "...", "value": "..." },
    { "label": "...", "value": "..." }
  ],
  "specs_en": [
    { "label": "Craft Form", "value": "..." },
    { "label": "Material", "value": "..." },
    { "label": "Size", "value": "..." },
    { "label": "Best For", "value": "..." }
  ],
  "tags": ["Handmade", "Kalakriti", "ONDC Ready", "HeritageCraft"]
}
`;

          let parts: any[] = [{ text: promptText }];
          if (selectedFile) {
            const base64Data = await fileToBase64(selectedFile);
            parts.push({
              inlineData: {
                mimeType: selectedFile.type || "image/jpeg",
                data: base64Data,
              },
            });
          }

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: { responseMimeType: "application/json" },
              }),
            }
          );

          if (response.ok) {
            const json = await response.json();
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
            generatedData = JSON.parse(cleanText);

            // Sync _local and _hi fields for cross-system backward compatibility
            const tLoc = generatedData.title_local || generatedData.title_hi || "";
            const sLoc = generatedData.story_local || generatedData.story_hi || "";
            const qLoc = generatedData.quick_summary_local || generatedData.quick_summary_hi || "";
            const hLoc = generatedData.highlights_local || generatedData.highlights_hi || [];
            const spLoc = generatedData.specs_local || generatedData.specs_hi || [];

            generatedData.title_local = tLoc;
            generatedData.title_hi = tLoc;
            generatedData.story_local = sLoc;
            generatedData.story_hi = sLoc;
            generatedData.quick_summary_local = qLoc;
            generatedData.quick_summary_hi = qLoc;
            generatedData.highlights_local = hLoc;
            generatedData.highlights_hi = hLoc;
            generatedData.specs_local = spLoc;
            generatedData.specs_hi = spLoc;

            // Populate localizedContent for the current language and English
            if (!generatedData.localizedContent) {
              generatedData.localizedContent = {};
            }
            generatedData.localizedContent[currentLang] = {
              title: tLoc,
              story: sLoc,
              quick_summary: qLoc,
              highlights: hLoc,
              specs: spLoc,
            };
            if (generatedData.title_en) {
              generatedData.localizedContent["en"] = {
                title: generatedData.title_en,
                story: generatedData.story_en || "",
                quick_summary: generatedData.quick_summary_en || "",
                highlights: generatedData.highlights_en || [],
                specs: generatedData.specs_en || [],
              };
            }
          }
        } catch (apiErr) {
          console.warn("Gemini call error:", apiErr);
        }
      }

      if (!generatedData) {
        const isPainting = /painting|मधुबनी|चित्र|paint|art|चित्रकारी/i.test(userNote + categoryName);
        const autoPrice = isPainting ? 299 : 180;
        const finalPrice = customPrice ? Number(customPrice) : autoPrice;

        const fallbackByLang: Record<string, { title: string; summary: string; story: string; craft: string; material: string }> = {
          mr: {
            title: isPainting ? "पारंपरिक मधुबनी लोककला चित्र" : "हस्तनिर्मित पारंपरिक मातीचे भांडे",
            summary: "कुशल कारागिरांनी हाताने बनवलेली अस्सल हस्तकला वस्तू.",
            story: "ही हस्तकला भारताच्या प्राचीन संस्कृतीचे आणि पिढ्यानपिढ्या चालत आलेल्या कारागिरीचे सुंदर प्रतीक आहे. स्थानिक नैसर्गिक साहित्यापासून तयार केलेली ही कला घरामध्‍ये समृद्धी आणते.",
            craft: isPainting ? "मधुबनी लोककला" : "पारंपरिक कुंभारकाम",
            material: isPainting ? "हँडमेड कागद व नैसर्गिक रंग" : "१००% शुद्ध लाल माती",
          },
          bn: {
            title: isPainting ? "ঐতিহ্যবাহী মধুবনী লোকশিল্প পেইন্টিং" : "হস্তনির্মিত ঐতিহ্যবাহী মাটির পাত্র",
            summary: "দক্ষ কারিগরদের দ্বারা হাতে তৈরি খাঁটি হস্তশিল্প পণ্য।",
            story: "এই শিল্পকর্মটি ভারতীয় লোকঐতিহ্য ও বংশানুক্রমিক দক্ষতার প্রতীক। প্রাকৃতিক উপাদান দিয়ে নিখুঁতভাবে তৈরি এই হস্তশিল্প ঘরের নান্দনিকতা বৃদ্ধি করে।",
            craft: isPainting ? "মধুবনী চিত্রকলা" : "ঐতিহ্যবাহী মৃৎশিল্প",
            material: isPainting ? "হ্যান্ডমেড কাগজ ও প্রাকৃতিক রং" : "১০০% খাঁটি লাল মাটি",
          },
          gu: {
            title: isPainting ? "પરંપરાગત મધુબની લોકકલા પેઇન્ટિંગ" : "હસ્તનિર્મિત પરંપરાગત માટીનું વાસણ",
            summary: "કુશળ કારીગરો દ્વારા હાથથી બનાવેલ અસલ હસ્તકલા ઉત્પાદન.",
            story: "આ હસ્તકળા ભારતીય પ્રાચીન લોક પરંપરા અને વારસાનું પ્રતીક છે. કુદરતી સામગ્રીમાંથી પ્રેમપૂર્વક તૈયાર કરેલ આ કલા ઘરમાં સાંસ્કૃતિક સુંદરતા લાવે છે.",
            craft: isPainting ? "મધુબની ચિત્રકામ" : "પરંપરાગત માટીકામ",
            material: isPainting ? "હેન્ડમેડ કાગળ અને કુદરતી રંગો" : "૧૦૦% શુદ્ધ માટી",
          },
          ta: {
            title: isPainting ? "பாரம்பரிய மதுபானி நாட்டுப்புற ஓவியம்" : "கைவினைப் பாரம்பரிய மண்பாண்டம்",
            summary: "திறமையான கைவினைஞர்களால் உருவாக்கப்பட்ட அசல் தயாரிப்பு.",
            story: "இந்த கைவினைப்பொருள் இந்தியாவின் பாரம்பரிய கலாச்சாரத்தை பிரதிபலிக்கிறது. இயற்கையான பொருட்களைக் கொண்டு தலைமுறை தலைமுறையாக கைவினைஞர்களால் வடிக்கப்பட்டது.",
            craft: isPainting ? "மதுபானி ஓவியக்கலை" : "மட்பாண்டக் கலை",
            material: isPainting ? "கைவினை காகிதம் & இயற்கை நிறங்கள்" : "100% இயற்கை களிமண்",
          },
          te: {
            title: isPainting ? "సాంప్రదాయ మధుబని జానపద పెయింటింగ్" : "హస్తకళా సాంప్రదాయ మట్టి కుండ",
            summary: "నైపుణ్యం కలిగిన కళాకారులచే స్వహస్తాలతో తయారు చేయబడిన ప్రామాణిక ఉత్పత్తి.",
            story: "ఈ చేతిపని భారతదేశ ప్రాచీన సంస్కృతికి మరియు తరతరాల కళా నైపుణ్యానికి ప్రతీక. సహజమైన పదార్థాలతో రూపొందించబడిన ఈ కళ గృహానికి సాంస్కృతిక శోభను చేకూరుస్తుంది.",
            craft: isPainting ? "మధుబని చిత్రకళ" : "సాంప్రదాయ కుండల తయారీ",
            material: isPainting ? "హ్యాండ్‌మేడ్ పేపర్ & సహజ రంగులు" : "100% సహజ మట్టి",
          },
          en: {
            title: isPainting ? "Traditional Handpainted Madhubani Artwork" : "Authentic Handcrafted Terracotta Clay Vessel",
            summary: "Authentic generational craft directly from rural artisan clusters.",
            story: "Handcrafted using age-old ancestral techniques and sustainable organic materials, carrying the soulful cultural heritage of rural craft masters into modern spaces.",
            craft: isPainting ? "Madhubani Art" : "Pottery",
            material: isPainting ? "Handmade Paper & Organic Pigments" : "100% Natural Terracotta Clay",
          },
          hi: {
            title: isPainting ? "पारंपरिक मधुबनी लोककला पेंटिंग" : "हस्तनिर्मित पारंपरिक मिट्टी की हांडी",
            summary: "कुशल कारीगरों द्वारा हस्तनिर्मित प्रामाणिक उत्पाद।",
            story: "यह शिल्प भारत की प्राचीन विरासत और पीढ़ीगत कारीगरी का सुंदर प्रतीक है। स्थानीय पर्यावरण-अनुकूल सामग्री और प्राकृतिक रंगों से तैयार यह कला घर में सकारात्मकता लाती है।",
            craft: isPainting ? "मधुबनी लोककला" : "पारंपरिक कुम्हारी",
            material: isPainting ? "हैंडमेड पेपर एवं प्राकृतिक रंग" : "100% प्राकृतिक मिट्टी",
          },
        };

        const loc = fallbackByLang[currentLang] || fallbackByLang.hi;

        const fallbackLocalizedContent: LocalizedContentMap = {};
        for (const [code, fData] of Object.entries(fallbackByLang)) {
          fallbackLocalizedContent[code as any] = {
            title: fData.title,
            story: fData.story,
            quick_summary: fData.summary,
            highlights: code === "en" ? [
              "100% Handcrafted from organic, sustainable materials",
              "Direct from generational rural artisan clusters",
              "Ideal for aesthetic home decor & mindful gifting",
            ] : [
              "100% हस्तनिर्मित एवं पर्यावरण-अनुकूल",
              "पारंपरिक शिल्पकारों द्वारा प्रामाणिक निर्माण",
              "गृह सज्जा, पूजा एवं सांस्कृतिक उपहार हेतु उपयुक्त",
            ],
            specs: code === "en" ? [
              { label: "Craft Form", value: isPainting ? "Madhubani Art" : "Pottery" },
              { label: "Material", value: isPainting ? "Handmade Paper" : "Natural Clay" },
              { label: "Best For", value: "Decor & Gifting" },
            ] : [
              { label: "कला / शिल्प", value: fData.craft },
              { label: "सामग्री", value: fData.material },
              { label: "उपयोग", value: "गृह सज्जा और उपहार" },
            ],
          };
        }

        generatedData = {
          title_local: loc.title,
          title_hi: loc.title,
          title_en: isPainting ? "Handmade Madhubani Folk Painting" : "Traditional Handcrafted Clay Pot",
          suggested_price: finalPrice,
          artisan_name: isPainting ? "माधुरी देवी" : "रमेश प्रजापति",
          artisan_region: isPainting ? "मिथिला, बिहार" : "अलवर, राजस्थान",
          quick_summary_local: loc.summary,
          quick_summary_hi: loc.summary,
          quick_summary_en: "Authentic handcrafted craft directly from rural artisan.",
          story_local: loc.story,
          story_hi: loc.story,
          story_en: "This authentic craft represents centuries of Indian generational heritage, meticulously shaped using sustainable materials.",
          highlights_local: [
            "100% हस्तनिर्मित एवं पर्यावरण-अनुकूल",
            "पारंपरिक शिल्पकारों द्वारा प्रामाणिक निर्माण",
            "गृह सज्जा, पूजा एवं सांस्कृतिक उपहार हेतु उपयुक्त",
          ],
          highlights_hi: [
            "100% हस्तनिर्मित एवं पर्यावरण-अनुकूल",
            "पारंपरिक शिल्पकारों द्वारा प्रामाणिक निर्माण",
            "गृह सज्जा, पूजा एवं सांस्कृतिक उपहार हेतु उपयुक्त",
          ],
          highlights_en: [
            "100% Handcrafted from organic, sustainable materials",
            "Direct from generational rural artisan clusters",
            "Ideal for aesthetic home decor & mindful gifting",
          ],
          specs_local: [
            { label: "कला / शिल्प", value: loc.craft },
            { label: "सामग्री", value: loc.material },
            { label: "उपयोग", value: "गृह सज्जा और उपहार" },
          ],
          specs_hi: [
            { label: "कला / शिल्प", value: loc.craft },
            { label: "सामग्री", value: loc.material },
            { label: "उपयोग", value: "गृह सज्जा और उपहार" },
          ],
          specs_en: [
            { label: "Craft Form", value: isPainting ? "Madhubani Art" : "Pottery" },
            { label: "Material", value: isPainting ? "Handmade Paper" : "Natural Clay" },
            { label: "Best For", value: "Decor & Gifting" },
          ],
          tags: ["Handmade", "ONDC Ready"],
          localizedContent: fallbackLocalizedContent,
        };
      }

      if (customPrice) {
        generatedData.suggested_price = Number(customPrice);
      }

      const finalPayload: CatalogData = {
        ...generatedData,
        imageUrl: finalImageUrl,
        originalImageUrl: originalImageUrl || photoUrl || "",
        transparentImageUrl: transparentImageUrl || photoUrl || "",
        enhancedImageUrl: enhancedImageUrl || finalImageUrl,
        imageSignature: imageSignature || (selectedFile ? `${selectedFile.name}_${selectedFile.size}` : undefined),
        language: currentLang,
      };

      setLoadingStage(t("ai_status_checking_duplicates"));
      saveProductToInventory(finalPayload);
      setSelectedPreviewItem(finalPayload);
      setScreen("preview");
    } catch (err: any) {
      alert(t("error_prefix") + (err.message || err));
    } finally {
      setIsLoading(false);
      setLoadingStage("");
    }
  };

  const handlePublishToOndc = async () => {
    if (!selectedPreviewItem) {
      setScreen("dashboard");
      return;
    }

    try {
      const targetItem = inventory.find(
        (i) => i.id === (selectedPreviewItem as any).id
      ) || {
        id: Date.now().toString(),
        ...selectedPreviewItem,
        quantity: 1,
      };

      // Register with official ONDC Retail v1.2.0 BPP backend
      fetch("http://localhost:5000/api/ondc/publish-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetItem),
      }).catch((e) => console.warn("Local BPP publishing note:", e));
    } catch (e) {
      console.warn("BPP publishing sync note:", e);
    }

    alert(t("ondc_published_success"));
    setScreen("dashboard");
  };

  // ── ROUTING ──
  // 0. 3D Craft Fair
  if (showGame) {
    return (
      <GameWorld
        onExit={() => {
          setShowGame(false);
          setScreen("buyer");
        }}
        inventory={inventory}
        onAddToCart={(product: any) => {
          try {
            const saved = localStorage.getItem("kalakriti_cart");
            const currentCart: CartItem[] = saved ? JSON.parse(saved) : [];
            const matchedInv = inventory.find((i) => i.id === product.id) || {
              id: product.id,
              title_en: product.title,
              title_hi: product.title,
              title_local: product.title,
              suggested_price: Number(product.price) || 499,
              quantity: product.stock !== undefined ? Number(product.stock) : 5,
              imageUrl: product.image_url,
              artisan_name: product.artisan?.name || "Indian Artisan",
              artisan_region: product.artisan?.location || "India",
            };
            const availableStock = Math.max(0, Number(matchedInv.quantity ?? 0));
            if (availableStock <= 0) {
              console.warn("Item is out of stock:", matchedInv.id);
              return;
            }
            const idx = currentCart.findIndex((c) => c.product.id === matchedInv.id);
            if (idx >= 0) {
              if (currentCart[idx].quantity >= availableStock) {
                console.warn("Cart quantity cannot exceed available stock");
                return;
              }
              currentCart[idx].quantity += 1;
            } else {
              currentCart.push({ product: matchedInv, quantity: 1 });
            }
            localStorage.setItem("kalakriti_cart", JSON.stringify(currentCart));
            window.dispatchEvent(new Event("storage"));
          } catch (e) {
            console.warn("3D Fair cart sync error:", e);
          }
        }}
      />
    );
  }
  if (!isLoggedIn || screen === "onboarding") {
    return <OnboardingScreen initialRole={activeRole} onLogin={handleLoginSuccess} />;
  }

  // 1. Customer side — Unified Buyer Marketplace
  if (screen === "buyer") {
    return (
      <PageTransition pageKey="buyer">
        <CustomerSide
          inventory={inventory}
          onOrderConfirmed={handleOrderConfirmedFromBuyer}
          onLogout={handleBuyerLogout}
          onEnterFair={() => {
            recordFairEntry();
            setShowGame(true);
          }}
        />
      </PageTransition>
    );
  }

  // 2. Marketplace — opens the existing 3D fair only after the user clicks Enter Craft Fair
  if (screen === "marketplace") {
    return (
      <PageTransition pageKey="marketplace">
        <Marketplace
          inventory={inventory}
          onEnterFair={() => {
            recordFairEntry();
            setShowGame(true);
          }}
          onBack={() => setScreen("buyer")}
          onAddToCart={(item: StoreItem) => {
            try {
              const saved = localStorage.getItem("kalakriti_cart");
              const currentCart: CartItem[] = saved ? JSON.parse(saved) : [];
              const matchedInv = inventory.find((i) => i.id === item.id) || item;
              const availableStock = Math.max(0, Number(matchedInv.quantity ?? 0));
              if (availableStock <= 0) {
                console.warn("Item is out of stock:", matchedInv.id);
                return;
              }
              const idx = currentCart.findIndex((c) => c.product.id === item.id);
              if (idx >= 0) {
                if (currentCart[idx].quantity >= availableStock) {
                  console.warn("Cart quantity cannot exceed available stock");
                  return;
                }
                currentCart[idx].quantity += 1;
              } else {
                currentCart.push({ product: item, quantity: 1 });
              }
              localStorage.setItem("kalakriti_cart", JSON.stringify(currentCart));
              window.dispatchEvent(new Event("storage"));
            } catch (e) {
              console.warn("Marketplace cart sync error:", e);
            }
          }}
        />
      </PageTransition>
    );
  }

  // 3. Listing Preview
  if (screen === "preview" && selectedPreviewItem) {
    return (
      <PageTransition pageKey="preview">
        <CatalogPreview
          data={selectedPreviewItem}
          onBack={() => setScreen("capture")}
          onCheckout={handlePublishToOndc}
          onCategoryChange={handleUpdateCategory}
        />
      </PageTransition>
    );
  }

  // 3. Artisan Dashboard Screen (Two-Way Synced)
  if (screen === "dashboard") {
    return (
      <PageTransition pageKey="dashboard">
        <ArtisanDashboard
          inventory={inventory}
          orders={orders}
          onAddNewProduct={() => setScreen("capture")}
          onBack={() => setScreen("capture")}
          onPreviewProduct={(product) => {
            setSelectedPreviewItem(product);
            setScreen("preview");
          }}
          onIncreaseQty={handleIncreaseQty}
          onDecreaseQty={handleDecreaseQty}
          onRemoveProduct={handleRemoveProduct}
          onDispatchOrder={handleDispatchOrder}
          onLogout={handleSellerLogout}
        />
      </PageTransition>
    );
  }

  // 4. Capture Screen
  return (
    <PageTransition pageKey="capture">
      <div
        className="size-full flex items-center justify-center"
        style={{ background: "#EDE0D4", fontFamily: "'Poppins', sans-serif" }}
      >
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
          className="flex items-center px-4 py-2.5 gap-2.5 flex-shrink-0 min-h-[56px]"
          style={{ background: "#6B3A2A" }}
        >
          <button
            type="button"
            onClick={() => setShowBackConfirm(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white active:scale-95 transition cursor-pointer flex-shrink-0 bg-white/15 hover:bg-white/25 border border-white/20"
            title={t("go_back")}
            aria-label={t("go_back")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h1
              className="text-base font-bold text-white tracking-wide truncate leading-tight"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              Kalakriti
            </h1>
            <p className="text-[10px] text-white/75 font-medium truncate leading-tight mt-0.5">{t("app_tagline")}</p>
          </div>

          {/* 🌐 Universal Language Dropdown */}
          <LanguageDropdown theme="seller" />

          <button
            type="button"
            onClick={() => setScreen("dashboard")}
            className="h-8 px-3 rounded-full text-xs font-semibold text-[#6B3A2A] bg-[#EDE0D4] hover:bg-[#E5D2C2] active:scale-95 transition cursor-pointer flex items-center justify-center flex-shrink-0 shadow-xs"
          >
            {t("shop")} ({inventory.length})
          </button>
        </div>

        {/* Form Body */}
        <div
          className="flex-1 overflow-y-auto px-5 py-5 space-y-5 animate-page-enter"
          style={{ scrollbarWidth: "none" }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-[#9C6644]">
              {t("new_product")}
            </p>
            <h2
              className="text-2xl font-bold text-[#3D1F0F]"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              {t("sell_new_product")}
            </h2>
          </div>

          {/* 📸 फोटो सेक्शन (कैमरा + गैलरी) */}
          <div className="relative w-full">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <input
              type="file"
              accept="image/*"
              ref={galleryInputRef}
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            <div
              className="w-full relative overflow-hidden flex flex-col items-center justify-center p-4 transition-all"
              style={{
                borderRadius: 20,
                border: photoUrl ? "1px solid rgba(196,136,107,0.3)" : "2.5px dashed #C4886B",
                background: photoUrl ? "#FFF" : "rgba(196,136,107,0.07)",
              }}
            >
              {photoUrl ? (
                <div className="w-full space-y-3">
                  <div className="relative h-52 w-full rounded-xl overflow-hidden bg-black/5 flex items-center justify-center animate-scale-in">
                    <img
                      src={photoUrl}
                      alt="Uploaded Product"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow animate-scale-in">
                      {t("photo_selected")}
                    </div>
                    {/* Indeterminate AI Photo Scanning Laser Overlay */}
                    <AiScannerOverlay active={isLoading} stageText={loadingStage || t("processing")} />
                  </div>

                  <div className="flex gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs text-white shadow active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      <span>📷</span>
                      <span>{t("retake_photo")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs border active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#8B4513",
                        color: "#6B3A2A",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      <span>🖼️</span>
                      <span>{t("change_gallery")}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center w-full py-2">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2 mx-auto bg-amber-100/60 text-2xl shadow-inner">
                    📷
                  </div>
                  <span
                    className="font-bold text-base text-[#6B3A2A] block"
                    style={{ fontFamily: "'Noto Serif', serif" }}
                  >
                    {t("take_photo")}
                  </span>
                  <p className="text-xs text-[#9C6644] mt-1 mb-4">
                    {t("photo_subtitle")}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      <span className="text-sm">📷</span>
                      <span>{t("open_camera")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="w-full py-2.5 px-3 rounded-xl font-bold text-xs border active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#8B4513",
                        color: "#6B3A2A",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      <span className="text-sm">🖼️</span>
                      <span>{t("upload_photo")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Voice Input */}
          <div>
            <p
              className="text-sm font-bold mb-3 text-[#3D1F0F]"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              🎙 {t("voice_input_title")}
            </p>
            <div className="flex gap-3 items-end">
              <div
                className="flex-1 relative rounded-2xl p-1 transition-all duration-200"
                style={{
                  background: "#FFF8F3",
                  border: micState === "listening" ? "2px solid #DC2626" : "1.5px solid #E8C9B0",
                  boxShadow: micState === "listening" ? "0 0 0 3px rgba(220, 38, 38, 0.15)" : undefined,
                  minHeight: 105,
                }}
              >
                <textarea
                  className="w-full h-full resize-none p-3 text-sm outline-none bg-transparent"
                  style={{ color: "#3D1F0F" }}
                  placeholder={
                    micState === "listening"
                      ? t("voice_listening")
                      : micState === "processing"
                      ? t("voice_processing")
                      : t("voice_placeholder")
                  }
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                />
                {micState === "success" && (
                  <span className="absolute bottom-2 right-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md animate-scale-in flex items-center gap-1 shadow-xs">
                    <span>✓</span>
                    <span>{t("voice_text_added")}</span>
                  </span>
                )}
                {micState === "error" && (
                  <span className="absolute bottom-2 right-2 text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md animate-scale-in shadow-xs">
                    ⚠️
                  </span>
                )}
              </div>

              {/* Mic Button with concentric ripple rings */}
              <div className="relative">
                <MicPulseRing active={micState === "listening"} />
                <button
                  type="button"
                  onClick={handleMicToggle}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl shadow-md active:scale-95 transition-all duration-200 cursor-pointer relative z-10"
                  style={{
                    background:
                      micState === "listening"
                        ? "#DC2626"
                        : micState === "processing"
                        ? "#D97706"
                        : micState === "success"
                        ? "#16A34A"
                        : "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                    boxShadow:
                      micState === "listening"
                        ? "0 4px 18px rgba(220, 38, 38, 0.45)"
                        : "0 4px 14px rgba(107, 58, 42, 0.35)",
                  }}
                  title={micState === "listening" ? t("voice_listening") : t("voice_input_title")}
                  aria-label={micState === "listening" ? t("voice_listening") : t("voice_input_title")}
                >
                  {micState === "listening" ? "⏹" : micState === "processing" ? "⏳" : micState === "success" ? "✓" : "🎤"}
                </button>
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div>
            <p
              className="text-sm font-bold mb-3 text-[#3D1F0F]"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              {t("craft_category_title")}
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat.en}
                  type="button"
                  onClick={() => setSelectedCategory(i)}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all touch-press cursor-pointer"
                  style={{
                    background: selectedCategory === i ? "#6B3A2A" : "rgba(196,136,107,0.1)",
                    color: selectedCategory === i ? "white" : "#6B3A2A",
                    border: "1.5px solid " + (selectedCategory === i ? "#6B3A2A" : "rgba(196,136,107,0.3)"),
                  }}
                >
                  {currentLang === "en" ? t(cat.key) : `${t(cat.key)} (${cat.en})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div
          className="flex-shrink-0 px-5 pb-8 pt-4"
          style={{ background: "linear-gradient(to top, #FFFBF7 85%, transparent)" }}
        >
          <button
            type="button"
            disabled={isLoading}
            onClick={handleOpenPriceModal}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 font-bold text-base text-white shadow-lg transition-all touch-press disabled:opacity-60 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
              boxShadow: "0 8px 24px rgba(107,58,42,0.35)",
            }}
          >
            {isLoading ? (
              <span className="animate-pulse">{loadingStage || t("processing")}</span>
            ) : (
              <>
                <span>✦</span>
                <span style={{ fontFamily: "'Noto Serif', serif" }}>{t("add_product_to_shop")}</span>
              </>
            )}
          </button>
          <p className="text-center text-xs mt-2 text-[#8B4513] font-medium">
            {t("ai_helper_text")}
          </p>
        </div>

        {/* ── 🏷 INTERACTIVE PRICING POPUP MODAL ── */}
        {showPriceModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center z-50 animate-fade-in">
            <div
              className="bg-[#FFFDF9] w-full rounded-t-3xl p-5 space-y-4 max-h-[90%] overflow-y-auto border-t-2 border-[#C4886B] shadow-2xl animate-slide-up"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <div className="flex items-center justify-between border-b border-[#EAC9B0] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-base">
                    🏷
                  </div>
                  <div>
                    <h3
                      className="text-base font-bold text-[#3D1F0F]"
                      style={{ fontFamily: "'Noto Serif', serif" }}
                    >
                      {t("pricing_modal_title")}
                    </h3>
                    <p className="text-[11px] text-[#8B4513]">
                      {t("pricing_modal_subtitle")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPriceModal(false)}
                  className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 font-bold flex items-center justify-center active:scale-90 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Option 1: AI Auto-Pricing */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6B3A2A] flex items-center gap-1.5">
                    <span>✨</span>
                    <span>{t("pricing_option1_badge")}</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    {t("ondc_staging_badge")}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  {t("pricing_option1_desc")}
                </p>
                <button
                  type="button"
                  onClick={() => handleGenerateCatalog(null)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-xs active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)" }}
                >
                  <span>✨</span>
                  <span>{t("pricing_option1_btn")}</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-[11px] font-bold text-[#9C6644] px-2 py-0.5 rounded-full bg-stone-100">
                  {t("pricing_or_custom")}
                </span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              {/* Option 2: Manual Price Input */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E0C8B5] space-y-3 shadow-xs">
                <div>
                  <label className="block text-xs font-bold text-[#3D1F0F] mb-1">
                    {t("pricing_option2_label")}
                  </label>
                  <div className="flex items-center rounded-xl overflow-hidden border-2 border-[#C4886B] bg-[#FFFBF7] px-3 py-1">
                    <span className="text-lg font-bold text-[#6B3A2A] mr-1">₹</span>
                    <input
                      type="number"
                      placeholder="उदा. 250"
                      value={manualPriceInput}
                      onChange={(e) => setManualPriceInput(e.target.value)}
                      className="w-full py-1 text-base font-extrabold text-[#3D1F0F] outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-stone-500 font-medium">{t("pricing_suggestions_label")}</span>
                  {[150, 200, 250, 350].map((quickAmt) => (
                    <button
                      key={quickAmt}
                      type="button"
                      onClick={() => setManualPriceInput(String(quickAmt))}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#6B3A2A] border border-stone-200 cursor-pointer"
                    >
                      ₹{quickAmt}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!manualPriceInput || Number(manualPriceInput) <= 0}
                  onClick={() => handleGenerateCatalog(Number(manualPriceInput))}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-xs active:scale-98 transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  style={{ background: "#15803D" }}
                >
                  <span>✓</span>
                  <span>
                    {manualPriceInput
                      ? t("pricing_add_with_price").replace("{price}", manualPriceInput)
                      : t("pricing_enter_price_prompt")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 🚪 BACK CONFIRMATION MODAL (Decoupled from Logout) ── */}
        <ConfirmationModal
          isOpen={showBackConfirm}
          onClose={() => setShowBackConfirm(false)}
          onConfirm={handleLeaveToArtisanLogin}
          title={t("confirm_leave_title")}
          message={t("confirm_leave_message")}
          cancelText={t("confirm_stay_button")}
          confirmText={t("confirm_leave_button")}
          icon="🚪"
          confirmVariant="danger"
        />
      </div>
    </div>
    </PageTransition>
  );
}