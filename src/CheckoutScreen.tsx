import { useState } from "react";

interface Props {
    onBack?: () => void;
}

export default function CheckoutScreen({ onBack }: Props) {
    const [form, setForm] = useState({ name: "", mobile: "", address: "", pincode: "" });
    const [focused, setFocused] = useState<string | null>(null);
    const [payment, setPayment] = useState<"upi" | "cod">("upi");
    const [ordered, setOrdered] = useState(false);

    const set = (field: string, val: string) =>
        setForm((f) => ({ ...f, [field]: val }));

    const hasValue = (field: string) => form[field as keyof typeof form].length > 0;
    const isFloating = (field: string) => focused === field || hasValue(field);

    return (
        <div
            className="size-full flex items-center justify-center"
            style={{ background: "#F5EFE7", fontFamily: "'Poppins', sans-serif" }}
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
                    style={{ background: "#FFFBF7" }}
                >
                    <span className="text-xs font-medium" style={{ color: "#6B3A2A" }}>9:41</span>
                    <div className="flex items-center gap-2">
                        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                            <rect x="0" y="3" width="3" height="9" rx="1" fill="#6B3A2A" fillOpacity="0.35" />
                            <rect x="4.5" y="2" width="3" height="10" rx="1" fill="#6B3A2A" fillOpacity="0.55" />
                            <rect x="9" y="0" width="3" height="12" rx="1" fill="#6B3A2A" fillOpacity="0.8" />
                            <rect x="13.5" y="0" width="2.5" height="12" rx="1" fill="#6B3A2A" />
                        </svg>
                        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                            <path d="M8 2.5C5.5 2.5 3.2 3.5 1.5 5.2L0 3.7C2.1 1.4 5 0 8 0s5.9 1.4 8 3.7l-1.5 1.5C12.8 3.5 10.5 2.5 8 2.5z" fill="#6B3A2A" />
                            <path d="M8 6C6.3 6 4.8 6.7 3.7 7.8L2.2 6.3C3.7 4.9 5.7 4 8 4s4.3.9 5.8 2.3L12.3 7.8C11.2 6.7 9.7 6 8 6z" fill="#6B3A2A" fillOpacity="0.7" />
                            <circle cx="8" cy="10.5" r="1.5" fill="#6B3A2A" />
                        </svg>
                        <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
                            <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="#6B3A2A" strokeOpacity="0.4" />
                            <rect x="2" y="2" width="16" height="9" rx="2" fill="#6B3A2A" />
                            <path d="M24 4.5v4a2 2 0 000-4z" fill="#6B3A2A" fillOpacity="0.4" />
                        </svg>
                    </div>
                </div>

                {/* Top App Bar — white */}
                <div
                    className="flex items-center px-4 py-3 gap-3 flex-shrink-0"
                    style={{ background: "#FFFBF7", borderBottom: "1px solid rgba(196,136,107,0.18)" }}
                >
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95"
                        style={{ background: "rgba(107,58,42,0.08)" }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18l-6-6 6-6" stroke="#6B3A2A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1
                            className="text-lg font-bold tracking-wide"
                            style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}
                        >
                            Checkout
                        </h1>
                    </div>
                    {/* Secure lock */}
                    <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.3)" }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <rect x="5" y="11" width="14" height="10" rx="2" stroke="#16A34A" strokeWidth="2" />
                            <path d="M8 11V7a4 4 0 018 0v4" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="text-xs font-semibold" style={{ color: "#16A34A" }}>Secure</span>
                    </div>
                </div>

                {/* Scrollable body */}
                <div
                    className="flex-1 overflow-y-auto px-5 py-5 space-y-6"
                    style={{ scrollbarWidth: "none", paddingBottom: 100 }}
                >
                    {/* ── Order Summary Card ── */}
                    <div
                        className="rounded-2xl p-4 flex items-center gap-4"
                        style={{ background: "#FFF0E6", border: "1.5px solid rgba(196,136,107,0.25)" }}
                    >
                        {/* Thumbnail */}
                        <div
                            className="flex-shrink-0 rounded-xl overflow-hidden"
                            style={{ width: 68, height: 68, background: "#F0EBE3" }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1604264726154-26480e76f4e1?w=136&h=136&fit=crop&auto=format"
                                alt="Decorative clay pot"
                                className="w-full h-full object-cover"
                                style={{ mixBlendMode: "multiply" }}
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p
                                className="font-bold text-base leading-tight"
                                style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}
                            >
                                सजावटी मिट्टी का घड़ा
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="#16A34A">
                                    <path d="M20 6L9 17l-5-5" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                </svg>
                                <p className="text-xs" style={{ color: "#6B8E6B" }}>
                                    Radha Devi · ONDC Verified
                                </p>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span
                                    className="text-xl font-bold"
                                    style={{ color: "#6B3A2A", fontFamily: "'Noto Serif', serif" }}
                                >
                                    ₹150
                                </span>
                                <span
                                    className="text-sm line-through font-medium"
                                    style={{ color: "#B07050" }}
                                >
                                    ₹250
                                </span>
                                <span
                                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                    style={{ background: "rgba(22,163,74,0.12)", color: "#16A34A" }}
                                >
                                    40% off
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Delivery Details ── */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ background: "#6B3A2A" }}
                            >
                                1
                            </div>
                            <h2
                                className="text-base font-bold"
                                style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}
                            >
                                Delivery Address
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    key: "name", label: "Full Name", type: "text", icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                        </svg>
                                    )
                                },
                                {
                                    key: "mobile", label: "Mobile Number", type: "tel", icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.8" />
                                            <circle cx="12" cy="18" r="1" fill="currentColor" />
                                        </svg>
                                    )
                                },
                                {
                                    key: "address", label: "Complete Address (Village / Street / City)", type: "text", icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.8" />
                                            <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                                        </svg>
                                    )
                                },
                                {
                                    key: "pincode", label: "Pincode", type: "number", icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
                                            <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
                                            <path d="M7 14h2M11 14h2M15 14h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                        </svg>
                                    )
                                },
                            ].map(({ key, label, type, icon }) => (
                                <div key={key} className="relative">
                                    <div
                                        className="relative rounded-xl overflow-hidden transition-all duration-200"
                                        style={{
                                            border: focused === key
                                                ? "2px solid #6B3A2A"
                                                : "1.5px solid rgba(196,136,107,0.45)",
                                            background: focused === key ? "#FFFBF7" : "#FFF8F3",
                                        }}
                                    >
                                        {/* Floating label */}
                                        <label
                                            className="absolute left-12 transition-all duration-200 pointer-events-none select-none"
                                            style={{
                                                top: isFloating(key) ? 8 : "50%",
                                                transform: isFloating(key) ? "none" : "translateY(-50%)",
                                                fontSize: isFloating(key) ? 10 : 14,
                                                fontWeight: isFloating(key) ? 600 : 400,
                                                color: focused === key ? "#6B3A2A" : "#9C6644",
                                                letterSpacing: isFloating(key) ? "0.04em" : "normal",
                                                textTransform: isFloating(key) ? "uppercase" : "none",
                                            }}
                                        >
                                            {label}
                                        </label>

                                        {/* Icon */}
                                        <div
                                            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                                            style={{ color: focused === key ? "#6B3A2A" : "#C4886B" }}
                                        >
                                            {icon}
                                        </div>

                                        <input
                                            type={type}
                                            value={form[key as keyof typeof form]}
                                            onChange={(e) => set(key, e.target.value)}
                                            onFocus={() => setFocused(key)}
                                            onBlur={() => setFocused(null)}
                                            className="w-full bg-transparent outline-none text-sm font-medium"
                                            style={{
                                                paddingLeft: 48,
                                                paddingRight: 16,
                                                paddingTop: isFloating(key) ? 26 : 16,
                                                paddingBottom: isFloating(key) ? 10 : 16,
                                                color: "#3D1F0F",
                                                fontFamily: "'Poppins', sans-serif",
                                                minHeight: 58,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Payment Method ── */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ background: "#6B3A2A" }}
                            >
                                2
                            </div>
                            <h2
                                className="text-base font-bold"
                                style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}
                            >
                                Payment Method
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {/* UPI option */}
                            <button
                                onClick={() => setPayment("upi")}
                                className="w-full flex items-center gap-4 rounded-2xl p-4 transition-all duration-200 active:scale-[0.98]"
                                style={{
                                    background: payment === "upi" ? "rgba(107,58,42,0.06)" : "#FFF8F3",
                                    border: payment === "upi" ? "2px solid #6B3A2A" : "1.5px solid rgba(196,136,107,0.35)",
                                }}
                            >
                                {/* Radio */}
                                <div
                                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ border: "2px solid #6B3A2A" }}
                                >
                                    {payment === "upi" && (
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#6B3A2A" }} />
                                    )}
                                </div>

                                {/* UPI logo stand-in */}
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: "linear-gradient(135deg, #6C3ABF 0%, #9B59B6 100%)" }}
                                >
                                    <span className="text-white text-xs font-bold tracking-tight">UPI</span>
                                </div>

                                <div className="flex-1 text-left">
                                    <p className="text-sm font-semibold" style={{ color: "#3D1F0F" }}>UPI (ONDC Secure)</p>
                                    <p className="text-xs mt-0.5" style={{ color: "#9C6644" }}>GPay · PhonePe · Paytm · Any UPI app</p>
                                </div>

                                {/* Zero fee tag */}
                                <span
                                    className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                                    style={{ background: "rgba(22,163,74,0.12)", color: "#16A34A", border: "1px solid rgba(22,163,74,0.3)" }}
                                >
                                    Zero Fee
                                </span>
                            </button>

                            {/* COD option */}
                            <button
                                onClick={() => setPayment("cod")}
                                className="w-full flex items-center gap-4 rounded-2xl p-4 transition-all duration-200 active:scale-[0.98]"
                                style={{
                                    background: payment === "cod" ? "rgba(107,58,42,0.06)" : "#FFF8F3",
                                    border: payment === "cod" ? "2px solid #6B3A2A" : "1.5px solid rgba(196,136,107,0.35)",
                                }}
                            >
                                <div
                                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ border: "2px solid #6B3A2A" }}
                                >
                                    {payment === "cod" && (
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#6B3A2A" }} />
                                    )}
                                </div>

                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: "linear-gradient(135deg, #9C6644 0%, #6B3A2A 100%)" }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <rect x="2" y="6" width="20" height="14" rx="2" stroke="white" strokeWidth="1.8" />
                                        <path d="M2 10h20" stroke="white" strokeWidth="1.8" />
                                        <circle cx="7" cy="15" r="1.5" fill="white" />
                                    </svg>
                                </div>

                                <div className="flex-1 text-left">
                                    <p className="text-sm font-semibold" style={{ color: "#3D1F0F" }}>Cash on Delivery</p>
                                    <p className="text-xs mt-0.5" style={{ color: "#9C6644" }}>Pay when you receive the order</p>
                                </div>

                                <span
                                    className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                                    style={{ background: "rgba(196,136,107,0.12)", color: "#9C6644", border: "1px solid rgba(196,136,107,0.3)" }}
                                >
                                    +₹20 fee
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* ── Bill Summary ── */}
                    <div
                        className="rounded-2xl p-4 space-y-3"
                        style={{ background: "#FFF0E6", border: "1.5px solid rgba(196,136,107,0.2)" }}
                    >
                        <p className="text-sm font-bold" style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}>
                            Bill Summary
                        </p>
                        {[
                            { label: "Item total", value: "₹250" },
                            { label: "Artisan discount", value: "− ₹100", green: true },
                            { label: "Platform fee", value: "₹0", green: true },
                            { label: "Delivery", value: "FREE", green: true },
                        ].map(({ label, value, green }) => (
                            <div key={label} className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: "#9C6644" }}>{label}</span>
                                <span
                                    className="text-sm font-semibold"
                                    style={{ color: green ? "#16A34A" : "#3D1F0F" }}
                                >
                                    {value}
                                </span>
                            </div>
                        ))}
                        <div style={{ height: 1, background: "rgba(196,136,107,0.25)" }} />
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-base" style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}>
                                Total payable
                            </span>
                            <span className="font-bold text-xl" style={{ color: "#6B3A2A", fontFamily: "'Noto Serif', serif" }}>
                                ₹150
                            </span>
                        </div>
                        <div
                            className="flex items-center gap-2 pt-1"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17l-5-5" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-xs font-medium" style={{ color: "#16A34A" }}>
                                You save ₹100 · 40% goes directly to the artisan
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Sticky Bottom Bar ── */}
                <div
                    className="absolute bottom-0 left-0 right-0 flex-shrink-0 px-5 pb-8 pt-3"
                    style={{ background: "linear-gradient(to top, #FFFBF7 70%, transparent)" }}
                >
                    {ordered ? (
                        <div
                            className="w-full flex flex-col items-center justify-center gap-1 rounded-2xl py-4"
                            style={{ background: "rgba(22,163,74,0.1)", border: "1.5px solid rgba(22,163,74,0.35)" }}
                        >
                            <div className="flex items-center gap-2">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 6L9 17l-5-5" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="font-bold text-base" style={{ color: "#16A34A" }}>Order Placed!</span>
                            </div>
                            <span className="text-xs" style={{ color: "#16A34A" }}>
                                Estimated delivery: 3–5 working days
                            </span>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => setOrdered(true)}
                                className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-semibold text-base transition-all duration-200 active:scale-[0.97]"
                                style={{
                                    background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                                    color: "white",
                                    boxShadow: "0 8px 28px rgba(107,58,42,0.38)",
                                    letterSpacing: "0.02em",
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="white" strokeWidth="1.8" />
                                    <path d="M8 11V7a4 4 0 018 0v4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                                </svg>
                                Place Order · ₹150
                            </button>
                            <p className="text-center text-xs mt-2" style={{ color: "#B07050" }}>
                                Secured by ONDC · End-to-end encrypted
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
