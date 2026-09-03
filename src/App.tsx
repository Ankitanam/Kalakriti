// src/App.tsx
import { useState, useRef } from "react";
import CatalogPreview from "./CatalogPreview";
import CheckoutScreen from "./CheckoutScreen";
import OnboardingScreen from "./OnboardingScreen";

const CATEGORIES = [
  { hi: "मिट्टी", en: "Pottery" },
  { hi: "बुनाई", en: "Weaving" },
  { hi: "लकड़ी", en: "Wood" },
  { hi: "कढ़ाई", en: "Embroidery" },
];

export default function App() {
  const [screen, setScreen] = useState<"onboarding" | "capture" | "preview" | "checkout">("capture");
  
  // Photo states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form & Voice states
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0);

  // AI & Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [catalogData, setCatalogData] = useState<any>(null);

  // Handle Photo Pick
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPhotoUrl(URL.createObjectURL(file));
    }
  };

  // Helper: Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
    });
  };

  // Upload to Cloudinary
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
    } catch (e) {
      console.warn("Cloudinary upload fallback:", e);
      return { originalUrl: photoUrl || "", enhancedUrl: photoUrl || "" };
    }
  };

  // Voice recording
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
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("");
          setVoiceText(transcript);
        };

        recognition.onend = () => setIsRecording(false);
        recognition.onerror = () => setIsRecording(false);
        recognition.start();
      } else {
        setTimeout(() => {
          setIsRecording(false);
          if (!voiceText) setVoiceText("यह हाथ से बनी पारंपरिक मधुबनी पेंटिंग है।");
        }, 1200);
      }
    }
  };

  // ── HERE IS handleGenerateCatalog WITH COMPETITIVE PRICING & TABULAR DATA ──
  const handleGenerateCatalog = async () => {
    if (!selectedFile && !photoUrl) {
      alert("कृपया पहले कैमरे या गैलरी से सामान की फोटो चुनें!");
      return;
    }

    try {
      setIsLoading(true);

      // 1. Cloudinary upload
      setLoadingStage("फोटो सुधारी जा रही है (Cloudinary)...");
      let finalImageUrl = photoUrl || "";
      if (selectedFile) {
        const cloudResult = await uploadToCloudinary(selectedFile);
        finalImageUrl = cloudResult.enhancedUrl || photoUrl || "";
      }

      // 2. Gemini AI call
      setLoadingStage("AI बाज़ार के अनुसार सही मूल्य तय कर रहा है...");
      const geminiKey = import.meta.env.VITE_GEMINI_KEY;
      const categoryName = CATEGORIES[selectedCategory].en;
      const userNote = voiceText || "पारंपरिक हस्तशिल्प";

      let generatedData: any = null;

      if (geminiKey) {
        try {
          const promptText = `
You are an ONDC e-commerce pricing and catalog specialist for rural Indian artisans (KalaSetu platform).
Analyze the photo and artisan note: "${userNote}".

OBJECTIVES:
1. COMPETITIVE DIRECT-TO-CONSUMER PRICING (HIGH VOLUME / FAST SALES):
   Set attractive, realistic, and competitive prices to beat factory-made goods:
   - Unframed Folk Paintings (Madhubani, Warli, Canvas sheet): ₹249 to ₹399
   - Daily Terracotta / Clay Pots / Planters: ₹99 to ₹249
   - Handloom Dupattas / Scarves: ₹299 to ₹549
   - Small Wooden / Brass Handicrafts: ₹199 to ₹449
   (Do NOT overprice. The goal is competitive artisan livelihood).

2. TABULAR SPECIFICATIONS:
   Output clear key-value attributes (Style, Material, Size, Framing, Origin) for instant glanceability.

Output ONLY valid JSON matching this schema:
{
  "title_hi": "मधुबनी सूर्य लोककला पेंटिंग",
  "title_en": "Handmade Madhubani Sun Art (Unframed)",
  "suggested_price": 299,
  "artisan_name": "माधुरी देवी",
  "artisan_region": "मिथिला, बिहार (Mithila, Bihar)",
  "quick_summary_hi": "प्राकृतिक रंगों और पारंपरिक कचनी-भरनी शैली से हस्तनिर्मित मूल मधुबनी पेंटिंग।",
  "quick_summary_en": "Authentic handmade Madhubani folk painting created with organic pigments on textured paper.",
  "specs_hi": [
    { "label": "कला शैली", "value": "मिथिला / मधुबनी लोककला" },
    { "label": "सामग्री", "value": "हस्तनिर्मित कागज़ + प्राकृतिक रंग" },
    { "label": "अनुमानित आकार", "value": "A4 शीट (लगभग 8x11 इंच)" },
    { "label": "फ्रेम प्रकार", "value": "बिना फ्रेम (रोल पैकिंग)" },
    { "label": "उपयोग", "value": "दीवार सजावट, लिविंग रूम, उपहार" }
  ],
  "specs_en": [
    { "label": "Art Form", "value": "Mithila / Madhubani Folk Art" },
    { "label": "Base Material", "value": "Handmade Paper & Eco Dyes" },
    { "label": "Dimensions", "value": "A4 Sheet (approx. 8x11 inches)" },
    { "label": "Framing", "value": "Unframed (Safe Cardboard Roll)" },
    { "label": "Best For", "value": "Wall Decor, Study, Cultural Gift" }
  ],
  "tags": ["Madhubani", "Handmade", "Affordable", "ONDC Direct", "Mithila"]
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

          // Try Gemini 3.5 Flash-Lite
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

      // Smart Competitive Fallback
      if (!generatedData) {
        const isPainting = /painting|मधुबनी|चित्र|paint|art/i.test(userNote);
        const compPrice = isPainting ? 299 : 149;

        generatedData = {
          title_hi: isPainting ? "मधुबनी सूर्य लोककला पेंटिंग" : "हस्तनिर्मित मिट्टी का उत्पाद",
          title_en: isPainting ? "Handmade Madhubani Sun Art (Unframed)" : "Handcrafted Clay Product",
          suggested_price: compPrice,
          artisan_name: "माधुरी देवी",
          artisan_region: isPainting ? "मिथिला, बिहार" : "राजस्थान",
          quick_summary_hi: "कारीगर द्वारा शुद्ध प्राकृतिक सामग्री से निर्मित प्रामाणिक हस्तशिल्प।",
          quick_summary_en: "Authentic handmade craft directly from rural artisan at fair market price.",
          specs_hi: [
            { label: "कला शैली", value: isPainting ? "मधुबनी लोककला" : "पारंपरिक कुम्हारी" },
            { label: "सामग्री", value: isPainting ? "हस्तनिर्मित कागज़ + प्राकृतिक रंग" : "शुद्ध टेराकोटा मिट्टी" },
            { label: "आकार", value: isPainting ? "A4 शीट (8x11 इंच)" : "मध्यम आकार" },
            { label: "फ्रेम", value: "बिना फ्रेम (सुरक्षित रोल)" },
            { label: "उपयोग", value: "दीवार सज्जा, लिविंग रूम, उपहार" }
          ],
          specs_en: [
            { label: "Craft Type", value: isPainting ? "Madhubani Painting" : "Traditional Pottery" },
            { label: "Material", value: isPainting ? "Handmade Sheet & Dyes" : "Pure Terracotta Clay" },
            { label: "Size", value: isPainting ? "A4 Sheet (8x11 in)" : "Medium" },
            { label: "Framing", value: "Unframed (Roll Packing)" },
            { label: "Best For", value: "Wall Decor, Gifting" }
          ],
          tags: ["Handmade", "Affordable", "ONDC Direct"],
        };
      }

      setCatalogData({
        ...generatedData,
        imageUrl: finalImageUrl,
      });

      setScreen("preview");
    } catch (err: any) {
      console.error("Processing failed:", err);
      alert("त्रुटि: " + (err.message || err));
    } finally {
      setIsLoading(false);
      setLoadingStage("");
    }
  };

  // Screen Routing
  if (screen === "onboarding") {
    return <OnboardingScreen onLogin={() => setScreen("capture")} />;
  }

  if (screen === "preview") {
    return (
      <CatalogPreview
        data={catalogData}
        onBack={() => setScreen("capture")}
        onCheckout={() => setScreen("checkout")}
      />
    );
  }

  if (screen === "checkout") {
    return <CheckoutScreen onBack={() => setScreen("preview")} />;
  }

  // KalaSetu Capture Screen
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
            onClick={() => setScreen("onboarding")}
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "'Noto Serif', serif" }}>
              KalaSetu
            </h1>
            <p className="text-xs text-white/60 -mt-0.5">आपकी अपनी ऑनलाइन दुकान</p>
          </div>
          <button
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3" stroke="white" strokeWidth="2" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ scrollbarWidth: "none" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#9C6644" }}>
              नया सामान
            </p>
            <h2 className="text-2xl font-bold" style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}>
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
                  <div className="absolute inset-0" style={{ background: "rgba(61,31,15,0.2)" }} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow" style={{ background: "rgba(255,255,255,0.95)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M20 7h-3.2l-1.4-2H8.6L7.2 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" stroke="#6B3A2A" strokeWidth="1.8" />
                        <circle cx="12" cy="13" r="3" stroke="#6B3A2A" strokeWidth="1.8" />
                      </svg>
                    </div>
                    <span className="text-white font-semibold text-sm drop-shadow">फोटो ली ✓</span>
                    <span className="text-white/90 text-xs drop-shadow">दोबारा फोटो लें</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1" style={{ background: "rgba(196,136,107,0.15)" }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <path d="M20 7h-3.2l-1.4-2H8.6L7.2 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" stroke="#9C6644" strokeWidth="1.8" />
                      <circle cx="12" cy="13" r="3.5" stroke="#9C6644" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <span className="font-bold text-base" style={{ color: "#6B3A2A", fontFamily: "'Noto Serif', serif" }}>
                    सामान की फोटो लें
                  </span>
                  <span className="text-xs text-center px-4" style={{ color: "#9C6644" }}>
                    कैमरा या गैलरी खोलने के लिए यहाँ दबाएं
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Voice Input */}
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}>
              🎙 बोलकर जानकारी दें
            </p>
            <div className="flex gap-3 items-end">
              <div
                className="flex-1 relative rounded-2xl overflow-hidden"
                style={{
                  background: "#FFF8F3",
                  border: isRecording ? "2px solid #6B3A2A" : "1.5px solid #E8C9B0",
                  minHeight: 110,
                }}
              >
                <textarea
                  className="w-full h-full resize-none p-4 text-sm outline-none bg-transparent"
                  style={{
                    color: "#3D1F0F",
                    minHeight: 110,
                    fontFamily: "'Poppins', sans-serif",
                    lineHeight: 1.6,
                  }}
                  placeholder={isRecording ? "सुन रहे हैं…" : "माइक बटन दबाकर बोलें: 'यह हाथ से बनी मधुबनी पेंटिंग है...'"}
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleMicToggle}
                className="flex-shrink-0 rounded-full flex items-center justify-center transition-all active:scale-95"
                style={{
                  width: 64,
                  height: 64,
                  background: isRecording
                    ? "linear-gradient(135deg, #C4886B 0%, #9C6644 100%)"
                    : "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                  boxShadow: "0 8px 24px rgba(107,58,42,0.35)",
                  transform: isRecording ? "scale(1.08)" : "scale(1)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="2" width="6" height="11" rx="3" fill="white" />
                  <path d="M5 11a7 7 0 0014 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="9" y1="22" x2="15" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}>
              सामान किस तरह का है?
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(({ hi, en }, i) => (
                <button
                  key={en}
                  type="button"
                  onClick={() => setSelectedCategory(i)}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all flex flex-col items-center leading-tight"
                  style={{
                    background: selectedCategory === i ? "#6B3A2A" : "rgba(196,136,107,0.10)",
                    color: selectedCategory === i ? "white" : "#6B3A2A",
                    border: selectedCategory === i ? "1.5px solid #6B3A2A" : "1.5px solid rgba(196,136,107,0.35)",
                    fontFamily: "'Noto Serif', serif",
                  }}
                >
                  <span>{hi}</span>
                  <span
                    className="text-xs font-normal mt-0.5"
                    style={{
                      opacity: 0.65,
                      fontFamily: "'Poppins', sans-serif",
                      color: selectedCategory === i ? "rgba(255,255,255,0.85)" : "#9C6644",
                    }}
                  >
                    {en}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 24 }} />
        </div>

        {/* Generate Button */}
        <div
          className="flex-shrink-0 px-5 pb-8 pt-4"
          style={{ background: "linear-gradient(to top, #FFFBF7 80%, transparent)" }}
        >
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGenerateCatalog}
            className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-semibold text-base transition-all active:scale-[0.97] disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
              color: "white",
              boxShadow: "0 8px 28px rgba(107,58,42,0.38)",
              letterSpacing: "0.02em",
            }}
          >
            {isLoading ? (
              <span className="animate-pulse">{loadingStage || "कैटलॉग बन रहा है..."}</span>
            ) : (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L9.5 9.5H2L8.5 14L6 21.5L12 17L18 21.5L15.5 14L22 9.5H14.5L12 2Z" fill="white" fillOpacity="0.9" />
                </svg>
                <span style={{ fontFamily: "'Noto Serif', serif" }}>★ कैटलॉग तैयार करें</span>
              </>
            )}
          </button>
          <p className="text-center text-xs mt-2.5" style={{ color: "#B07050", fontFamily: "'Noto Serif', serif" }}>
            AI आपका नाम, जानकारी और सही बाज़ार मूल्य बनाएगा
          </p>
        </div>
      </div>
    </div>
  );
}