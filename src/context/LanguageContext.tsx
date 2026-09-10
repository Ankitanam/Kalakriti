// src/context/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

export type LanguageCode = "hi" | "en" | "mr" | "bn" | "gu" | "ta" | "te";

export interface LanguageMeta {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  speechLang: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: "hi", nativeName: "हिन्दी", englishName: "Hindi", speechLang: "hi-IN" },
  { code: "en", nativeName: "English", englishName: "English", speechLang: "en-IN" },
  { code: "mr", nativeName: "मराठी", englishName: "Marathi", speechLang: "mr-IN" },
  { code: "bn", nativeName: "বাংলা", englishName: "Bengali", speechLang: "bn-IN" },
  { code: "gu", nativeName: "ગુજરાતી", englishName: "Gujarati", speechLang: "gu-IN" },
  { code: "ta", nativeName: "தமிழ்", englishName: "Tamil", speechLang: "ta-IN" },
  { code: "te", nativeName: "తెలుగు", englishName: "Telugu", speechLang: "te-IN" },
];

export const TRANSLATIONS = {
  // ── कॉमन ──
  app_tagline: {
    hi: "आपकी अपनी ऑनलाइन दुकान",
    en: "Your Authentic Online Store",
    mr: "तुमचे स्वतःचे ऑनलाइन दुकान",
    bn: "আপনার নিজস্ব অনলাইন দোকান",
    gu: "તમારી પોતાની ઓનલાઇન દુકાન",
    ta: "உங்கள் சொந்த ஆன்லைன் கடை",
    te: "మీ స్వంత ఆన్‌లైన్ స్టోర్",
  },
  shop: {
    hi: "दुकान",
    en: "Store",
    mr: "दुकान",
    bn: "দোকান",
    gu: "દુકાન",
    ta: "கடை",
    te: "దుకాణం",
  },
  cart: {
    hi: "कार्ट",
    en: "Cart",
    mr: "कार्ट",
    bn: "কার্ট",
    gu: "કાર્ટ",
    ta: "வண்டி",
    te: "కార్ట్",
  },
  logout: {
    hi: "लॉगआउट",
    en: "Logout",
    mr: "लॉगआउट",
    bn: "লগআউট",
    gu: "લૉગ આઉટ",
    ta: "வெளியேறு",
    te: "లాగ్అవుట్",
  },
  lang_switcher: {
    hi: "भाषा",
    en: "Language",
    mr: "भाषा",
    bn: "ভাষা",
    gu: "ભાષા",
    ta: "மொழி",
    te: "భాష",
  },
  select_language: {
    hi: "अपनी भाषा चुनें",
    en: "Choose your language",
    mr: "तुमची भाषा निवडा",
    bn: "আপনার ভাষা নির্বাচন করুন",
    gu: "તમારી ભાષા પસંદ કરો",
    ta: "உங்கள் மொழியைத் தேர்வுசெய்க",
    te: "మీ భాషను ఎంచుకోండి",
  },

  // ── सेलर (कारीगर) पेज ──
  new_product: {
    hi: "नया सामान",
    en: "New Item",
    mr: "नवीन वस्तू",
    bn: "নতুন পণ্য",
    gu: "નવી વસ્તુ",
    ta: "புதிய பொருள்",
    te: "కొత్త వస్తువు",
  },
  sell_new_product: {
    hi: "नया सामान बेचें",
    en: "Sell New Product",
    mr: "नवीन वस्तू विका",
    bn: "নতুন পণ্য বিক্রি করুন",
    gu: "નવો સામાન વેચો",
    ta: "புதிய பொருளை விற்கவும்",
    te: "కొత్త వస్తువును విక్రయించండి",
  },
  take_photo: {
    hi: "सामान की फोटो लें",
    en: "Take Product Photo",
    mr: "वस्तूचा फोटो घ्या",
    bn: "পণ্যের ছবি তুলুন",
    gu: "સામાનનો ફોટો લો",
    ta: "பொருளின் புகைப்படத்தை எடுக்கவும்",
    te: "వస్తువు ఫోటో తీయండి",
  },
  photo_subtitle: {
    hi: "कैमरे से तुरंत फोटो खींचें या गैलरी से अपलोड करें",
    en: "Snap instant photo via camera or upload from gallery",
    mr: "कॅमेऱ्याने त्वरित फोटो काढा किंवा गॅलरीतून अपलोड करा",
    bn: "ক্যামেরা দিয়ে ছবি তুলুন বা গ্যালারি থেকে আপলোড করুন",
    gu: "કેમેરાથી તરત ફોટો પાડો અથવા ગેલેરીમાંથી અપલોડ કરો",
    ta: "கேமராவிலிருந்து உடனடியாக படம் எடுக்கவும் அல்லது கேலரியில் பதிவேற்றவும்",
    te: "కెమెరా ద్వారా ఫోటో తీయండి లేదా గ్యాలరీ నుండి అప్‌లోడ్ చేయండి",
  },
  open_camera: {
    hi: "कैमरा खोलें",
    en: "Open Camera",
    mr: "कॅमेरा उघडा",
    bn: "ক্যামেরা খুলুন",
    gu: "કેમેરો ખોલો",
    ta: "கேமராவைத் திற",
    te: "కెమెరా తెరవండి",
  },
  upload_photo: {
    hi: "फोटो अपलोड",
    en: "Upload Photo",
    mr: "फोटो अपलोड",
    bn: "ছবি আপলোড",
    gu: "ફોટો અપલોડ",
    ta: "புகைப்படம் பதிவேற்று",
    te: "ఫోటో అప్‌లోడ్",
  },
  retake_photo: {
    hi: "दोबारा फोटो लें",
    en: "Retake Photo",
    mr: "पुन्हा फोटो घ्या",
    bn: "আবার ছবি তুলুন",
    gu: "ફરીથી ફોટો લો",
    ta: "மீண்டும் புகைப்படம் எடுக்கவும்",
    te: "మళ్ళీ ఫోటో తీయండి",
  },
  change_gallery: {
    hi: "गैलरी से बदलें",
    en: "Change from Gallery",
    mr: "गॅलरीतून बदला",
    bn: "গ্যালারি থেকে পরিবর্তন করুন",
    gu: "ગેલેરીમાંથી બદલો",
    ta: "கேலரியில் இருந்து மாற்றவும்",
    te: "గ్యాలరీ నుండి మార్చండి",
  },
  voice_input_title: {
    hi: "बोलकर जानकारी दें",
    en: "Speak Product Details",
    mr: "बोलून माहिती द्या",
    bn: "মুখে বলে বিবরণ দিন",
    gu: "બોલીને માહિતી આપો",
    ta: "பேசி விவரங்களை வழங்கவும்",
    te: "మాట్లాడి వివరాలు తెలపండి",
  },
  voice_placeholder: {
    hi: "माइक दबाकर बोलें — 'यह मधुबनी पेंटिंग है...'",
    en: "Tap mic & speak — 'This is a Madhubani painting...'",
    mr: "माईक दाबून बोला — 'हे मातीचे भांडे आहे...'",
    bn: "মাইক চেপে বলুন — 'এটি মাটির পাত্র...'",
    gu: "માઇક દબાવીને બોલો — 'આ માટીનું વાસણ છે...'",
    ta: "மைக்கை அழுத்தி பேசவும்...",
    te: "మైక్ నొక్కి మాట్లాడండి...",
  },
  craft_category_title: {
    hi: "सामान किस तरह का है?",
    en: "What type of craft is it?",
    mr: "वस्तू कोणत्या प्रकारची आहे?",
    bn: "পণ্যটি কোন ধরনের?",
    gu: "સામાન કયા પ્રકારનો છે?",
    ta: "பொருள் எந்த வகையானது?",
    te: "వస్తువు ఏ రకమైనది?",
  },
  add_product_to_shop: {
    hi: "दुकान में सामान जोड़ें",
    en: "Add Product to Store",
    mr: "दुकानात वस्तू जोडा",
    bn: "দোকানে পণ্য যোগ করুন",
    gu: "દુકાનમાં સામાન ઉમેરો",
    ta: "கடையில் பொருளைச் சேர்க்கவும்",
    te: "దుకాణంలో వస్తువును చేర్చండి",
  },
  ai_helper_text: {
    hi: "✨ AI फोटो देखकर सही दाम और विवरण खुद लिख देगा",
    en: "✨ AI inspects your craft to suggest fair price & description",
    mr: "✨ AI फोटो पाहून योग्य किंमत व वर्णन स्वतः लिहील",
    bn: "✨ AI ছবি দেখে সঠিক দাম ও বিবরণ লিখে দেবে",
    gu: "✨ AI ફોટો જોઈને સાચો ભાવ અને વિગત જાતે લખશે",
    ta: "✨ AI புகைப்படத்தைப் பார்த்து சரியான விலை மற்றும் விவரங்களை எழுதும்",
    te: "✨ AI ఫోటోను చూసి సరైన ధర మరియు వివరణను వ్రాస్తుంది",
  },

  // ── बायर (खरीदार) पेज ──
  direct_from_artisans: {
    hi: "सीधे ग्रामीण कारीगरों से",
    en: "Direct from Rural Artisans",
    mr: "थेट ग्रामीण कारागिरांकडून",
    bn: "সরাসরি গ্রামীণ কারিগরদের থেকে",
    gu: "સીધા ગ્રામીણ કારીગરો પાસેથી",
    ta: "நேரடியாக கிராமப்புற கைவினைஞர்களிடமிருந்து",
    te: "నేరుగా గ్రామీణ కళాకారుల నుండి",
  },
  available: {
    hi: "उपलब्ध",
    en: "available",
    mr: "उपलब्ध",
    bn: "উপলব্ধ",
    gu: "ઉપલબ્ધ",
    ta: "கிடைக்கக்கூடியவை",
    te: "అందుబాటులో ఉన్నాయి",
  },
  search_placeholder: {
    hi: "हस्तशिल्प, पेंटिंग, मिट्टी, wood खोजें...",
    en: "Search crafts, paintings, pottery, wood...",
    mr: "हस्तकला, पेंटिंग, मातीची भांडी शोधा...",
    bn: "হস্তশিল্প, পেইন্টিং, মাটির কাজ খুঁজুন...",
    gu: "હસ્તકલા, પેઇન્ટિંગ, માટીની વસ્તુઓ શોધો...",
    ta: "கைவினைப் பொருட்கள், ஓவியங்களை தேடுங்கள்...",
    te: "చేతిపనులు, పెయింటింగ్స్ శోధించండి...",
  },
  add_to_cart: {
    hi: "कार्ट में जोड़ें",
    en: "Add to Cart",
    mr: "कार्टमध्ये जोडा",
    bn: "কার্টে যোগ করুন",
    gu: "કાર્ટમાં ઉમેરો",
    ta: "வண்டியில் சேர்க்கவும்",
    te: "కార్ట్‌కు జోడించండి",
  },
  out_of_stock: {
    hi: "स्टॉक समाप्त",
    en: "Out of Stock",
    mr: "स्टॉक संपला",
    bn: "স্টক শেষ",
    gu: "સ્ટોક ખાલી",
    ta: "கையிருப்பு இல்லை",
    te: "స్టాక్ ముగిసింది",
  },
  stock_count: {
    hi: "स्टॉक",
    en: "Stock",
    mr: "स्टॉक",
    bn: "স্টক",
    gu: "સ્ટોક",
    ta: "இருப்பு",
    te: "స్టాక్",
  },
  savings_badge: {
    hi: "40% बचत",
    en: "40% Savings",
    mr: "40% बचत",
    bn: "40% সাশ্রয়",
    gu: "40% બચત",
    ta: "40% சேமிப்பு",
    te: "40% ఆదా",
  },
  direct_artisan_benefit: {
    hi: "कारीगर को सीधा लाभ",
    en: "Direct Artisan Benefit",
    mr: "कारागिराला थेट फायदा",
    bn: "কারিগরদের সরাসরি লাভ",
    gu: "કારીગરને સીધો ફાયદો",
    ta: "கைவினைஞருக்கு நேரடி பயன்",
    te: "కళాకారునికి ప్రత్యక్ష ప్రయోజనం",
  },
  empty_cart_title: {
    hi: "आपकी कार्ट खाली है",
    en: "Your Cart is Empty",
    mr: "तुमची कार्ट रिकामी आहे",
    bn: "আপনার কার্ট খালি",
    gu: "તમારી કાર્ટ ખાલી છે",
    ta: "உங்கள் வண்டி காலியாக உள்ளது",
    te: "మీ కార్ట్ ఖాళీగా ఉంది",
  },
  empty_cart_desc: {
    hi: "कृपया कारीगरों द्वारा बनाए गए प्रामाणिक हस्तशिल्प देखें और अपनी कार्ट में जोड़ें।",
    en: "Explore authentic heritage handicrafts made by rural craftspeople.",
    mr: "कृपया कारागिरांनी तयार केलेल्या अस्सल वस्तू पाहून कार्टमध्ये जोडा.",
    bn: "কারিগরদের তৈরি খাঁটি হস্তশিল্প দেখুন এবং কার্টে যোগ করুন।",
    gu: "કૃપા કરીને કારીગરો દ્વારા બનાવેલ હસ્તકલા સામાન કાર્ટમાં ઉમેરો.",
    ta: "கிராமப்புற கைவினைஞர்கள் தயாரித்த பொருட்களை வண்டியில் சேர்க்கவும்.",
    te: "దయచేసి కళాకారులు తయారుచేసిన వస్తువులను కార్ట్‌లో చేర్చండి.",
  },
  start_shopping: {
    hi: "खरीदारी शुरू करें",
    en: "Start Shopping",
    mr: "खरेदी सुरू करा",
    bn: "কেনাকাটা শুরু করুন",
    gu: "ખરીદી શરૂ કરો",
    ta: "ஷாப்பிங் தொடங்கு",
    te: "షాపింగ్ ప్రారంభించండి",
  },
  proceed_delivery: {
    hi: "डिलीवरी पता चुनें और आगे बढ़ें ➔",
    en: "Select Delivery Address & Proceed ➔",
    mr: "डिलिव्हरी पत्ता निवडा आणि पुढे जा ➔",
    bn: "ডেলিভারি ঠিকানা বেছে নিয়ে এগিয়ে যান ➔",
    gu: "ડિલિવરી સરનામું પસંદ કરી આગળ વધો ➔",
    ta: "டெலிவரி முகவரியைத் தேர்ந்தெடுத்து தொடரவும் ➔",
    te: "డెలివరీ చిరునామా ఎంచుకుని కొనసాగండి ➔",
  },
  pay_order_upi: {
    hi: "UPI से पेमेंट करें और आर्डर दें",
    en: "Pay via UPI & Confirm Order",
    mr: "UPI द्वारे पैसे द्या आणि ऑर्डर करा",
    bn: "UPI মাধ্যমে পেমেন্ট করুন ও অর্ডার দিন",
    gu: "UPI થી પેમેન્ટ કરો અને ઓર્ડર આપો",
    ta: "UPI மூலம் பணம் செலுத்தி ஆர்டர் செய்க",
    te: "UPI ద్వారా చెల్లించి ఆర్డర్ చేయండి",
  },
  total_payable: {
    hi: "कुल देय राशि",
    en: "Total Amount",
    mr: "एकूण देय रक्कम",
    bn: "মোট প্রদেয় অর্থ",
    gu: "કુલ ચૂકવવાપાત્ર રકમ",
    ta: "மொத்த தொகை",
    te: "మొత్తం చెల్లించవలసిన మొత్తం",
  },

  // ── क्राफ्ट श्रेणियां ──
  cat_painting: { hi: "चित्रकारी", en: "Painting", mr: "चित्रकला", bn: "চিত্রকর্ম", gu: "ચિત્રકામ", ta: "ஓவியம்", te: "చిత్రకళ" },
  cat_pottery: { hi: "मिट्टी", en: "Pottery", mr: "मातीकाम", bn: "মৃৎশিল্প", gu: "માટીકામ", ta: "மட்பாண்டம்", te: "కుండలు" },
  cat_weaving: { hi: "बुनाई", en: "Weaving", mr: "विणकाम", bn: "বয়নশিল্প", gu: "વણાટકામ", ta: "நெசவு", te: "నేతపని" },
  cat_wood: { hi: "लकड़ी", en: "Wood", mr: "लाकूडकाम", bn: "দারুশিল্প", gu: "લાકડાકામ", ta: "மரவேலை", te: "చెక్కపని" },
  cat_embroidery: { hi: "कढ़ाई", en: "Embroidery", mr: "भरतकाम", bn: "সূচিকর্ম", gu: "ભરતકામ", ta: "பூவேலை", te: "ఎంబ్రాయిడరీ" },
};

export type TranslationKey = keyof typeof TRANSLATIONS;

interface LanguageContextType {
  currentLang: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: TranslationKey) => string;
  speechLang: string;
  languages: LanguageMeta[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem("kalakriti_language") as LanguageCode;
      return saved || "hi"; // By default Hindi for rural artisans
    } catch {
      return "hi";
    }
  });

  const setLanguage = (code: LanguageCode) => {
    setCurrentLang(code);
    try {
      localStorage.setItem("kalakriti_language", code);
    } catch (e) {
      console.warn("Language save failed:", e);
    }
  };

  const currentMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const t = (key: TranslationKey): string => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[currentLang] || entry["hi"] || entry["en"] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        setLanguage,
        t,
        speechLang: currentMeta.speechLang,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};