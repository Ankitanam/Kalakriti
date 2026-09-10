// src/App.tsx
import { useLanguage } from "./context/LanguageContext";
import { LanguageModal } from "./components/LanguageModal";
import { useState, useRef, useEffect } from "react";
import CatalogPreview, { CatalogData } from "./CatalogPreview";
import OnboardingScreen from "./OnboardingScreen";
import ArtisanDashboard, { OrderItem } from "./ArtisanDashboard";
import OndcBuyerScreen from "./OndcBuyerScreen";
import { CartItem, ConfirmedOrder } from "./utils/becknEngine";

// Craft Categories
const CATEGORIES = [
  { hi: "चित्रकारी", en: "Painting" },
  { hi: "मिट्टी", en: "Pottery" },
  { hi: "बुनाई", en: "Weaving" },
  { hi: "लकड़ी", en: "Wood" },
  { hi: "कढ़ाई", en: "Embroidery" },
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
    suggested_price: 349,
    quantity: 3,
    imageUrl: "https://images.unsplash.com/photo-1599818471241-10515152865c?w=500",
    artisan_name: "शंकर लाल भाट",
    artisan_region: "जयपुर, राजस्थान",
    quick_summary_hi: "कपड़े और लकड़ी से हस्तनिर्मित पारंपरिक राजस्थानी कठपुतली।",
    quick_summary_en: "Authentic handcrafted traditional Rajasthani decorative puppet pair.",
    specs_hi: [
      { label: "कला शैली", value: "राजस्थानी कठपुतली शिल्प" },
      { label: "सामग्री", value: "लकड़ी, गोटा-पट्टी व कपड़ा" },
      { label: "आकार", value: "ऊंचाई लगभग 12 इंच" },
      { label: "उपयोग", value: "गृह सज्जा, सांस्कृतिक उपहार" },
    ],
    specs_en: [
      { label: "Craft Type", value: "Rajasthani Puppet Craft" },
      { label: "Material", value: "Wood, Traditional Fabrics & Lace" },
      { label: "Size", value: "Height approx. 12 inches" },
      { label: "Best For", value: "Home Aesthetics, Cultural Gifting" },
    ],
    tags: ["Puppets", "Rajasthan", "ONDC Live"],
    publishedAt: "आज",
  },
  {
    id: "seed-2",
    title_hi: "सजावटी हस्तनिर्मित लाल मिट्टी का कलश",
    title_en: "Decorative Handcrafted Red Terracotta Kalash",
    suggested_price: 199,
    quantity: 5,
    imageUrl: "https://images.unsplash.com/photo-1604264726154-26480e76f4e1?w=500",
    artisan_name: "रमेश प्रजापति",
    artisan_region: "अलवर, राजस्थान",
    quick_summary_hi: "पारंपरिक लाल मिट्टी से बना सुंदर सजावटी कलश।",
    quick_summary_en: "Traditional red clay pot with stone and zari embellishments.",
    specs_hi: [
      { label: "कला शैली", value: "पारंपरिक टेराकोटा" },
      { label: "सामग्री", value: "100% शुद्ध लाल मिट्टी" },
      { label: "आकार", value: "मध्यम (ऊंचाई ~7 इंच)" },
      { label: "उपयोग", value: "गृह सज्जा, पूजा, त्यौहार" },
    ],
    specs_en: [
      { label: "Craft Type", value: "Terracotta Pottery" },
      { label: "Material", value: "Pure Red Clay" },
      { label: "Size", value: "Medium (~7 inches)" },
      { label: "Best For", value: "Festive Decor, Gifting" },
    ],
    tags: ["Terracotta", "Handmade", "ONDC Live"],
    publishedAt: "आज",
  },
];

// 🛡️ ई-कॉमर्स डी-डुप्लीकेशन लॉजिक: एक ही फोटो या नाम के डुप्लीकेट कार्ड्स को मर्ज करना (Issue 1 Fix)
const deduplicateInventory = (items: StoreItem[]): StoreItem[] => {
  const seen = new Map<string, StoreItem>();
  for (const item of items) {
    const key = item.imageUrl?.trim() || item.title_hi?.trim() || item.id;
    if (seen.has(key)) {
      const existing = seen.get(key)!;
      existing.quantity = Math.max(0, (Number(existing.quantity) || 0) + (Number(item.quantity) || 1));
    } else {
      seen.set(key, { ...item, quantity: Math.max(0, Number(item.quantity) || 1) });
    }
  }
  return Array.from(seen.values());
};

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

  const [screen, setScreen] = useState<"onboarding" | "capture" | "preview" | "dashboard" | "buyer">(() => {
    try {
      const loggedIn = localStorage.getItem("artisan_logged_in") === "true";
      const savedRole = localStorage.getItem("user_role");
      if (!loggedIn) return "onboarding";
      return savedRole === "buyer" ? "buyer" : "dashboard";
    } catch {
      return "onboarding";
    }
  });

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
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<CatalogData | null>(null);

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [manualPriceInput, setManualPriceInput] = useState("");
  // ── 🌐 Multilingual Language Hook & Modal State ──
  const { t, speechLang, currentLang } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleOpenPriceModal = () => {
    if (!selectedFile && !photoUrl) {
      alert("कृपया पहले कैमरे या गैलरी से सामान की फोटो चुनें!");
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

    alert("📦 आर्डर सफलतापूर्वक पैक हो गया! India Post स्पीड पोस्ट को पिकअप भेज दिया गया है।");
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
    if (window.confirm("क्या आप इस उत्पाद को दुकान से हटाना चाहते हैं?")) {
      const updated = inventory.filter((item) => item.id !== id);
      setInventory(updated);
      localStorage.setItem("kalakriti_inventory", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    }
  };

  // 🛡️ नया सामान जोड़ते समय डुप्लीकेट चेक (Issue 1 Permanent Fix)
  const saveProductToInventory = (catalogItem: CatalogData) => {
    // अगर वही फोटो या वही नाम पहले से दुकान में है, तो नया कार्ड न बनाएं—स्टॉक बढ़ा दें!
    const existingIndex = inventory.findIndex(
      (item) =>
        (catalogItem.imageUrl && item.imageUrl?.trim() === catalogItem.imageUrl?.trim()) ||
        item.title_hi?.trim() === catalogItem.title_hi?.trim()
    );

    let updatedList: StoreItem[];
    if (existingIndex > -1) {
      updatedList = inventory.map((item, idx) =>
        idx === existingIndex
          ? {
              ...item,
              quantity: (Number(item.quantity) || 0) + 1,
              imageUrl: catalogItem.imageUrl || item.imageUrl,
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
      };
      updatedList = [newEntry, ...inventory];
    }

    const cleanList = deduplicateInventory(updatedList);
    setInventory(cleanList);
    localStorage.setItem("kalakriti_inventory", JSON.stringify(cleanList));
    window.dispatchEvent(new Event("storage"));

    setSelectedFile(null);
    setPhotoUrl(null);
    setVoiceText("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPhotoUrl(URL.createObjectURL(file));
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
    } else {
      setVoiceText("");
      setIsRecording(true);
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = speechLang; // 👈 अब यह चुनी गई भाषा (मराठी, बांग्ला, हिन्दी आदि) में सुनेगा!
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((r: any) => r[0].transcript)
            .join("");
          setVoiceText(transcript);
        };
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = () => setIsRecording(false);
        recognition.start();
      } else {
        setTimeout(() => {
          setIsRecording(false);
          if (!voiceText) setVoiceText("यह हाथ से बनी मधुबनी पेंटिंग है।");
        }, 1200);
      }
    }
  };

  // ── AI Catalog Generation ──
  const handleGenerateCatalog = async (customPrice?: number | null) => {
    setShowPriceModal(false);

    try {
      setIsLoading(true);
      setLoadingStage("फोटो सुधारी जा रही है (Cloudinary)...");

      let finalImageUrl = photoUrl || "";
      if (selectedFile) {
        const cloudResult = await uploadToCloudinary(selectedFile);
        finalImageUrl = cloudResult.enhancedUrl || photoUrl || "";
      }

      setLoadingStage(
        customPrice
          ? `आपकी तय कीमत (₹${customPrice}) से कैटलॉग बन रहा है...`
          : "AI बाज़ार के अनुसार सही मूल्य तय कर रहा है..."
      );

      const geminiKey = import.meta.env.VITE_GEMINI_KEY;
      const categoryName = CATEGORIES[selectedCategory].en;
      const userNote = voiceText || "हस्तशिल्प उत्पाद";

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

CRITICAL TASK: Generate rich, evocative, high-converting marketplace catalog copy that honors the artisan's craft heritage.
Do NOT write bland or generic 1-line text. Provide deep cultural storytelling, craft highlights, and precise specifications.

Output ONLY valid JSON matching this schema:
{
  "title_hi": "सटीक और आकर्षक हिंदी नाम (उदा. पारंपरिक मधुबनी सूर्य पेंटिंग)",
  "title_en": "Evocative English craft name (e.g. Handmade Madhubani Sun Divinity Folk Painting)",
  "suggested_price": ${customPrice || 199},
  "artisan_name": "कारीगर का नाम",
  "artisan_region": "शिल्प का प्रसिद्ध क्षेत्र व राज्य (उदा. मधुबनी, बिहार)",
  "quick_summary_hi": "1 आकर्षक हुक लाइन जिसमें उत्पाद की मुख्य पहचान हो।",
  "quick_summary_en": "1 crisp, enticing sentence highlighting the craft.",
  "story_hi": "2-3 पंक्तियों में इस शिल्प की प्राचीन विरासत, निर्माण की हस्तनिर्मित तकनीक (जैसे प्राकृतिक रंग, चाक पर गढ़ी मिट्टी, या बारीक हाथ की बुनाई) और इसके सांस्कृतिक महत्व की सुंदर कहानी लिखें।",
  "story_en": "2-3 evocative sentences describing the cultural heritage, artisan craftsmanship technique, and timeless aesthetic value for modern living spaces.",
  "highlights_hi": [
    "100% पर्यावरण-अनुकूल एवं प्राकृतिक सामग्री",
    "पीढ़ीगत पारंपरिक तकनीकों द्वारा हस्तनिर्मित",
    "गृह सज्जा, पूजा एवं सांस्कृतिक उपहार हेतु उत्तम"
  ],
  "highlights_en": [
    "100% Eco-friendly & naturally sourced materials",
    "Handcrafted using authentic generational techniques",
    "Ideal for cultural aesthetics, decor & mindful gifting"
  ],
  "specs_hi": [
    { "label": "कला / शिल्प", "value": "विशिष्ट शिल्प का नाम" },
    { "label": "सामग्री", "value": "उपयोग की गई वास्तविक सामग्री" },
    { "label": "आकार", "value": "अनुमानित आकार / आयाम" },
    { "label": "उपयोग", "value": "सजावट, पूजा, या दैनिक उपयोग" }
  ],
  "specs_en": [
    { "label": "Craft Form", "value": "Specific Art / Craft Form" },
    { "label": "Material", "value": "Raw materials used" },
    { "label": "Size", "value": "Estimated size" },
    { "label": "Best For", "value": "Home aesthetics, decor & gifting" }
  ],
  "tags": ["Handmade", "Kalakriti", "ONDC Verified", "HeritageCraft"]
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
          }
        } catch (apiErr) {
          console.warn("Gemini call error:", apiErr);
        }
      }

      if (!generatedData) {
        const isPainting = /painting|मधुबनी|चित्र|paint|art|चित्रकारी/i.test(userNote + categoryName);
        const autoPrice = isPainting ? 299 : 180;
        const finalPrice = customPrice ? Number(customPrice) : autoPrice;

        generatedData = {
          title_hi: isPainting ? "पारंपरिक मधुबनी लोककला पेंटिंग" : "हस्तनिर्मित पारंपरिक मिट्टी की हांडी",
          title_en: isPainting ? "Handmade Madhubani Folk Painting" : "Traditional Handcrafted Clay Pot",
          suggested_price: finalPrice,
          artisan_name: isPainting ? "माधुरी देवी" : "रमेश प्रजापति",
          artisan_region: isPainting ? "मिथिला, बिहार" : "अलवर, राजस्थान",
          quick_summary_hi: "कुशल कारीगरों द्वारा हस्तनिर्मित प्रामाणिक उत्पाद।",
          quick_summary_en: "Authentic handcrafted craft directly from rural artisan.",
          specs_hi: [
            { label: "कला / शिल्प", value: isPainting ? "मधुबनी लोककला" : "पारंपरिक कुम्हारी" },
            { label: "सामग्री", value: isPainting ? "हैंडमेड पेपर एवं प्राकृतिक रंग" : "100% प्राकृतिक मिट्टी" },
            { label: "उपयोग", value: "गृह सज्जा और उपहार" },
          ],
          specs_en: [
            { label: "Craft Form", value: isPainting ? "Madhubani Art" : "Pottery" },
            { label: "Material", value: isPainting ? "Handmade Paper" : "Natural Clay" },
            { label: "Best For", value: "Decor & Gifting" },
          ],
          tags: ["Handmade", "ONDC Ready"],
        };
      }

      if (customPrice) {
        generatedData.suggested_price = Number(customPrice);
      }

      const finalPayload: CatalogData = {
        ...generatedData,
        imageUrl: finalImageUrl,
      };

      saveProductToInventory(finalPayload);
      setSelectedPreviewItem(finalPayload);
      setScreen("preview");
    } catch (err: any) {
      alert("त्रुटि: " + (err.message || err));
    } finally {
      setIsLoading(false);
      setLoadingStage("");
    }
  };

  // ── ROUTING ──
  if (!isLoggedIn || screen === "onboarding") {
    return <OnboardingScreen initialRole={activeRole} onLogin={handleLoginSuccess} />;
  }

  // 1. Buyer Marketplace View
  if (screen === "buyer") {
    return (
      <OndcBuyerScreen
        inventory={inventory}
        onOrderConfirmed={handleOrderConfirmedFromBuyer}
        onLogout={handleBuyerLogout}
      />
    );
  }

  // 2. Listing Preview Screen
  if (screen === "preview" && selectedPreviewItem) {
    return (
      <CatalogPreview
        data={selectedPreviewItem}
        onBack={() => setScreen("capture")}
        onCheckout={() => setScreen("dashboard")}
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
          className="flex items-center px-4 py-3 gap-3 flex-shrink-0"
          style={{ background: "#6B3A2A" }}
        >
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition cursor-pointer"
            style={{ background: "rgba(255,255,255,0.12)" }}
            title="दुकान पर वापस जाएं"
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
              Kalakriti
            </h1>
            <p className="text-xs text-white/70 -mt-0.5">आपकी अपनी ऑनलाइन दुकान</p>
          </div>
          {/* 🌐 Flipkart-Style भाषा पिल बटन */}
          <button
            type="button"
            onClick={() => setShowLanguageModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold text-white bg-white/20 active:scale-95 transition cursor-pointer border border-white/25"
          >
            <span>🌐</span>
            <span>{currentLang.toUpperCase()}</span>
          </button>

          <button
            type="button"
            onClick={() => setScreen("dashboard")}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-[#6B3A2A] bg-[#EDE0D4] transition active:scale-95 cursor-pointer"
          >
            दुकान ({inventory.length})
          </button>
        </div>

        {/* Form Body */}
        <div
          className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
          style={{ scrollbarWidth: "none" }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-[#9C6644]">
              नया सामान
            </p>
            <h2
              className="text-2xl font-bold text-[#3D1F0F]"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              नया सामान बेचें
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
                  <div className="relative h-52 w-full rounded-xl overflow-hidden bg-black/5 flex items-center justify-center">
                    <img
                      src={photoUrl}
                      alt="Uploaded Product"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow">
                      ✓ फोटो चुनी गई
                    </div>
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
                      <span>दोबारा फोटो लें</span>
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
                      <span>गैलरी से बदलें</span>
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
                    सामान की फोटो लें
                  </span>
                  <p className="text-xs text-[#9C6644] mt-1 mb-4">
                    कैमरे से तुरंत फोटो खींचें या गैलरी से अपलोड करें
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
                      <span>कैमरा खोलें</span>
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
                      <span>फोटो अपलोड</span>
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
              🎙 बोलकर जानकारी दें
            </p>
            <div className="flex gap-3 items-end">
              <div
                className="flex-1 relative rounded-2xl p-1"
                style={{
                  background: "#FFF8F3",
                  border: isRecording ? "2px solid #6B3A2A" : "1.5px solid #E8C9B0",
                  minHeight: 105,
                }}
              >
                <textarea
                  className="w-full h-full resize-none p-3 text-sm outline-none bg-transparent"
                  style={{ color: "#3D1F0F" }}
                  placeholder={isRecording ? "सुन रहे हैं…" : "माइक दबाकर बोलें — 'यह मधुबनी पेंटिंग है...'"}
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleMicToggle}
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl shadow-md transition active:scale-95 cursor-pointer"
                style={{
                  background: isRecording
                    ? "#DC2626"
                    : "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                }}
              >
                {isRecording ? "⏹" : "🎤 "}
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div>
            <p
              className="text-sm font-bold mb-3 text-[#3D1F0F]"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              सामान किस तरह का है?
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(({ hi, en }, i) => (
                <button
                  key={en}
                  type="button"
                  onClick={() => setSelectedCategory(i)}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer"
                  style={{
                    background: selectedCategory === i ? "#6B3A2A" : "rgba(196,136,107,0.1)",
                    color: selectedCategory === i ? "white" : "#6B3A2A",
                    border: "1.5px solid " + (selectedCategory === i ? "#6B3A2A" : "rgba(196,136,107,0.3)"),
                  }}
                >
                  {hi} ({en})
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
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 font-bold text-base text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
              boxShadow: "0 8px 24px rgba(107,58,42,0.35)",
            }}
          >
            {isLoading ? (
              <span className="animate-pulse">{loadingStage || "तैयार हो रहा है..."}</span>
            ) : (
              <>
                <span>✦</span>
                <span style={{ fontFamily: "'Noto Serif', serif" }}>दुकान में सामान जोड़ें</span>
              </>
            )}
          </button>
          <p className="text-center text-xs mt-2 text-[#8B4513] font-medium">
            ✨ AI फोटो देखकर सही दाम और विवरण खुद लिख देगा
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
                      कीमत कैसे तय करना चाहते हैं?
                    </h3>
                    <p className="text-[11px] text-[#8B4513]">
                      अपनी मर्ज़ी से कीमत डालें या AI को तय करने दें
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
                    <span>विकल्प 1: AI बाज़ार भाव (अनुशंसित)</span>
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    ONDC Ready
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  AI फोटो और कला की बारीकी देखकर सबसे सही प्रतिस्पर्धी दाम खुद तय करेगा।
                </p>
                <button
                  type="button"
                  onClick={() => handleGenerateCatalog(null)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-xs active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)" }}
                >
                  <span>✨</span>
                  <span>AI को कीमत तय करने दें</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-[11px] font-bold text-[#9C6644] px-2 py-0.5 rounded-full bg-stone-100">
                  या अपनी खुद की कीमत डालें
                </span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              {/* Option 2: Manual Price Input */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E0C8B5] space-y-3 shadow-xs">
                <div>
                  <label className="block text-xs font-bold text-[#3D1F0F] mb-1">
                    विकल्प 2: अपनी बिक्री कीमत (Your Price in ₹)
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
                  <span className="text-[10px] text-stone-500 font-medium">सुझाव:</span>
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
                    {manualPriceInput ? `₹${manualPriceInput} की कीमत से जोड़ें` : "कीमत दर्ज करें"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* 🌐 फ्लिपकार्ट-स्टाइल लैंग्वेज बॉटम शीट */}
        <LanguageModal
          isOpen={showLanguageModal}
          onClose={() => setShowLanguageModal(false)}
          theme="seller"
        />

        {/* ── 🚪 LOGOUT CONFIRMATION POPUP MODAL ── */}
        {showLogoutConfirm && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-5 z-50 animate-fade-in">
            <div
              className="bg-[#FFFDF9] w-full max-w-xs rounded-3xl p-5 space-y-4 border-2 border-[#C4886B] shadow-2xl text-center animate-slide-up"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-2xl flex items-center justify-center mx-auto shadow-xs">
                🚪
              </div>

              <div className="space-y-1">
                <h3
                  className="text-lg font-bold text-[#3D1F0F]"
                  style={{ fontFamily: "'Noto Serif', serif" }}
                >
                  क्या आप बाहर निकलना चाहते हैं?
                </h3>
                <p className="text-xs text-[#8B4513] leading-relaxed">
                  अगर आप अभी बाहर जाएंगे तो आपको दोबारा लॉगिन करना होगा।
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-3 rounded-2xl font-bold text-sm text-white shadow-md active:scale-98 transition cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)" }}
                >
                  नहीं, यहीं सामान जोड़ें (Stay Here)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    handleSellerLogout();
                  }}
                  className="w-full py-2.5 rounded-2xl font-bold text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 active:scale-98 transition cursor-pointer"
                >
                  हाँ, बाहर निकलें (लॉगआउट)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}