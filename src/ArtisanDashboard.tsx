// src/ArtisanDashboard.tsx
import React, { useState } from "react";
import { StoreItem } from "./App";
import { useLanguage } from "./context/LanguageContext";

export interface OrderItem {
  orderId: string;
  productTitle: string;
  buyerCity: string;
  buyerPlatform: "PhonePe Pincode" | "Paytm ONDC" | "Magicpin";
  amount: number;
  courier: "India Post (डाक घर)" | "Delhivery";
  status: "Pending" | "Packed" | "Shipped";
  orderDate: string;
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
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "earnings">("products");
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

  const orders = propOrders && propOrders.length > 0 ? propOrders : localOrders;
  const totalUnits = inventory.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;

  // Simulate Buyer Order (For Judges)
  const handleSimulateBuyerOrder = () => {
    if (inventory.length === 0) {
      alert("कृपया पहले कम से कम एक सामान जोड़ें!");
      return;
    }

    const randomProduct = inventory[Math.floor(Math.random() * inventory.length)];
    const platforms: ("PhonePe Pincode" | "Paytm ONDC" | "Magicpin")[] = [
      "PhonePe Pincode",
      "Paytm ONDC",
      "Magicpin",
    ];
    const cities = ["बेंगलुरु", "दिल्ली", "मुंबई", "पुणे", "हैदराबाद"];

    const newOrder: OrderItem = {
      orderId: `ONDC-${Math.floor(1000 + Math.random() * 9000)}`,
      productTitle: randomProduct.title_hi || "हस्तनिर्मित सामान",
      buyerCity: cities[Math.floor(Math.random() * cities.length)],
      buyerPlatform: platforms[Math.floor(Math.random() * platforms.length)],
      amount: randomProduct.suggested_price || 199,
      courier: "India Post (डाक घर)",
      status: "Pending",
      orderDate: "अभी-अभी (Just now)",
    };

    const updatedOrders = [newOrder, ...orders];
    setLocalOrders(updatedOrders);
    localStorage.setItem("kalakriti_orders", JSON.stringify(updatedOrders));

    setActiveTab("orders");
    alert(`🎉 बधाई हो! ONDC (${newOrder.buyerPlatform}) से ${newOrder.buyerCity} के ग्राहक का ₹${newOrder.amount} का नया आर्डर आया!`);
  };

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

        {/* Top App Bar */}
        <div
          className="flex items-center px-4 py-3 gap-2 flex-shrink-0"
          style={{ background: "#6B3A2A" }}
        >
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-white active:scale-95 transition"
            style={{ background: "rgba(255,255,255,0.15)" }}
            title="नया सामान जोड़ें पर वापस जाएं"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-white tracking-wide truncate" style={{ fontFamily: "'Noto Serif', serif" }}>
                {t("my_store")}
              </h1>
              <span className="text-[9px] bg-emerald-500/25 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-400/30">
                Node #412
              </span>
            </div>
            <p className="text-[10px] text-white/70 truncate">Kalakriti Store</p>
          </div>

          <button
            type="button"
            onClick={handleSimulateBuyerOrder}
            className="px-2 py-1 rounded-xl text-[10px] font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 shadow-xs active:scale-95 border border-amber-400"
            title="Simulate PhonePe Buyer Order"
          >
            ⚡ {t("test_order")}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="px-2 py-1 rounded-xl text-[10px] font-bold text-white bg-red-900/60 border border-red-400/40 active:scale-95 transition"
            title={t("logout")}
          >
            {t("logout")}
          </button>
        </div>

        {/* ── 3 Tabs (सामान, आर्डर, कमाई) ── */}
        <div className="flex px-4 pt-3 pb-1 bg-[#FFFBF7] border-b border-[#F0DFD2] gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1"
            style={{
              background: activeTab === "products" ? "#6B3A2A" : "transparent",
              color: activeTab === "products" ? "white" : "#8B4513",
            }}
          >
            <span>🏺</span>
            <span>{t("tab_products")} ({inventory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 relative"
            style={{
              background: activeTab === "orders" ? "#6B3A2A" : "transparent",
              color: activeTab === "orders" ? "white" : "#8B4513",
            }}
          >
            <span>📦</span>
            <span>{t("tab_orders")}</span>
            {pendingOrders > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center">
                {pendingOrders}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("earnings")}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1"
            style={{
              background: activeTab === "earnings" ? "#6B3A2A" : "transparent",
              color: activeTab === "earnings" ? "white" : "#8B4513",
            }}
          >
            <span>💰</span>
            <span>{t("tab_earnings")} (₹{totalRevenue})</span>
          </button>
        </div>

        {/* ── Scrollable Tab Content ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: "none", paddingBottom: 105 }}>
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
                  {inventory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onPreviewProduct(item)}
                      className="rounded-2xl overflow-hidden bg-white shadow-xs border flex flex-col cursor-pointer transition-all hover:shadow-md"
                      style={{ borderColor: "rgba(196,136,107,0.25)" }}
                    >
                      <div className="relative h-32 bg-[#F0EBE3] overflow-hidden">
                        <img src={item.imageUrl} alt={item.title_en} className="w-full h-full object-cover" />
                        <div className="absolute top-1.5 left-1.5 bg-white/95 px-1.5 py-0.5 rounded text-[8px] font-bold text-[#6B3A2A]">
                          {t("ondc_active")}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCertItem(item);
                          }}
                          className="absolute top-1.5 right-1.5 bg-amber-100 text-amber-900 border border-amber-300 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs"
                          title="View Digital Certificate"
                        >
                          📜 {t("certified_badge")}
                        </button>
                      </div>

                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-[#3D1F0F] line-clamp-1" style={{ fontFamily: "'Noto Serif', serif" }}>
                            {item.title_hi}
                          </h4>
                          <p className="text-[10px] text-[#8B4513] line-clamp-1 mt-0.5">{item.title_en}</p>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                onDecreaseQty(item.id);
                              }}
                              className="w-4 h-4 rounded bg-white text-[#6B3A2A] font-bold text-xs flex items-center justify-center shadow-2xs active:scale-90"
                            >
                              −
                            </button>
                            <span className="font-bold text-xs text-[#3D1F0F] min-w-3 text-center">
                              {item.quantity || 1}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onIncreaseQty(item.id);
                              }}
                              className="w-4 h-4 rounded bg-[#6B3A2A] text-white font-bold text-xs flex items-center justify-center shadow-2xs active:scale-90"
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
                          className="w-full mt-2 py-0.8 rounded text-[10px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center gap-1 active:scale-95"
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
                <button
                  type="button"
                  onClick={handleSimulateBuyerOrder}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[#6B3A2A] text-white active:scale-95"
                >
                  ＋ {t("test_order")}
                </button>
              </div>

              {orders.map((ord) => (
                <div key={ord.orderId} className="rounded-2xl p-3 bg-white border border-[#EAC9B0] shadow-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <div>
                      <span className="text-xs font-bold text-[#3D1F0F]">{ord.productTitle}</span>
                      <p className="text-[10px] text-[#8B4513]">
                        {ord.buyerCity} · <span className="font-semibold text-purple-700">{ord.buyerPlatform}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#3D1F0F]">₹{ord.amount}</span>
                      <p className="text-[9px] text-stone-400">{ord.orderDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[11px] text-[#6B3A2A]">
                      <span>🚚</span>
                      <span className="font-medium">{ord.courier}</span>
                    </div>

                    {ord.status === "Pending" ? (
                      <button
                        type="button"
                        onClick={() => handleDispatch(ord.orderId)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 transition"
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
              ))}
            </div>
          )}

          {/* TAB 3: EARNINGS */}
          {activeTab === "earnings" && (
            <div className="space-y-3">
              <div className="rounded-2xl p-4 text-white space-y-2" style={{ background: "linear-gradient(135deg, #6B3A2A 0%, #3D1F0F 100%)" }}>
                <p className="text-[10px] text-white/75 uppercase tracking-wider">{t("net_payout")}</p>
                <h2 className="text-3xl font-extrabold">₹{Math.round(totalRevenue * 0.85)}</h2>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/20">
                  <span>{t("jan_dhan_bank")}</span>
                  <span className="bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded font-bold">{t("settled_24hrs")}</span>
                </div>
              </div>

              <div className="rounded-2xl p-3.5 bg-white border border-[#EAC9B0] space-y-2.5">
                <h4 className="text-xs font-bold text-[#3D1F0F] uppercase tracking-wider">
                  {t("direct_impact_title")}
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>{t("artisan_share_85")}</span>
                    <span>₹{Math.round(totalRevenue * 0.85)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>{t("india_post_delivery_10")}</span>
                    <span>₹{Math.round(totalRevenue * 0.1)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>{t("ondc_network_maintenance_5")}</span>
                    <span>₹{Math.round(totalRevenue * 0.05)}</span>
                  </div>
                  <div className="border-t border-stone-100 pt-1.5 flex justify-between font-extrabold text-[#3D1F0F]">
                    <span>{t("gross_sales")}</span>
                    <span>₹{totalRevenue}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal for KalaPramaan Digital Certificate ── */}
        {selectedCertItem && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-[#FFFDF9] rounded-3xl p-5 w-full max-w-xs border-2 border-[#C4886B] shadow-2xl space-y-3 relative">
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
                  <span className="font-bold">{selectedCertItem.title_hi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">{t("cert_artisan")}</span>
                  <span className="font-bold">{selectedCertItem.artisan_name || "माधुरी देवी"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">{t("cert_region")}</span>
                  <span className="font-bold">{selectedCertItem.artisan_region || "मिथिला, बिहार"}</span>
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
      </div>
    </div>
  );
}