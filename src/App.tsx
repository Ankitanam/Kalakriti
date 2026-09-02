import { useState, useRef } from "react";
import CatalogPreview from "./CatalogPreview";
import CheckoutScreen from "./CheckoutScreen";
import KalakritiScreen from "./KalakritiScreen";
import OnboardingScreen from "./OnboardingScreen";

export default function App() {
  const [screen, setScreen] = useState<"onboarding" | "kalakriti" | "capture" | "preview" | "checkout">("onboarding");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");

  // Updated state for camera functionality
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const pulseRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New function to handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPhotoUrl(imageUrl);
    }
  };

  const handleMicToggle = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      // 1. Clear the old text and show recording animation
      setVoiceText("");
      setIsRecording(true);

      // 2. Access the browser's built-in Speech A
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN'; // Sets the AI to understand Hindi!
        recognition.interimResults = true; // Shows text as you speak

        // 3. Update the text box with what you are saying
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setVoiceText(transcript);
        };

        // 4. Stop recording when you finish speaking
        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.onerror = () => {
          alert("माइक काम नहीं कर रहा है (Mic not working. Please allow microphone permissions).");
          setIsRecording(false);
        };

        recognition.start();
      } else {
        alert("आपका ब्राउज़र वॉयस टाइपिंग सपोर्ट नहीं करता (Your browser doesn't support voice typing).");
        setIsRecording(false);
      }
    }
  };

  // Screen Routing
  if (screen === "onboarding") {
    return <OnboardingScreen onLogin={() => setScreen("capture")} />;
  }
  if (screen === "kalakriti") {
    return <KalakritiScreen />;
  }
  if (screen === "preview") {
    return <CatalogPreview onBack={() => setScreen("capture")} onCheckout={() => setScreen("checkout")} />;
  }
  if (screen === "checkout") {
    return <CheckoutScreen onBack={() => setScreen("preview")} />;
  }

  return (
    <div
      className="size-full flex items-center justify-center"
      style={{ background: "#F5EFE7", fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Phone shell */}
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
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <rect x="0" y="3" width="3" height="9" rx="1" fill="white" fillOpacity="0.4" />
              <rect x="4.5" y="2" width="3" height="10" rx="1" fill="white" fillOpacity="0.6" />
              <rect x="9" y="0" width="3" height="12" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="13.5" y="0" width="2.5" height="12" rx="1" fill="white" />
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M8 2.5C5.5 2.5 3.2 3.5 1.5 5.2L0 3.7C2.1 1.4 5 0 8 0s5.9 1.4 8 3.7l-1.5 1.5C12.8 3.5 10.5 2.5 8 2.5z" fill="white" />
              <path d="M8 6C6.3 6 4.8 6.7 3.7 7.8L2.2 6.3C3.7 4.9 5.7 4 8 4s4.3.9 5.8 2.3L12.3 7.8C11.2 6.7 9.7 6 8 6z" fill="white" fillOpacity="0.8" />
              <circle cx="8" cy="10.5" r="1.5" fill="white" />
            </svg>
            <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
              <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="white" strokeOpacity="0.5" />
              <rect x="2" y="2" width="16" height="9" rx="2" fill="white" />
              <path d="M24 4.5v4a2 2 0 000-4z" fill="white" fillOpacity="0.5" />
            </svg>
          </div>
        </div>

        {/* Top App Bar */}
        <div
          className="flex items-center px-4 py-3 gap-3 flex-shrink-0"
          style={{ background: "#6B3A2A" }}
        >
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
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
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
          style={{ scrollbarWidth: "none" }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#9C6644" }}>
              नया सामान
            </p>
            <h2 className="text-2xl font-bold" style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}>
              नया सामान बेचें
            </h2>
          </div>

          {/* Working Camera Section */}
          <div className="relative w-full">
            {/* Hidden File Input that opens Camera/Gallery */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full relative overflow-hidden flex flex-col items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98]"
              style={{
                height: 220,
                borderRadius: 20,
                border: photoUrl ? "none" : "2.5px dashed #C4886B",
                background: photoUrl
                  ? "linear-gradient(135deg, #8B5E3C 0%, #C4886B 100%)"
                  : "rgba(196,136,107,0.07)",
              }}
            >
              {photoUrl ? (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `url('${photoUrl}') center/cover`,
                      opacity: 0.85,
                    }}
                  />
                  <div className="absolute inset-0" style={{ background: "rgba(61,31,15,0.25)" }} />
                  <div className="relative flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.9)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M20 7h-3.2l-1.4-2H8.6L7.2 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" stroke="#6B3A2A" strokeWidth="1.8" />
                        <circle cx="12" cy="13" r="3" stroke="#6B3A2A" strokeWidth="1.8" />
                      </svg>
                    </div>
                    <span className="text-white font-medium text-sm">फोटो ली ✓</span>
                    <span className="text-white/70 text-xs">दोबारा फोटो लें</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 rounded-tl" style={{ borderColor: "#C4886B" }} />
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 rounded-tr" style={{ borderColor: "#C4886B" }} />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 rounded-bl" style={{ borderColor: "#C4886B" }} />
                  <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 rounded-br" style={{ borderColor: "#C4886B" }} />
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1"
                    style={{ background: "rgba(196,136,107,0.15)" }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <path d="M20 7h-3.2l-1.4-2H8.6L7.2 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" stroke="#9C6644" strokeWidth="1.8" />
                      <circle cx="12" cy="13" r="3.5" stroke="#9C6644" strokeWidth="1.8" />
                      <path d="M16.5 9.5h.5" stroke="#9C6644" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="font-bold text-base" style={{ color: "#6B3A2A", fontFamily: "'Noto Serif', serif" }}>सामान की फोटो लें</span>
                  <span className="text-xs text-center px-4 leading-relaxed" style={{ color: "#9C6644" }}>कैमरा खोलने के लिए यहाँ दबाएं</span>
                </>
              )}
            </button>
          </div>

          {/* Voice description */}
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}>
              🎙 बोलकर जानकारी दें
            </p>
            <div className="flex gap-3 items-end">
              <div
                className="flex-1 relative rounded-2xl overflow-hidden"
                style={{
                  background: "#FFF8F3",
                  border: "1.5px solid #E8C9B0",
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
                  placeholder={isRecording ? "सुन रहे हैं…" : "माइक बटन दबाकर बोलें: 'यह मिट्टी का घड़ा है, इसकी कीमत...'"}
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                />
                {isRecording && (
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full animate-bounce"
                        style={{
                          height: 8 + Math.random() * 16,
                          background: "#C4886B",
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: "0.6s",
                        }}
                      />
                    ))}
                    <span className="text-xs font-medium ml-1" style={{ color: "#9C6644" }}>सुन रहे हैं…</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleMicToggle}
                className="flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
                style={{
                  width: 64,
                  height: 64,
                  background: isRecording
                    ? "linear-gradient(135deg, #C4886B 0%, #9C6644 100%)"
                    : "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                  boxShadow: isRecording
                    ? "0 0 0 8px rgba(196,136,107,0.2), 0 8px 24px rgba(107,58,42,0.35)"
                    : "0 8px 24px rgba(107,58,42,0.35)",
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

          {/* Craft category chips */}
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}>
              सामान किस तरह का है?
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { hi: "मिट्टी", en: "Pottery" },
                { hi: "बुनाई", en: "Weaving" },
                { hi: "लकड़ी", en: "Wood" },
                { hi: "कढ़ाई", en: "Embroidery" },
              ].map(({ hi, en }, i) => (
                <button
                  key={en}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-150 flex flex-col items-center leading-tight"
                  style={{
                    background: i === 0 ? "#6B3A2A" : "rgba(196,136,107,0.10)",
                    color: i === 0 ? "white" : "#6B3A2A",
                    border: i === 0 ? "1.5px solid #6B3A2A" : "1.5px solid rgba(196,136,107,0.35)",
                    fontFamily: "'Noto Serif', serif",
                  }}
                >
                  <span>{hi}</span>
                  <span
                    className="text-xs font-normal mt-0.5"
                    style={{
                      opacity: 0.65,
                      fontFamily: "'Poppins', sans-serif",
                      color: i === 0 ? "rgba(255,255,255,0.85)" : "#9C6644",
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

        {/* Bottom action button */}
        <div
          className="flex-shrink-0 px-5 pb-8 pt-4"
          style={{ background: "linear-gradient(to top, #FFFBF7 80%, transparent)" }}
        >
          <button
            onClick={() => setScreen("preview")}
            className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-semibold text-base transition-all duration-200 active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
              color: "white",
              boxShadow: "0 8px 28px rgba(107,58,42,0.38)",
              letterSpacing: "0.02em",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L9.5 9.5H2L8.5 14L6 21.5L12 17L18 21.5L15.5 14L22 9.5H14.5L12 2Z" fill="white" fillOpacity="0.9" />
            </svg>
            <span style={{ fontFamily: "'Noto Serif', serif" }}>कैटलॉग तैयार करें</span>
          </button>
          <p className="text-center text-xs mt-2.5" style={{ color: "#B07050", fontFamily: "'Noto Serif', serif" }}>
            AI आपका नाम, जानकारी और कीमत बनाएगा
          </p>
        </div>
      </div>
    </div>
  );
}