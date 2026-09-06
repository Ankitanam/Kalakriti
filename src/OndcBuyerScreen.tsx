// src/OndcBuyerScreen.tsx
import React, { useState, useEffect } from "react";
import { StoreItem } from "./App";
import { transformToOndcCatalog } from "./utils/becknSchema";
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
  onOrderConfirmed?: (order: any, cart: any) => void; // 👈 accepts order and cart
  onLogout: () => void;
}

export default function OndcBuyerScreen({
  inventory,
  onOrderConfirmed, // 👈 received here
  onLogout,
}: OndcBuyerScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<StoreItem | null>(null);
  const [selectedQty, setSelectedQty] = useState(1);
  const [showBecknModal, setShowBecknModal] = useState<StoreItem | null>(null);
  const [buyerPlatform, setBuyerPlatform] = useState<"PhonePe Pincode" | "Paytm ONDC">("PhonePe Pincode");

  // ── Step 3: Cart State (Beckn Select) ──
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

  // ── Step 4: Delivery Address State (Beckn Init - Persisted in LocalStorage) ──
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

  // Courier Provider Selection (India Post vs Delhivery)
  const [selectedCourier, setSelectedCourier] = useState<"India Post (डाक घर)" | "Delhivery">("India Post (डाक घर)");

  // ── Step 2 Integration: Fuzzy Search ──
  const filteredProducts = searchProductsFuzzy(inventory, searchQuery);

  // ── Step 3 & 4: Beckn Live Quotes & ETA Calculation ──
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const { quote: cartQuote } = executeBecknSelect(cart);
  const { formattedEta } = executeBecknInit(cart, address);

  // Sync cart with localStorage
  const updateCartAndStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem("kalakriti_cart", JSON.stringify(updatedCart));
  };

  // Add to cart with quantity
  const handleAddToCart = (product: StoreItem, quantityToAdd: number) => {
    const existingIndex = cart.findIndex((c) => c.product.id === product.id);
    let updatedCart: CartItem[];

    if (existingIndex > -1) {
      updatedCart = cart.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: Math.min(item.quantity + quantityToAdd, product.quantity || 10) }
          : item
      );
    } else {
      updatedCart = [...cart, { product, quantity: quantityToAdd }];
    }

    updateCartAndStorage(updatedCart);
    setSelectedProduct(null);
    setSelectedQty(1);
  };

  // Cart Qty Controls
  const handleIncreaseCartQty = (productId: string) => {
    const updated = cart.map((item) =>
      item.product.id === productId
        ? { ...item, quantity: Math.min(item.quantity + 1, item.product.quantity || 10) }
        : item
    );
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

  // ── Step 4 & 5: Save Address & Finalize Order (Beckn Confirm) ──
  const handleFinalOrderPlacement = () => {
    if (!address.fullName || !address.phone || !address.pincode || !address.street) {
      alert("कृपया पूरा डिलीवरी पता और मोबाइल नंबर भरें!");
      return;
    }

    // Save address for future orders
    localStorage.setItem("kalakriti_buyer_address", JSON.stringify(address));

    // Execute Beckn Confirm Transaction
    const orderResult = executeBecknConfirm(cart, address, "UPI (PhonePe / GPay)");
    setConfirmedOrderDetails(orderResult);
     if (onOrderConfirmed) {
         onOrderConfirmed(orderResult, cart);
       }
   // Empty Cart
   
    // Empty Cart
    updateCartAndStorage([]);

    // Move to Success Stage
    setCheckoutStage("success");
  };

  return (
    <div
      className="size-full flex items-center justify-center"
      style={{ background: "#EDE9FE", fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Phone Shell styled as Consumer App */}
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

        {/* ── Buyer App Header (PhonePe Pincode / Paytm Style) ── */}
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
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-95 transition"
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

            {/* Cart Icon with Live Count */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCheckoutStage("cart")}
                className="relative w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-95"
                title="कार्ट देखें"
              >
                <span>🛒</span>
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
                className="text-[10px] font-bold bg-white/20 px-2 py-1.5 rounded-lg border border-white/30 active:scale-95"
              >
                स्विच ⇄
              </button>
            </div>
          </div>

          {/* Search Bar with Fuzzy Search */}
          <div className="relative mt-2">
            <input
              type="text"
              placeholder="हस्तशिल्प, पेंटिंग, मिट्टी, wood, mitti खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-9 pr-8 rounded-xl bg-white text-slate-800 text-xs outline-none shadow-inner font-medium"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-slate-400 text-xs font-bold"
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

        {/* ── Product Feed ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "none", paddingBottom: 110 }}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              सीधे ग्रामीण कारीगरों से (Direct from Artisans)
            </h3>
            <span className="text-[11px] text-slate-500">{filteredProducts.length} उपलब्ध</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm font-semibold">&apos;{searchQuery}&apos; से मिलता-जुलता कोई सामान नहीं मिला</p>
              <p className="text-xs mt-1">कृपया कोई अन्य शब्द जैसे &apos;मिट्टी&apos;, &apos;painting&apos;, या &apos;कठपुतली&apos; खोजें।</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                >
                  <div
                    className="relative h-32 bg-slate-100 cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(item);
                      setSelectedQty(1);
                    }}
                  >
                    <img src={item.imageUrl} alt={item.title_en} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                      {item.artisan_region || "भारत"}
                    </span>
                    <span className="absolute top-1.5 left-1.5 bg-white/90 text-purple-900 text-[8px] font-bold px-1.5 py-0.5 rounded">
                      स्टॉक: {item.quantity || 1}
                    </span>
                  </div>

                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title_hi}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{item.title_en}</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xs font-extrabold text-slate-900">₹{item.suggested_price}</span>
                        <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 rounded font-bold">
                          40% बचत
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1 pt-1.5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(item);
                          setSelectedQty(1);
                        }}
                        className="w-full py-1.5 rounded-lg text-xs font-bold text-white shadow-xs active:scale-95 transition flex items-center justify-center gap-1"
                        style={{
                          background: buyerPlatform === "PhonePe Pincode" ? "#5f259f" : "#00b9f5",
                        }}
                      >
                        <span>🛒</span>
                        <span>कार्ट में जोड़ें</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowBecknModal(item)}
                        className="w-full py-0.5 text-[9px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 rounded text-center"
                        title="Show Beckn JSON Schema to Judges"
                      >
                        🛠️ View Beckn JSON
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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

        {/* ── Product Quick-View Modal (Quantity Selector) ── */}
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
                    <p className="text-xs text-slate-500">कारीगर: {selectedProduct.artisan_name}</p>
                    <p className="text-sm font-extrabold text-emerald-700 mt-0.5">
                      ₹{selectedProduct.suggested_price}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-800">खरीदने की मात्रा (Quantity):</p>
                  <p className="text-[10px] text-slate-500">उपलब्ध स्टॉक: {selectedProduct.quantity || 1} पीस</p>
                </div>

                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-300 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                    className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center active:scale-90"
                  >
                    −
                  </button>
                  <span className="font-extrabold text-sm text-slate-900 min-w-4 text-center">
                    {selectedQty}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedQty((q) => Math.min(selectedProduct.quantity || 10, q + 1))
                    }
                    className="w-6 h-6 rounded-lg bg-purple-700 text-white font-bold text-xs flex items-center justify-center active:scale-90"
                  >
                    ＋
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 px-1">
                <span>कुल मूल्य ({selectedQty} पीस):</span>
                <span className="text-base font-extrabold text-slate-900">
                  ₹{(selectedProduct.suggested_price || 199) * selectedQty}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleAddToCart(selectedProduct, selectedQty)}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2"
                style={{
                  background:
                    buyerPlatform === "PhonePe Pincode"
                      ? "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)"
                      : "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                }}
              >
                <span>🛒</span>
                <span>कार्ट में जोड़ें (Add to Cart)</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 1: Cart Modal (Beckn Select) ── */}
        {checkoutStage === "cart" && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end z-50">
            <div className="bg-white w-full rounded-t-3xl p-5 space-y-3.5 max-h-[88%] overflow-y-auto animate-slide-up">
              <div className="flex justify-between items-center border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛒</span>
                  <h3 className="text-sm font-bold text-slate-900">आपकी कार्ट ({totalCartCount} सामान)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutStage("closed")}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-slate-100 max-h-44 overflow-y-auto">
                {cart.map((c) => (
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

                    {/* Quantity Controller */}
                    <div className="flex items-center gap-1.5 bg-slate-100 px-1.5 py-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => handleDecreaseCartQty(c.product.id)}
                        className="w-5 h-5 rounded bg-white font-bold text-xs flex items-center justify-center shadow-2xs"
                      >
                        −
                      </button>
                      <span className="font-bold text-xs min-w-3 text-center">{c.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleIncreaseCartQty(c.product.id)}
                        className="w-5 h-5 rounded bg-purple-700 text-white font-bold text-xs flex items-center justify-center shadow-2xs"
                      >
                        ＋
                      </button>
                    </div>
                  </div>
                ))}
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
                  <span>कुल देय राशि</span>
                  <span>₹{cartQuote.totalPrice}</span>
                </div>
              </div>

              {/* Button to Proceed to Step 4 (Address) */}
              <button
                type="button"
                onClick={() => setCheckoutStage("address")} // 👈 Moves directly to Step 4!
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2"
                style={{
                  background:
                    buyerPlatform === "PhonePe Pincode"
                      ? "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)"
                      : "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                }}
              >
                <span>📍</span>
                <span>डिलीवरी पता चुनें और आगे बढ़ें ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 2: Step 4 Delivery Address & Logistics (Beckn Init) ── */}
        {checkoutStage === "address" && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end z-50">
            <div className="bg-white w-full rounded-t-3xl p-5 space-y-3.5 max-h-[90%] overflow-y-auto animate-slide-up">
              <div className="flex justify-between items-center border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStage("cart")}
                    className="text-xs text-purple-700 font-bold hover:underline"
                  >
                    ← कार्ट
                  </button>
                  <span className="text-slate-300">|</span>
                  <h3 className="text-sm font-bold text-slate-900">डिलीवरी पता (Beckn on_init)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutStage("closed")}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Delivery Address Input Form */}
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
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">मकान नं. व सड़क का नाम (Street Address)</label>
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

              {/* ── Logistics Provider Selection & Calculated ETA (Step 4) ── */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>🚚 कूरियर पार्टनर (Logistics Selection):</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                    ETA: {formattedEta}
                  </span>
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCourier("India Post (डाक घर)")}
                    className="p-2 rounded-xl text-left border transition-all text-xs"
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
                    className="p-2 rounded-xl text-left border transition-all text-xs"
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

              {/* Final Confirm Payment Button */}
              <button
                type="button"
                onClick={handleFinalOrderPlacement}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2"
                style={{
                  background:
                    buyerPlatform === "PhonePe Pincode"
                      ? "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)"
                      : "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                }}
              >
                <span>⚡</span>
                <span>UPI से पेमेंट करें और आर्डर दें (Pay ₹{cartQuote.totalPrice})</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 3: Order Confirmation & Live Tracking (Beckn Confirm) ── */}
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

              {/* Delivery ETA Card */}
              <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-purple-900">
                  <span>अनुमानित डिलीवरी (ETA):</span>
                  <span>{confirmedOrderDetails.estimatedDeliveryDate}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  कूरियर: <span className="font-semibold text-slate-900">{confirmedOrderDetails.courierName}</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  डिलीवरी पता: {confirmedOrderDetails.deliveryAddress.street}, {confirmedOrderDetails.deliveryAddress.city} - {confirmedOrderDetails.deliveryAddress.pincode}
                </p>
                <div className="border-t border-purple-200/80 pt-1 flex justify-between text-emerald-800 font-bold">
                  <span>कुल भुगतान (Paid via UPI):</span>
                  <span>₹{confirmedOrderDetails.quote.totalPrice}</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 font-semibold">
                ✓ ₹{confirmedOrderDetails.quote.artisanShare} की राशि सीधे कारीगर के जन-धन बैंक खाते में ट्रांसफर कर दी गई है!
              </div>

              <button
                type="button"
                onClick={() => setCheckoutStage("closed")}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-md active:scale-98 transition"
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

        {/* ── Beckn JSON Schema Modal (Judges Proof) ── */}
        {showBecknModal && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 text-emerald-400 rounded-2xl p-4 w-full max-h-[80%] flex flex-col shadow-2xl border border-slate-700">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                <span className="text-xs font-bold text-white">ONDC Beckn JSON (`nic2004:52110`)</span>
                <button
                  type="button"
                  onClick={() => setShowBecknModal(null)}
                  className="text-white text-sm font-bold"
                >
                  ✕
                </button>
              </div>
              <pre className="text-[10px] overflow-auto flex-1 font-mono leading-relaxed bg-black/50 p-2 rounded">
                {JSON.stringify(transformToOndcCatalog(showBecknModal), null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* ── Bottom Bar: Logout ── */}
        <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between px-5 flex-shrink-0">
          <span className="text-[10px] font-semibold text-slate-500">
            🛡️ ONDC Verified Buyer Node
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 active:scale-95"
          >
            लॉगआउट (Logout)
          </button>
        </div>
      </div>
    </div>
  );
}