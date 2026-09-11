// src/utils/artisanAiService.ts
import { StoreItem } from "../App";
import { CatalogData } from "../CatalogPreview";

export interface OrderItem {
  orderId: string;
  productId?: string;
  productTitle: string;
  buyerCity: string;
  buyerPlatform: "PhonePe Pincode" | "Paytm ONDC" | "Magicpin";
  amount: number;
  courier: string;
  status?: "Pending" | "Packed" | "Shipped" | "Delivered" | "Cancelled" | string;
  orderDate: string;
}

export interface LocalizedProductContent {
  title: string;
  quick_summary: string;
  story: string;
  highlights: string[];
  specs: Array<{ label: string; value: string }>;
  artisan_name?: string;
  artisan_region?: string;
}

export type LocalizedContentMap = Partial<Record<string, LocalizedProductContent>>;

// ── Multi-Indic Rich Content for Seed & Standard Indian Crafts ──
export const KNOWN_CRAFT_LOCALIZATIONS: Record<string, Record<string, LocalizedProductContent>> = {
  puppet: {
    hi: {
      title: "राजस्थानी पारंपरिक कठपुतली जोड़ा",
      quick_summary: "कपड़े और लकड़ी से हस्तनिर्मित पारंपरिक राजस्थानी कठपुतली।",
      story: "यह शिल्प राजस्थान की प्राचीन लोक कला और कठपुतली परंपरा की समृद्ध विरासत को दर्शाता है। इसे कुशल ग्रामीण कारीगरों द्वारा हस्तनिर्मित वस्त्रों, गोटा-पट्टी और प्राकृतिक लकड़ी से तैयार किया जाता है।",
      highlights: [
        "100% पारंपरिक काठ एवं वस्त्र शिल्प",
        "राजस्थानी पुश्तैनी कठपुतली कलाकारों द्वारा निर्मित",
        "गृह सज्जा, सांस्कृतिक उपहार एवं उत्सवों हेतु उपयुक्त",
      ],
      specs: [
        { label: "कला शैली", value: "राजस्थानी कठपुतली शिल्प" },
        { label: "सामग्री", value: "लकड़ी, गोटा-पट्टी व कपड़ा" },
        { label: "आकार", value: "ऊंचाई लगभग 12 इंच" },
        { label: "उपयोग", value: "गृह सज्जा, सांस्कृतिक उपहार" },
      ],
      artisan_name: "शंकर लाल भाट",
      artisan_region: "जयपुर, राजस्थान",
    },
    en: {
      title: "Rajasthani Traditional Handmade Puppets Pair",
      quick_summary: "Authentic handcrafted traditional Rajasthani decorative puppet pair.",
      story: "This craft celebrates centuries of Rajasthani folk heritage and generational puppet theatre artistry. Carefully crafted with wooden heads, vibrant traditional fabrics, and intricate lace detailing.",
      highlights: [
        "100% Handcrafted from seasoned wood and festive textiles",
        "Crafted by generational folk puppeteer artisans of Rajasthan",
        "Ideal for aesthetic home decor & cultural gifting",
      ],
      specs: [
        { label: "Craft Type", value: "Rajasthani Puppet Craft" },
        { label: "Material", value: "Wood, Traditional Fabrics & Lace" },
        { label: "Size", value: "Height approx. 12 inches" },
        { label: "Best For", value: "Home Aesthetics, Cultural Gifting" },
      ],
      artisan_name: "Shankar Lal Bhat",
      artisan_region: "Jaipur, Rajasthan",
    },
    mr: {
      title: "राजस्थानी पारंपरिक हस्तनिर्मित बाहुल्यांची जोडी (कठपुतळी)",
      quick_summary: "कापड आणि लाकडापासून बनवलेली अस्सल पारंपरिक राजस्थानी कठपुतळी बाहुली.",
      story: "ही हस्तकला राजस्थानच्या प्राचीन लोककलेचा आणि पिढ्यानपिढ्या चालत आलेल्या कठपुतळी परंपरेचा समृद्ध वारसा दर्शवते. लाकडी कोरीव काम आणि नक्षीदार राजस्थानी कापडापासून ती सुंदररित्या तयार केली आहे.",
      highlights: [
        "१००% अस्सल लाकूड आणि पारंपरिक कापडी हस्तकला",
        "राजस्थानच्या पारंपरिक कारागिरांकडून थेट निर्मित",
        "घर सजावट आणि सांस्कृतिक भेटवस्तूसाठी उत्कृष्ट",
      ],
      specs: [
        { label: "कला प्रकार", value: "राजस्थानी कठपुतळी शिल्प" },
        { label: "साहित्य", value: "लाकूड, गोटा-पट्टी व अस्सल कापड" },
        { label: "आकार", value: "उंची साधारण १२ इंच" },
        { label: "वापर", value: "घर सजावट, सांस्कृतिक भेट" },
      ],
      artisan_name: "शंकर लाल भाट",
      artisan_region: "जयपूर, राजस्थान",
    },
    bn: {
      title: "রাজস্থানি ঐতিহ্যবাহী হস্তনির্মিত পুতুল জোড়া (কাঠপুতলি)",
      quick_summary: "কাঠ ও উজ্জ্বল ঐতিহ্যবাহী কাপড়ে তৈরি হস্তনির্মিত রাজস্থানি লোকশিল্প পুতুল।",
      story: "এই হস্তশিল্পটি রাজস্থানের শতাব্দী প্রাচীন লোকসংস্কৃতি এবং ঐতিহ্যবাহী পুতুলনাচের সমৃদ্ধ ধারাকে তুলে ধরে। গ্রামীণ শিল্পীরা নিখুঁত কাঠের খোদাই ও রঙিন কাপড়ের জরির কাজের মাধ্যমে প্রতিটি পুতুল তৈরি করেন।",
      highlights: [
        "১০০% হস্তনির্মিত কাঠ ও বস্ত্র লোকশিল্প",
        "রাজস্থানের বংশানুক্রমিক লোকশিল্পীদের দ্বারা নির্মিত",
        "গৃহসজ্জা ও সাংস্কৃতিক উপহারের জন্য উপযুক্ত",
      ],
      specs: [
        { label: "শিল্পশৈলী", value: "রাজস্থানি কাঠপুতলি শিল্প" },
        { label: "উপকরণ", value: "কাঠ, ঐতিহ্যবাহী কাপড় ও জরি" },
        { label: "আকার", value: "উচ্চতা প্রায় ১২ ইঞ্চি" },
        { label: "ব্যবহার", value: "গৃহসজ্জা, সাংস্কৃতিক উপহার" },
      ],
      artisan_name: "শঙ্কর লাল ভাট",
      artisan_region: "জয়পুর, রাজস্থান",
    },
    gu: {
      title: "રાજસ્થાની પરંપરાગત હસ્તનિર્મિત કઠપૂતળી જોડી",
      quick_summary: "કાપડ અને લાકડામાંથી બનેલી અસલ રાજસ્થાની કઠપૂતળી જોડી.",
      story: "આ હસ્તકલા રાજસ્થાનના પ્રાચીન લોકવારસા અને કઠપૂતળી પરંપરાનું સુંદર પ્રતીક છે. કુશળ ગ્રામીણ કારીગરો દ્વારા લાકડું, ગોટા-પટ્ટી અને રંગબેરંગી કાપડથી આ કલાત્મક જોડી તૈયાર કરવામાં આવી છે.",
      highlights: [
        "૧૦૦% પરંપરાગત લાકડા અને કાપડની હસ્તકલા",
        "રાજસ્થાનના પેઢી દર પેઢીના કારીગરો દ્વારા નિર્મિત",
        "ઘર સજાવટ અને સાંસ્કૃતિક ભેટ માટે ઉત્તમ",
      ],
      specs: [
        { label: "કલા પ્રકાર", value: "રાજસ્થાની કઠપૂતળી શિલ્પ" },
        { label: "સામગ્રી", value: "લાકડું, ગોટા-પટ્ટી અને કાપડ" },
        { label: "કદ", value: "ઊંચાઈ આશરે ૧૨ ઇંચ" },
        { label: "ઉપયોગ", value: "ઘર સજાવટ, સાંસ્કૃતિક ભેટ" },
      ],
      artisan_name: "શંકર લાલ ભાટ",
      artisan_region: "જયપુર, રાજસ્થાન",
    },
    ta: {
      title: "பாரம்பரிய ராஜஸ்தானி கைவினை பொம்மைகள் ஜோடி",
      quick_summary: "மரக்கட்டை மற்றும் துணியால் கைவினையாக செய்யப்பட்ட பாரம்பரிய ராஜஸ்தானி பொம்மைகள்.",
      story: "இந்த கைவினைப்பொருள் ராஜஸ்தானின் பழங்கால நாட்டுப்புற கலை மற்றும் பொம்மலாட்ட பாரம்பரியத்தின் பெருமையை வெளிப்படுத்துகிறது. பாரம்பரிய மரவேலைப்பாடுகள் மற்றும் வண்ணமயமான ஆடைகளால் நேர்த்தியாக உருவாக்கப்பட்டுள்ளது.",
      highlights: [
        "100% கைவினை மர மற்றும் துணி கலைப்படைப்பு",
        "ராஜஸ்தானின் தலைமுறை கைவினைஞர்களால் உருவாக்கப்பட்டது",
        "வீட்டு அலங்காரம் மற்றும் கலாச்சார பரிசுகளுக்கு ஏற்றது",
      ],
      specs: [
        { label: "கைவினை வடிவம்", value: "ராஜஸ்தானி பொம்மலாட்ட கலை" },
        { label: "பொருள்", value: "மரம், பாரம்பரிய துணி & சரிகை" },
        { label: "அளவு", value: "உயரம் சுமார் 12 அங்குலம்" },
        { label: "பயன்பாடு", value: "வீட்டு அலங்காரம், கலாச்சார பரிசு" },
      ],
      artisan_name: "சங்கர் லால் பாட்",
      artisan_region: "ஜெய்ப்பூர், ராஜஸ்தான்",
    },
    te: {
      title: "సంప్రదాయ చేతితో చేసిన రాజస్థానీ తోలుబొమ్మల జత",
      quick_summary: "వస్త్రాలు మరియు చెక్కతో అందంగా తయారుచేసిన రాజస్థానీ సంప్రదాయ బొమ్మలు.",
      story: "ఈ హస్తకళ రాజస్థాన్ యొక్క ప్రాచీన జానపద కళ మరియు బొమ్మలాట సంప్రదాయ వారసత్వాన్ని ప్రతిబింబిస్తుంది. సహజమైన చెక్క మరియు సంప్రదాయ వస్త్రాల అలంకరణతో రూపొందించబడింది.",
      highlights: [
        "100% సంప్రదాయ చెక్క మరియు వస్త్ర హస్తకళ",
        "రాజస్థాన్ తరతరాల కళాకారులచే ప్రత్యక్షంగా రూపొందించబడింది",
        "గృహాలంకరణ మరియు సాంస్కృతిక బహుమతులకు అనుకూలం",
      ],
      specs: [
        { label: "చేతిపని శైలి", value: "రాజస్థానీ తోలుబొమ్మల కళ" },
        { label: "పదార్థం", value: "చెక్క, సంప్రదాయ వస్త్రాలు, జరీ" },
        { label: "పరిమాణం", value: "ఎత్తు సుమారు 12 అంగుళాలు" },
        { label: "ఉపయోగం", value: "ఇంటి అలంకరణ, సాంస్కృతిక బహుమతి" },
      ],
      artisan_name: "శంకర్ లాల్ భాట్",
      artisan_region: "జైపూర్, రాజస్థాన్",
    },
  },

  kalash: {
    hi: {
      title: "सजावटी हस्तनिर्मित लाल मिट्टी का कलश",
      quick_summary: "पारंपरिक लाल मिट्टी से बना सुंदर सजावटी कलश।",
      story: "शुद्ध प्राकृतिक मिट्टी से कुम्हार के चाक पर गढ़ा गया यह कलश भारतीय परंपरा और पवित्रता का प्रतीक है। पर्यावरण-अनुकूल पकी हुई मिट्टी से बना यह कलश घर में सकारात्मक ऊर्जा का संचार करता है।",
      highlights: [
        "100% शुद्ध प्राकृतिक लाल मिट्टी से निर्मित",
        "कुम्हार के पारंपरिक चाक पर हस्तनिर्मित",
        "पूजा, उत्सव और घर की सजावट हेतु आदर्श",
      ],
      specs: [
        { label: "कला शैली", value: "पारंपरिक टेराकोटा" },
        { label: "सामग्री", value: "100% शुद्ध लाल मिट्टी" },
        { label: "आकार", value: "मध्यम (ऊंचाई ~7 इंच)" },
        { label: "उपयोग", value: "गृह सज्जा, पूजा, त्यौहार" },
      ],
      artisan_name: "रमेश प्रजापति",
      artisan_region: "अलवर, राजस्थान",
    },
    en: {
      title: "Decorative Handcrafted Red Terracotta Kalash",
      quick_summary: "Traditional red clay pot with intricate artisanal embellishments.",
      story: "Masterfully shaped from pure earthen clay on the traditional potter's wheel, embodying sustainable living, timeless purity, and positive Indian festive energy.",
      highlights: [
        "100% Natural terracotta earthen clay",
        "Wheel-thrown by master generational potters",
        "Perfect for festive decor, rituals & mindful gifting",
      ],
      specs: [
        { label: "Craft Type", value: "Terracotta Pottery" },
        { label: "Material", value: "Pure Red Clay" },
        { label: "Size", value: "Medium (~7 inches)" },
        { label: "Best For", value: "Festive Decor, Gifting" },
      ],
      artisan_name: "Ramesh Prajapati",
      artisan_region: "Alwar, Rajasthan",
    },
    mr: {
      title: "सजावटी हस्तनिर्मित लाल मातीचा कलश (घडा)",
      quick_summary: "पारंपरिक लाल मातीपासून तयार केलेला सुंदर आणि नक्षीदार कलश.",
      story: "शुद्ध नैसर्गिक मातीपासून कुंभाराच्या चाकावर घडवलेला हा कलश भारतीय संस्कृती आणि मांगल्याचे प्रतीक आहे. पर्यावरणपूरक भाजलेल्या मातीपासून बनवलेला हा कलश घरात सकारात्मक ऊर्जा आणतो.",
      highlights: [
        "१००% शुद्ध नैसर्गिक लाल मातीपासून तयार",
        "कुंभाराच्या पारंपारिक चाकावर हाताने घडवलेला",
        "पूजा, सण आणि घर सजावटीसाठी अतिशय योग्य",
      ],
      specs: [
        { label: "कला प्रकार", value: "पारंपरिक टेराकोटा मातीकाम" },
        { label: "साहित्य", value: "१००% शुद्ध लाल माती" },
        { label: "आकार", value: "मध्यम (उंची ~७ इंच)" },
        { label: "वापर", value: "घर सजावट, पूजा व सण" },
      ],
      artisan_name: "रमेश प्रजापती",
      artisan_region: "अलवर, राजस्थान",
    },
    bn: {
      title: "আলংকারিক হস্তনির্মিত লাল পোড়ামাটির কলস (টেরাকোটা)",
      quick_summary: "খাঁটি লাল মাটি দিয়ে চাকার সাহায্যে হস্তনির্মিত সুন্দর আলংকারিক কলস।",
      story: "প্রকৃতির খাঁটি মাটি থেকে ঐতিহ্যবাহী কুমোরের চাকায় গড়া এই টেরাকোটা কলস ভারতীয় সংস্কৃতি ও পবিত্রতার প্রতীক। পরিবেশবান্ধব ও টেকসই উপাদানে তৈরি এই শিল্পকর্ম ঘরে শান্তি ও নান্দনিকতা এনে দেয়।",
      highlights: [
        "১০০% খাঁটি প্রাকৃতিক লাল পোড়ামাটির তৈরি",
        "ঐতিহ্যবাহী কুমোরের চাকায় হস্তনির্মিত শিল্প",
        "পূজা, উৎসব ও ঘর সাজানোর জন্য অত্যন্ত উপযোগী",
      ],
      specs: [
        { label: "শিল্পশৈলী", value: "ঐতিহ্যবাহী টেরাকোটা মৃত্শিল্প" },
        { label: "উপকরণ", value: "১০০% খাঁটি লাল মাটি" },
        { label: "আকার", value: "মাঝারি (উচ্চতা ~৭ ইঞ্চি)" },
        { label: "ব্যবহার", value: "গৃহসজ্জা, পূজা ও উৎসব" },
      ],
      artisan_name: "রমেশ প্রজাপতি",
      artisan_region: "আলওয়ার, রাজস্থান",
    },
    gu: {
      title: "સુશોભન હસ્તનિર્મિત લાલ માટીનો કળશ",
      quick_summary: "પરંપરાગત લાલ માટીમાંથી બનેલો સુંદર સુશોભિત કળશ.",
      story: "શુદ્ધ કુદરતી માટીમાંથી કુંભારના ચાક પર બનેલો આ કળશ ભારતીય સંસ્કૃતિ અને પવિત્રતાનું પ્રતીક છે. પર્યાવરણ-અનુકૂળ પકવેલી માટીથી બનેલો આ કળશ ઘરમાં મંગળમય ઊર્જા લાવે છે.",
      highlights: [
        "૧૦૦% શુદ્ધ કુદરતી લાલ માટીમાંથી નિર્મિત",
        "કુંભારના પરંપરાગત ચાકડા પર હસ્તનિર્મિત",
        "પૂજા, તહેવાર અને ઘરની સજાવટ માટે ઉત્તમ",
      ],
      specs: [
        { label: "કલા પ્રકાર", value: "પરંપરાગત ટેરાકોટા માટીકામ" },
        { label: "સામગ્રી", value: "૧૦૦% શુદ્ધ લાલ માટી" },
        { label: "કદ", value: "મધ્યમ (ઊંચાઈ ~૭ ઇંચ)" },
        { label: "ઉપયોગ", value: "ઘર સજાવટ, પૂજા અને તહેવાર" },
      ],
      artisan_name: "રમેશ પ્રજાપતિ",
      artisan_region: "અલવર, રાજસ્થાન",
    },
    ta: {
      title: "அலங்கார கைவினை சிவப்பு சுடுமண் கலசம்",
      quick_summary: "பாரம்பரிய சிவப்பு களிமண்ணால் செய்யப்பட்ட அழகான அலங்கார கலசம்.",
      story: "இயற்கையான களிமண்ணைக் கொண்டு குயவரின் சக்கரத்தில் கைவினையாக வடிவமைக்கப்பட்ட இந்த சுடுமண் கலசம் இந்திய பாரம்பரியத்தின் புனிதம் மற்றும் அமைதியை பிரதிபலிக்கிறது.",
      highlights: [
        "100% இயற்கை சிவப்பு சுடுமண்ணால் உருவாக்கப்பட்டது",
        "பாரம்பரிய மண்பாண்ட சக்கரத்தில் கைவினையாக செய்யப்பட்டது",
        "பூஜை, பண்டிகைகள் மற்றும் வீட்டு அலங்காரத்திற்கு மிக சிறந்தது",
      ],
      specs: [
        { label: "கைவினை வடிவம்", value: "பாரம்பரிய சுடுமண் மண்பாண்டம்" },
        { label: "பொருள்", value: "100% இயற்கை சிவப்பு களிமண்" },
        { label: "அளவு", value: "நடுத்தர அளவு (~7 அங்குலம்)" },
        { label: "பயன்பாடு", value: "வீட்டு அலங்காரம், பூஜை" },
      ],
      artisan_name: "ரமேஷ் பிரஜாபதி",
      artisan_region: "அல்வார், ராஜஸ்தான்",
    },
    te: {
      title: "అలంకార చేతితో చేసిన ఎర్ర మట్టి కలశం",
      quick_summary: "సంప్రదాయ ఎర్ర మట్టితో కుమ్మరి చక్రంపై అందంగా రూపొందించిన కలశం.",
      story: "స్వచ్ఛమైన సహజమైన మట్టితో కుమ్మరి చక్రంపై రూపుదిద్దుకున్న ఈ టెర్రకోట కలశం భారతీయ సంస్కృతి మరియు పవిత్రతకు ప్రతీక. పర్యావరణ అనుకూలమైన కాల్చిన మట్టితో తయారైంది.",
      highlights: [
        "100% స్వచ్ఛమైన సహజ ఎర్ర మట్టితో తయారీ",
        "కుమ్మరి సంప్రదాయ చక్రంపై చేతితో చేయబడింది",
        "పూజ, పండుగలు మరియు గృహాలంకరణకు శ్రేష్ఠమైనది",
      ],
      specs: [
        { label: "చేతిపని శైలి", value: "సంప్రదాయ టెర్రకోట మట్టిపని" },
        { label: "పదార్థం", value: "100% స్వచ్ఛమైన ఎర్ర మట్టి" },
        { label: "పరిమాణం", value: "మధ్యస్థం (ఎత్తు ~7 అంగుళాలు)" },
        { label: "ఉపయోగం", value: "ఇంటి అలంకరణ, పూజ, పండుగలు" },
      ],
      artisan_name: "రమేష్ ప్రజాపతి",
      artisan_region: "అల్వార్, రాజస్థాన్",
    },
  },

  mojari: {
    hi: {
      title: "पारंपरिक हस्तनिर्मित कशीदाकारी मखमली मोजड़ी",
      quick_summary: "फूल-नक्काशी और ज़री की बारीक कढ़ाई से सजी मखमली जूतियां।",
      story: "शाही राजपूताना विरासत से प्रेरित यह मोजड़ी कुशल चर्मकारों और कढ़ाई कारीगरों द्वारा शुद्ध मखमल और सुनहरे धागों से हस्तनिर्मित की जाती है।",
      highlights: [
        "100% हस्तनिर्मित ज़री और रेशम कढ़ाई",
        "आरामदायक मुलायम इनर सोल व टिकाऊ बनावट",
        "पारंपरिक विवाह, उत्सव व उत्सव पोशाक हेतु उत्तम",
      ],
      specs: [
        { label: "कला शैली", value: "राजस्थानी मोजड़ी शिल्प" },
        { label: "सामग्री", value: "मखमल, ज़री धागा व शुद्ध चमड़ा" },
        { label: "आकार", value: "मानक भारतीय फुटवियर माप" },
        { label: "उपयोग", value: "विवाह, उत्सव, सांस्कृतिक समारोह" },
      ],
      artisan_name: "माधुरी देवी",
      artisan_region: "जोधपुर, राजस्थान",
    },
    en: {
      title: "Handcrafted Artisanal Floral Velvet Mojari Shoes",
      quick_summary: "Exquisitely hand-embroidered velvet jutti with traditional zari floral motifs.",
      story: "Inspired by royal Rajputana heritage, each mojari is meticulously stitched by master footwear artisans using plush velvet, golden zari thread, and soft inner padding.",
      highlights: [
        "100% Handcrafted zari and resham thread embroidery",
        "Ergonomic soft padded sole for all-day comfort",
        "Perfect pairing for festive ethnic and wedding ensembles",
      ],
      specs: [
        { label: "Craft Type", value: "Mojari Leathercraft" },
        { label: "Material", value: "Velvet, Zari Thread & Leather" },
        { label: "Size", value: "Standard Indian Fit" },
        { label: "Best For", value: "Weddings, Cultural Celebrations" },
      ],
      artisan_name: "Madhuri Devi",
      artisan_region: "Jodhpur, Rajasthan",
    },
    mr: {
      title: "पारंपरिक हस्तनिर्मित नक्षीकाम आणि जरदोजी मखमली मोजड्या",
      quick_summary: "फुलांची सुरेख नक्षी आणि जरीचे बारीक भरतकाम केलेल्या मखमली मोजड्या.",
      story: "राजेशाही वारशाने प्रेरित या मोजड्या कुशल कारागिरांनी मखमली कापड आणि सुवर्ण जरीच्या धाग्यांनी हाताने विणल्या आहेत. सण आणि समारंभात या पायांची शोभा वाढवतात.",
      highlights: [
        "१००% हाताने केलेले जरदोजी भरतकाम",
        "मऊ आणि आरामदायी तळ आणि टिकाऊ बनावट",
        "सण-समारंभ आणि पारंपरिक पोशाखासाठी आदर्श",
      ],
      specs: [
        { label: "कला प्रकार", value: "पारंपरिक मोजडी शिल्प" },
        { label: "साहित्य", value: "मखमल, जरी धागा व अस्सल चामडे" },
        { label: "आकार", value: "प्रमाणित भारतीय माप" },
        { label: "वापर", value: "लग्नसमारंभ, सण आणि उत्सव" },
      ],
      artisan_name: "माधुरी देवी",
      artisan_region: "जोधपूर, राजस्थान",
    },
    bn: {
      title: "ঐতিহ্যবাহী হস্তনির্মিত জরির কাজ করা মখমল মোজারি জুতো",
      quick_summary: "ফুলের নকশা ও সূক্ষ্ম জরির এমব্রয়ডারি করা মখমলি জুতো।",
      story: "রাজকীয় ঐতিহ্যে অনুপ্রাণিত এই মোজারিগুলি দক্ষ কারিগরদের দ্বারা কোমল মখমল ও সোনালী জরির সুতো দিয়ে অত্যন্ত যত্নে তৈরি। এটি পরতে আরামদায়ক এবং দেখতে অত্যন্ত আভিজাত্যপূর্ণ।",
      highlights: [
        "১০০% হস্তনির্মিত জরি ও রেশম এমব্রয়ডারি",
        "কোমল আরামদায়ক ইনসোল ও দীর্ঘস্থায়ী স্থায়িত্ব",
        "বিয়ে, উৎসব ও ঐতিহ্যবাহী অনুষ্ঠানের জন্য আদর্শ",
      ],
      specs: [
        { label: "শিল্পশৈলী", value: "রাজস্থানি মোজারি শিল্প" },
        { label: "উপকরণ", value: "মখমল, জরির সুতো ও চামড়া" },
        { label: "আকার", value: "মানসম্মত মাপ" },
        { label: "ব্যবহার", value: "বিবাহ, উৎসব ও অনুষ্ঠান" },
      ],
      artisan_name: "মাধুরী দেবী",
      artisan_region: "যোধপুর, রাজস্থান",
    },
    gu: {
      title: "પરંપરાગત હસ્તનિર્મિત ભરતકામવાળી મખમલી મોજડી",
      quick_summary: "ફૂલોની કલાત્મક ભાત અને ઝરીના ભરતકામથી શણગારેલી મખમલની મોજડી.",
      story: "શાહી વારસાથી પ્રેરિત આ મોજડી કુશળ કારીગરો દ્વારા ઉત્તમ મખમલ અને સોનેરી ઝરીના તારથી હાથથી બનાવવામાં આવે છે. સુંદર દેખાવ સાથે પગ માટે આરામદાયક છે.",
      highlights: [
        "૧૦૦% હસ્તનિર્મિત ઝરી અને રેશમ ભરતકામ",
        "નરમ કુશનવાળું તળિયું અને ટકાઉ ફિટિંગ",
        "લગ્ન, તહેવારો અને પરંપરાગત પોશાક માટે શ્રેષ્ઠ",
      ],
      specs: [
        { label: "કલા પ્રકાર", value: "મોજડી ચર્મ શિલ્પ" },
        { label: "સામગ્રી", value: "મખમલ, ઝરી દોરો અને ચામડું" },
        { label: "કદ", value: "સ્ટાન્ડર્ડ ભારતીય માપ" },
        { label: "ઉપયોગ", value: "લગ્ન, તહેવાર, સાંસ્કૃતિક પ્રસંગ" },
      ],
      artisan_name: "માધુરી દેવી",
      artisan_region: "જોધપુર, રાજસ્થાન",
    },
    ta: {
      title: "பாரம்பரிய கைவினை மலர் எம்பிராய்டரி வெல்வெட் மோஜாரி காலணிகள்",
      quick_summary: "பூ வேலைப்பாடுகள் மற்றும் ஜரிகை நைப்புணயம் கொண்ட மென்மையான வெல்வெட் காலணிகள்.",
      story: "பாரம்பரிய ராஜபுத்திர கலாச்சாரத்தின் அழகை தாங்கி நிற்கும் இந்த மோஜாரி காலணிகள், மென்மையான வெல்வெட் மற்றும் பொன் ஜரிகை நூல்களால் தலைசிறந்த கைவினைஞர்களால் தைக்கப்பட்டுள்ளன.",
      highlights: [
        "100% கைவினை ஜரிகை மற்றும் பட்டு நூல் எம்பிராய்டரி",
        "நாள் முழுவதும் அணியக்கூடிய மென்மையான உள் அடுக்கு",
        "திருமணம் மற்றும் பண்டிகை கால உடைகளுக்கு மிக பொருத்தம்",
      ],
      specs: [
        { label: "கைவினை வடிவம்", value: "மோஜாரி கைவினை" },
        { label: "பொருள்", value: "வெல்வெட், ஜரிகை நூல் & தோல்" },
        { label: "அளவு", value: "நிலையான இந்திய அளவு" },
        { label: "பயன்பாடு", value: "திருமணம், பண்டிகைகள்" },
      ],
      artisan_name: "மாதூரி தேவி",
      artisan_region: "ஜோத்பூர், ராஜஸ்தான்",
    },
    te: {
      title: "సంప్రదాయ చేతితో ఎంబ్రాయిడరీ చేసిన వెల్వెట్ మోజారీ పాదరక్షలు",
      quick_summary: "పూల నమూనాలు మరియు జరీ కుట్టుతో అలంకరించిన వెల్వెట్ మోజారీలు.",
      story: "రాచరిక సంస్కృతితో కూడిన ఈ మోజారీ పాదరక్షలను నిపుణులైన కళాకారులు నాణ్యమైన వెల్వెట్, బంగారు జరీ దారాలతో ఎంతో శ్రద్ధతో చేతితో కుట్టారు.",
      highlights: [
        "100% చేతితో చేసిన జరీ మరియు పట్టు దారాల ఎంబ్రాయిడరీ",
        "పాదాలకు ఎంతో సౌకర్యవంతంగా ఉండే మెత్తని ఇన్నర్ సోల్",
        "వివాహాలు మరియు పండుగల సంప్రదాయ దుస్తులకు పరిపూర్ణ జత",
      ],
      specs: [
        { label: "చేతిపని శైలి", value: "మోజారీ హస్తకళ" },
        { label: "పదార్థం", value: "వెల్వెట్, జరీ దారం & లెదర్" },
        { label: "పరిమాణం", value: "ప్రామాణిక భారతీయ ఫిట్టింగ్" },
        { label: "ఉపయోగం", value: "వివాహాలు, పండుగలు, ఉత్సవాలు" },
      ],
      artisan_name: "మాధురీ దేవి",
      artisan_region: "జోధ్‌పూర్, రాజస్థాన్",
    },
  },

  painting: {
    hi: {
      title: "हस्तनिर्मित मधुबनी सूर्य लोककला चित्र",
      quick_summary: "प्राकृतिक रंगों से हस्तनिर्मित पारंपरिक मधुबनी पेंटिंग।",
      story: "मिथिला की प्राचीन भूमि से उपजी यह मधुबनी पेंटिंग सूर्य देव की जीवनदायिनी ऊर्जा का उत्सव मनाती है। बांस की तीलियों और प्राकृतिक वानस्पतिक रंगों से तैयार की गई यह कला पीढ़ियों की विरासत है।",
      highlights: [
        "100% प्राकृतिक वानस्पतिक रंगों द्वारा हस्तचित्रित",
        "मिथिला बिहार के पारंपरिक लोक कलाकारों द्वारा रचित",
        "घर की दीवारों के लिए शुभ व आकर्षक कलाकृति",
      ],
      specs: [
        { label: "कला शैली", value: "मधुबनी लोककला (मिथिला)" },
        { label: "सामग्री", value: "हस्तनिर्मित कागज़ व प्राकृतिक रंग" },
        { label: "आकार", value: "12 × 16 इंच" },
        { label: "उपयोग", value: "दीवार सज्जा, सांस्कृतिक उपहार" },
      ],
      artisan_name: "सीता देवी",
      artisan_region: "मधुबनी, बिहार",
    },
    en: {
      title: "Handcrafted Madhubani Sun Folk Painting",
      quick_summary: "Traditional Madhubani painting meticulously hand-painted with natural dyes.",
      story: "Originating from the historic Mithila region, this Madhubani painting depicts the radiant Sun God using natural organic pigments and fine bamboo nibs, celebrating cosmic vitality and heritage.",
      highlights: [
        "100% Hand-painted using natural plant & mineral dyes",
        "Directly from generational Mithila folk art masters",
        "Brings auspicious cultural aura to modern wall aesthetics",
      ],
      specs: [
        { label: "Craft Type", value: "Madhubani Folk Painting" },
        { label: "Material", value: "Handmade Paper & Natural Pigments" },
        { label: "Size", value: "12 × 16 inches" },
        { label: "Best For", value: "Wall Aesthetics, Mindful Gifting" },
      ],
      artisan_name: "Sita Devi",
      artisan_region: "Madhubani, Bihar",
    },
    mr: {
      title: "हस्तनिर्मित पारंपरिक मधुबनी सूर्य लोककला चित्र",
      quick_summary: "नैसर्गिक रंगांनी हाताने रेखाटलेले अस्सल मधुबनी चित्र.",
      story: "मिथिला भूमीतील ही प्राचीन मधुबनी कला निसर्ग आणि सूर्यदेवाच्या तेजाचे प्रतीक आहे. बांबूच्या काड्या आणि वनस्पतींच्या नैसर्गिक अर्कापासून हे चित्र हाताने तयार केले जाते.",
      highlights: [
        "१००% नैसर्गिक वनस्पती रंगांचा वापर",
        "मिथिला बिहारच्या पारंपरिक लोककलावंतांकडून साकारलेले",
        "घराच्या भिंतींसाठी मंगलमय व आकर्षक कलाकृती",
      ],
      specs: [
        { label: "कला प्रकार", value: "मधुबनी लोककला (मिथिला)" },
        { label: "साहित्य", value: "हँडमेड कागद व नैसर्गिक रंग" },
        { label: "आकार", value: "१२ × १६ इंच" },
        { label: "वापर", value: "भिंत सजावट, सांस्कृतिक भेट" },
      ],
      artisan_name: "सीता देवी",
      artisan_region: "मधुबनी, बिहार",
    },
    bn: {
      title: "হস্তনির্মিত ঐতিহ্যবাহী মধুবনী সূর্য লোকশিল্প চিত্র",
      quick_summary: "প্রাকৃতিক ভেষজ রঙে হাতে আঁকা ঐতিহ্যবাহী মধুবনী চিত্রকর্ম।",
      story: "মিথিলার সুপ্রাচীন লোকসংস্কৃতির নিদর্শন এই মধুবনী চিত্রকর্মে সূর্যদেবের প্রাণময় রূপ ফুটিয়ে তোলা হয়েছে। বাঁশের কঞ্চি এবং প্রাকৃতিক ভেষজ ও খনিজ রঙ দিয়ে শিল্পীরা নিখুঁতভাবে এটি আঁকেন।",
      highlights: [
        "১০০% প্রাকৃতিক ভেষজ ও খনিজ রঙে অঙ্কিত",
        "মিথিলার পরম্পরাগত লোকশিল্পীদের মৌলিক সৃষ্টি",
        "দেয়াল সজ্জা ও নান্দনিক উপহারের জন্য অত্যন্ত শুভ",
      ],
      specs: [
        { label: "শিল্পশৈলী", value: "মধুবনী লোকশিল্প (মিথিলা)" },
        { label: "উপকরণ", value: "হ্যান্ডমেড কাগজ ও প্রাকৃতিক রং" },
        { label: "আকার", value: "১২ × ১৬ ইঞ্চি" },
        { label: "ব্যবহার", value: "দেয়াল সজ্জা, শিল্প উপহার" },
      ],
      artisan_name: "সীতা দেবী",
      artisan_region: "মধুবনী, বিহার",
    },
    gu: {
      title: "હસ્તનિર્મિત મધુબની સૂર્ય લોકકળા ચિત્ર",
      quick_summary: "કુદરતી રંગોથી હાથથી દોરેલું પરંપરાગત મધુબની ચિત્ર.",
      story: "મિથિલાની પવિત્ર ભૂમિમાંથી ઉદ્ભવેલી આ મધુબની કળા સૂર્યદેવની તેજસ્વી ઊર્જાનું પ્રતીક છે. વાંસની સળીઓ અને વનસ્પતિજન્ય કુદરતી રંગોથી આ અદભુત ચિત્રકામ કરવામાં આવે છે.",
      highlights: [
        "૧૦૦% કુદરતી વનસ્પતિ રંગો દ્વારા હસ્તચિત્રિત",
        "મિથિલાના પરંપરાગત લોકકલાકારો દ્વારા રચિત",
        "ઘરની દિવાલની સજાવટ માટે મંગલમય કલાકૃતિ",
      ],
      specs: [
        { label: "કલા પ્રકાર", value: "મધુબની લોકકળા (મિથિલા)" },
        { label: "સામગ્રી", value: "હસ્તનિર્મિત કાગળ અને કુદરતી રંગ" },
        { label: "કદ", value: "૧૨ × ૧૬ ઇંચ" },
        { label: "ઉપયોગ", value: "દિવાલ સજાવટ, સાંસ્કૃતિક ભેટ" },
      ],
      artisan_name: "સીતા દેવી",
      artisan_region: "મધુબની, બિહાર",
    },
    ta: {
      title: "கைவினை மதுபானி சூரிய நாட்டுப்புற ஓவியம்",
      quick_summary: "இயற்கை வண்ணங்களால் கைகளால் வரையப்பட்ட பாரம்பரிய மதுபானி ஓவியம்.",
      story: "மிதிலை மண்ணின் புகழ்பெற்ற மதுபானி ஓவியக்கலை சூரிய பகவானின் ஆற்றலை போற்றுகிறது. மூங்கில் குச்சிகள் மற்றும் மூலிகை வண்ணங்களைக் கொண்டு கைவினைஞர்களால் நுணுக்கமாக வரையப்பட்டுள்ளது.",
      highlights: [
        "100% இயற்கை மூலிகை மற்றும் கனிம வண்ணங்களால் வரையப்பட்டது",
        "மிதிலையின் பாரம்பரிய நாட்டுப்புற கலைஞர்களால் உருவாக்கப்பட்டது",
        "வீட்டின் சுவர்களுக்கு மங்கலகரமான அழகு சேர்க்கும் படைப்பு",
      ],
      specs: [
        { label: "கைவினை வடிவம்", value: "மதுபானி ஓவியக்கலை" },
        { label: "பொருள்", value: "கைவினை காகிதம் & இயற்கை வண்ணங்கள்" },
        { label: "அளவு", value: "12 × 16 அங்குலம்" },
        { label: "பயன்பாடு", value: "சுவர் அலங்காரம், கலைப்பரிசு" },
      ],
      artisan_name: "சீதா தேவி",
      artisan_region: "மதுபானி, பீகார்",
    },
    te: {
      title: "చేతితో వేసిన మధుబని సూర్య జానపద పెయింటింగ్",
      quick_summary: "సహజ రంగులతో చేతితో అందంగా చిత్రించిన సాంప్రదాయ మధుబని పెయింటింగ్.",
      story: "మిథిల ప్రాంతం నుండి వెలసిన ప్రాచీన మధుబని కళ సూర్యభగవానుడి దివ్య తేజాన్ని ప్రదర్శిస్తుంది. వెదురు పుల్లలు మరియు మొక్కల సహజ రంగులతో ఈ చిత్రం వేయబడింది.",
      highlights: [
        "100% సహజ వృక్ష సంబంధిత రంగులతో చేతితో గీయబడింది",
        "మిథిల సాంప్రదాయ జానపద కళాకారులచే ప్రత్యక్ష సృష్టి",
        "ఇంటి గోడల అలంకరణకు శుభకరమైన కళాఖండం",
      ],
      specs: [
        { label: "చేతిపని శైలి", value: "మధుబని జానపద కళ" },
        { label: "పదార్థం", value: "చేతితో చేసిన కాగితం & సహజ రంగులు" },
        { label: "పరిమాణం", value: "12 × 16 అంగుళాలు" },
        { label: "ఉపయోగం", value: "గోడ అలంకరణ, సాంస్కృతిక బహుమతి" },
      ],
      artisan_name: "సీతా దేవి",
      artisan_region: "మధుబని, బీహార్",
    },
  },
};

// ── Multi-Indic City Dictionary ──
export const LOCALIZED_CITIES: Record<string, Record<string, string>> = {
  Bengaluru: { hi: "बेंगलुरु", en: "Bengaluru", mr: "बंगळुरू", bn: "বেঙ্গালুরু", gu: "બેંગલુરુ", ta: "பெங்களூரு", te: "బెంగళూరు" },
  Delhi: { hi: "दिल्ली", en: "Delhi", mr: "दिल्ली", bn: "দিল্লি", gu: "દિલ્હી", ta: "தில்லி", te: "ఢిల్లీ" },
  Mumbai: { hi: "मुंबई", en: "Mumbai", mr: "मुंबई", bn: "মুম্বই", gu: "મુંબઈ", ta: "மும்பை", te: "ముంబై" },
  Pune: { hi: "पुणे", en: "Pune", mr: "पुणे", bn: "পুনে", gu: "પુણે", ta: "புனே", te: "పూణే" },
  Hyderabad: { hi: "हैदराबाद", en: "Hyderabad", mr: "हैदराबाद", bn: "হায়দরাবাদ", gu: "હૈદરાબાદ", ta: "ஹைதராபாத்", te: "హైదరాబాద్" },
};

export function getRandomBuyerCity(lang: string = "hi"): string {
  const keys = Object.keys(LOCALIZED_CITIES);
  const selected = keys[Math.floor(Math.random() * keys.length)];
  return LOCALIZED_CITIES[selected]?.[lang] || LOCALIZED_CITIES[selected]?.["en"] || selected;
}

export function getLocalizedCity(cityName: string, lang: string = "hi"): string {
  if (!cityName) return "";
  for (const [key, map] of Object.entries(LOCALIZED_CITIES)) {
    if (cityName.toLowerCase().includes(key.toLowerCase()) || Object.values(map).some((v) => v === cityName)) {
      return map[lang] || map["en"] || cityName;
    }
  }
  return cityName;
}

/**
 * Match a craft token from item attributes
 */
function matchCraftKey(item: any): string | null {
  if (!item) return null;
  const combined = `${item.title_en || ""} ${item.title_hi || ""} ${item.title_local || ""} ${item.categoryName || ""}`.toLowerCase();
  if (/jutti|जूती|mojari|मोजड़ी|मोजड्या/i.test(combined)) return "mojari";
  if (/puppet|कठपुतली|बाहुली/i.test(combined)) return "puppet";
  if (/kalash|कलश|घडा|कળશ/i.test(combined)) return "kalash";
  if (/madhubani|मधुबनी|painting|चित्र|चित्रकारी/i.test(combined)) return "painting";
  return null;
}

/**
 * Resolves the appropriate craft title for any item based on active language code.
 */
export function getDisplayTitle(item: any, currentLang: string = "hi"): string {
  if (!item) return "";

  // 1. Direct localizedContent title
  if (item.localizedContent?.[currentLang]?.title) {
    return item.localizedContent[currentLang].title;
  }

  // 2. Persistent storage cache check
  if (item.id) {
    try {
      const cached = localStorage.getItem(`kalakriti_loc_${item.id}_${currentLang}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.title) return parsed.title;
      }
    } catch {}
  }

  // 3. Known craft token matching
  const matchedKey = matchCraftKey(item);
  if (matchedKey && KNOWN_CRAFT_LOCALIZATIONS[matchedKey]?.[currentLang]?.title) {
    return KNOWN_CRAFT_LOCALIZATIONS[matchedKey][currentLang].title;
  }

  // 4. Language is English
  if (currentLang === "en") {
    return item.title_en || item.title_local || item.title_hi || "";
  }

  // 5. Language is Hindi
  if (currentLang === "hi") {
    return item.title_hi || item.title_local || item.title_en || "";
  }

  // 6. If item carries local title matching currentLang
  if (item.language === currentLang && item.title_local) {
    return item.title_local;
  }

  return item.title_local || item.title_hi || item.title_en || "";
}

/**
 * Returns full culturally rich content (title, quick_summary, story, highlights, specs)
 * in the user's active language, guaranteeing no silent Hindi fallback.
 */
export function getLocalizedProductContent(
  product: any,
  currentLang: string = "hi"
): LocalizedProductContent {
  if (!product) {
    return {
      title: "",
      quick_summary: "",
      story: "",
      highlights: [],
      specs: [],
    };
  }

  // 1. Check direct product.localizedContent
  if (product.localizedContent?.[currentLang]) {
    return product.localizedContent[currentLang];
  }

  // 2. Check persistent localStorage cache
  if (product.id) {
    try {
      const cached = localStorage.getItem(`kalakriti_loc_${product.id}_${currentLang}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.title && parsed?.story) return parsed;
      }
    } catch {}
  }

  // 3. Check known craft localizations
  const key = matchCraftKey(product);
  if (key && KNOWN_CRAFT_LOCALIZATIONS[key]?.[currentLang]) {
    return KNOWN_CRAFT_LOCALIZATIONS[key][currentLang];
  }

  // 4. If English
  if (currentLang === "en") {
    return {
      title: product.title_en || product.title_hi || "Authentic Handcrafted Artisan Craft",
      quick_summary: product.quick_summary_en || "Authentic handmade Indian handicraft crafted using generational techniques.",
      story: product.story_en || "This authentic artisan craft represents centuries of Indian generational heritage. Meticulously shaped and detailed using sustainable, locally sourced materials.",
      highlights: product.highlights_en && product.highlights_en.length ? product.highlights_en : [
        "100% Handcrafted from organic, sustainable materials",
        "Direct from generational rural artisan clusters",
        "Ideal for aesthetic home decor & mindful gifting",
      ],
      specs: product.specs_en && product.specs_en.length ? product.specs_en : [
        { label: "Craft Type", value: "Indian Traditional Craft" },
        { label: "Material", value: "Natural, Eco-friendly Materials" },
        { label: "Origin", value: product.artisan_region || "India" },
        { label: "Best For", value: "Home Aesthetics, Festive Decor" },
      ],
      artisan_name: product.artisan_name || "Master Rural Craftsperson",
      artisan_region: product.artisan_region || "India",
    };
  }

  // 5. If Hindi
  if (currentLang === "hi") {
    return {
      title: product.title_hi || product.title_en || "प्रामाणिक पारंपरिक हस्तशिल्प उत्पाद",
      quick_summary: product.quick_summary_hi || "पारंपरिक तकनीकों द्वारा हस्तनिर्मित प्रामाणिक भारतीय शिल्प।",
      story: product.story_hi || "यह हस्तशिल्प भारत की प्राचीन लोक परंपरा और कारीगरी का प्रतीक है। इसे कुशल ग्रामीण कारीगरों द्वारा स्थानीय पर्यावरण-अनुकूल सामग्री और पारंपरिक तकनीकों से तैयार किया गया है।",
      highlights: product.highlights_hi && product.highlights_hi.length ? product.highlights_hi : [
        "100% हस्तनिर्मित एवं पर्यावरण-अनुकूल",
        "पारंपरिक शिल्पकारों द्वारा प्रामाणिक निर्माण",
        "गृह सज्जा, पूजा एवं सांस्कृतिक उपहार हेतु उपयुक्त",
      ],
      specs: product.specs_hi && product.specs_hi.length ? product.specs_hi : [
        { label: "कला शैली", value: "भारतीय पारंपरिक शिल्प" },
        { label: "सामग्री", value: "प्राकृतिक पर्यावरण-अनुकूल सामग्री" },
        { label: "मूल स्थान", value: product.artisan_region || "भारत" },
        { label: "उपयोग", value: "गृह सज्जा, सांस्कृतिक उपहार" },
      ],
      artisan_name: product.artisan_name || "कुशल ग्रामीण कारीगर",
      artisan_region: product.artisan_region || "भारत",
    };
  }

  // 6. If product has native local fields matching currentLang
  if (product.language === currentLang && product.story_local) {
    return {
      title: product.title_local || product.title_en || "",
      quick_summary: product.quick_summary_local || product.quick_summary_en || "",
      story: product.story_local,
      highlights: product.highlights_local || product.highlights_en || [],
      specs: product.specs_local || product.specs_en || [],
      artisan_name: product.artisan_name,
      artisan_region: product.artisan_region,
    };
  }

  // 7. Non-Hindi, non-English fallback in the native target script
  const title = getDisplayTitle(product, currentLang);
  const fallbacksByLang: Record<string, LocalizedProductContent> = {
    mr: {
      title: title || "अस्सल पारंपरिक हस्तकला वस्तू",
      quick_summary: "कुशल ग्रामीण कारागिरांनी हाताने बनवलेली अस्सल भारतीय हस्तकला वस्तू.",
      story: "ही हस्तकला भारताच्या प्राचीन संस्कृतीचे आणि पिढ्यानपिढ्या चालत आलेल्या कौशल्याचे सुंदर प्रतीक आहे. स्थानिक नैसर्गिक साहित्यापासून तयार केलेली ही कला घरामध्ये समृद्धी आणि सौंदर्य आणते.",
      highlights: [
        "१००% हाताने तयार केलेली पर्यावरणपूरक कला",
        "पारंपरिक ग्रामीण कारागिरांकडून थेट उपलब्ध",
        "घर सजावट आणि सांस्कृतिक भेटवस्तूंसाठी उत्तम",
      ],
      specs: [
        { label: "कला प्रकार", value: "भारतीय पारंपरिक हस्तकला" },
        { label: "साहित्य", value: "नैसर्गिक पर्यावरणपूरक साहित्य" },
        { label: "मूळ स्थान", value: product.artisan_region || "भारत" },
        { label: "वापर", value: "घर सजावट, सांस्कृतिक भेट" },
      ],
      artisan_name: product.artisan_name || "कुशल ग्रामीण कारागीर",
      artisan_region: product.artisan_region || "भारत",
    },
    bn: {
      title: title || "ঐতিহ্যবাহী ভারতীয় হস্তশিল্প",
      quick_summary: "দক্ষ গ্রামীণ কারিগরদের দ্বারা বংশানুক্রমিক কৌশলে তৈরি খাঁটি হস্তশিল্প।",
      story: "এই ঐতিহ্যবাহী শিল্পকর্মটি ভারতীয় লোকঐতিহ্য ও সাংস্কৃতিক নিপুণতার প্রতীক। স্থানীয় পরিবেশবান্ধব উপাদান দিয়ে নিখুঁতভাবে তৈরি এই হস্তশিল্প ঘরের নান্দনিকতা ও সংস্কৃতি বৃদ্ধি করে।",
      highlights: [
        "১০০% হস্তনির্মিত ও পরিবেশবান্ধব উপাদান",
        "গ্রামীণ কারিগর ক্লাস্টার থেকে সরাসরি সংগৃহীত",
        "গৃহসজ্জা ও সাংস্কৃতিক উপহারের জন্য উপযুক্ত",
      ],
      specs: [
        { label: "শিল্পশৈলী", value: "ভারতীয় ঐতিহ্যবাহী হস্তশিল্প" },
        { label: "উপকরণ", value: "প্রাকৃতিক পরিবেশবান্ধব উপকরণ" },
        { label: "উৎস", value: product.artisan_region || "ভারত" },
        { label: "ব্যবহার", value: "গৃহসজ্জা ও উৎসব" },
      ],
      artisan_name: product.artisan_name || "দক্ষ গ্রামীণ কারিগর",
      artisan_region: product.artisan_region || "ভারত",
    },
    gu: {
      title: title || "અસલ પરંપરાગત ભારતીય હસ્તકલા",
      quick_summary: "કુશળ ગ્રામીણ કારીગરો દ્વારા પેઢી દર પેઢીની તકનીકથી બનેલી હસ્તકલા.",
      story: "આ હસ્તકલા ભારતની પ્રાચીન સંસ્કૃતિ અને કારીગરીનું સુંદર પ્રતીક છે. સ્થાનિક પર્યાવરણ-અનુકૂળ સામગ્રીમાંથી પ્રેમપૂર્વક તૈયાર કરેલી આ કલાકૃતિ ઘરમાં સમૃદ્ધિ અને સુંદરતા લાવે છે.",
      highlights: [
        "૧૦૦% હસ્તનિર્મિત અને ઇકો-ફ્રેન્ડલી",
        "પરંપરાગત ગ્રામીણ કારીગરો પાસેથી સીધું પ્રાપ્ત",
        "ઘર સજાવટ અને સાંસ્કૃતિક ભેટ માટે શ્રેષ્ઠ",
      ],
      specs: [
        { label: "કલા પ્રકાર", value: "ભારતીય પરંપરાગત હસ્તકલા" },
        { label: "સામગ્રી", value: "કુદરતી ઇકો-ફ્રેન્ડલી સામગ્રી" },
        { label: "મૂળ સ્થાન", value: product.artisan_region || "ભારત" },
        { label: "ઉપયોગ", value: "ઘર સજાવટ, સાંસ્કૃતિક ભેટ" },
      ],
      artisan_name: product.artisan_name || "કુશળ ગ્રામીણ કારીગર",
      artisan_region: product.artisan_region || "ભારત",
    },
    ta: {
      title: title || "அசல் பாரம்பரிய இந்திய கைவினைப்பொருள்",
      quick_summary: "திறமையான கிராமப்புற கலைஞர்களால் பாரம்பரிய முறையில் உருவாக்கப்பட்ட கைவினைப்பொருள்.",
      story: "இந்த கைவினைப்பொருள் இந்தியாவின் பழமையான கலாச்சாரம் மற்றும் தலைமுறை தலைமுறையாக தொடரும் கலைத்திறனின் சின்னமாகும். சுற்றுச்சூழலுக்கு உகந்த பொருட்களால் நேர்த்தியாக வடிவமைக்கப்பட்டுள்ளது.",
      highlights: [
        "100% கைவினை மற்றும் சுற்றுச்சூழலுக்கு உகந்தது",
        "கிராமப்புற கலைஞர்களிடமிருந்து நேரடியாக பெறப்பட்டது",
        "வீட்டு அலங்காரம் மற்றும் மங்களகரமான பரிசுகளுக்கு சிறந்தது",
      ],
      specs: [
        { label: "கைவினை வடிவம்", value: "இந்திய பாரம்பரிய கைவினை" },
        { label: "பொருள்", value: "இயற்கை சூழல் நட்பு பொருட்கள்" },
        { label: "பிறப்பிடம்", value: product.artisan_region || "இந்தியா" },
        { label: "பயன்பாடு", value: "வீட்டு அலங்காரம், பண்டிகைகள்" },
      ],
      artisan_name: product.artisan_name || "திறமையான கிராமப்புற கைவினைஞர்",
      artisan_region: product.artisan_region || "இந்தியா",
    },
    te: {
      title: title || "ప్రామాణిక సంప్రదాయ భారతీయ హస్తకళ",
      quick_summary: "నిపుణులైన గ్రామీణ కళాకారులు తరతరాల నైపుణ్యంతో రూపొందించిన హస్తకళా వస్తువు.",
      story: "ఈ హస్తకళ భారతదేశపు ప్రాచీన సంస్కృతి మరియు తరతరాల కళావారసత్వానికి ప్రతీక. స్థానిక పర్యావరణ అనుకూల పదార్థాలతో ఎంతో శ్రద్ధతో చేతితో రూపొందించబడింది.",
      highlights: [
        "100% చేతితో చేసిన పర్యావరణ అనుకూల హస్తకళ",
        "గ్రామీణ కళాకారుల సమూహాల నుండి నేరుగా లభ్యం",
        "ఇంటి అలంకరణ మరియు సాంస్కృతిక బహుమతులకు అత్యుత్తమం",
      ],
      specs: [
        { label: "చేతిపని శైలి", value: "భారతీయ సంప్రదాయ హస్తకళ" },
        { label: "పదార్థం", value: "సహజ పర్యావరణ అనుకూల వనరులు" },
        { label: "మూలం", value: product.artisan_region || "భారతదేశం" },
        { label: "ఉపయోగం", value: "ఇంటి అలంకరణ, పూజ, పండుగలు" },
      ],
      artisan_name: product.artisan_name || "నైపుణ్యం కలిగిన గ్రామీణ కళాకారుడు",
      artisan_region: product.artisan_region || "భారతదేశం",
    },
  };

  return (
    fallbacksByLang[currentLang] || {
      title: title || product.title_en || "",
      quick_summary: product.quick_summary_en || "",
      story: product.story_en || "",
      highlights: product.highlights_en || [],
      specs: product.specs_en || [],
      artisan_name: product.artisan_name,
      artisan_region: product.artisan_region,
    }
  );
}

/**
 * On-demand translation with Gemini 3.5 Flash-Lite.
 * Requests translation in target language and caches result permanently.
 */
export async function ensureProductLocalization(
  product: any,
  targetLang: string,
  geminiKey?: string
): Promise<LocalizedProductContent> {
  const existing = getLocalizedProductContent(product, targetLang);
  if (product?.localizedContent?.[targetLang]) {
    return existing;
  }

  // If we already have a persistent cache entry
  if (product.id) {
    try {
      const cached = localStorage.getItem(`kalakriti_loc_${product.id}_${targetLang}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.title && parsed?.story) {
          if (!product.localizedContent) product.localizedContent = {};
          product.localizedContent[targetLang] = parsed;
          return parsed;
        }
      }
    } catch {}
  }

  // If language is English or Hindi, we already have complete native data
  if (targetLang === "en" || targetLang === "hi") {
    return existing;
  }

  const keyToUse =
    geminiKey ||
    (typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env.VITE_GEMINI_KEY || import.meta.env.VITE_GEMINI_API_KEY
      : "");

  if (!keyToUse) {
    return existing;
  }

  const langNames: Record<string, { en: string; native: string }> = {
    mr: { en: "Marathi", native: "मराठी" },
    bn: { en: "Bengali", native: "বাংলা" },
    gu: { en: "Gujarati", native: "ગુજરાતી" },
    ta: { en: "Tamil", native: "தமிழ்" },
    te: { en: "Telugu", native: "తెలుగు" },
  };

  const targetMeta = langNames[targetLang];
  if (!targetMeta) return existing;

  try {
    const prompt = `You are a cultural localization expert for Indian handicrafts at Kalakriti.
Translate and culturally localize this handicraft product catalog into authentic, fluent ${targetMeta.en} (${targetMeta.native}).
Craft English Name: "${product.title_en || product.title_hi || ""}"
Craft Story: "${product.story_en || product.story_hi || ""}"
Craft Summary: "${product.quick_summary_en || product.quick_summary_hi || ""}"
Highlights: ${JSON.stringify(product.highlights_en || product.highlights_hi || [])}
Specs: ${JSON.stringify(product.specs_en || product.specs_hi || [])}

Output ONLY valid JSON matching this schema:
{
  "title": "Culturally authentic craft title in ${targetMeta.en} script (${targetMeta.native})",
  "quick_summary": "1 hook sentence in ${targetMeta.en} script (${targetMeta.native})",
  "story": "2-3 evocative sentences celebrating craft heritage in ${targetMeta.en} script (${targetMeta.native})",
  "highlights": ["3 highlight bullets in ${targetMeta.en} script (${targetMeta.native})"],
  "specs": [
    { "label": "Label in ${targetMeta.native}", "value": "Value in ${targetMeta.native}" }
  ]
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${keyToUse}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const clean = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed: LocalizedProductContent = JSON.parse(clean);

      if (parsed?.title && parsed?.story) {
        if (!product.localizedContent) product.localizedContent = {};
        product.localizedContent[targetLang] = parsed;

        if (product.id) {
          try {
            localStorage.setItem(`kalakriti_loc_${product.id}_${targetLang}`, JSON.stringify(parsed));
            // Update inventory in localStorage
            const savedInv = localStorage.getItem("kalakriti_inventory");
            if (savedInv) {
              const inv: any[] = JSON.parse(savedInv);
              const idx = inv.findIndex((it) => it.id === product.id);
              if (idx !== -1) {
                if (!inv[idx].localizedContent) inv[idx].localizedContent = {};
                inv[idx].localizedContent[targetLang] = parsed;
                localStorage.setItem("kalakriti_inventory", JSON.stringify(inv));
              }
            }
          } catch (e) {
            console.warn("Localization cache save error:", e);
          }
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Gemini on-demand localization error:", err);
  }

  return existing;
}

/**
 * Pure dynamic earnings calculation based on live order records.
 * Rules:
 * - Gross Sales = sum of all orders
 * - Artisan Share = 85% (Direct to Jan Dhan account in 24 hrs)
 * - India Post Courier Delivery = 10%
 * - ONDC Network Maintenance Fee = 5%
 */
export function calculateArtisanEarnings(
  orders: Array<{ amount: number; status?: string; [key: string]: any }>
) {
  const activeOrders = orders.filter((o) => o.status !== "Cancelled");
  const grossSales = activeOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const artisanShare = Math.round(grossSales * 0.85);
  const deliveryCharges = Math.round(grossSales * 0.1);
  const networkCharges = Math.round(grossSales * 0.05);

  return {
    grossSales,
    artisanShare,
    deliveryCharges,
    networkCharges,
    totalOrdersCount: orders.length,
    pendingOrdersCount: orders.filter((o) => o.status === "Pending").length,
    dispatchedOrdersCount: orders.filter((o) => o.status === "Shipped" || o.status === "Delivered").length,
  };
}

/**
 * Extracts craft core keyword for duplicate comparison.
 */
export function extractCoreKeyword(title: string = ""): string {
  const lower = title.toLowerCase();
  if (/mojari|jutti|मोजड़ी|मोजड्या|जूती/i.test(lower)) return "mojari";
  if (/puppet|कठपुतली|बाहुली/i.test(lower)) return "puppet";
  if (/kalash|कलश|घडा|कળશ/i.test(lower)) return "kalash";
  if (/painting|चित्र|मधुबनी/i.test(lower)) return "painting";
  if (/pot|मटका|भांडे|हांडी/i.test(lower)) return "pot";
  if (/doll|गुड़िया|ઢીંગલી/i.test(lower)) return "doll";
  if (/sneaker|स्नीकर|shoe|जूता/i.test(lower)) return "sneaker";
  if (/saree|साड़ी|dupatta|दुपट्टा/i.test(lower)) return "textile";
  if (/wood|लकड़ी|wooden|काठ/i.test(lower)) return "woodcraft";
  return lower.slice(0, 25);
}

/**
 * Robust, deterministic duplicate craft detection.
 * Prioritizes imageSignature (${file.name}_${file.size}_${file.lastModified}).
 * Merges identical products without creating duplicate cards.
 */
export function areItemsDuplicate(
  a: StoreItem | CatalogData,
  b: StoreItem | CatalogData
): boolean {
  // 1. Match by ID if both exist
  if ((a as any).id && (b as any).id && (a as any).id === (b as any).id) {
    return true;
  }

  // 2. Match by exact deterministic Image Signature (most reliable for re-uploads)
  if (
    a.imageSignature &&
    b.imageSignature &&
    a.imageSignature.trim() === b.imageSignature.trim()
  ) {
    return true;
  }

  // 3. Match by exact Image URL
  if (a.imageUrl && b.imageUrl && a.imageUrl.trim() === b.imageUrl.trim()) {
    return true;
  }

  // 4. Match by image base file name (e.g. jutti.jpg from different blob wrappers)
  if (a.imageUrl && b.imageUrl) {
    const fileA = a.imageUrl.split("?")[0].split("/").pop();
    const fileB = b.imageUrl.split("?")[0].split("/").pop();
    if (fileA && fileB && fileA.length > 5 && fileA === fileB) {
      return true;
    }
  }

  // 5. Match by exact English title
  if (
    a.title_en &&
    b.title_en &&
    a.title_en.trim().toLowerCase() === b.title_en.trim().toLowerCase()
  ) {
    return true;
  }

  // 6. Match by exact Local or Hindi title
  const titleA = ((a as any).title_local || a.title_hi || "").trim().toLowerCase();
  const titleB = ((b as any).title_local || b.title_hi || "").trim().toLowerCase();
  if (titleA && titleB && titleA === titleB) {
    return true;
  }

  // 7. Craft keyword + color / visual attribute matching
  const kwA = extractCoreKeyword(`${a.title_en} ${titleA}`);
  const kwB = extractCoreKeyword(`${b.title_en} ${titleB}`);
  if (kwA && kwB && kwA === kwB) {
    const isBlueA = /blue|नील|निळ|नीला|velvet/i.test(`${a.title_en} ${titleA}`);
    const isBlueB = /blue|नील|निळ|नीला|velvet/i.test(`${b.title_en} ${titleB}`);
    const isRedA = /red|लाल/i.test(`${a.title_en} ${titleA}`);
    const isRedB = /red|लाल/i.test(`${b.title_en} ${titleB}`);
    if (
      (isBlueA && isBlueB) ||
      (isRedA && isRedB) ||
      (!isBlueA && !isBlueB && !isRedA && !isRedB)
    ) {
      return true;
    }
  }

  return false;
}
