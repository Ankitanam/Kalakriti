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

interface OndcBuyerScreenProps {
  inventory: StoreItem[];
  onOrderConfirmed?: (order: any, cart: any) => void;
  onLogout: () => void;
}

export default function OndcBuyerScreen({
  inventory,
  onOrderConfirmed,
  onLogout,
}: OndcBuyerScreenProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<StoreItem | null>(null);
  const [selectedQty, setSelectedQty] = useState(1);
  const [buyerPlatform, setBuyerPlatform] = useState<"PhonePe Pincode" | "Paytm ONDC">("PhonePe Pincode");

  // 🔍 फुल प्रोडक्ट विवरण स्क्रीन के लिए स्टेट
  const [viewingDetailsProduct, setViewingDetailsProduct] = useState<StoreItem | null>(null);
  const [detailsSpecsLang, setDetailsSpecsLang] = useState<"hi" | "en">("hi");

  // 🔄 लाइव इन्वेंट्री स्टेट (सेलर डैशबोर्ड से ऑटोमैटिक सिंक)
  const [liveInventory, setLiveInventory] = useState<StoreItem[]>(() => {
    try {
      const saved = localStorage.getItem("kalakriti_inventory");
      return saved ? JSON.parse(saved) : inventory;
    } catch {
      return inventory;
    }
  });

  // सेलर जब भी स्टॉक बदले, बायर पेज पर रीयल-टाइम ऑटो सिंक
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem("kalakriti_inventory");
        if (saved) {
          setLiveInventory(JSON.parse(saved));
        }
      } catch (e) {
        console.warn("इन्वेंट्री सिंक एरर:", e);
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
      alert("माफ़ करें! यह सामान विक्रेता के पास स्टॉक में उपलब्ध नहीं है।");
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
    setSelectedProduct(null);
    setSelectedQty(1);
  };

  const handleIncreaseCartQty = (productId: string) => {
    const item = liveInventory.find((it) => it.id === productId);
    const maxSellerStock = Math.max(0, Number(item?.quantity ?? 0));

    const updated = cart.map((c) => {
      if (c.product.id === productId) {
        if (c.quantity >= maxSellerStock) {
          alert(`विक्रेता के पास केवल ${maxSellerStock} पीस उपलब्ध हैं!`);
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

  // ── Step 4 & 5: Save Address, Deduct Stock & Sync Orders (E-Commerce Logic) ──
  const handleFinalOrderPlacement = () => {
    if (!address.fullName || !address.phone || !address.pincode || !address.street) {
      alert("कृपया पूरा डिलीवरी पता और मोबाइल नंबर भरें!");
      return;
    }

    if (cart.length === 0) {
      alert("आपकी कार्ट खाली है!");
      return;
    }

    localStorage.setItem("kalakriti_buyer_address", JSON.stringify(address));

    // 1. ONDC Beckn Transaction Execute
    const orderResult = executeBecknConfirm(cart, address, "UPI (PhonePe / GPay)");
    setConfirmedOrderDetails(orderResult);

    // 2. सेलर की इन्वेंट्री में से खरीदे गए सभी सामानों का स्टॉक घटाएं
    const updatedInventory = liveInventory.map((invItem) => {
      const cartMatch = cart.find((c) => c.product.id === invItem.id);
      if (cartMatch) {
        const remainingQty = Math.max(0, (Number(invItem.quantity) || 0) - cartMatch.quantity);
        return { ...invItem, quantity: remainingQty };
      }
      return invItem;
    });

    setLiveInventory(updatedInventory);
    localStorage.setItem("kalakriti_inventory", JSON.stringify(updatedInventory));

    // 3. सेलर के आर्डर टैब में नए आर्डर जोड़ें
    try {
      const currentOrders = JSON.parse(localStorage.getItem("kalakriti_orders") || "[]");
      const newArtisanOrders = cart.map((c) => ({
        orderId: orderResult.orderId,
        productTitle: c.product.title_hi || "हस्तशिल्प उत्पाद",
        buyerCity: `${address.city} (${address.state})`,
        buyerPlatform: buyerPlatform,
        amount: (Number(c.product.suggested_price) || 199) * c.quantity,
        courier: selectedCourier,
        status: "Pending",
        orderDate: "अभी-अभी (Just now)",
      }));

      const mergedOrders = [...newArtisanOrders, ...currentOrders];
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

    // कार्ट खाली करें
    updateCartAndStorage([]);
    setCheckoutStage("success");
  };

  const openAddToCartModal = (item: StoreItem) => {
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
        <div className="flex items-center justify-between px-6 pt-3 pb-1 text-slate-800 text-xs font-semibold">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-5 h-2.5 border border-slate-700 rounded-xs p-0.5">
              <div className="h-full bg-slate-800 w-3/4 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* ── Buyer App Header ── */}
        <div
          className="p-4 text-white shadow-md flex-shrink-0"
          style={{
            background:
              buyerPlatform === "PhonePe Pincode"
                ? "linear-gradient(135deg, #5f259f 0%, #3b1466 100%)"
                : "linear-gradient(135deg, #00b9f5 0%, #002970 100%)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onLogout}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-95 transition cursor-pointer"
                title="लॉगआउट"
              >
                ←
              </button>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/80">
                  {buyerPlatform}
                </p>
                <p className="text-xs font-semibold flex items-center gap-1">
                  <span>📍 {address.city || "बांद्रा वेस्ट, मुंबई"}</span>
                  <span className="text-[10px]">▾</span>
                </p>
              </div>
            </div>

            {/* Cart Icon */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCheckoutStage("cart")}
                className="relative w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-95 cursor-pointer"
                title="कार्ट देखें"
              >
                <span>🛒 </span>
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {totalCartCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() =>
                  setBuyerPlatform((prev) =>
                    prev === "PhonePe Pincode" ? "Paytm ONDC" : "PhonePe Pincode"
                  )
                }
                className="text-[10px] font-bold bg-white/20 px-2 py-1.5 rounded-lg border border-white/30 active:scale-95 cursor-pointer"
              >
                स्विच ⇄
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-2">
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-9 pr-8 rounded-xl bg-white text-slate-800 text-xs outline-none shadow-inner font-medium"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍 </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-slate-400 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── ONDC Live Broadcast Bar ── */}
        <div className="bg-purple-100 border-b border-purple-200 px-4 py-1.5 flex items-center justify-between text-[11px] text-purple-900 font-semibold">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ONDC ओपन नेटवर्क लाइव फ़ीड
          </span>
          <span className="text-[10px] text-purple-700 font-mono">Beckn v1.1 • nic2004:52110</span>
        </div>

        {/* ── Product Feed (Real-Time Stock Checked) ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "none", paddingBottom: 110 }}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t("direct_from_artisans")}
            </h3>
            <span className="text-[11px] text-slate-500">{filteredProducts.length} {t("available")}</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-3xl mb-2">🔍 </p>
              <p className="text-sm font-semibold">&apos;{searchQuery}&apos; से मिलता-जुलता कोई सामान नहीं मिला</p>
              <p className="text-xs mt-1">कृपया कोई अन्य शब्द जैसे &apos;मिट्टी&apos;, &apos;painting&apos; खोजें।</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((item) => {
                const stock = Math.max(0, Number(item.quantity ?? 0));
                const inCart = cart.find((c) => c.product.id === item.id)?.quantity || 0;
                const isOutOfStock = stock <= 0;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                  >
                    {/* फोटो पर क्लिक करने से फुल डिस्क्रिप्शन खुलेगा */}
                    <div
                      className="relative h-36 bg-slate-100 cursor-pointer group overflow-hidden"
                      onClick={() => setViewingDetailsProduct(item)}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title_en}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                          isOutOfStock ? "grayscale opacity-75" : ""
                        }`}
                      />
                      <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                        {item.artisan_region || "भारत"}
                      </span>
                      <span
                        className={`absolute top-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs ${
                          isOutOfStock
                            ? "bg-red-600 text-white"
                            : "bg-white/90 text-purple-900"
                        }`}
                      >
                        {isOutOfStock ? t("out_of_stock") : `${t("stock_count")}: ${stock}`}
                      </span>
                    </div>

                    {/* नाम व दाम */}
                    <div
                      className="p-2.5 flex-1 flex flex-col justify-between cursor-pointer"
                      onClick={() => setViewingDetailsProduct(item)}
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title_hi}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.title_en}</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xs font-extrabold text-slate-900">₹{item.suggested_price}</span>
                          <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 rounded font-bold">
                            {t("savings_badge")}
                          </span>
                        </div>
                      </div>

                      {/* कार्ट में जोड़ें बटन */}
                      <div className="mt-2 pt-1.5 border-t border-slate-100">
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={(e) => {
                            e.stopPropagation();
                            openAddToCartModal(item);
                          }}
                          className={`w-full py-2 rounded-xl text-xs font-bold text-white shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
                            isOutOfStock
                              ? "bg-slate-400 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                          style={{
                            background: isOutOfStock
                              ? "#94a3b8"
                              : buyerPlatform === "PhonePe Pincode"
                              ? "#5f259f"
                              : "#00b9f5",
                          }}
                        >
                          <span>🛒 </span>
                          <span>{isOutOfStock ? t("out_of_stock") : t("add_to_cart")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Floating Bottom Cart Bar ── */}
        {totalCartCount > 0 && checkoutStage === "closed" && (
          <div className="absolute bottom-12 left-4 right-4 z-40 animate-fade-in">
            <div
              onClick={() => setCheckoutStage("cart")}
              className="p-3 rounded-2xl text-white shadow-xl flex items-center justify-between cursor-pointer active:scale-98 transition"
              style={{
                background:
                  buyerPlatform === "PhonePe Pincode"
                    ? "linear-gradient(135deg, #4C1D95 0%, #5B21B6 100%)"
                    : "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm font-bold">
                  🛒
                </div>
                <div>
                  <p className="text-xs font-bold">{totalCartCount} सामान कार्ट में</p>
                  <p className="text-[10px] text-white/80">कुल: ₹{cartQuote.totalPrice}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold bg-white text-slate-900 px-3 py-1.5 rounded-xl shadow-xs">
                <span>चेकआउट करें</span>
                <span>➔</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 📜 फुल प्रोडक्ट विवरण स्क्रीन (PRODUCT FULL DETAILS MODAL)                */}
        {/* ========================================================================= */}
        {viewingDetailsProduct && (
          <div className="absolute inset-0 z-50 bg-[#FAF5FF] flex flex-col overflow-hidden animate-in fade-in duration-200">
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
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 active:scale-90 transition text-lg cursor-pointer"
              >
                ←
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

              {/* टाइटल और मूल्य */}
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-purple-100 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3
                      className="text-lg font-bold text-stone-900 leading-snug"
                      style={{ fontFamily: "'Noto Serif', serif" }}
                    >
                      {viewingDetailsProduct.title_hi}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {viewingDetailsProduct.title_en}
                    </p>
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
                    {viewingDetailsProduct.artisan_name || "कुशल ग्रामीण कारीगर"}
                  </h4>
                  <p className="text-xs text-stone-600">
                    {viewingDetailsProduct.artisan_region || "पारंपरिक शिल्प क्लस्टर"}
                  </p>
                </div>
              </div>

              {/* विवरण */}
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-purple-100 space-y-2">
                <h4
                  className="text-sm font-bold text-stone-900 flex items-center gap-1.5"
                  style={{ fontFamily: "'Noto Serif', serif" }}
                >
                  <span>📜</span>
                  <span>{t("item_description_title")}</span>
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {viewingDetailsProduct.quick_summary_hi || "पारंपरिक हस्तनिर्मित प्रामाणिक उत्पाद।"}
                </p>
                {viewingDetailsProduct.quick_summary_en && (
                  <p className="text-[11px] text-stone-500 leading-relaxed italic border-t border-stone-100 pt-2">
                    {viewingDetailsProduct.quick_summary_en}
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
                    {t("key_highlights_title")}
                  </h4>
                  <div className="flex bg-purple-100/70 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setDetailsSpecsLang("hi")}
                      className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                        detailsSpecsLang === "hi"
                          ? "bg-[#5B21B6] text-white shadow-xs"
                          : "text-purple-800"
                      }`}
                    >
                      हिंदी
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
                  {(detailsSpecsLang === "hi"
                    ? viewingDetailsProduct.specs_hi
                    : viewingDetailsProduct.specs_en
                  )?.map((spec, i) => (
                    <div key={i} className="py-2 flex justify-between gap-4">
                      <span className="text-stone-500 font-medium">{spec.label}</span>
                      <span className="text-stone-900 font-semibold text-right">
                        {spec.value}
                      </span>
                    </div>
                  )) || (
                    <p className="text-xs text-stone-400 py-2">
                      {t("specs_not_available")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* बॉटम स्टिकी बार */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-purple-100 flex items-center gap-3 shadow-lg">
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-semibold">{t("price_label")}</p>
                <p className="text-lg font-black text-[#5B21B6]">
                  ₹{viewingDetailsProduct.suggested_price}
                </p>
              </div>

              <button
                type="button"
                disabled={Number(viewingDetailsProduct.quantity || 0) <= 0}
                onClick={() => {
                  const itemToAdd = viewingDetailsProduct;
                  setViewingDetailsProduct(null);
                  openAddToCartModal(itemToAdd);
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 ${
                  Number(viewingDetailsProduct.quantity || 0) <= 0
                    ? "bg-slate-400 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                style={{
                  background:
                    Number(viewingDetailsProduct.quantity || 0) <= 0
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                <span>🛒</span>
                <span>
                  {Number(viewingDetailsProduct.quantity || 0) <= 0
                    ? t("out_of_stock")
                    : t("add_to_cart")}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ── 🛒 Product Quick-View Modal (Quantity Selector - Stock Guard) ── */}
        {selectedProduct && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end z-50">
            <div className="bg-white w-full rounded-t-3xl p-5 space-y-3.5 max-h-[85%] overflow-y-auto animate-slide-up">
              <div className="flex justify-between items-start border-b pb-3">
                <div className="flex gap-3">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.title_en}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedProduct.title_hi}</h3>
                    <p className="text-xs text-slate-500">{t("artisan_label")} {selectedProduct.artisan_name}</p>
                    <p className="text-sm font-extrabold text-emerald-700 mt-0.5">
                      ₹{selectedProduct.suggested_price}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
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
                    className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center transition ${
                      selectedQty <= 1
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                        : "bg-slate-100 text-slate-700 active:scale-90 cursor-pointer"
                    }`}
                  >
                    −
                  </button>

                  <span className="font-extrabold text-sm text-slate-900 min-w-4 text-center">
                    {selectedQty}
                  </span>

                  <button
                    type="button"
                    disabled={selectedQty >= activeStockInfo.availableToAdd}
                    onClick={() =>
                      setSelectedQty((q) => Math.min(activeStockInfo.availableToAdd, q + 1))
                    }
                    className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center transition ${
                      selectedQty >= activeStockInfo.availableToAdd
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-purple-700 text-white active:scale-90 cursor-pointer"
                    }`}
                  >
                    ＋
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 px-1">
                <span>{t("total_price_label").replace("{qty}", String(selectedQty))}</span>
                <span className="text-base font-extrabold text-slate-900">
                  ₹{(Number(selectedProduct.suggested_price) || 199) * selectedQty}
                </span>
              </div>

              <button
                type="button"
                disabled={activeStockInfo.availableToAdd <= 0}
                onClick={() => handleAddToCart(selectedProduct, selectedQty)}
                className={`w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2 ${
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end z-50">
            <div className="bg-white w-full rounded-t-3xl p-5 space-y-3.5 max-h-[88%] overflow-y-auto animate-slide-up">
              <div className="flex justify-between items-center border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛒 </span>
                  <h3 className="text-sm font-bold text-slate-900">आपकी कार्ट ({totalCartCount} सामान)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutStage("closed")}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
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
                    className="mt-3 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)" }}
                  >
                    {t("start_shopping")}
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="divide-y divide-slate-100 max-h-44 overflow-y-auto">
                    {cart.map((c) => {
                      const currentStock = Math.max(0, Number(liveInventory.find((it) => it.id === c.product.id)?.quantity ?? 0));
                      const isMax = c.quantity >= currentStock;

                      return (
                        <div key={c.product.id} className="py-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={c.product.imageUrl}
                              alt={c.product.title_en}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{c.product.title_hi}</p>
                              <p className="text-[10px] text-slate-500">₹{c.product.suggested_price} × {c.quantity}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 bg-slate-100 px-1.5 py-0.5 rounded-lg">
                            <button
                              type="button"
                              onClick={() => handleDecreaseCartQty(c.product.id)}
                              className="w-5 h-5 rounded bg-white font-bold text-xs flex items-center justify-center shadow-2xs cursor-pointer"
                            >
                              −
                            </button>
                            <span className="font-bold text-xs min-w-3 text-center">{c.quantity}</span>
                            <button
                              type="button"
                              disabled={isMax}
                              onClick={() => handleIncreaseCartQty(c.product.id)}
                              className={`w-5 h-5 rounded font-bold text-xs flex items-center justify-center shadow-2xs ${
                                isMax
                                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                  : "bg-purple-700 text-white cursor-pointer"
                              }`}
                            >
                              ＋
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Price Quote Breakdown */}
                  <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>सामान का कुल मूल्य</span>
                      <span>₹{cartQuote.itemTotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>कूरियर (India Post डाक घर)</span>
                      <span className={cartQuote.deliveryFee === 0 ? "text-emerald-700 font-bold" : ""}>
                        {cartQuote.deliveryFee === 0 ? "फ्री (₹499+ प्रोमो)" : `₹${cartQuote.deliveryFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-extrabold text-slate-900 text-sm border-t border-purple-200/80 pt-1">
                      <span>{t("total_payable")}</span>
                      <span>₹{cartQuote.totalPrice}</span>
                    </div>
                  </div>

                  {/* Proceed to Address Button */}
                  <button
                    type="button"
                    onClick={() => setCheckoutStage("address")}
                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end z-50">
            <div className="bg-white w-full rounded-t-3xl p-5 space-y-3.5 max-h-[90%] overflow-y-auto animate-slide-up">
              <div className="flex justify-between items-center border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStage("cart")}
                    className="text-xs text-purple-700 font-bold hover:underline cursor-pointer"
                  >
                    ← कार्ट
                  </button>
                  <span className="text-slate-300">|</span>
                  <h3 className="text-sm font-bold text-slate-900">डिलीवरी पता (Beckn on_init)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutStage("closed")}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Delivery Address Form */}
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">पूरा नाम (Full Name)</label>
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none focus:border-purple-600"
                    placeholder="उदा. रोहन शर्मा"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">मोबाइल नंबर</label>
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none focus:border-purple-600"
                      placeholder="10-digit Mobile"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">पिनकोड (Pincode)</label>
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
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">मकान नं. व सड़क का नाम</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none focus:border-purple-600"
                    placeholder="फ्लैट 402, शांति हाइट्स, हिल रोड"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">शहर (City)</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">राज्य (State)</label>
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
                  <span>🚚 कूरियर पार्टनर:</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                    ETA: {formattedEta}
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCourier("India Post (डाक घर)")}
                    className="p-2 rounded-xl text-left border transition-all text-xs cursor-pointer"
                    style={{
                      borderColor: selectedCourier === "India Post (डाक घर)" ? "#5B21B6" : "#E2E8F0",
                      background: selectedCourier === "India Post (डाक घर)" ? "#F3E8FF" : "#FFFFFF",
                    }}
                  >
                    <p className="font-bold text-slate-900 text-[11px]">🇮🇳 India Post</p>
                    <p className="text-[10px] text-slate-500">स्पीड पोस्ट (3 दिन)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCourier("Delhivery")}
                    className="p-2 rounded-xl text-left border transition-all text-xs cursor-pointer"
                    style={{
                      borderColor: selectedCourier === "Delhivery" ? "#5B21B6" : "#E2E8F0",
                      background: selectedCourier === "Delhivery" ? "#F3E8FF" : "#FFFFFF",
                    }}
                  >
                    <p className="font-bold text-slate-900 text-[11px]">⚡ Delhivery</p>
                    <p className="text-[10px] text-slate-500">एक्सप्रेस (2 दिन)</p>
                  </button>
                </div>
              </div>

              {/* Pay & Order Button */}
              <button
                type="button"
                onClick={handleFinalOrderPlacement}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end z-50">
            <div className="bg-white w-full rounded-t-3xl p-5 space-y-4 max-h-[90%] overflow-y-auto animate-slide-up text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto shadow-xs">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">🎉 आर्डर सफलतापूर्वक दर्ज हुआ!</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  आर्डर आईडी: <span className="font-mono font-bold text-purple-800">{confirmedOrderDetails.orderId}</span>
                </p>
              </div>

              <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-purple-900">
                  <span>अनुमानित डिलीवरी (ETA):</span>
                  <span>{confirmedOrderDetails.estimatedDeliveryDate}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  कूरियर: <span className="font-semibold text-slate-900">{confirmedOrderDetails.courierName}</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  डिलीवरी पता: {confirmedOrderDetails.deliveryAddress.street}, {confirmedOrderDetails.deliveryAddress.city}
                </p>
                <div className="border-t border-purple-200/80 pt-1 flex justify-between text-emerald-800 font-bold">
                  <span>कुल भुगतान:</span>
                  <span>₹{confirmedOrderDetails.quote.totalPrice}</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 font-semibold">
                ✓ ₹{confirmedOrderDetails.quote.artisanShare} की राशि सीधे कारीगर के जन-धन बैंक खाते में ट्रांसफर कर दी गई है!
              </div>

              <button
                type="button"
                onClick={() => setCheckoutStage("closed")}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-md active:scale-98 transition cursor-pointer"
                style={{
                  background:
                    buyerPlatform === "PhonePe Pincode"
                      ? "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)"
                      : "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                }}
              >
                खरीदारी जारी रखें (Continue Shopping)
              </button>
            </div>
          </div>
        )}

        {/* ── Bottom Bar: Logout ── */}
        <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between px-5 flex-shrink-0">
          <span className="text-[10px] font-semibold text-slate-500">
            🛡 ONDC Verified Buyer Node
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 active:scale-95 cursor-pointer"
          >
            लॉगआउट (Logout)
          </button>
        </div>
      </div>
    </div>
  );
}