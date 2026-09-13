
import { useLanguage, TranslationKey } from "./context/LanguageContext";
import { useState, useRef, useEffect } from "react";
import CatalogPreview, { CatalogData } from "./CatalogPreview";
import OnboardingScreen from "./OnboardingScreen";
import ArtisanDashboard, { OrderItem } from "./ArtisanDashboard";
import OndcBuyerScreen from "./OndcBuyerScreen";
import ConfirmationModal from "./components/ConfirmationModal";
import { LanguageDropdown } from "./components/LanguageDropdown";
import { CartItem, ConfirmedOrder } from "./utils/becknEngine";
import { areItemsDuplicate, extractCoreKeyword, getDisplayTitle, KNOWN_CRAFT_LOCALIZATIONS, LocalizedContentMap } from "./utils/artisanAiService";
import { MicPulseRing, AiScannerOverlay } from "./components/motion/MotionPrimitives";
import GameWorld from "./components/GameWorld";

// Craft Categories
const CATEGORIES: Array<{ hi: string; en: string; key: TranslationKey }> = [
  { hi: "चित्रकारी", en: "Painting", key: "cat_painting" },
  { hi: "मिट्टी", en: "Pottery", key: "cat_pottery" },
  { hi: "बुनाई", en: "Weaving", key: "cat_weaving" },
  { hi: "लकड़ी", en: "Wood", key: "cat_wood" },
  { hi: "कढ़ाई", en: "Embroidery", key: "cat_embroidery" },
];

export interface StoreItem extends CatalogData {
  id: string;
  quantity: number;
  publishedAt?: string;
  categoryName?: string;
}

const INITIAL_SEED: StoreItem[] = [
  {
    id: "seed-1",
    title_hi: "राजस्थानी पारंपरिक कठपुतली जोड़ा",
    title_en: "Rajasthani Traditional Handmade Puppets Pair",
    title_local: "राजस्थानी पारंपरिक हस्तनिर्मित बाहुल्यांची जोडी (कठपुतळी)",
    suggested_price: 349,
    quantity: 3,
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

const deduplicateInventory = (items: StoreItem[]): StoreItem[] => {
  const merged: StoreItem[] = [];
  for (const item of items) {
    const existing = merged.find((m) => areItemsDuplicate(m, item));
    if (existing) {
      existing.quantity = Math.max(1, (Number(existing.quantity) || 0) + (Number(item.quantity) || 1));
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
      merged.push({ ...item, quantity: Math.max(1, Number(item.quantity) || 1) });
    }
  }
  return merged;
};

interface MarketplaceProps {
  inventory: StoreItem[];
  onEnterFair: () => void;
  onBack: () => void;
}

function Marketplace({ inventory, onEnterFair, onBack }: MarketplaceProps) {
  const availableProducts = inventory.filter((item) => item.quantity > 0);

  return (
    <div className="min-h-screen bg-[#F8F3ED] text-stone-900">
      <header className="sticky top-0 z-30 bg-[#5B21B6] px-5 py-4 text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Kalakriti</p>
            <h1 className="text-2xl font-bold">Marketplace</h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25 transition"
          >
            ← Customer
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 to-purple-600 p-6 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            Indian Artisan Marketplace
          </p>
          <h2 className="mt-2 text-3xl font-black md:text-5xl">
            Discover crafts. Meet artisans.
          </h2>
          <p className="mt-3 max-w-xl text-white/80">
            Shop authentic handmade products and step into the virtual craft fair.
          </p>
          <button
            type="button"
            onClick={onEnterFair}
            className="mt-6 rounded-2xl bg-white px-6 py-3 font-bold text-violet-900 shadow-lg hover:bg-violet-50 transition"
          >
            Enter Craft Fair →
          </button>
        </section>

        <div className="mt-7 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-700">
              ONDC-ready products
            </p>
            <h3 className="text-2xl font-bold">Featured Crafts</h3>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-sm">
            {availableProducts.length} products
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {availableProducts.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
            >
              <div className="aspect-square bg-stone-100">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title_en || item.title_hi || "Handmade craft"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl">🎨</div>
                )}
              </div>
              <div className="p-4">
                <h4 className="line-clamp-2 font-bold">
                  {item.title_en || item.title_hi}
                </h4>
                <p className="mt-1 text-xs text-stone-500">
                  {item.artisan_region || "Indian artisan"}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-extrabold">₹{item.suggested_price}</span>
                  <span className="text-xs font-semibold text-emerald-700">In stock</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

function CustomerSide({
  inventory,
  onOrderConfirmed,
  onLogout,
  onMarketplace,
}: {
  inventory: StoreItem[];
  onOrderConfirmed: (order: ConfirmedOrder, cart: CartItem[]) => void;
  onLogout: () => void;
  onMarketplace: () => void;
}) {
  return (
    <div className="relative min-h-screen">
      <button
        type="button"
        onClick={onMarketplace}
        className="fixed right-4 top-4 z-[100] rounded-full bg-violet-700 px-4 py-2.5 text-sm font-bold text-white shadow-xl ring-2 ring-white hover:bg-violet-800 active:scale-95 transition"
        aria-label="Open Kalakriti Marketplace"
      >
        🛍️ Marketplace
      </button>
      <OndcBuyerScreen
        inventory={inventory}
        onOrderConfirmed={onOrderConfirmed}
        onLogout={onLogout}
      />
    </div>
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
    const updatedInventory = inventory.map((invItem) => {
      const cartMatch = cartItems.find((c) => c.product.id === invItem.id);
      if (cartMatch) {
        const remainingQty = Math.max(0, (Number(invItem.quantity) || 0) - cartMatch.quantity);
        return { ...invItem, quantity: remainingQty };
      }
      return invItem;
    });

    setInventory(updatedInventory);
    localStorage.setItem("kalakriti_inventory", JSON.stringify(updatedInventory));

    const newArtisanOrders: OrderItem[] = cartItems.map((c) => ({
      orderId: confirmedOrder.orderId,
      productTitle: c.product.title_hi || "हस्तशिल्प उत्पाद",
      buyerCity: `${confirmedOrder.deliveryAddress.city} (${confirmedOrder.deliveryAddress.state})`,
      buyerPlatform: "PhonePe Pincode",
      amount: (Number(c.product.suggested_price) || 199) * c.quantity,
      courier: "India Post (डाक घर)",
      status: "Pending",
      orderDate: "अभी-अभी (Just now)",
    }));

    const updatedOrders = [...newArtisanOrders, ...orders];
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
              quantity: (Number(item.quantity) || 0) + 1,
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
      const newEntry: StoreItem = {
        id: Date.now().toString(),
        ...catalogItem,
        quantity: 1,
        publishedAt: "आज",
        categoryName: CATEGORIES[selectedCategory].en,
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
      return { originalUrl: photoUrl || "", enhancedUrl: photoUrl || "" };
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) return { originalUrl: photoUrl || "", enhancedUrl: photoUrl || "" };
      const data = await res.json();
      const enhancedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/e_improve,q_auto,f_auto/${data.public_id}.${data.format || "jpg"}`;
      return { originalUrl: data.secure_url, enhancedUrl };
    } catch {
      return { originalUrl: photoUrl || "", enhancedUrl: photoUrl || "" };
    }
  };

  const handleMicToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      setMicState("idle");
    } else {
      setVoiceText("");
      setIsRecording(true);
      setMicState("listening");
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = speechLang;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
          setMicState("processing");
          const transcript = Array.from(event.results)
            .map((r: any) => r[0].transcript)
            .join("");
          setVoiceText(transcript);
        };
        recognition.onend = () => {
          setIsRecording(false);
          setMicState("success");
          setTimeout(() => setMicState("idle"), 1200);
        };
        recognition.onerror = () => {
          setIsRecording(false);
          setMicState("error");
          setTimeout(() => setMicState("idle"), 1500);
        };
        recognition.start();
      } else {
        setTimeout(() => {
          setIsRecording(false);
          if (!voiceText) setVoiceText("यह हाथ से बनी मधुबनी पेंटिंग है।");
          setMicState("success");
          setTimeout(() => setMicState("idle"), 1200);
        }, 1200);
      }
    }
  };

  // ── AI Catalog Generation ──
  const handleGenerateCatalog = async (customPrice?: number | null) => {
    setShowPriceModal(false);

    try {
      setIsLoading(true);
      setLoadingStage(t("ai_status_enhancing"));

      let finalImageUrl = photoUrl || "";
      if (selectedFile) {
        const cloudResult = await uploadToCloudinary(selectedFile);
        finalImageUrl = cloudResult.enhancedUrl || photoUrl || "";
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
Carefully inspect the attached photo. User voice note: "${userNote}". Category: "${categoryName}".

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
              inline_data: {
                mime_type: selectedFile.type || "image/jpeg",
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
                generationConfig: { response_mime_type: "application/json" },
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
  // 0. 3D Fair
  if (showGame) {
    return <GameWorld onExit={() => setShowGame(false)} />;
  }
  if (!isLoggedIn || screen === "onboarding") {
    return <OnboardingScreen initialRole={activeRole} onLogin={handleLoginSuccess} />;
  }

  // 1. Customer side — Marketplace button lives here only
  if (screen === "buyer") {
    return (
      <CustomerSide
        inventory={inventory}
        onOrderConfirmed={handleOrderConfirmedFromBuyer}
        onLogout={handleBuyerLogout}
        onMarketplace={() => setScreen("marketplace")}
      />
    );
  }

  // 2. Marketplace — opens the existing 3D fair only after the user clicks Enter Craft Fair
  if (screen === "marketplace") {
    return (
      <Marketplace
        inventory={inventory}
        onEnterFair={() => setShowGame(true)}
        onBack={() => setScreen("buyer")}
      />
    );
  }

  // 3. Listing Preview
  if (screen === "preview" && selectedPreviewItem) {
    return (
      <CatalogPreview
        data={selectedPreviewItem}
        onBack={() => setScreen("capture")}
        onCheckout={handlePublishToOndc}
      />
    );
  }

  // 3. Artisan Dashboard Screen (Two-Way Synced)
  if (screen === "dashboard") {
    return (
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
    );
  }

  // 4. Capture Screen
  return (
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
                      ? t("processing")
                      : t("voice_placeholder")
                  }
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                />
                {micState === "success" && (
                  <span className="absolute bottom-2 right-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md animate-scale-in">
                    ✓
                  </span>
                )}
                {micState === "error" && (
                  <span className="absolute bottom-2 right-2 text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md animate-scale-in">
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
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl shadow-md touch-press transition-all duration-200 cursor-pointer relative z-10"
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
                  title={micState === "listening" ? "Stop Listening" : "Tap to Speak"}
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
  );
}