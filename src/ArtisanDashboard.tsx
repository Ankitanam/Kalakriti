// src/ArtisanDashboard.tsx
import React, { useState, useMemo } from "react";
import { StoreItem } from "./App";
import { useLanguage } from "./context/LanguageContext";
import { LanguageDropdown } from "./components/LanguageDropdown";
import { getDisplayTitle, calculateArtisanEarnings, getLocalizedCity } from "./utils/artisanAiService";
import { AnimatedNumber } from "./components/motion/MotionPrimitives";
import { OpportunitiesTab } from "./components/OpportunitiesTab";

export interface OrderItem {
  orderId: string;
  productTitle: string;
  buyerCity: string;
  buyerPlatform: "PhonePe Pincode" | "Paytm ONDC" | "Magicpin";
  amount: number;
  courier: "India Post (डाक घर)" | "Delhivery";
  status: "Pending" | "Packed" | "Shipped";
  orderDate: string;
  productId?: string;
  quantity?: number;
  sellerName?: string;
}

interface ArtisanDashboardProps {
  inventory: StoreItem[];
  orders?: OrderItem[];
  onAddNewProduct: () => void;
  onBack: () => void;
  onPreviewProduct: (product: StoreItem) => void;
  onIncreaseQty: (id: string) => void;
  onDecreaseQty: (id: string) => void;
  onRemoveProduct: (id: string) => void;
  onDispatchOrder?: (orderId: string) => void;
  onSwitchToBuyer?: () => void;
  onLogout: () => void;
}

export default function ArtisanDashboard({
  inventory,
  orders: propOrders,
  onAddNewProduct,
  onBack,
  onPreviewProduct,
  onIncreaseQty,
  onDecreaseQty,
  onRemoveProduct,
  onDispatchOrder,
  onSwitchToBuyer,
  onLogout,
}: ArtisanDashboardProps) {
  const { t, currentLang } = useLanguage();
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "earnings" | "opportunities">("products");
  const [selectedCertItem, setSelectedCertItem] = useState<StoreItem | null>(null);

  // Synced Orders State
  const [localOrders, setLocalOrders] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem("kalakriti_orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const rawOrders = propOrders && propOrders.length > 0 ? propOrders : localOrders;
  const inventoryIds = new Set(inventory.map((item) => item.id));
  const inventoryTitles = new Set(
    inventory.map((item) => item.title_hi || item.title_en || item.title_local).filter(Boolean)
  );
  const orders = rawOrders.filter((o) => {
    if (inventory.length === 0) return false;
    if (o.productId && inventoryIds.has(o.productId)) return true;
    if (o.productTitle && inventoryTitles.has(o.productTitle)) return true;
    if (o.sellerName && inventory.some((i) => i.artisan_name === o.sellerName)) return true;
    return false;
  });
  const totalUnits = inventory.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const earnings = calculateArtisanEarnings(orders);
  const totalRevenue = earnings.grossSales;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;

  // Derive reliable artisan profile data from inventory without fabricating or blindly picking inventory[0]
  const { primaryCraft, reliableLocation, uniqueCrafts } = useMemo(() => {
    if (!inventory || inventory.length === 0) {
      return { primaryCraft: undefined, reliableLocation: undefined, uniqueCrafts: [] };
    }

    // 1. Gather crafts and categories with frequency counting (avoid picking inventory[0] blindly)
    const craftFrequency = new Map<string, number>();
    const craftsList: string[] = [];

    inventory.forEach((item) => {
      const craftCandidate = (item.craft || item.category || item.categoryName || "").trim();
      if (
        craftCandidate &&
        craftCandidate.toLowerCase() !== "unknown" &&
        craftCandidate.toLowerCase() !== "other"
      ) {
        craftFrequency.set(craftCandidate, (craftFrequency.get(craftCandidate) || 0) + 1);
        if (!craftsList.includes(craftCandidate)) {
          craftsList.push(craftCandidate);
        }
      }
    });

    let primary: string | undefined = undefined;
    let maxCount = 0;
    craftFrequency.forEach((count, craftName) => {
      if (count > maxCount) {
        maxCount = count;
        primary = craftName;
      }
    });

    // 2. Gather reliable artisan region (only if non-empty, genuine, and consistent)
    const regions = inventory
      .map((item) => (item.artisan_region || "").trim())
      .filter((r) => r.length > 0 && r.toLowerCase() !== "unknown");

    let location: string | undefined = undefined;
    if (regions.length > 0) {
      const regionFrequency = new Map<string, number>();
      regions.forEach((r) => regionFrequency.set(r, (regionFrequency.get(r) || 0) + 1));
      let maxRegionCount = 0;
      regionFrequency.forEach((count, reg) => {
        if (count > maxRegionCount) {
          maxRegionCount = count;
          location = reg;
        }
      });
    }

    return { primaryCraft: primary, reliableLocation: location, uniqueCrafts: craftsList };
  }, [inventory]);

  // Dispatch Order Handler
  const handleDispatch = (orderId: string) => {
    if (onDispatchOrder) {
      onDispatchOrder(orderId);
    }
    const updated = orders.map((o) =>
      o.orderId === orderId ? { ...o, status: "Shipped" as const } : o
    );
    setLocalOrders(updated);
  };

  return (
    <div
      className="size-full flex items-center justify-center"
      style={{ background: "#EDE0D4", fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Phone Shell */}
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

        {/* Top App Bar — Clean 2-Row Layout */}
        <div
          className="px-4 py-3 flex-shrink-0 flex flex-col gap-2.5"
          style={{ background: "#6B3A2A" }}
        >
          {/* Row 1: Primary Navigation, Store Identity & Language Selector */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                type="button"
                onClick={onBack}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white active:scale-95 transition cursor-pointer flex-shrink-0 bg-white/15 hover:bg-white/25 border border-white/20"
                title={t("go_back")}
                aria-label={t("go_back")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
                </svg>
              </button>

              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <h1
                  className="text-base font-bold text-white tracking-wide truncate leading-tight"
                  style={{ fontFamily: "'Noto Serif', serif" }}
                >
                  {t("my_store")}
                </h1>
                <p className="text-[11px] text-white/75 font-medium truncate leading-tight mt-0.5">
                  Kalakriti Store
                </p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <LanguageDropdown theme="seller" />
            </div>
          </div>

          {/* Row 2: Status & System Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/15">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30 tracking-wide">
                ONDC Ready
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="h-7.5 px-3 rounded-full text-[11px] font-semibold text-white bg-red-900/60 hover:bg-red-900/80 border border-red-400/30 active:scale-95 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              title={t("logout")}
              aria-label={t("logout")}
            >
              <span className="text-xs">🚪</span>
              <span>{t("logout")}</span>
            </button>
          </div>
        </div>

        {/* ── 4 Tabs (सामान, आर्डर, कमाई, अवसर) WITH SLIDING INDICATOR ── */}
        <div className="flex px-2.5 pt-2.5 pb-1 bg-[#FFFBF7] border-b border-[#F0DFD2] gap-1 flex-shrink-0 relative">
          {/* Sliding indicator pill */}
          <div
            className="absolute top-2.5 bottom-1 rounded-xl transition-transform duration-250 ease-out bg-[#6B3A2A]"
            style={{
              width: "calc((100% - 20px - 9px) / 4)",
              left: 10,
              transform:
                activeTab === "products"
                  ? "translate3d(0, 0, 0)"
                  : activeTab === "orders"
                  ? "translate3d(calc(100% + 3px), 0, 0)"
                  : activeTab === "earnings"
                  ? "translate3d(calc(200% + 6px), 0, 0)"
                  : "translate3d(calc(300% + 9px), 0, 0)",
              boxShadow: "0 2px 8px rgba(107, 58, 42, 0.3)",
            }}
          />

          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className="flex-1 py-1 sm:py-1.5 px-0.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-colors duration-200 text-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 relative z-10 touch-press cursor-pointer"
            style={{
              color: activeTab === "products" ? "white" : "#8B4513",
            }}
            title={`${t("tab_products")} (${inventory.length})`}
          >
            <span className="text-xs leading-none">🏺</span>
            <span className="leading-tight tracking-tight whitespace-nowrap">{t("tab_products")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className="flex-1 py-1 sm:py-1.5 px-0.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-colors duration-200 text-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 relative z-10 touch-press cursor-pointer"
            style={{
              color: activeTab === "orders" ? "white" : "#8B4513",
            }}
            title={t("tab_orders")}
          >
            <span className="text-xs leading-none relative">
              📦
              {pendingOrders > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[8px] flex items-center justify-center flex-shrink-0 font-bold">
                  {pendingOrders}
                </span>
              )}
            </span>
            <span className="leading-tight tracking-tight whitespace-nowrap">{t("tab_orders")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("earnings")}
            className="flex-1 py-1 sm:py-1.5 px-0.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-colors duration-200 text-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 relative z-10 touch-press cursor-pointer"
            style={{
              color: activeTab === "earnings" ? "white" : "#8B4513",
            }}
            title={t("tab_earnings")}
          >
            <span className="text-xs leading-none">💰</span>
            <span className="leading-tight tracking-tight whitespace-nowrap">{t("tab_earnings")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("opportunities")}
            className="flex-1 py-1 sm:py-1.5 px-0.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-colors duration-200 text-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 relative z-10 touch-press cursor-pointer"
            style={{
              color: activeTab === "opportunities" ? "white" : "#8B4513",
            }}
            title={t("tab_opportunities")}
          >
            <span className="text-xs leading-none">✨</span>
            <span className="leading-tight tracking-tight whitespace-nowrap">{t("tab_opportunities")}</span>
          </button>
        </div>

        {/* ── Scrollable Tab Content ── */}
        <div
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          style={{
            scrollbarWidth: "none",
            paddingBottom: activeTab === "opportunities" ? 30 : 105,
          }}
        >
          {/* TAB 1: PRODUCTS INVENTORY */}
          {activeTab === "products" && (
            <>
              <div
                className="rounded-2xl p-3.5 flex items-center justify-between shadow-xs"
                style={{
                  background: "linear-gradient(135deg, #FFF0E6 0%, #FDE7D8 100%)",
                  border: "1.5px solid rgba(196,136,107,0.3)",
                }}
              >
                <div>
                  <p className="text-[10px] font-bold text-[#8B4513] uppercase">{t("stock_availability")}</p>
                  <h2 className="text-xl font-extrabold text-[#3D1F0F]" style={{ fontFamily: "'Noto Serif', serif" }}>
                    {t("types_stock_count").replace("{types}", String(inventory.length)).replace("{pieces}", String(totalUnits))}
                  </h2>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t("live_on_platforms")}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#6B3A2A] text-white flex items-center justify-center text-lg shadow-sm">
                  🛍️
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-[#3D1F0F]" style={{ fontFamily: "'Noto Serif', serif" }}>
                  {t("craft_catalog_title")}
                </span>
                <span className="text-[11px] text-[#9C6644]">{t("stock_action_hint")}</span>
              </div>

              {inventory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-2">📦</div>
                  <h4 className="font-bold text-[#3D1F0F]">{t("no_products")}</h4>
                  <p className="text-xs text-[#9C6644] mt-1">{t("add_first_product_hint")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {inventory.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => onPreviewProduct(item)}
                      className="rounded-2xl overflow-hidden bg-white shadow-xs border flex flex-col cursor-pointer transition-all hover:shadow-md touch-press animate-card-enter"
                      style={{
                        borderColor: "rgba(196,136,107,0.25)",
                        animationDelay: `${Math.min(idx * 50, 300)}ms`,
                      }}
                    >
                      <div className="relative h-32 bg-[#F0EBE3] overflow-hidden">
                        <img src={item.imageUrl} alt={item.title_en} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                        <div
                          className="absolute top-1.5 left-1.5 bg-white/95 px-1.5 py-0.5 rounded text-[8px] font-bold text-[#6B3A2A] flex items-center gap-1 shadow-2xs"
                          title={t("ondc_ready_tooltip")}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{t("ondc_staging_badge")}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCertItem(item);
                          }}
                          className="absolute top-1.5 right-1.5 bg-amber-100 text-amber-900 border border-amber-300 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs touch-press"
                          title="View Digital Certificate"
                        >
                          📜 {t("certified_badge")}
                        </button>
                        {(item.quantity ?? 0) <= 0 && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                            <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-sm">
                              {currentLang === "hi" ? "स्टॉक समाप्त" : "Out of Stock"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-[#3D1F0F] line-clamp-1" style={{ fontFamily: "'Noto Serif', serif" }}>
                            {getDisplayTitle(item, currentLang)}
                          </h4>
                          <p className="text-[10px] text-[#8B4513] line-clamp-1 mt-0.5">
                            {currentLang === "en" ? (item.title_local || item.title_hi) : item.title_en}
                          </p>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-sm font-extrabold text-[#3D1F0F]">₹{item.suggested_price}</span>
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">{t("savings_badge")}</span>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-[#8B4513]">{t("quantity_label")}</span>
                          <div className="flex items-center gap-1 bg-[#FFF0E5] px-1 py-0.5 rounded border border-[#EAC9B0]">
                            <button
                              type="button"
                              disabled={(item.quantity ?? 0) <= 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                if ((item.quantity ?? 0) > 0) {
                                  onDecreaseQty(item.id);
                                }
                              }}
                              className={`w-4 h-4 rounded font-bold text-xs flex items-center justify-center shadow-2xs touch-press ${
                                (item.quantity ?? 0) <= 0
                                  ? "bg-stone-200 text-stone-400 cursor-not-allowed opacity-50"
                                  : "bg-white text-[#6B3A2A]"
                              }`}
                            >
                              −
                            </button>
                            <span
                              key={item.quantity}
                              className="font-bold text-xs text-[#3D1F0F] min-w-3 text-center inline-block animate-badge-bump"
                            >
                              {item.quantity ?? 0}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onIncreaseQty(item.id);
                              }}
                              className="w-4 h-4 rounded bg-[#6B3A2A] text-white font-bold text-xs flex items-center justify-center shadow-2xs touch-press"
                            >
                              ＋
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveProduct(item.id);
                          }}
                          className="w-full mt-2 py-0.8 rounded text-[10px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center gap-1 touch-press"
                        >
                          🗑️ {t("remove_product")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#3D1F0F]" style={{ fontFamily: "'Noto Serif', serif" }}>
                    {t("ondc_live_orders")}
                  </h3>
                  <p className="text-[10px] text-[#9C6644]">{t("orders_from_platforms")}</p>
                </div>
              </div>

              {orders.map((ord, idx) => {
                const matchedItem = inventory.find(
                  (inv) =>
                    inv.suggested_price === ord.amount ||
                    inv.title_hi === ord.productTitle ||
                    inv.title_en === ord.productTitle ||
                    (inv.title_local && inv.title_local === ord.productTitle)
                );
                const displayTitle = matchedItem
                  ? getDisplayTitle(matchedItem, currentLang)
                  : ord.productTitle;

                return (
                  <div
                    key={ord.orderId}
                    className="rounded-2xl p-3 bg-white border border-[#EAC9B0] shadow-xs space-y-2 animate-card-enter"
                    style={{ animationDelay: `${Math.min(idx * 60, 300)}ms` }}
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <div>
                        <span className="text-xs font-bold text-[#3D1F0F]">{displayTitle}</span>
                        <p className="text-[10px] text-[#8B4513]">
                          {getLocalizedCity(ord.buyerCity, currentLang)} · <span className="font-semibold text-purple-700">{ord.buyerPlatform}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-[#3D1F0F]">₹{ord.amount}</span>
                        <p className="text-[9px] text-stone-400">
                          {ord.orderDate?.includes("Just now") || ord.orderDate?.includes("अभी-अभी")
                            ? t("just_now")
                            : ord.orderDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-[11px] text-[#6B3A2A]">
                        <span>🚚</span>
                        <span className="font-medium">
                          {ord.courier?.includes("India Post")
                            ? t("courier_india_post")
                            : ord.courier}
                        </span>
                      </div>

                      {ord.status === "Pending" ? (
                        <button
                          type="button"
                          onClick={() => handleDispatch(ord.orderId)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs touch-press transition"
                        >
                          {t("pack_and_dispatch")}
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                          {t("dispatched_courier")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: EARNINGS */}
          {activeTab === "earnings" && (
            <div className="space-y-3 animate-fade-in">
              <div className="rounded-2xl p-4 text-white space-y-2" style={{ background: "linear-gradient(135deg, #6B3A2A 0%, #3D1F0F 100%)" }}>
                <p className="text-[10px] text-white/75 uppercase tracking-wider">{t("net_payout")}</p>
                <h2 className="text-3xl font-extrabold">
                  <AnimatedNumber value={earnings.artisanShare} prefix="₹" duration={450} />
                </h2>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/20">
                  <span>{t("jan_dhan_bank")}</span>
                  <span className="bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded font-bold">{t("settled_24hrs")}</span>
                </div>
              </div>

              <div className="rounded-2xl p-3.5 bg-white border border-[#EAC9B0] space-y-2.5">
                <h4 className="text-xs font-bold text-[#3D1F0F] uppercase tracking-wider">
                  {t("direct_impact_title")}
                </h4>

                {/* 85% Jan Dhan Visual Breakdown Bar */}
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden flex my-2 shadow-inner">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-700 ease-out"
                    style={{ width: "85%" }}
                    title="85% Direct to Artisan Jan Dhan Account"
                  />
                  <div
                    className="h-full bg-blue-500 transition-all duration-700 ease-out"
                    style={{ width: "10%" }}
                    title="10% India Post Logistics"
                  />
                  <div
                    className="h-full bg-amber-500 transition-all duration-700 ease-out"
                    style={{ width: "5%" }}
                    title="5% ONDC Network Maintenance"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>{t("artisan_share_85")}</span>
                    <span>₹{earnings.artisanShare}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>{t("india_post_delivery_10")}</span>
                    <span>₹{earnings.deliveryCharges}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>{t("ondc_network_maintenance_5")}</span>
                    <span>₹{earnings.networkCharges}</span>
                  </div>
                  <div className="border-t border-stone-100 pt-1.5 flex justify-between font-extrabold text-[#3D1F0F]">
                    <span>{t("gross_sales")}</span>
                    <span><AnimatedNumber value={earnings.grossSales} prefix="₹" duration={450} /></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-[#EAC9B0] flex items-center justify-between text-[11px]">
                  <span className="text-stone-500">{t("settlement_status")}</span>
                  <span className="font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                    {t("settlement_staging_pending")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OPPORTUNITIES (TINYFISH SEARCH + FETCH + GEMINI) */}
          {activeTab === "opportunities" && (
            <OpportunitiesTab
              initialCraft={primaryCraft || ""}
              initialLocation={reliableLocation || ""}
              artisanCraft={primaryCraft}
              artisanLocation={reliableLocation}
              artisanCrafts={uniqueCrafts}
            />
          )}
        </div>

        {/* ── Modal for KalaPramaan Digital Certificate ── */}
        {selectedCertItem && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-[#FFFDF9] rounded-3xl p-5 w-full max-w-xs border-2 border-[#C4886B] shadow-2xl space-y-3 relative animate-scale-in">
              <button
                type="button"
                onClick={() => setSelectedCertItem(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-stone-100 text-stone-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>

              <div className="text-center space-y-1 border-b pb-3 border-[#EAC9B0]">
                <span className="text-2xl">🏛️</span>
                <h3 className="font-bold text-sm text-[#3D1F0F]" style={{ fontFamily: "'Noto Serif', serif" }}>
                  {t("kalapramaan_title")}
                </h3>
                <p className="text-[10px] text-[#8B4513] font-semibold">{t("kalapramaan_subtitle")}</p>
              </div>

              <div className="space-y-1.5 text-xs text-[#5A2E12]">
                <div className="flex justify-between">
                  <span className="text-stone-400">{t("cert_product")}</span>
                  <span className="font-bold">{getDisplayTitle(selectedCertItem, currentLang)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">{t("cert_artisan")}</span>
                  <span className="font-bold">{selectedCertItem.artisan_name || t("craft_artisan_default")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">{t("cert_region")}</span>
                  <span className="font-bold">{selectedCertItem.artisan_region || t("craft_region_default")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">{t("cert_gi_status")}</span>
                  <span className="font-bold text-emerald-700">{t("cert_gi_verified")}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Sticky Bottom Bar: Add Product ── */}
        {activeTab !== "opportunities" && (
          <div
            className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-4 flex-shrink-0"
            style={{ background: "linear-gradient(to top, #FFFBF7 85%, transparent)" }}
          >
            <button
              type="button"
              onClick={onAddNewProduct}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-base text-white shadow-lg transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                boxShadow: "0 8px 24px rgba(107,58,42,0.35)",
              }}
            >
              <span className="text-lg">＋</span>
              <span style={{ fontFamily: "'Noto Serif', serif" }}>{t("add_product_to_shop")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}