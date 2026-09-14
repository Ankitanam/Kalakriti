// src/OndcBuyerScreen.tsx
import React, { useState, useEffect } from "react";
import { useLanguage } from "./context/LanguageContext";
import { StoreItem } from "./App";
import {
  CartItem,
  executeBecknSelect,
  executeBecknInit,
  executeBecknConfirm,
  DeliveryAddress,
  ConfirmedOrder,
} from "./utils/becknEngine";
import { searchProductsFuzzy } from "./utils/fuzzySearch";
import {
  getDisplayTitle as getArtisanDisplayTitle,
  getLocalizedProductContent,
  ensureProductLocalization,
  getLocalizedCity,
} from "./utils/artisanAiService";
import { LanguageDropdown } from "./components/LanguageDropdown";
import { TiltCard } from "./components/MouseParallax";
import {
  useBuyerGamification,
  awardXp,
  recordCraftDiscovery,
  recordArtisanOrderSupport,
  BADGE_DEFINITIONS,
  getLocalizedLevelTitle,
  getLocalizedBadge,
  getLocalizedQuest,
  getNextLevelInfo,
} from "./utils/gamificationService";
import { AnimatedNumber } from "./components/motion/MotionPrimitives";

interface OndcBuyerScreenProps {
  inventory: StoreItem[];
  onOrderConfirmed?: (order: any, cart: any) => void;
  onLogout: () => void;
  onEnterFair?: () => void;
}

export default function OndcBuyerScreen({
  inventory,
  onOrderConfirmed,
  onLogout,
  onEnterFair,
}: OndcBuyerScreenProps) {
  const { t, currentLang, languages } = useLanguage();
  const activeLangMeta = languages?.find((l) => l.code === currentLang) || {
    code: "hi",
    nativeName: "हिन्दी",
    englishName: "Hindi",
    speechLang: "hi-IN",
  };

  const getDisplayTitle = (item: any) => {
    if (!item) return "";
    return getArtisanDisplayTitle(item, currentLang);
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<StoreItem | null>(null);
  const [selectedQty, setSelectedQty] = useState(1);
  const [buyerPlatform, setBuyerPlatform] = useState<"PhonePe Pincode" | "Paytm ONDC">("PhonePe Pincode");
  const gamification = useBuyerGamification();
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 🔍 फुल प्रोडक्ट विवरण स्क्रीन के लिए स्टेट
  const [viewingDetailsProduct, setViewingDetailsProduct] = useState<StoreItem | null>(null);
  const [detailsSpecsLang, setDetailsSpecsLang] = useState<"local" | "en">("local");

  // On-demand AI translation for viewingDetailsProduct if needed
  useEffect(() => {
    if (viewingDetailsProduct && currentLang !== "en" && currentLang !== "hi") {
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
      const prodId = viewingDetailsProduct.id;
      ensureProductLocalization(viewingDetailsProduct, currentLang, apiKey).then((localized) => {
        setViewingDetailsProduct((prev) => {
          if (!prev || prev.id !== prodId) return prev;
          const updatedMap = { ...(prev.localizedContent || {}), [currentLang]: localized };
          return { ...prev, localizedContent: updatedMap };
        });
      });
    }
  }, [viewingDetailsProduct?.id, currentLang]);

  // 🔄 लाइव इन्वेंट्री स्टेट (सेलर डैशबोर्ड से ऑटोमैटिक सिंक)
  const [liveInventory, setLiveInventory] = useState<StoreItem[]>(() => {
    try {
      const saved = localStorage.getItem("kalakriti_inventory");
      return saved ? JSON.parse(saved) : inventory;
    } catch {
      return inventory;
    }
  });

  // सेलर जब भी स्टॉक बदले या Craft Fair / अन्य स्क्रीन से कार्ट बदले, बायर पेज पर रीयल-टाइम ऑटो सिंक
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem("kalakriti_inventory");
        if (saved) {
          setLiveInventory(JSON.parse(saved));
        }
        const savedCart = localStorage.getItem("kalakriti_cart");
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (e) {
        console.warn("इन्वेंट्री / कार्ट सिंक एरर:", e);
      }
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, []);

  useEffect(() => {
    if (inventory && inventory.length > 0) {
      setLiveInventory(inventory);
    }
  }, [inventory]);

  // ── Cart State ──
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("kalakriti_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal Stage: "cart" | "address" | "success"
  const [checkoutStage, setCheckoutStage] = useState<"closed" | "cart" | "address" | "success">("closed");
  const [confirmedOrderDetails, setConfirmedOrderDetails] = useState<ConfirmedOrder | null>(null);

  // ── Delivery Address State ──
  const [address, setAddress] = useState<DeliveryAddress>(() => {
    try {
      const saved = localStorage.getItem("kalakriti_buyer_address");
      return saved
        ? JSON.parse(saved)
        : {
            fullName: "रोहन शर्मा",
            phone: "9876543210",
            street: "फ्लैट 402, शांति हाइट्स, हिल रोड",
            city: "बांद्रा वेस्ट, मुंबई",
            state: "महाराष्ट्र",
            pincode: "400050",
          };
    } catch {
      return {
        fullName: "रोहन शर्मा",
        phone: "9876543210",
        street: "फ्लैट 402, शांति हाइट्स, हिल रोड",
        city: "बांद्रा वेस्ट, मुंबई",
        state: "महाराष्ट्र",
        pincode: "400050",
      };
    }
  });

  const [selectedCourier, setSelectedCourier] = useState<"India Post (डाक घर)" | "Delhivery">("India Post (डाक घर)");

  // Live Fuzzy Search
  const filteredProducts = searchProductsFuzzy(liveInventory, searchQuery);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const { quote: cartQuote } = executeBecknSelect(cart);
  const { formattedEta } = executeBecknInit(cart, address);

  const updateCartAndStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem("kalakriti_cart", JSON.stringify(updatedCart));
  };

  // सेलर के असली उपलब्ध स्टॉक की सटीक गणना (ई-कॉमर्स लॉजिक)
  const getProductStockInfo = (productId: string) => {
    const item = liveInventory.find((it) => it.id === productId);
    const sellerStock = Math.max(0, Number(item?.quantity ?? 0));
    const inCartQty = cart.find((c) => c.product.id === productId)?.quantity || 0;
    const availableToAdd = Math.max(0, sellerStock - inCartQty);
    return { sellerStock, inCartQty, availableToAdd };
  };

  // Add to cart with strict stock enforcement
  const handleAddToCart = (product: StoreItem, quantityToAdd: number) => {
    const { availableToAdd } = getProductStockInfo(product.id);

    if (availableToAdd <= 0) {
      alert(t("out_of_stock_alert"));
      return;
    }

    const finalQty = Math.min(quantityToAdd, availableToAdd);
    const existingIndex = cart.findIndex((c) => c.product.id === product.id);
    let updatedCart: CartItem[];

    if (existingIndex > -1) {
      updatedCart = cart.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + finalQty }
          : item
      );
    } else {
      updatedCart = [...cart, { product, quantity: finalQty }];
    }

    updateCartAndStorage(updatedCart);
    awardXp(50, "Added craft to cart");
    setSelectedProduct(null);
    setSelectedQty(1);
  };

  const handleIncreaseCartQty = (productId: string) => {
    const item = liveInventory.find((it) => it.id === productId);
    const maxSellerStock = Math.max(0, Number(item?.quantity ?? 0));

    const updated = cart.map((c) => {
      if (c.product.id === productId) {
        if (c.quantity >= maxSellerStock) {
          alert(t("stock_limit_alert").replace("{count}", String(maxSellerStock)));
          return c;
        }
        return { ...c, quantity: c.quantity + 1 };
      }
      return c;
    });
    updateCartAndStorage(updated);
  };

  const handleDecreaseCartQty = (productId: string) => {
    const target = cart.find((item) => item.product.id === productId);
    if (!target) return;
    if (target.quantity > 1) {
      const updated = cart.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
      updateCartAndStorage(updated);
    } else {
      const updated = cart.filter((item) => item.product.id !== productId);
      updateCartAndStorage(updated);
    }
  };

  // Revalidate cart items against fresh inventory before checkout or stage change
  const validateCartItemsAgainstStock = (): boolean => {
    let freshInv: StoreItem[] = liveInventory;
    try {
      const saved = localStorage.getItem("kalakriti_inventory");
      if (saved) {
        freshInv = JSON.parse(saved);
      }
    } catch {}

    for (const c of cart) {
      const matched = freshInv.find((inv) => inv.id === c.product.id);
      if (!matched) {
        alert(
          currentLang === "hi"
            ? `क्षमा करें, "${getDisplayTitle(c.product)}" अब उपलब्ध नहीं है। कृपया इसे कार्ट से हटाएं।`
            : `Sorry, "${getDisplayTitle(c.product)}" is no longer available. Please remove it from your cart.`
        );
        return false;
      }
      const available = Math.max(0, Number(matched.quantity ?? 0));
      if (available <= 0) {
        alert(
          currentLang === "hi"
            ? `क्षमा करें, "${getDisplayTitle(c.product)}" का स्टॉक समाप्त हो चुका है।`
            : `Sorry, "${getDisplayTitle(c.product)}" is out of stock.`
        );
        return false;
      }
      if (c.quantity > available) {
        alert(
          currentLang === "hi"
            ? `क्षमा करें, "${getDisplayTitle(c.product)}" के केवल ${available} पीस उपलब्ध हैं। कृपया कार्ट में संख्या घटाएं।`
            : `Sorry, only ${available} items available for "${getDisplayTitle(c.product)}". Please adjust cart quantity.`
        );
        return false;
      }
    }
    return true;
  };

  // ── Step 4 & 5: Save Address, Deduct Stock & Sync Orders (E-Commerce Logic) ──
  const handleFinalOrderPlacement = () => {
    if (!address.fullName || !address.phone || !address.pincode || !address.street) {
      alert(t("fill_address_alert"));
      return;
    }

    if (cart.length === 0) {
      alert(t("cart_empty_alert"));
      return;
    }

    if (!validateCartItemsAgainstStock()) {
      return;
    }

    localStorage.setItem("kalakriti_buyer_address", JSON.stringify(address));

    // 1. ONDC Beckn Transaction Execute
    const orderResult = executeBecknConfirm(cart, address, "UPI (PhonePe / GPay)");
    setConfirmedOrderDetails(orderResult);

    // Read freshest inventory
    let freshInventory = liveInventory;
    try {
      const saved = localStorage.getItem("kalakriti_inventory");
      if (saved) freshInventory = JSON.parse(saved);
    } catch {}

    // 2. सेलर की इन्वेंट्री में से खरीदे गए सभी सामानों का स्टॉक घटाएं
    const updatedInventory = freshInventory.map((invItem) => {
      const cartMatch = cart.find((c) => c.product.id === invItem.id);
      if (cartMatch) {
        const remainingQty = Math.max(0, (Number(invItem.quantity) || 0) - cartMatch.quantity);
        return { ...invItem, quantity: remainingQty };
      }
      return invItem;
    });

    setLiveInventory(updatedInventory);
    localStorage.setItem("kalakriti_inventory", JSON.stringify(updatedInventory));

    // 3. सेलर के आर्डर टैब में नए आर्डर जोड़ें (Deduplicated)
    try {
      const currentOrders = JSON.parse(localStorage.getItem("kalakriti_orders") || "[]");
      const newArtisanOrders = cart.map((c) => ({
        orderId: orderResult.orderId,
        productId: c.product.id,
        productTitle: getDisplayTitle(c.product) || "हस्तशिल्प उत्पाद",
        buyerCity: `${address.city} (${address.state})`,
        buyerPlatform: buyerPlatform,
        amount: (Number(c.product.suggested_price) || 199) * c.quantity,
        courier: selectedCourier,
        status: "Pending" as const,
        orderDate: "अभी-अभी (Just now)",
        quantity: c.quantity,
        sellerName: c.product.artisan_name,
      }));

      const existingFiltered = currentOrders.filter((eo: any) =>
        !newArtisanOrders.some((no) => no.orderId === eo.orderId && (no.productId && eo.productId ? no.productId === eo.productId : no.productTitle === eo.productTitle))
      );
      const mergedOrders = [...newArtisanOrders, ...existingFiltered];
      localStorage.setItem("kalakriti_orders", JSON.stringify(mergedOrders));
    } catch (err) {
      console.warn("आर्डर सिंक करने में त्रुटि:", err);
    }

    // 4. बायर को ऑर्डर रिसीट भेजें
    if (onOrderConfirmed) {
      onOrderConfirmed(orderResult, cart);
    }

    // 5. स्टोरेज इवेंट ट्रिगर करें ताकि सेलर डैशबोर्ड तुरंत रीयल-टाइम अपडेट हो जाए
    window.dispatchEvent(new Event("storage"));
    recordArtisanOrderSupport(orderResult?.orderId); // recordArtisanOrderSupport()

    // कार्ट खाली करें
    updateCartAndStorage([]);
    setCheckoutStage("success");
  };

  const handleQuickAdd = (item: StoreItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const localized = getLocalizedProductContent(item, currentLang);
    const liveItem = liveInventory.find((i) => i.id === item.id) || item;
    const stock = Math.max(0, Number(liveItem.quantity ?? 0));
    if (stock <= 0) return;

    const existing = cart.find((c) => c.product.id === item.id);
    const currentInCart = existing ? existing.quantity : 0;
    if (currentInCart >= stock) return;

    let updated: CartItem[];
    if (existing) {
      updated = cart.map((c) =>
        c.product.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      );
    } else {
      updated = [...cart, { product: item, quantity: 1 }];
    }
    updateCartAndStorage(updated);
    awardXp(50, "Added craft from Marketplace");
    recordCraftDiscovery(item.id, item.categoryName || item.title_en || item.title_hi);
    setToastMessage(`✓ "${localized.title}" ${t("marketplace_added_toast")} (+50 XP)`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const openAddToCartModal = (item: StoreItem) => {
    recordCraftDiscovery(item.id, item.categoryName || item.title_en || item.title_hi);
    const { availableToAdd } = getProductStockInfo(item.id);
    setSelectedProduct(item);
    setSelectedQty(availableToAdd > 0 ? 1 : 0);
  };

  const activeStockInfo = selectedProduct
    ? getProductStockInfo(selectedProduct.id)
    : { sellerStock: 0, inCartQty: 0, availableToAdd: 0 };

  return (
    <div
      className="size-full flex items-center justify-center"
      style={{ background: "#EDE9FE", fontFamily: "'Poppins', sans-serif" }}
    >
      <div
        className="relative flex flex-col overflow-hidden bg-slate-50"
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
              onClick={onLogout}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 border border-white/25 flex items-center justify-center text-white active:scale-95 transition cursor-pointer flex-shrink-0 touch-press"
              title={t("marketplace_back_customer")}
              aria-label={t("marketplace_back_customer")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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
              onClick={() => setShowDiscoveryModal(true)}
              className="flex items-center gap-1 bg-amber-400/25 hover:bg-amber-400/35 text-amber-200 border border-amber-300/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition active:scale-95 shadow-xs touch-press"
              title="View Explorer Quests & Badges"
            >
              <span>✨</span>
              <span className="text-white font-extrabold">{t("gamification_level")} {gamification.level}</span>
              <span className="opacity-90">({gamification.xp} {t("gamification_xp")})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDiscoveryModal(true)}
              className="flex items-center gap-1 text-[10px] font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full transition cursor-pointer active:scale-95 touch-press"
            >
              <span>🏆</span>
              <span>{t("marketplace_craft_explorer_quests")} ({gamification.badges.length})</span>
            </button>
          </div>
        </header>

        {/* ── Toast Alert ── */}
        {toastMessage && (
          <div className="absolute top-20 left-3 right-3 z-40 bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-slide-up">
            <span>🎉</span>
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

        {/* ── MAIN SCROLLABLE CONTENT ── */}
        <main
          className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3"
          style={{ scrollbarWidth: "none", paddingBottom: totalCartCount > 0 ? 140 : 80 }}
        >
          {/* Hero Banner */}
          <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-violet-900 to-purple-700 p-3.5 text-white shadow-md relative animate-fade-in">
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
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onEnterFair) onEnterFair();
                  }}
                  className="rounded-xl bg-white px-3 py-1.5 font-bold text-violet-900 shadow-md hover:bg-amber-50 active:scale-95 transition flex items-center gap-1.5 cursor-pointer text-xs touch-press"
                >
                  <span>🎪</span>
                  <span>{t("enter_fair_btn")}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-9 pr-8 rounded-xl bg-white text-slate-800 text-xs outline-none shadow-xs border border-stone-200 font-medium transition-all duration-150 focus:border-violet-400 focus:ring-2 focus:ring-violet-200/50"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-90 text-xs font-bold transition cursor-pointer touch-press"
              >
                ✕
              </button>
            )}
          </div>

          {/* ── ONDC Live Broadcast Bar ── */}
          <div className="bg-purple-100/80 border border-purple-200/80 rounded-xl px-3 py-1.5 flex items-center justify-between text-[10px] text-purple-900 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t("ondc_open_feed")}</span>
            </span>
            <span className="font-mono text-[9px] text-purple-700">Beckn v1.1 • nic2004:52110</span>
          </div>

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
              {filteredProducts.length} {t("marketplace_products_count")}
            </span>
          </div>

          {/* Product Grid (2 columns on mobile, touch-friendly, localized with TiltCard) */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-xs font-semibold">{t("no_items_found_query").replace("{query}", searchQuery)}</p>
              <p className="text-[10px] mt-1">{t("search_suggestion_hint")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {filteredProducts.map((item, idx) => {
                const localized = getLocalizedProductContent(item, currentLang);
                const stock = Math.max(0, Number(item.quantity ?? 0));
                const isOutOfStock = stock <= 0;

                return (
                  <TiltCard
                    key={item.id}
                    maxTilt={8}
                    scale={1.01}
                    className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-xs border border-stone-200 hover:shadow-md transition-all duration-200 flex flex-col justify-between animate-card-enter"
                    style={{ animationDelay: `${Math.min(idx * 40, 280)}ms` }}
                    onClick={() => {
                      setViewingDetailsProduct(item);
                      recordCraftDiscovery(item.id, item.categoryName || item.title_en || item.title_hi);
                    }}
                  >
                    <div className="aspect-square bg-stone-100 overflow-hidden relative group">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={localized.title}
                          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                            isOutOfStock ? "grayscale opacity-75" : ""
                          }`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl">🎨</div>
                      )}
                      <span className="absolute top-1.5 right-1.5 rounded-full bg-black/60 backdrop-blur-xs px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">
                        {t("marketplace_handmade_tag")}
                      </span>
                      <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 backdrop-blur-xs px-1.5 py-0.5 text-[8px] font-medium text-white truncate max-w-[80%]">
                        📍 {item.artisan_region || "India"}
                      </span>
                      {isOutOfStock && (
                        <span className="absolute top-1.5 left-1.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider shadow-xs">
                          {t("out_of_stock")}
                        </span>
                      )}
                    </div>

                    <div className="p-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="line-clamp-2 font-bold text-stone-900 text-xs leading-snug">
                          {localized.title}
                        </h4>
                        <p className="mt-0.5 text-[9px] text-stone-500 line-clamp-1">
                          {currentLang === "en" ? (item.title_local || item.title_hi) : item.title_en}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-stone-100">
                        <div>
                          <span className="text-xs font-black text-stone-900">₹{item.suggested_price}</span>
                          <p className="text-[8px] font-semibold text-emerald-700">
                            {isOutOfStock ? t("out_of_stock") : `${t("marketplace_in_stock")} (${stock})`}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isOutOfStock) return;
                            handleQuickAdd(item, e);
                          }}
                          className={`rounded-lg px-2 py-1 text-[10px] font-bold shadow-xs transition touch-press ${
                            isOutOfStock
                              ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                              : "bg-violet-700 hover:bg-violet-800 text-white cursor-pointer"
                          }`}
                          title={t("marketplace_add_cart")}
                        >
                          {t("marketplace_add_cart")}
                        </button>
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </div>
          )}
        </main>

        {/* ── Floating Bottom Cart Bar ── */}
        {totalCartCount > 0 && checkoutStage === "closed" && (
          <div className="absolute bottom-12 left-4 right-4 z-40 animate-slide-up">
            <div
              onClick={() => setCheckoutStage("cart")}
              className="p-3 rounded-2xl text-white shadow-xl flex items-center justify-between cursor-pointer touch-press transition"
              style={{
                background:
                  buyerPlatform === "PhonePe Pincode"
                    ? "linear-gradient(135deg, #4C1D95 0%, #5B21B6 100%)"
                    : "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm font-bold shadow-xs">
                  🛒
                </div>
                <div>
                  <p className="text-xs font-bold flex items-center gap-1">
                    <span
                      key={totalCartCount}
                      className="inline-block font-black text-amber-300 animate-badge-bump"
                    >
                      {totalCartCount}
                    </span>
                    <span>{t("cart_items_count").replace("{count}", "").trim()}</span>
                  </p>
                  <p className="text-[10px] text-white/85">
                    {t("cart_total_amount").replace("{amount}", "").trim()}{" "}
                    <AnimatedNumber
                      value={cartQuote.totalPrice}
                      prefix="₹"
                      className="font-extrabold text-white"
                    />
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold bg-white text-slate-900 px-3 py-1.5 rounded-xl shadow-xs active:scale-95 transition touch-press">
                <span>{t("checkout_action")}</span>
                <span>➔</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 📜 फुल प्रोडक्ट विवरण स्क्रीन (PRODUCT FULL DETAILS MODAL)                */}
        {/* ========================================================================= */}
        {viewingDetailsProduct && (
          <div className="absolute inset-0 z-50 bg-[#FAF5FF] flex flex-col overflow-hidden animate-page-enter">
            <div
              className="flex items-center justify-between px-4 py-3.5 flex-shrink-0 text-white shadow-md"
              style={{
                background:
                  buyerPlatform === "PhonePe Pincode"
                    ? "linear-gradient(135deg, #5f259f 0%, #3b1466 100%)"
                    : "linear-gradient(135deg, #00b9f5 0%, #0077b6 100%)",
              }}
            >
              <button
                type="button"
                onClick={() => setViewingDetailsProduct(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 border border-white/25 active:scale-95 transition cursor-pointer text-white touch-press"
                title={t("go_back")}
                aria-label={t("go_back")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <h2
                className="text-base font-bold tracking-wide"
                style={{ fontFamily: "'Noto Serif', serif" }}
              >
                {t("product_details_header")}
              </h2>
              <div className="w-9" />
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ scrollbarWidth: "none", paddingBottom: 110 }}
            >
              {/* बड़ी प्रोडक्ट इमेज */}
              <div className="relative w-full h-64 rounded-3xl overflow-hidden shadow-md bg-white border border-purple-100">
                <img
                  src={viewingDetailsProduct.imageUrl}
                  alt={viewingDetailsProduct.title_en}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-full text-xs font-bold text-[#5B21B6] shadow-xs">
                  {t("ondc_certified_seal")}
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs font-medium px-3 py-1 rounded-full">
                  📍 {viewingDetailsProduct.artisan_region || "भारत"}
                </div>
              </div>

              {/* विवरण, कथा व विनिर्देश */}
              {(() => {
                const targetLangCode = detailsSpecsLang === "local" ? currentLang : "en";
                const altLangCode = detailsSpecsLang === "local" ? "en" : currentLang;
                const activeContent = getLocalizedProductContent(viewingDetailsProduct, targetLangCode);
                const altContent = getLocalizedProductContent(viewingDetailsProduct, altLangCode);

                return (
                  <>
                    {/* टाइटल और मूल्य */}
                    <div className="bg-white rounded-2xl p-4 shadow-xs border border-purple-100 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3
                            className="text-lg font-bold text-stone-900 leading-snug"
                            style={{ fontFamily: "'Noto Serif', serif" }}
                          >
                            {activeContent.title}
                          </h3>
                          {altContent.title && altContent.title !== activeContent.title && (
                            <p className="text-xs text-stone-500 mt-0.5">
                              {altContent.title}
                            </p>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg flex-shrink-0">
                          {t("savings_badge")}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2.5 pt-1">
                        <span className="text-2xl font-extrabold text-[#5B21B6]">
                          ₹{viewingDetailsProduct.suggested_price}
                        </span>
                        <span className="text-sm text-stone-400 line-through">
                          ₹{Math.round((Number(viewingDetailsProduct.suggested_price) || 199) * 1.4)}
                        </span>
                        <span className="text-xs text-stone-500 font-medium ml-auto">
                          {t("stock_available_pcs").replace("{count}", String(Math.max(0, Number(viewingDetailsProduct.quantity ?? 0))))}
                        </span>
                      </div>
                    </div>

                    {/* कारीगर कार्ड */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-200/70 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#5B21B6] text-white flex items-center justify-center text-xl shadow-xs">
                        🏺
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">
                          {t("artisan_maker_title")}
                        </p>
                        <h4
                          className="text-sm font-bold text-stone-900"
                          style={{ fontFamily: "'Noto Serif', serif" }}
                        >
                          {viewingDetailsProduct.artisan_name || t("craft_artisan_default")}
                        </h4>
                        <p className="text-xs text-stone-600">
                          {viewingDetailsProduct.artisan_region || t("craft_cluster_default")}
                        </p>
                      </div>
                    </div>

                    {/* विरासत कथा */}
                    <div className="bg-white rounded-2xl p-4 shadow-xs border border-purple-100 space-y-2">
                      <h4
                        className="text-sm font-bold text-stone-900 flex items-center gap-1.5"
                        style={{ fontFamily: "'Noto Serif', serif" }}
                      >
                        <span>📜</span>
                        <span>{t("heritage_story_title")}</span>
                      </h4>
                      <p className="text-xs text-stone-700 leading-relaxed">
                        {activeContent.story || activeContent.quick_summary}
                      </p>
                      {activeContent.quick_summary && activeContent.quick_summary !== activeContent.story && (
                        <p className="text-[11px] text-stone-500 leading-relaxed italic border-t border-stone-100 pt-2">
                          {activeContent.quick_summary}
                        </p>
                      )}
                    </div>

                    {/* विनिर्देश तालिका */}
                    <div className="bg-white rounded-2xl p-4 shadow-xs border border-purple-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4
                          className="text-sm font-bold text-stone-900"
                          style={{ fontFamily: "'Noto Serif', serif" }}
                        >
                          {t("specs_table_title")}
                        </h4>
                        <div className="flex bg-purple-100/70 p-0.5 rounded-lg text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => setDetailsSpecsLang("local")}
                            className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                              detailsSpecsLang === "local"
                                ? "bg-[#5B21B6] text-white shadow-xs"
                                : "text-purple-800"
                            }`}
                          >
                            {activeLangMeta.nativeName}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDetailsSpecsLang("en")}
                            className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                              detailsSpecsLang === "en"
                                ? "bg-[#5B21B6] text-white shadow-xs"
                                : "text-purple-800"
                            }`}
                          >
                            English
                          </button>
                        </div>
                      </div>

                      <div className="divide-y divide-purple-50 text-xs">
                        {activeContent.specs && activeContent.specs.length > 0 ? (
                          activeContent.specs.map((spec, i) => (
                            <div key={i} className="py-2 flex justify-between gap-4">
                              <span className="text-stone-500 font-medium">{spec.label}</span>
                              <span className="text-stone-900 font-semibold text-right">
                                {spec.value}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-stone-400 py-2">
                            {t("specs_not_available")}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* बॉटम स्टिकी बार */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-purple-100 flex items-center gap-3 shadow-lg">
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-semibold">{t("price_label")}</p>
                <p className="text-lg font-black text-[#5B21B6]">
                  ₹{viewingDetailsProduct.suggested_price}
                </p>
              </div>

              {(() => {
                const liveDetail = liveInventory.find((i) => i.id === viewingDetailsProduct.id) || viewingDetailsProduct;
                const isDetailOutOfStock = Math.max(0, Number(liveDetail.quantity ?? 0)) <= 0;
                return (
                  <button
                    type="button"
                    disabled={isDetailOutOfStock}
                    onClick={() => {
                      const itemToAdd = liveDetail;
                      setViewingDetailsProduct(null);
                      openAddToCartModal(itemToAdd);
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md touch-press transition-all flex items-center justify-center gap-2 ${
                      isDetailOutOfStock
                        ? "bg-slate-400 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    style={{
                      background:
                        isDetailOutOfStock
                          ? "#94a3b8"
                          : "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <span>🛒</span>
                    <span>
                      {isDetailOutOfStock
                        ? t("out_of_stock")
                        : t("add_to_cart")}
                    </span>
                  </button>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── 🛒 Product Quick-View Modal (Quantity Selector - Stock Guard) ── */}
        {selectedProduct && (
          <div
            onClick={() => setSelectedProduct(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end z-50 animate-fade-in cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full rounded-t-3xl p-5 space-y-3.5 max-h-[85%] overflow-y-auto animate-slide-up cursor-default"
            >
              <div className="flex justify-between items-start border-b pb-3">
                <div className="flex gap-3">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.title_en}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{getDisplayTitle(selectedProduct)}</h3>
                    <p className="text-xs text-slate-500">{t("artisan_label")} {selectedProduct.artisan_name}</p>
                    <p className="text-sm font-extrabold text-emerald-700 mt-0.5">
                      ₹{selectedProduct.suggested_price}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center cursor-pointer touch-press"
                >
                  ✕
                </button>
              </div>

              {/* Quantity Selector Section */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-800">{t("buy_qty_label")}</p>
                  <p className="text-[10px] text-slate-500">
                    {t("stock_available_pcs").replace("{count}", String(activeStockInfo.sellerStock))}
                    {activeStockInfo.inCartQty > 0 && ` (${activeStockInfo.inCartQty} ${t("already_in_cart")})`}
                  </p>
                </div>

                {/* Counter Stepper: कभी भी सेलर के स्टॉक से ऊपर नहीं जाएगा */}
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-300 shadow-xs">
                  <button
                    type="button"
                    disabled={selectedQty <= 1}
                    onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                    className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center transition touch-press ${
                      selectedQty <= 1
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-slate-700 hover:bg-slate-100 cursor-pointer"
                    }`}
                  >
                    -
                  </button>

                  <span
                    key={selectedQty}
                    className="text-xs font-extrabold text-purple-900 w-5 text-center inline-block animate-badge-bump"
                  >
                    {selectedQty}
                  </span>

                  <button
                    type="button"
                    disabled={selectedQty >= activeStockInfo.availableToAdd}
                    onClick={() =>
                      setSelectedQty((q) => Math.min(activeStockInfo.availableToAdd, q + 1))
                    }
                    className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center transition touch-press ${
                      selectedQty >= activeStockInfo.availableToAdd
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-purple-700 hover:bg-purple-100 cursor-pointer"
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 px-1">
                <span>{t("total_price_label").replace("{qty}", String(selectedQty))}</span>
                <span className="text-base font-extrabold text-slate-900">
                  <AnimatedNumber value={(Number(selectedProduct.suggested_price) || 199) * selectedQty} prefix="₹" />
                </span>
              </div>

              <button
                type="button"
                disabled={activeStockInfo.availableToAdd <= 0}
                onClick={() => handleAddToCart(selectedProduct, selectedQty)}
                className={`w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-md touch-press transition flex items-center justify-center gap-2 ${
                  activeStockInfo.availableToAdd <= 0
                    ? "bg-slate-400 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                style={{
                  background:
                    activeStockInfo.availableToAdd <= 0
                      ? "#94a3b8"
                      : buyerPlatform === "PhonePe Pincode"
                      ? "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)"
                      : "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                }}
              >
                <span>🛒 </span>
                <span>
                  {activeStockInfo.availableToAdd <= 0
                    ? t("out_of_stock")
                    : t("add_to_cart")}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 1: Cart Modal (Empty Cart Handled - Bug 4 Fixed) ── */}
        {checkoutStage === "cart" && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end z-50 animate-fade-in cursor-pointer"
            onClick={() => setCheckoutStage("closed")}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full rounded-t-3xl p-5 space-y-3.5 max-h-[88%] overflow-y-auto animate-slide-up cursor-default"
            >
              <div className="flex justify-between items-center border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛒 </span>
                  <h3 className="text-sm font-bold text-slate-900">{t("your_cart_title").replace("{count}", String(totalCartCount))}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutStage("closed")}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center cursor-pointer touch-press"
                >
                  ✕
                </button>
              </div>

              {/* जब कार्ट खाली हो (Issue 4 Fixed) */}
              {cart.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-purple-50 flex items-center justify-center text-3xl">
                    🛒
                  </div>
                  <h4 className="text-base font-bold text-slate-800">{t("empty_cart_title")}</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {t("empty_cart_desc")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCheckoutStage("closed")}
                    className="mt-3 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer touch-press"
                    style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)" }}
                  >
                    {t("start_shopping")}
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {cart.map((cartItem) => {
                      const itemTotal = Number(cartItem.product.suggested_price) * cartItem.quantity;
                      const liveItem = liveInventory.find((i) => i.id === cartItem.product.id);
                      const maxStock = liveItem ? Math.max(0, Number(liveItem.quantity ?? 0)) : 0;

                      return (
                        <div
                          key={cartItem.product.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-200"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={cartItem.product.imageUrl}
                              alt={cartItem.product.title_en}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{getDisplayTitle(cartItem.product)}</h4>
                              <p className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1">
                                <span>₹{cartItem.product.suggested_price} × {cartItem.quantity} = </span>
                                <AnimatedNumber value={itemTotal} prefix="₹" />
                              </p>
                              {maxStock <= 0 ? (
                                <span className="text-[10px] text-red-600 font-bold block">
                                  {currentLang === "hi" ? "स्टॉक समाप्त" : "Out of Stock"}
                                </span>
                              ) : cartItem.quantity > maxStock ? (
                                <span className="text-[10px] text-amber-600 font-bold block">
                                  {currentLang === "hi" ? `केवल ${maxStock} उपलब्ध` : `Only ${maxStock} available`}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* Incrementor/Decrementor */}
                          <div className="flex items-center gap-1.5 bg-white px-1.5 py-0.5 rounded-xl border border-slate-300">
                            <button
                              type="button"
                              onClick={() => handleDecreaseCartQty(cartItem.product.id)}
                              className="w-5 h-5 text-xs font-bold text-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-100 rounded touch-press"
                            >
                              -
                            </button>
                            <span
                              key={cartItem.quantity}
                              className="text-xs font-bold text-slate-900 w-4 text-center inline-block animate-badge-bump"
                            >
                              {cartItem.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={cartItem.quantity >= maxStock || maxStock <= 0}
                              onClick={() => handleIncreaseCartQty(cartItem.product.id)}
                              className={`w-5 h-5 text-xs font-bold flex items-center justify-center rounded touch-press ${
                                cartItem.quantity >= maxStock || maxStock <= 0
                                  ? "text-slate-300 cursor-not-allowed"
                                  : "text-slate-600 hover:bg-slate-100 cursor-pointer"
                              }`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Price Quote Summary */}
                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>{t("items_total_value")}</span>
                      <span><AnimatedNumber value={cartQuote.itemTotal} prefix="₹" /></span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{t("courier_india_post")}</span>
                      <span className={cartQuote.deliveryFee === 0 ? "text-emerald-700 font-bold" : ""}>
                        {cartQuote.deliveryFee === 0 ? t("courier_free_promo") : `₹${cartQuote.deliveryFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-extrabold text-slate-900 text-sm border-t border-purple-200/80 pt-1">
                      <span>{t("total_payable")}</span>
                      <span><AnimatedNumber value={cartQuote.totalPrice} prefix="₹" /></span>
                    </div>
                  </div>

                  {/* Proceed to Address Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (validateCartItemsAgainstStock()) {
                        setCheckoutStage("address");
                      }
                    }}
                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-md touch-press transition flex items-center justify-center gap-2 cursor-pointer"
                    style={{
                      background:
                        buyerPlatform === "PhonePe Pincode"
                          ? "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)"
                          : "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                    }}
                  >
                    <span>📍 </span>
                    <span>{t("proceed_delivery")}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── STAGE 2: Step 4 Delivery Address ── */}
        {checkoutStage === "address" && (
          <div
            onClick={() => setCheckoutStage("closed")}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end z-50 animate-fade-in cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full rounded-t-3xl p-5 space-y-3.5 max-h-[90%] overflow-y-auto animate-slide-up cursor-default"
            >
              <div className="flex justify-between items-center border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStage("cart")}
                    className="text-xs text-purple-700 font-bold hover:underline cursor-pointer touch-press"
                  >
                    {t("back_to_cart")}
                  </button>
                  <span className="text-slate-300">|</span>
                  <h3 className="text-sm font-bold text-slate-900">{t("delivery_address_header")}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutStage("closed")}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center cursor-pointer touch-press"
                >
                  ✕
                </button>
              </div>

              {/* Delivery Address Form */}
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">{t("full_name_label")}</label>
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none focus:border-purple-600"
                    placeholder="Rohan Sharma"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">{t("mobile_label")}</label>
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none focus:border-purple-600"
                      placeholder="10-digit Mobile"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">{t("pincode_label")}</label>
                    <input
                      type="text"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none focus:border-purple-600 font-mono"
                      placeholder="400050"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">{t("house_street_label")}</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none focus:border-purple-600"
                    placeholder="Flat 402, Shanti Heights, Hill Road"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">{t("city_label")}</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">{t("state_label")}</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Logistics Provider Selection */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>{t("courier_partner_title")}</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                    ETA: {formattedEta}
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCourier("India Post (डाक घर)")}
                    className="p-2 rounded-xl text-left border transition-all text-xs cursor-pointer touch-press"
                    style={{
                      borderColor: selectedCourier === "India Post (डाक घर)" ? "#5B21B6" : "#E2E8F0",
                      background: selectedCourier === "India Post (डाक घर)" ? "#F3E8FF" : "#FFFFFF",
                    }}
                  >
                    <p className="font-bold text-slate-900 text-[11px]">🇮🇳 India Post</p>
                    <p className="text-[10px] text-slate-500">{t("speed_post_sub")}</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCourier("Delhivery")}
                    className="p-2 rounded-xl text-left border transition-all text-xs cursor-pointer touch-press"
                    style={{
                      borderColor: selectedCourier === "Delhivery" ? "#5B21B6" : "#E2E8F0",
                      background: selectedCourier === "Delhivery" ? "#F3E8FF" : "#FFFFFF",
                    }}
                  >
                    <p className="font-bold text-slate-900 text-[11px]">⚡ Delhivery</p>
                    <p className="text-[10px] text-slate-500">{t("delhivery_express_sub")}</p>
                  </button>
                </div>
              </div>

              {/* Pay & Order Button */}
              <button
                type="button"
                onClick={handleFinalOrderPlacement}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-md touch-press transition flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background:
                    buyerPlatform === "PhonePe Pincode"
                      ? "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)"
                      : "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                }}
              >
                <span>⚡</span>
                <span>{t("pay_order_upi")} (Pay ₹{cartQuote.totalPrice})</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 3: Order Confirmation & Live Tracking ── */}
        {checkoutStage === "success" && confirmedOrderDetails && (
          <div
            onClick={() => setCheckoutStage("closed")}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end z-50 animate-fade-in cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full rounded-t-3xl p-5 space-y-4 max-h-[90%] overflow-y-auto animate-slide-up text-center cursor-default"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto shadow-xs animate-scale-in">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t("order_confirmed_title")}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("order_id_label")} <span className="font-mono font-bold text-purple-800">{confirmedOrderDetails.orderId}</span>
                </p>
              </div>

              <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-purple-900">
                  <span>{t("eta_label")}</span>
                  <span>{confirmedOrderDetails.estimatedDeliveryDate}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {t("courier_label")} <span className="font-semibold text-slate-900">{confirmedOrderDetails.courierName}</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  {t("delivery_address_label")} {confirmedOrderDetails.deliveryAddress.street}, {confirmedOrderDetails.deliveryAddress.city}
                </p>
                <div className="border-t border-purple-200/80 pt-1 flex justify-between text-emerald-800 font-bold">
                  <span>{t("total_paid_label")}</span>
                  <span>₹{confirmedOrderDetails.quote.totalPrice}</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 font-semibold">
                {t("artisan_payout_notice").replace("{amount}", String(confirmedOrderDetails.quote.artisanShare))}
              </div>

              <button
                type="button"
                onClick={() => setCheckoutStage("closed")}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-md touch-press transition cursor-pointer"
                style={{
                  background:
                    buyerPlatform === "PhonePe Pincode"
                      ? "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)"
                      : "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                }}
              >
                {t("continue_shopping")}
              </button>
            </div>
          </div>
        )}

        {/* ── Artisan Discovery & Quests Modal (In-Shell) ── */}
        {showDiscoveryModal && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in cursor-pointer"
            onClick={() => setShowDiscoveryModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-sm w-full p-4 max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-200 animate-modal-enter cursor-default"
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
                  onClick={() => setShowDiscoveryModal(false)}
                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-xs cursor-pointer touch-press"
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
                {onEnterFair && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDiscoveryModal(false);
                      onEnterFair();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs transition cursor-pointer touch-press"
                  >
                    {t("enter_fair_btn")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowDiscoveryModal(false)}
                  className={`py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer touch-press ${
                    onEnterFair ? "px-4" : "w-full"
                  }`}
                >
                  {t("marketplace_close")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Bottom Bar: Logout ── */}
        <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between px-5 flex-shrink-0">
          <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>{t("buyer_sandbox_badge")}</span>
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 active:scale-95 cursor-pointer"
          >
            {t("logout")}
          </button>
        </div>
      </div>
    </div>
  );
}