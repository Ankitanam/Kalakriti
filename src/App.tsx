// src/App.tsx
import OndcBuyerScreen from "./OndcBuyerScreen";
import ArtisanDashboard from "./ArtisanDashboard";
import { useState, useRef } from "react";
import CatalogPreview, { CatalogData } from "./CatalogPreview";
import OnboardingScreen from "./OnboardingScreen";

// 1. Categories including Painting (चित्रकारी)
const CATEGORIES = [
  { hi: "चित्रकारी", en: "Painting" },
  { hi: "मिट्टी", en: "Pottery" },
  { hi: "बुनाई", en: "Weaving" },
  { hi: "लकड़ी", en: "Wood" },
  { hi: "कढ़ाई", en: "Embroidery" },
];

export interface StoreItem extends CatalogData {
  id: string;
  quantity: number; // 👈 Stock / Quantity Support
  publishedAt?: string;
  categoryName?: string;
}

const INITIAL_SEED: StoreItem[] = [
  {
    id: "seed-1",
    title_hi: "मधुबनी सूर्य लोककला पेंटिंग",
    title_en: "Handmade Madhubani Sun Art (Unframed)",
    suggested_price: 299,
    quantity: 1,
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500",
    artisan_name: "माधुरी देवी",
    artisan_region: "मिथिला, बिहार",
    quick_summary_hi: "पारंपरिक मिथिला शैली में हस्तनिर्मित सुंदर मधुबनी पेंटिंग।",
    quick_summary_en: "Authentic handmade traditional folk painting on handmade paper.",
    specs_hi: [
      { label: "कला / शिल्प", value: "मधुबनी पेंटिंग" },
      { label: "सामग्री", value: "हैंडमेड पेपर और प्राकृतिक रंग" },
      { label: "आकार", value: "A4 आकार" },
      { label: "उपयोग", value: "गृह सज्जा और उपहार" }
    ],
    specs_en: [
      { label: "Art Form", value: "Madhubani Folk Art" },
      { label: "Material", value: "Handmade Paper & Natural Dyes" },
      { label: "Size", value: "A4 Sheet" },
      { label: "Best For", value: "Wall Decor, Gifting" }
    ],
    tags: ["मधुबनी", "Painting", "ONDC Live"],
    publishedAt: "आज"
  }
];

export default function App() {
  // Login Session
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem("artisan_logged_in") === "true";
    } catch {
      return false;
    }
  });

  // Current Screen
  const [screen, setScreen] = useState<"onboarding" | "capture" | "preview" | "dashboard" | "buyer">(() => {
    try {
      const loggedIn = localStorage.getItem("artisan_logged_in") === "true";
      return loggedIn ? "dashboard" : "onboarding";
    } catch {
      return "onboarding";
    }
  });

  // Inventory list with quantity
  const [inventory, setInventory] = useState<StoreItem[]>(() => {
    try {
      const saved = localStorage.getItem("kalakriti_inventory");
      return saved ? JSON.parse(saved) : INITIAL_SEED;
    } catch {
      return INITIAL_SEED;
    }
  });

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<CatalogData | null>(null);

  const handleLoginSuccess = () => {
    localStorage.setItem("artisan_logged_in", "true");
    setIsLoggedIn(true);
    setScreen("capture"); // Opens photo upload first
  };

  const handleLogout = () => {
    localStorage.removeItem("artisan_logged_in");
    setIsLoggedIn(false);
    setScreen("onboarding");
  };
  // ── Step 4: When Buyer purchases on PhonePe/Paytm screen ──
  const handlePlaceOrderFromBuyer = (
    product: StoreItem,
    platform: "PhonePe Pincode" | "Paytm ONDC"
  ) => {
    // 1. Create ONDC order entry
    const newOrder = {
      orderId: `ONDC-${Math.floor(1000 + Math.random() * 9000)}`,
      productTitle: product.title_hi || "हस्तशिल्प उत्पाद",
      buyerCity: "मुंबई (Maharashtra)",
      buyerPlatform: platform,
      amount: product.suggested_price || 199,
      courier: "India Post (डाक घर)",
      status: "Pending",
      orderDate: "अभी-अभी (Just now)",
    };

    // 2. Save order to localStorage
    const existingOrders = JSON.parse(localStorage.getItem("kalakriti_orders") || "[]");
    localStorage.setItem("kalakriti_orders", JSON.stringify([newOrder, ...existingOrders]));

    // 3. Decrement inventory stock by 1
    const updatedInv = inventory.map((item) =>
      item.id === product.id && item.quantity > 0
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    setInventory(updatedInv);
    localStorage.setItem("kalakriti_inventory", JSON.stringify(updatedInv));
  };

  // ── Stock / Quantity Handlers ──
  const handleIncreaseQty = (id: string) => {
    const updated = inventory.map((item) =>
      item.id === id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
    );
    setInventory(updated);
    localStorage.setItem("kalakriti_inventory", JSON.stringify(updated));
  };

  const handleDecreaseQty = (id: string) => {
    const target = inventory.find((item) => item.id === id);
    if (!target) return;

    if (target.quantity > 1) {
      const updated = inventory.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      );
      setInventory(updated);
      localStorage.setItem("kalakriti_inventory", JSON.stringify(updated));
    } else {
      handleRemoveProduct(id);
    }
  };

  const handleRemoveProduct = (id: string) => {
    if (window.confirm("क्या आप इस उत्पाद को दुकान से हटाना चाहते हैं?")) {
      const updated = inventory.filter((item) => item.id !== id);
      setInventory(updated);
      localStorage.setItem("kalakriti_inventory", JSON.stringify(updated));
    }
  };

  // Save product and handle duplicates by adding to quantity
  const saveProductToInventory = (catalogItem: CatalogData) => {
    // Check if an item with the same title already exists
    const existingIndex = inventory.findIndex(
      (item) => item.title_hi?.trim() === catalogItem.title_hi?.trim()
    );

    let updatedList: StoreItem[];
    if (existingIndex > -1) {
      // Instead of duplicate card, increase stock quantity!
      updatedList = inventory.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: (item.quantity || 1) + 1, imageUrl: catalogItem.imageUrl || item.imageUrl }
          : item
      );
    } else {
      const newEntry: StoreItem = {
        id: Date.now().toString(),
        ...catalogItem,
        quantity: 1, // default stock 1
        publishedAt: "आज",
        categoryName: CATEGORIES[selectedCategory].en,
      };
      updatedList = [newEntry, ...inventory];
    }

    setInventory(updatedList);
    try {
      localStorage.setItem("kalakriti_inventory", JSON.stringify(updatedList));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }

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
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "hi-IN";
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join("");
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

  const handleGenerateCatalog = async () => {
    if (!selectedFile && !photoUrl) {
      alert("कृपया पहले कैमरे या गैलरी से सामान की फोटो चुनें!");
      return;
    }

    try {
      setIsLoading(true);
      setLoadingStage("फोटो सुधारी जा रही है (Cloudinary)...");

      let finalImageUrl = photoUrl || "";
      if (selectedFile) {
        const cloudResult = await uploadToCloudinary(selectedFile);
        finalImageUrl = cloudResult.enhancedUrl || photoUrl || "";
      }

      setLoadingStage("AI उत्पाद की पहचान कर सही विवरण बना रहा है...");
      const geminiKey = import.meta.env.VITE_GEMINI_KEY;
      const categoryName = CATEGORIES[selectedCategory].en;
      const userNote = voiceText || "हस्तशिल्प उत्पाद";

      let generatedData: any = null;

      if (geminiKey) {
        try {
          const promptText = `
You are an expert Indian Handicrafts catalog specialist for Kalakriti on ONDC.
Carefully inspect the attached photo. User note: "${userNote}". Category: "${categoryName}".

CRITICAL INSTRUCTIONS:
1. IDENTIFY WHAT IS ACTUALLY IN THE PHOTO:
   - If it's a painting / wall art: describe it as a painting (Madhubani, Mithila, Warli, etc.).
   - If it's pottery / terracotta: describe it as a clay pot / handi.
   - DO NOT mix up painting with clay pot!
2. PRICING:
   - Painting: ₹249 to ₹399
   - Pottery / Clay: ₹149 to ₹249
3. CONCISE SPECIFICATIONS: Material, size, usage.

Output ONLY valid JSON matching this schema:
{
  "title_hi": "सटीक हिंदी नाम (जैसे: हस्तनिर्मित मधुबनी पेंटिंग या मिट्टी की हांडी)",
  "title_en": "Accurate English name matching photo",
  "suggested_price": 299,
  "artisan_name": "कारीगर का नाम",
  "artisan_region": "क्षेत्र व राज्य",
  "quick_summary_hi": "फोटो में दिख रहे सामान का 1-2 लाइन में विवरण।",
  "quick_summary_en": "1-2 lines description matching the photo.",
  "specs_hi": [
    { "label": "कला / शिल्प", "value": "शिल्प का प्रकार" },
    { "label": "सामग्री", "value": "उपयोग की गई सामग्री" },
    { "label": "आकार", "value": "आकार" },
    { "label": "उपयोग", "value": "उपयोग" }
  ],
  "specs_en": [
    { "label": "Craft Form", "value": "Craft type" },
    { "label": "Material", "value": "Materials" },
    { "label": "Size", "value": "Size" },
    { "label": "Best For", "value": "Usage" }
  ],
  "tags": ["Handmade", "Kalakriti", "ONDC Verified"]
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

      // Dynamic Fallback
      if (!generatedData) {
        const isPainting = /painting|मधुबनी|चित्र|paint|art|चित्रकारी/i.test(userNote + categoryName);
        const isPottery = /mitti|bartan|pot|ghada|handi|मिट्टी|बर्तन/i.test(userNote + categoryName);

        if (isPainting) {
          generatedData = {
            title_hi: "पारंपरिक मधुबनी लोककला पेंटिंग",
            title_en: "Handmade Madhubani Folk Painting",
            suggested_price: 299,
            artisan_name: "माधुरी देवी",
            artisan_region: "मिथिला, बिहार",
            quick_summary_hi: "प्राकृतिक रंगों और पारंपरिक मिथिला शैली में हस्तनिर्मित प्रामाणिक पेंटिंग।",
            quick_summary_en: "Authentic handmade traditional Mithila folk painting with natural dyes.",
            specs_hi: [
              { label: "कला / शिल्प", value: "मधुबनी लोककला" },
              { label: "सामग्री", value: "हैंडमेड पेपर एवं प्राकृतिक रंग" },
              { label: "आकार", value: "A4 शीट" },
              { label: "उपयोग", value: "गृह सज्जा और उपहार" }
            ],
            specs_en: [
              { label: "Craft Form", value: "Madhubani Folk Art" },
              { label: "Material", value: "Handmade Paper & Natural Dyes" },
              { label: "Size", value: "A4 Sheet" },
              { label: "Best For", value: "Home Decor & Gifting" }
            ],
            tags: ["मधुबनी", "Painting", "ONDC Live"]
          };
        } else if (isPottery) {
          generatedData = {
            title_hi: "हस्तनिर्मित पारंपरिक मिट्टी की हांडी",
            title_en: "Traditional Handcrafted Terracotta Pot",
            suggested_price: 180,
            artisan_name: "रमेश प्रजापति",
            artisan_region: "अलवर, राजस्थान",
            quick_summary_hi: "शुद्ध प्राकृतिक लाल मिट्टी से बनी पारंपरिक हांडी।",
            quick_summary_en: "Organic terracotta pot made with natural red clay.",
            specs_hi: [
              { label: "कला / शिल्प", value: "पारंपरिक कुम्हारी" },
              { label: "सामग्री", value: "100% प्राकृतिक मिट्टी" },
              { label: "आकार", value: "मध्यम (~1.5 लीटर)" },
              { label: "उपयोग", value: "खाना पकाना, जल संचयन" }
            ],
            specs_en: [
              { label: "Craft Form", value: "Terracotta Pottery" },
              { label: "Material", value: "Natural Red Clay" },
              { label: "Size", value: "Medium (~1.5 L)" },
              { label: "Best For", value: "Cooking & Decor" }
            ],
            tags: ["ClayPot", "Pottery", "ONDC Ready"]
          };
        } else {
          generatedData = {
            title_hi: `हस्तनिर्मित ${userNote}`,
            title_en: `Handcrafted ${categoryName}`,
            suggested_price: 199,
            artisan_name: "कारीगर साथी",
            artisan_region: "भारत",
            quick_summary_hi: `कुशल कारीगरों द्वारा हस्तनिर्मित प्रामाणिक ${userNote}।`,
            quick_summary_en: `Authentic handcrafted item directly from rural artisans.`,
            specs_hi: [
              { label: "शिल्प", value: categoryName },
              { label: "सामग्री", value: "पर्यावरण-अनुकूल सामग्री" },
              { label: "उपयोग", value: "गृह सज्जा और दैनिक उपयोग" }
            ],
            specs_en: [
              { label: "Craft", value: categoryName },
              { label: "Material", value: "Eco-friendly Material" },
              { label: "Usage", value: "Daily Use & Decor" }
            ],
            tags: ["Handmade", "ONDC Ready"]
          };
        }
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
    return <OnboardingScreen onLogin={handleLoginSuccess} />;
  }

  if (screen === "preview" && selectedPreviewItem) {
    return (
      <CatalogPreview
        data={selectedPreviewItem}
        onBack={() => setScreen("capture")}
        onCheckout={() => setScreen("dashboard")}
      />
    );
  }

  // ── SCREEN: "मेरी दुकान" DASHBOARD ──
  if (screen === "dashboard") {
    return (
      <ArtisanDashboard
        inventory={inventory}
        onAddNewProduct={() => setScreen("capture")}
        onPreviewProduct={(product) => {
          setSelectedPreviewItem(product);
          setScreen("preview");
        }}
        onIncreaseQty={handleIncreaseQty}
        onDecreaseQty={handleDecreaseQty}
        onRemoveProduct={handleRemoveProduct}
        onLogout={handleLogout}
      />
    );
  }
// ── SCREEN: Buyer Shopping View (Option A) ──
  if (screen === "buyer") {
    return (
      <OndcBuyerScreen
        inventory={inventory}
        onPlaceOrder={handlePlaceOrderFromBuyer}
        onBackToArtisan={() => setScreen("dashboard")}
      />
    );
  }
  // ── CAPTURE SCREEN (Rebranded Kalakriti with Painting option) ──
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

        {/* Top App Bar with working Back button to Dashboard */}
        <div
          className="flex items-center px-4 py-3 gap-3 flex-shrink-0"
          style={{ background: "#6B3A2A" }}
        >
          <button
            type="button"
            onClick={() => setScreen("dashboard")}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition"
            style={{ background: "rgba(255,255,255,0.12)" }}
            title="दुकान पर वापस जाएं"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Rebranded to Kalakriti */}
          <div className="flex-1">
            <h1
              className="text-xl font-bold text-white tracking-wide"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              Kalakriti
            </h1>
            <p className="text-xs text-white/70 -mt-0.5">आपकी अपनी ऑनलाइन दुकान</p>
          </div>

          <button
            type="button"
            onClick={() => setScreen("dashboard")}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-[#6B3A2A] bg-[#EDE0D4] transition active:scale-95"
          >
            दुकान ({inventory.length})
          </button>
          {/* ── 👇 ठीक यहाँ Enter दबाकर यह कोड पेस्ट करें ── */}
     <button
       type="button"
       onClick={() => setScreen("buyer")}
       className="px-2.5 py-1.5 rounded-full text-xs font-bold text-white bg-purple-700/80 border border-purple-400/40 active:scale-95 transition"
       title="Switch to Buyer View"
     >
       🛍️ ग्राहक दृश्य (Buyer)
     </button>
 </div>
        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ scrollbarWidth: "none" }}>
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

          {/* Photo upload container */}
          <div className="relative w-full">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full relative overflow-hidden flex flex-col items-center justify-center gap-3 transition-all active:scale-[0.98]"
              style={{
                height: 220,
                borderRadius: 20,
                border: photoUrl ? "none" : "2.5px dashed #C4886B",
                background: photoUrl ? "#FFF" : "rgba(196,136,107,0.07)",
              }}
            >
              {photoUrl ? (
                <>
                  <img
                    src={photoUrl}
                    alt="Uploaded Product"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/25" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <span className="text-white font-semibold text-sm drop-shadow">फोटो ली ✓</span>
                    <span className="text-white/90 text-xs drop-shadow">दोबारा फोटो लें</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2 mx-auto bg-amber-100/60 text-2xl">
                    📷
                  </div>
                  <span
                    className="font-bold text-base text-[#6B3A2A]"
                    style={{ fontFamily: "'Noto Serif', serif" }}
                  >
                    सामान की फोटो लें
                  </span>
                  <p className="text-xs text-[#9C6644] mt-1">
                    कैमरा या गैलरी खोलने के लिए यहाँ दबाएं
                  </p>
                </div>
              )}
            </button>
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
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl shadow-md transition active:scale-95"
                style={{
                  background: isRecording
                    ? "#DC2626"
                    : "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                }}
              >
                {isRecording ? "⏹" : "🎤"}
              </button>
            </div>
          </div>

          {/* Category Chips with चित्रकारी (Painting) */}
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
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
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
            onClick={handleGenerateCatalog}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 font-bold text-base text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
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
                <span style={{ fontFamily: "'Noto Serif', serif" }}>
                  दुकान में सामान जोड़ें
                </span>
              </>
            )}
          </button>
          <p className="text-center text-xs mt-2 text-[#8B4513] font-medium">
            ✨ AI फोटो देखकर सही दाम और विवरण खुद लिख देगा
          </p>
        </div>
      </div>
    </div>
  );
}