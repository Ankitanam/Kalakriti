import { useState, useRef, useEffect } from "react"

const CATEGORIES = [
    { hi: "मिट्टी", en: "Pottery" },
    { hi: "बुनाई", en: "Weaving" },
    { hi: "लकड़ी", en: "Woodwork" },
    { hi: "पेंटिंग", en: "Painting" },
]

const WAVE_HEIGHTS = [10, 18, 26, 16, 22, 12, 20, 14, 24, 10]

interface KalakritiScreenProps {
    onCatalogGenerated?: (catalogData: any) => void
}

export default function KalakritiScreen({ onCatalogGenerated }: KalakritiScreenProps) {
    // ── Real Photo State ──
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const [activeCategory, setActiveCategory] = useState(0)
    const [isRecording, setIsRecording] = useState(false)
    const [voiceText, setVoiceText] = useState("")
    const [showNotif, setShowNotif] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [loadingStage, setLoadingStage] = useState("")

    // Hidden input refs
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const galleryInputRef = useRef<HTMLInputElement>(null)
    const recognitionRef = useRef<any>(null)

    // Setup speech recognition
    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition()
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = "hi-IN"

            recognition.onresult = (event: any) => {
                let transcript = ""
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    transcript += event.results[i][0].transcript
                }
                setVoiceText((prev) => (prev ? prev + " " + transcript : transcript))
            }

            recognition.onerror = () => setIsRecording(false)
            recognition.onend = () => setIsRecording(false)

            recognitionRef.current = recognition
        }
    }, [])

    const handleMic = () => {
        if (isRecording) {
            recognitionRef.current?.stop()
            setIsRecording(false)
        } else {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start()
                    setIsRecording(true)
                } catch {
                    setIsRecording(false)
                }
            } else {
                setIsRecording(true)
                setTimeout(() => {
                    setIsRecording(false)
                    if (!voiceText) {
                        setVoiceText("यह हाथ से बनाया हुआ मिट्टी का घड़ा है।")
                    }
                }, 1500)
            }
        }
    }

    // ── Handle Real Image Pick ──
    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    // Helper: Convert File to base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
                const base64String = (reader.result as string).split(",")[1]
                resolve(base64String)
            }
            reader.onerror = reject
        })
    }

    // ── Upload & Enhance via Cloudinary (With Fallback) ──
    const uploadToCloudinary = async (file: File) => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

        if (!cloudName || !uploadPreset) {
            console.warn("Cloudinary keys missing in .env, using local preview.")
            return {
                originalUrl: previewUrl || "",
                enhancedUrl: previewUrl || "",
            }
        }

        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("upload_preset", uploadPreset)

            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: formData,
            })

            if (!res.ok) {
                console.warn("Cloudinary returned non-200, fallback to local preview.")
                return { originalUrl: previewUrl || "", enhancedUrl: previewUrl || "" }
            }

            const data = await res.json()
            const enhancedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/e_improve,q_auto,f_auto/${data.public_id}.${data.format || "jpg"}`
            return { originalUrl: data.secure_url, enhancedUrl }
        } catch (e) {
            console.warn("Cloudinary upload failed, using local preview instead:", e)
            return { originalUrl: previewUrl || "", enhancedUrl: previewUrl || "" }
        }
    }

    // ── Generate AI Catalog with Gemini (Direct REST API) ──
    const handleGenerateCatalog = async () => {
        // If user didn't pick an image yet, use the current preview or alert
        if (!selectedFile && !previewUrl) {
            alert("कृपया पहले कैमरे या गैलरी से सामान की फोटो चुनें!")
            return
        }

        try {
            setIsLoading(true)

            // Step A: Cloudinary Upload
            setLoadingStage("फोटो सुधारी जा रही है...")
            let finalImageUrl = previewUrl || ""
            if (selectedFile) {
                const cloudinaryResult = await uploadToCloudinary(selectedFile)
                finalImageUrl = cloudinaryResult.enhancedUrl || previewUrl || ""
            }

            // Step B: Gemini Catalog Generation
            setLoadingStage("AI कैटलॉग विवरण बना रहा है...")
            const geminiKey = import.meta.env.VITE_GEMINI_KEY
            const categoryName = CATEGORIES[activeCategory].en
            const userNote = voiceText || "मिट्टी का घड़ा"

            let catalogData: any = null

            if (geminiKey) {
                try {
                    let parts: any[] = [
                        {
                            text: `You are an expert Indian artisan e-commerce assistant for KalaSetu on ONDC.
Category: "${categoryName}".
Artisan voice/text note: "${userNote}".

Analyze the item and generate complete product details. Output ONLY a valid JSON object matching this exact schema:
{
  "title_hi": "सजावटी मिट्टी का घड़ा",
  "title_en": "Handcrafted Decorative Clay Pot",
  "description_hi": "यह प्राकृतिक मिट्टी से बना खूबसूरत हस्तनिर्मित घड़ा है, जो पारंपरिक कारीगरी का उत्कृष्ट उदाहरण है।",
  "description_en": "A beautifully handcrafted traditional terracotta clay pot made with eco-friendly natural clay.",
  "suggested_price": 150,
  "artisan_name": "Radha Devi",
  "artisan_region": "Rajasthan Artisan",
  "category": "${categoryName}",
  "tags": ["मिट्टी के बर्तन", "Handmade", "Terracotta", "Home Decor", "ONDC Ready"]
}`,
                        },
                    ]

                    if (selectedFile) {
                        const base64Data = await fileToBase64(selectedFile)
                        parts.push({
                            inline_data: {
                                mime_type: selectedFile.type || "image/jpeg",
                                data: base64Data,
                            },
                        })
                    }

                    // Direct REST call to Gemini 2.5 Flash
                    const geminiRes = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                contents: [{ parts }],
                                generationConfig: {
                                    response_mime_type: "application/json",
                                },
                            }),
                        }
                    )

                    if (geminiRes.ok) {
                        const resJson = await geminiRes.json()
                        const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || ""
                        // Strip any potential markdown wrappers
                        const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim()
                        catalogData = JSON.parse(cleanedText)
                    } else {
                        console.warn("Gemini API error, using smart fallback.")
                    }
                } catch (apiErr) {
                    console.warn("Gemini call exception:", apiErr)
                }
            }

            // Fallback data if Gemini didn't return valid JSON
            if (!catalogData) {
                catalogData = {
                    title_hi: userNote.length > 3 ? userNote : "सजावटी मिट्टी का घड़ा",
                    title_en: "Handcrafted Decorative Clay Pot",
                    description_hi: `यह पारंपरिक तकनीक और प्राकृतिक सामग्री से बनाया गया ${userNote} है।`,
                    description_en: "An authentic handcrafted artisanal piece made with care and traditional skill.",
                    suggested_price: 150,
                    artisan_name: "Radha Devi",
                    artisan_region: "Rajasthan Artisan",
                    category: categoryName,
                    tags: ["Handmade", "Artisan Craft", "Eco-friendly", "ONDC Ready"],
                }
            }

            const finalPayload = {
                ...catalogData,
                imageUrl: finalImageUrl,
            }

            // Navigate to Preview Screen
            if (onCatalogGenerated) {
                onCatalogGenerated(finalPayload)
            } else {
                console.log("Catalog Generated:", finalPayload)
                alert("कैटलॉग बन गया! (App.tsx में onCatalogGenerated कनेक्ट करें)")
            }
        } catch (err: any) {
            console.error("Critical Error:", err)
            alert("त्रुटि: " + (err.message || err))
        } finally {
            setIsLoading(false)
            setLoadingStage("")
        }
    }

    return (
        <div
            className="size-full flex items-center justify-center"
            style={{ background: "#EDE0D4", fontFamily: "'Poppins', sans-serif" }}
        >
            {/* ── Hidden File Inputs ── */}
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                style={{ display: "none" }}
                onChange={handleFileSelected}
            />
            <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                style={{ display: "none" }}
                onChange={handleFileSelected}
            />

            {/* ── Phone Shell ── */}
            <div
                className="relative flex flex-col overflow-hidden"
                style={{
                    width: "min(390px, 100vw)",
                    height: "min(844px, 100vh)",
                    background: "#FFFBF7",
                    borderRadius: "clamp(0px, 2vw, 28px)",
                    boxShadow:
                        "0 32px 80px rgba(61,31,15,0.22), 0 4px 20px rgba(0,0,0,0.1)",
                }}
            >
                {/* ── Status Bar ── */}
                <div
                    className="flex items-center justify-between px-6 pt-3 pb-1 flex-shrink-0"
                    style={{ background: "#6B3A2A" }}
                >
                    <span className="text-xs font-semibold text-white/90" style={{ letterSpacing: "0.04em" }}>
                        9:41
                    </span>
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-end gap-px">
                            {[4, 6, 9, 12].map((h, i) => (
                                <div
                                    key={i}
                                    className="w-1 rounded-sm"
                                    style={{
                                        height: h,
                                        background: `rgba(255,255,255,${0.35 + i * 0.2})`,
                                    }}
                                />
                            ))}
                        </div>
                        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
                            <path d="M7.5 8.5a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" fill="white" />
                            <path d="M3.2 5.8A6 6 0 0111.8 5.8" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                            <path d="M0.8 3.2A9.6 9.6 0 0114.2 3.2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.6" />
                        </svg>
                        <div className="flex items-center gap-0.5">
                            <div className="relative rounded" style={{ width: 22, height: 11, border: "1.5px solid rgba(255,255,255,0.55)" }}>
                                <div className="absolute inset-0.5 rounded-sm" style={{ background: "white", width: "72%" }} />
                            </div>
                            <div className="rounded-r-sm" style={{ width: 3, height: 5, background: "rgba(255,255,255,0.5)" }} />
                        </div>
                    </div>
                </div>

                {/* ── Top App Bar ── */}
                <div
                    className="flex items-center px-4 pb-4 pt-2 gap-3 flex-shrink-0"
                    style={{ background: "#6B3A2A" }}
                >
                    <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: "rgba(255,255,255,0.15)",
                            border: "1px solid rgba(255,255,255,0.2)",
                        }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path d="M12 3C10 5 7 6 5 9c-2 3-1 7 2 9s7 2 9 0c2-2 3-5 2-8-1-3-4-5-6-7z" fill="rgba(255,255,255,0.9)" />
                            <path d="M12 3c2 2 5 4 6 7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "'Noto Serif', serif" }}>
                            KalaSetu
                        </h1>
                        <p className="text-xs text-white/65 -mt-0.5">आपकी अपनी ऑनलाइन दुकान</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="relative w-9 h-9 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.12)" }}
                            onClick={() => setShowNotif(false)}
                        >
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M13.73 21a2 2 0 01-3.46 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            {showNotif && (
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2" style={{ background: "#F97316", borderColor: "#6B3A2A" }} />
                            )}
                        </button>
                        <button
                            className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm"
                            style={{
                                background: "linear-gradient(135deg, #D97706 0%, #92400E 100%)",
                                border: "2px solid rgba(255,255,255,0.35)",
                                color: "white",
                            }}
                        >
                            R
                        </button>
                    </div>
                </div>

                {/* ── Scrollable Content ── */}
                <div
                    className="flex-1 overflow-y-auto px-5 pt-5 space-y-5"
                    style={{ scrollbarWidth: "none", paddingBottom: 110 }}
                >
                    <div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-2" style={{ background: "rgba(107,58,42,0.1)", color: "#6B3A2A" }}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="#6B3A2A"><circle cx="5" cy="5" r="5" /></svg>
                            नया सामान
                        </span>
                        <h2 className="text-2xl font-bold" style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}>
                            नया सामान बेचें
                        </h2>
                        <p className="text-sm mt-0.5" style={{ color: "#9C6644" }}>फोटो और आवाज़ से कैटलॉग बनाएं</p>
                    </div>

                    {/* ── Real Photo Upload Box ── */}
                    <div
                        className="relative rounded-3xl overflow-hidden cursor-pointer"
                        style={{
                            border: previewUrl ? "none" : "2.5px dashed #C4886B",
                            background: previewUrl ? "transparent" : "rgba(196,136,107,0.06)",
                            minHeight: 220,
                        }}
                    >
                        {previewUrl ? (
                            <>
                                <img src={previewUrl} alt="Product" className="w-full object-cover rounded-3xl" style={{ height: 220 }} />
                                <div className="absolute inset-0" style={{ background: "rgba(61,31,15,0.1)" }} />
                                <button
                                    type="button"
                                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                    className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm active:scale-95"
                                    style={{ background: "rgba(255,255,255,0.92)", color: "#6B3A2A" }}
                                >
                                    दोबारा फोटो लें
                                </button>
                                <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(22,163,74,0.9)", color: "white" }}>
                                    फोटो ली ✓
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-4 py-7 px-5">
                                <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: "rgba(196,136,107,0.14)" }}>
                                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#9C6644" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="13" r="4" stroke="#9C6644" strokeWidth="1.8" />
                                    </svg>
                                </div>
                                <p className="text-xs font-medium text-center" style={{ color: "#9C6644" }}>सामान की साफ़ फोटो लें</p>
                                <div className="flex gap-3 w-full">
                                    <button
                                        type="button"
                                        onClick={() => cameraInputRef.current?.click()}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-[0.97]"
                                        style={{ background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)", color: "white" }}
                                    >
                                        कैमरा से लें
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => galleryInputRef.current?.click()}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-[0.97]"
                                        style={{ background: "rgba(196,136,107,0.1)", color: "#6B3A2A", border: "1.5px solid rgba(107,58,42,0.3)" }}
                                    >
                                        गैलरी से चुनें
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Voice & Text Input ── */}
                    <div>
                        <p className="text-base font-bold mb-3" style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}>
                            🎙️ बोलकर जानकारी दें
                        </p>
                        <div className="flex gap-3 items-end">
                            <div className="flex-1 relative rounded-2xl" style={{ background: "#FFF8F3", border: isRecording ? "2px solid #6B3A2A" : "1.5px solid #E0C0A8", minHeight: 118 }}>
                                <textarea
                                    className="w-full resize-none p-4 text-sm outline-none bg-transparent leading-relaxed"
                                    style={{ color: "#3D1F0F", minHeight: 118, fontFamily: "'Noto Serif', serif" }}
                                    placeholder="माइक दबाकर बोलें — 'यह मिट्टी का घड़ा है...'"
                                    value={voiceText}
                                    onChange={(e) => setVoiceText(e.target.value)}
                                />
                                {isRecording && (
                                    <div className="absolute bottom-3 left-4 right-16 flex items-end gap-1 overflow-hidden" style={{ height: 28 }}>
                                        {WAVE_HEIGHTS.map((h, i) => (
                                            <div key={i} className="flex-1 rounded-full animate-bounce" style={{ height: h, background: `rgba(107,58,42,${0.4 + (i % 3) * 0.2})`, animationDelay: `${i * 0.07}s`, animationDuration: "0.55s" }} />
                                        ))}
                                        <span className="absolute right-0 text-xs font-semibold" style={{ color: "#6B3A2A", bottom: 6 }}>सुन रहे हैं…</span>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleMic}
                                className="relative rounded-full flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                                style={{
                                    width: 64,
                                    height: 64,
                                    background: isRecording ? "linear-gradient(135deg, #C4886B 0%, #8B4513 100%)" : "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                                    boxShadow: "0 8px 24px rgba(107,58,42,0.38)",
                                }}
                            >
                                {isRecording ? (
                                    <div className="w-5 h-5 rounded" style={{ background: "white" }} />
                                ) : (
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                        <rect x="9" y="2" width="6" height="11" rx="3" fill="white" />
                                        <path d="M5 11a7 7 0 0014 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                        <line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                        <line x1="9" y1="22" x2="15" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── Category Pills ── */}
                    <div>
                        <p className="text-base font-bold mb-3" style={{ color: "#3D1F0F", fontFamily: "'Noto Serif', serif" }}>
                            सामान किस तरह का है?
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                            {CATEGORIES.map(({ hi, en }, i) => {
                                const active = activeCategory === i
                                return (
                                    <button
                                        key={en}
                                        type="button"
                                        onClick={() => setActiveCategory(i)}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all"
                                        style={{
                                            background: active ? "#6B3A2A" : "rgba(196,136,107,0.09)",
                                            border: active ? "2px solid #6B3A2A" : "1.5px solid rgba(196,136,107,0.4)",
                                        }}
                                    >
                                        <span className="text-sm font-bold" style={{ color: active ? "white" : "#3D1F0F" }}>{hi}</span>
                                        <span className="text-xs" style={{ color: active ? "rgba(255,255,255,0.7)" : "#9C6644" }}>{en}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Sticky Bottom Bar ── */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-4 flex-shrink-0" style={{ background: "linear-gradient(to top, #FFFBF7 80%, transparent)" }}>
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleGenerateCatalog}
                        className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-bold text-base transition-all duration-200 active:scale-[0.97] disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #92400E 0%, #6B3A2A 100%)", color: "white", boxShadow: "0 10px 32px rgba(107,58,42,0.42)" }}
                    >
                        {isLoading ? (
                            <span className="animate-pulse">{loadingStage || "कैटलॉग बन रहा है..."}</span>
                        ) : (
                            <>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" fill="rgba(255,255,255,0.92)" />
                                </svg>
                                <span style={{ fontFamily: "'Noto Serif', serif" }}>★ कैटलॉग तैयार करें</span>
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs mt-2" style={{ color: "#B07050", fontFamily: "'Noto Serif', serif" }}>
                        AI आपका नाम, जानकारी और कीमत बनाएगा
                    </p>
                </div>
            </div>
        </div>
    )
}