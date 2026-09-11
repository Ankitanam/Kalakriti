MASTER PROJECT MEMORY COMPLETE

KALAKRITI (कलाकृति) — MASTER TECHNICAL HANDOFF & REPOSITORY MEMORY

1. PROJECT OVERVIEW

  - Project Name: Kalakriti (कलाकृति) — previously referenced as KalaSetu during
    early design and prototyping iterations.
  - Target Competition: Smart India Hackathon (SIH) 2025/2026.
  - Problem Statement: Rural Indian master craftspeople (terracotta potters,
    Madhubani/Pattachitra painters, handloom weavers, wooden toy makers,
    embroidery artisans) generate immense cultural value but are structurally
    excluded from modern e-commerce. They face high digital and English
    illiteracy barriers, lack cataloging and pricing expertise, and lose 30%–40%
    of their retail margins to predatory middlemen and regional distributors.
  - Core Mission: Provide an intuitive, zero-barrier mobile application that
    allows a rural artisan to take a picture of their handmade craft, speak
    details in their regional language, and have multimodal AI automatically
    enhance the photo, compose rich cultural storytelling, structure technical
    specifications, suggest fair market-tested pricing, and publish directly to
    the Open Network for Digital Commerce (ONDC) open retail network
    (nic2004:52110).
  - Target User Personas:
    1.  Rural Artisan / Seller (ग्रामीण कारीगर): Low digital/English literacy;
        communicates through native vernacular voice and smartphone camera.
        Needs instant cataloging, a simple inventory stock counter, transparent
        order notifications, and a direct 85% Jan Dhan bank payout ledger.
    2.  Urban Buyer / Cultural Patron (शहरी खरीदार): Shoppers browsing verified,
        GI-tagged Indian heritage crafts through an ONDC buyer node (modeled
        after PhonePe Pincode and Paytm ONDC) with bilingual fuzzy search, cart
        management, transparent pricing, and live India Post logistics tracking.
  - Key Hackathon & Regulatory Requirements:
      - Compliance with ONDC Retail Protocol standards (Beckn Protocol v1.1,
        domain nic2004:52110).
      - Strict offline-first resilience so that network drops or missing cloud
        keys during a live jury demonstration never cause an unhandled
        white-screen crash.
      - Direct Jan Dhan Bank Account Direct Benefit Transfer (DBT) transparency
        (85% artisan direct, 10% India Post logistics, 5% network maintenance
        fee).
      - Digital provenance verification (KalaPramaan GI certification).

2. TECH STACK

| Category                         | Technologies & Tools                     | Implementation Details                                                                                                                              |
| :------------------------------- | :--------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend Framework**           | React 19 (`19.0.x`)                      | Functional components, Hooks (`useState`, `useRef`, `useEffect`, `useContext`).                                                                     |
| **Language & Tooling**           | TypeScript 5.9 (`5.9.x`), Vite 8 (`8.x`) | Strict mode, ESNext build target, Lightning-fast HMR.                                                                                               |
| **Styling & CSS**                | Tailwind CSS v4 (`@tailwindcss/vite`)    | CSS variable engine, utility-first classes, custom keyframe animations (`animate-slide-up`, `animate-fade-in`).                                     |
| **Typography**                   | Google Fonts: *Noto Serif* & *Poppins*   | `'Noto Serif', serif` for Devanagari headings, titles, and stories; `'Poppins', sans-serif` for body, badges, buttons, and numeric UI.              |
| **AI Multimodal Model**          | Google Gemini 3.5 Flash-Lite             | Direct REST `v1beta` endpoint (`gemini-3.5-flash-lite:generateContent`). Direct native `fetch()` calls.                                             |
| **Image Processing**             | Cloudinary REST Upload API               | Unsigned preset uploads with URL-based real-time image transformations: `e_improve,q_auto,f_auto`.                                                  |
| **Voice / Speech Input**         | HTML5 Web Speech API                     | Native `webkitSpeechRecognition` / `SpeechRecognition` dynamically adapting locale (`hi-IN`, `mr-IN`, `bn-IN`, `gu-IN`, `ta-IN`, `te-IN`, `en-IN`). |
| **Protocol Engine**              | Beckn Protocol v1.1 Specifications       | Modeled against ONDC Retail standard (`domain: "nic2004:52110"`), executing `select`, `init`, and `confirm` stages.                                 |
| **Internationalization (i18n)**  | Custom React Context (`LanguageContext`) | Zero-dependency, crash-proof translation engine supporting 7 Indian languages.                                                                      |
| **Primary Persistence**          | Browser `localStorage`                   | Offline-first architecture synchronized with `storage` and `focus` event listeners across views.                                                    |
| **Secondary / Optional Backend** | Node.js + Express (`server.js`)          | Optional local proxy server to hide client credentials in production.                                                                               |
| **Planned Cloud Database**       | Supabase (PostgreSQL + JSONB)            | Schema planned (`public.users`), but code runs 100% independently on `localStorage`.                                                                |
| **Deployment Target**            | Vercel / GitHub Actions                  | Repository target: `shub8995/kalakriti_sih_app`.                                                                                                    |

3. COMPLETE ARCHITECTURE

High-Level System Dataflow

   [ ARTISAN SELLER FLOW ]                              [ URBAN BUYER FLOW ]
  (Terracotta: #6B3A2A)                               (Royal Violet: #5B21B6)
           │                                                     │
           ▼                                                     ▼
 ┌─────────────────────┐                               ┌─────────────────────┐
 │ Dual Camera Capture │                               │  ONDC Buyer Node    │
 │ • Rear Camera       │                               │ • PhonePe / Paytm   │
 │ • Gallery Picker    │                               │ • Bilingual Search  │
 └─────────┬───────────┘                               └──────────┬──────────┘
           │ Image File                                           │
           ▼                                                      ▼
 ┌─────────────────────┐                               ┌─────────────────────┐
 │ Cloudinary API      │                               │ Full Details Modal  │
 │ (e_improve, q_auto) │                               │ • Heritage Story    │
 └─────────┬───────────┘                               │ • Specifications    │
           │ Optimized URL                                     │ • Stock Check       │
           ▼                                           └──────────┬──────────┘
 ┌─────────────────────┐                                          │
 │ Gemini 3.5 Flash    │                                          ▼
 │ Multimodal REST     │                               ┌─────────────────────┐
 │ • Voice Context     │                               │ Quantity Sheet      │
 │ • Visual Analysis   │                               │ (Strict Stock Clamped)
 └─────────┬───────────┘                               └──────────┬──────────┘
           │ Structured JSON                                      │
           ▼                                                      ▼
 ┌─────────────────────┐                               ┌─────────────────────┐
 │ Interactive Pricing │                               │ Beckn Order Confirm │
 │ • AI Market-Tested  │                               │ • Stock Decrement   │
 │ • Manual Custom     │                               │ • India Post Ledger │
 └─────────┬───────────┘                               └──────────┬──────────┘
           │                                                      │
           ▼                                                      │
 ┌─────────────────────┐       Cross-View Real-Time Sync          │
 │ Catalog Preview     │◄─────────────────────────────────────────┘
 │ & De-duplication    │   (kalakriti_inventory & kalakriti_orders)
 └─────────┬───────────┘
           │
           ▼
 ┌─────────────────────┐
 │ Storefront Dashboard│
 │ • Real-time Orders  │
 │ • 85% Jan Dhan DBT  │
 └─────────────────────┘

Detailed Component Flows

1.  Language & Voice Locale Adaptation: src/main.tsx wraps the application in
    <LanguageProvider>. When an artisan or shopper toggles their language (e.g.,
    from Hindi to Marathi), LanguageContext updates kalakriti_language in
    localStorage, re-evaluates all t("key") dictionary tokens instantly, and
    updates speechLang so the Web Speech engine listens in mr-IN instead of
    hi-IN.

2.  Image Ingestion & Optimization Flow:

      - The artisan clicks कैमरा खोलें, which triggers an <input type="file"
        accept="image/*" capture="environment" />, directly invoking the
        hardware camera shutter on mobile devices.
      - Alternatively, clicking फोटो अपलोड triggers a standard <input
        type="file" accept="image/*" /> to choose from the photo gallery.
      - The file is converted to an object URL for instant UI preview and
        asynchronously transformed into Base64 via FileReader.
      - Concurrently, uploadToCloudinary submits a multipart/form-data payload
        containing the file and unsigned upload preset to
        https://api.cloudinary.com/v1_1/${cloudName}/image/upload.
      - Cloudinary returns a secure URL transformed with e_improve,q_auto,f_auto
        to brighten low-light workshop shots.

3.  Gemini Multimodal Catalog Generation Flow:

      - The client prepares a raw REST payload containing the Base64 image
        (inline_data) and the artisan's voice transcript.
      - A POST request is dispatched directly to:
        https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}
      - The system prompt instructs Gemini to output strict JSON containing
        titles, market-tested pricing, provenance, an evocative cultural story
        (story_hi, story_en), 3 highlight bullets (highlights_hi,
        highlights_en), tabular specifications (specs_hi, specs_en), and ONDC
        tags.
      - If the API call fails or connectivity drops, a comprehensive
        category-aware Dynamic Fallback activates instantly, preventing empty
        screens.

4.  De-duplication & Inventory Lifecycle:

      - Prior to writing to localStorage, saveProductToInventory runs
        deduplicateInventory(). It compares the incoming item against existing
        items by matching imageUrl or normalized title_hi.
      - If a match exists, it increments the item's quantity rather than
        creating a duplicate listing.
      - Stock is persisted in kalakriti_inventory.

5.  Two-Way Order & Ledger Synchronization:

      - When a buyer checks out on OndcBuyerScreen.tsx,
        handleFinalOrderPlacement executes executeBecknConfirm().
      - The purchased quantities are subtracted from kalakriti_inventory. If
        stock reaches 0, the item status changes to "स्टॉक समाप्त" (Out of
        Stock).
      - Confirmed orders are appended to kalakriti_orders.
      - A native window.dispatchEvent(new Event("storage")) triggers across
        active browser tabs. The artisan's dashboard updates its order count and
        recalculates the 85% net payout ledger immediately.

4. PROJECT FILE STRUCTURE

kalakriti_sih_app/
├── .env                              # Private API keys (Git-ignored)
├── .env.example                      # Template for public repository cloning
├── .gitignore                        # Standard rules (node_modules, dist, .env)
├── index.html                        # Root HTML mounting /src/main.tsx
├── package.json                      # React 19, TypeScript 5.9, Vite 8, Tailwind v4
├── server.js                         # Optional Express backend proxy
├── tsconfig.json                     # TypeScript compiler configuration
├── vite.config.ts                    # Vite build configuration with Tailwind plugin
└── src/
    ├── main.tsx                      # Root entry point wrapping App in LanguageProvider
    ├── App.tsx                       # Master State Manager, Router, AI Ingestion & Dashboard
    ├── CatalogPreview.tsx            # Pre-publishing listing preview with Story & Specs
    ├── ArtisanDashboard.tsx          # "मेरी दुकान" - Seller storefront, order manager & ledger
    ├── OnboardingScreen.tsx          # Dual-role authentication portal (Seller vs Buyer)
    ├── OndcBuyerScreen.tsx           # Mock PhonePe Pincode / Paytm ONDC Buyer Application
    ├── index.css                     # Tailwind v4 directives & font imports
    ├── context/
    │   └── LanguageContext.tsx       # 7-language dictionary, speechLang sync, crash-proof hook
    ├── components/
    │   └── LanguageModal.tsx         # Flipkart-style bottom sheet language picker
    └── utils/
        ├── becknEngine.ts            # Beckn Protocol transaction state machine (select/init/confirm)
        ├── becknSchema.ts            # Serializer for ONDC Retail JSON (nic2004:52110)
        └── fuzzySearch.ts            # Bilingual phonetic typo-tolerant search engine

Detailed File Breakdown

  - src/main.tsx:
      - Purpose: Bootstraps the application.
      - Key Logic: Renders createRoot, wrapping <App /> within <StrictMode> and
        <LanguageProvider>.
      - Dependencies: react, react-dom/client, ./context/LanguageContext, ./App.
  - src/App.tsx:
      - Purpose: Central brain of Kalakriti. Manages application screens
        (onboarding, capture, preview, dashboard, buyer), offline persistence,
        Cloudinary upload, Gemini multimodal prompting, and stock mutations.
      - Key Functions: handleImageUpload, uploadToCloudinary, fileToBase64,
        handleMicToggle, handleGenerateCatalog, deduplicateInventory,
        saveProductToInventory, handleIncreaseQty, handleDecreaseQty,
        handleOrderConfirmedFromBuyer.
      - Dependencies: CatalogPreview, OnboardingScreen, ArtisanDashboard,
        OndcBuyerScreen, LanguageContext, LanguageModal, becknEngine.
  - src/CatalogPreview.tsx:
      - Purpose: Pre-publish review screen displaying the AI-generated craft
        catalog.
      - Key Sections: Top hero photo card, artisan trust header, price card
        with 40% margin savings, Hindi/English tab switch, quick headline hook,
        विरासत व शिल्प कथा (Heritage Story), मुख्य विशेषताएं (Key Highlights),
        tabular specifications, and ONDC tags.
      - Dependencies: react.
  - src/ArtisanDashboard.tsx:
      - Purpose: Artisan business management center ("मेरी दुकान").
      - Key Features: Tab 1: सामान (2-column inventory grid with + / - stock
        counters and remove actions); Tab 2: आर्डर (live order fulfillment and
        India Post dispatch triggers); Tab 3: कमाई (transparent 85% Jan Dhan DBT
        breakdown, 10% India Post, 5% ONDC fee); KalaPramaan certificate modal.
  - src/OndcBuyerScreen.tsx:
      - Purpose: Consumer shopping interface modeled after ONDC buyer apps
        (PhonePe Pincode / Paytm ONDC).
      - Key Features: Real-time inventory synchronization, fuzzy bilingual
        search, full-screen product details modal with heritage storytelling,
        quantity selector bottom sheet with strict stock limits, empty cart
        safeguards, and checkout flow.
  - src/context/LanguageContext.tsx:
      - Purpose: Centralized multilingual engine supporting 7 Indian languages
        (hi, en, mr, bn, gu, ta, te).
      - Key Logic: Provides t(key) translation function, sets speechLang for Web
        Speech API, stores choice in localStorage.getItem("kalakriti_language").
        Built with a fail-safe fallback to prevent white-screen crashes if
        context is missing.
  - src/components/LanguageModal.tsx:
      - Purpose: Bottom sheet language picker modeled after Flipkart. Displays
        language cards with native scripts and English subtitles. Adapts styling
        to Seller (Terracotta) or Buyer (Royal Violet) theme.
  - src/utils/becknEngine.ts:
      - Purpose: Simulates Beckn Protocol retail commerce stages. Computes items
        total, shipping fees (free above ₹499, else ₹40), logistics provider
        selection (India Post vs Delhivery), and confirmed order creation.
  - src/utils/becknSchema.ts:
      - Purpose: Transforms local StoreItem instances into strict ONDC Beckn
        v1.1 JSON objects for judges' protocol compliance inspection.
  - src/utils/fuzzySearch.ts:
      - Purpose: Typo-tolerant search using Levenshtein distance and phonetic
        matching across Hindi, English, and Hinglish.

5. FEATURES AND CURRENT STATUS

| Feature                            | Status                | Implementation Details                                                                                    | Key Files                                  |
| :--------------------------------- | :-------------------: | :-------------------------------------------------------------------------------------------------------- | :----------------------------------------- |
| **Dual Role Authentication**       | ✅ COMPLETED           | Toggle between Seller (Terracotta `#6B3A2A`) and Buyer (Royal Violet `#5B21B6`) with persistent sessions. | `OnboardingScreen.tsx`, `App.tsx`          |
| **Dual Camera/Gallery Capture**    | ✅ COMPLETED           | Separate inputs for direct hardware camera (`capture="environment"`) and gallery photo picker.            | `App.tsx`                                  |
| **Vernacular Voice Transcription** | ✅ COMPLETED           | Continuous Web Speech transcription adapting dynamically to selected regional language.                   | `App.tsx`, `LanguageContext.tsx`           |
| **Cloudinary Image Optimization**  | ✅ COMPLETED           | Unsigned preset upload returning optimized URLs (`e_improve,q_auto,f_auto`).                              | `App.tsx`                                  |
| **Gemini 3.5 Multimodal Analysis** | ✅ COMPLETED           | Direct REST `v1beta` payload generating titles, storytelling copy, highlights, and specs.                 | `App.tsx`                                  |
| **Dynamic Category-Aware Pricing** | ✅ COMPLETED           | Automatic fair pricing bounds (Pottery: ₹149–₹249, Paintings: ₹249–₹399, Puppets: ₹299–₹449).             | `App.tsx`                                  |
| **Interactive Pricing Popup**      | ✅ COMPLETED           | Allows artisan to choose between AI auto-pricing or manual price input.                                   | `App.tsx`                                  |
| **Vernacular Logout Confirmation** | ✅ COMPLETED           | Confirmation popup (*"क्या आप बाहर निकलना चाहते हैं?"*) preventing accidental session loss.               | `App.tsx`                                  |
| **Listing Preview Screen**         | ✅ COMPLETED           | Shows hero photo card, bilingual tabs, heritage story, highlights, and specs table.                       | `CatalogPreview.tsx`                       |
| **Inventory De-duplication**       | ✅ COMPLETED           | `deduplicateInventory()` automatically merges items sharing identical image or title.                     | `App.tsx`                                  |
| **Artisan Storefront Dashboard**   | ✅ COMPLETED           | 2-column inventory grid with `+` / `-` stock counters, delete button, and ONDC badge.                     | `ArtisanDashboard.tsx`                     |
| **Direct Payout Ledger**           | ✅ COMPLETED           | 85% Jan Dhan DBT, 10% India Post, 5% ONDC fee breakdown matching total gross sales.                       | `ArtisanDashboard.tsx`                     |
| **KalaPramaan GI Certificate**     | ✅ COMPLETED           | Provenance certificate modal with mock QR verification for GI-tagged crafts.                              | `ArtisanDashboard.tsx`                     |
| **ONDC Buyer Feed & App Mock**     | ✅ COMPLETED           | PhonePe Pincode / Paytm ONDC mock UI with platform switcher and address management.                       | `OndcBuyerScreen.tsx`                      |
| **Full Product Description Modal** | ✅ COMPLETED           | Displays large image, heritage storytelling card, highlight bullets, and specs table.                     | `OndcBuyerScreen.tsx`                      |
| **Strict Stock Clamping**          | ✅ COMPLETED           | Quantity selector clamped to real available stock (`availableToAdd = sellerStock - inCartQty`).           | `OndcBuyerScreen.tsx`                      |
| **Empty Cart Safeguard**           | ✅ COMPLETED           | Empty cart renders a dedicated zero-state with ₹0 delivery fee; disables checkout.                        | `OndcBuyerScreen.tsx`                      |
| **Two-Way Order & Ledger Sync**    | ✅ COMPLETED           | Buyer checkout decrements seller inventory stock and updates seller orders and earnings.                  | `App.tsx`, `OndcBuyerScreen.tsx`           |
| **Bilingual Fuzzy Search**         | ✅ COMPLETED           | Levenshtein-distance search supporting queries in English, Hindi, and Hinglish.                           | `fuzzySearch.ts`                           |
| **Beckn Protocol Engine**          | ✅ COMPLETED           | Implementation of ONDC `search`, `select`, `init`, and `confirm` transaction stages.                      | `becknEngine.ts`, `becknSchema.ts`         |
| **Multilingual UI (7 Languages)**  | ✅ COMPLETED           | Flipkart-style bottom sheet language picker supporting `hi`, `en`, `mr`, `bn`, `gu`, `ta`, `te`.          | `LanguageContext.tsx`, `LanguageModal.tsx` |
| **Fail-Safe i18n Context**         | ✅ COMPLETED           | Crash-proof fallback preventing React white-screen errors if context is unmounted.                        | `LanguageContext.tsx`, `main.tsx`          |
| **Automated Background Removal**   | ⚪ NOT STARTED         | AI-driven isolation of crafts photographed on cluttered workshop floors.                                  | `App.tsx`                                  |
| **Supabase Cloud Database Sync**   | 🟡 PARTIALLY COMPLETED | SQL schema defined; application currently operates on `localStorage`.                                     | `App.tsx`                                  |

6. UI/UX SPECIFICATIONS

Visual Design Systems (STRICTLY PRESERVED)

1. Seller & General App Theme (Terracotta / Earth)

  - Header / Status Bar: #6B3A2A
  - Primary Button Gradient: linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)
  - Text Colors: Deep Charcoal #3D1F0F (headings), Earth Brown #8B4513 and
    #9C6644 (subtitles/muted)
  - Backgrounds: #FFFBF7 (phone container), #EDE0D4 (outer viewport backdrop)
  - Borders / Accents: rgba(196, 136, 107, 0.35) to rgba(196, 136, 107, 0.65)

2. Buyer App Theme (Royal Violet / ONDC Node)

  - Header Gradient: linear-gradient(135deg, #5f259f 0%, #3b1466 100%) (PhonePe
    Pincode) or linear-gradient(135deg, #00b9f5 0%, #002970 100%) (Paytm ONDC)
  - Primary Buttons: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)
  - Backgrounds: #FAF5FF (container), #EDE9FE (outer viewport)
  - Borders / Accents: rgba(124, 58, 237, 0.35)

Typography

  - Devanagari Headings & Titles: 'Noto Serif', serif
  - Body, Numeric Displays, Badges & Pills: 'Poppins', sans-serif

User Journey & Navigation Rules

1.  Role Decoupling: The buyer flow and seller dashboard are completely
    isolated. A buyer clicking back returns to the buyer login, never into the
    artisan's private dashboard.
2.  Vernacular Confirmation: Tapping < on the product capture screen triggers a
    vernacular Hindi logout modal ("क्या आप बाहर निकलना चाहते हैं?").
3.  Empty States: Empty carts display a clean graphic with zero charges and a
    Start Shopping button.

7. API INTEGRATIONS

1. Google Gemini Multimodal API

  - Service Name: Google Generative Language REST v1beta
  - Endpoint:
    https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${VITE_GEMINI_KEY}
  - Method: POST
  - Headers: Content-Type: application/json
  - Request Payload:
    {
      "contents": [
        {
          "parts": [
            { "text": "<DETAILED_CATALOG_SYSTEM_PROMPT>" },
            {
              "inline_data": {
                "mime_type": "image/jpeg",
                "data": "<BASE64_ENCODED_IMAGE_STRING>"
              }
            }
          ]
        }
      ],
      "generationConfig": {
        "response_mime_type": "application/json"
      }
    }
  - Expected Output JSON:
    {
      "title_hi": "सटीक और आकर्षक हिंदी नाम",
      "title_en": "Evocative English craft name",
      "suggested_price": 249,
      "artisan_name": "कारीगर का नाम",
      "artisan_region": "शिल्प का प्रसिद्ध क्षेत्र व राज्य",
      "quick_summary_hi": "1 आकर्षक हुक लाइन।",
      "quick_summary_en": "1 crisp, enticing sentence hook.",
      "story_hi": "2-3 पंक्तियों में शिल्प की विरासत और निर्माण तकनीक...",
      "story_en": "2-3 evocative sentences describing heritage and craftsmanship...",
      "highlights_hi": ["खूबी 1", "खूबी 2", "खूबी 3"],
      "highlights_en": ["Feature 1", "Feature 2", "Feature 3"],
      "specs_hi": [{ "label": "कला / शिल्प", "value": "..." }],
      "specs_en": [{ "label": "Craft Form", "value": "..." }],
      "tags": ["Handmade", "Kalakriti", "ONDC Verified"]
    }
  - Error Handling: Wrapped in try/catch. If network fails or key is invalid,
    triggers the internal Dynamic Fallback using regex on user notes to generate
    complete data offline.
  - Environment Variable: VITE_GEMINI_KEY=<SECRET>

2. Cloudinary Image Optimization API

  - Service Name: Cloudinary Direct Upload REST API
  - Endpoint:
    https://api.cloudinary.com/v1_1/${VITE_CLOUDINARY_CLOUD_NAME}/image/upload
  - Method: POST
  - Request Payload: FormData containing file and upload_preset:
    VITE_CLOUDINARY_UPLOAD_PRESET.
  - URL Transformation:
    https://res.cloudinary.com/${cloudName}/image/upload/e_improve,q_auto,f_auto/${public_id}.${format}
  - Error Handling: Wrapped in try/catch. If upload fails, falls back gracefully
    to the local browser object URL (blob:).
  - Environment Variables:
      - VITE_CLOUDINARY_CLOUD_NAME=<SECRET>
      - VITE_CLOUDINARY_UPLOAD_PRESET=<SECRET>

3. HTML5 Web Speech API

  - Service Name: Browser-Native SpeechRecognition / webkitSpeechRecognition
  - Locale Synchronization: Dynamically bound to LanguageContext.speechLang:
      - Hindi: hi-IN
      - Marathi: mr-IN
      - Bengali: bn-IN
      - Gujarati: gu-IN
      - Tamil: ta-IN
      - Telugu: te-IN
      - English: en-IN
  - Error Handling: Silent timeout fallback after 1.2s simulation if microphone
    permission is denied or unsupported.

8. DATABASE & PERSISTENCE

The primary persistence layer is browser localStorage, with an offline-first
architecture that syncs state across tabs using
window.addEventListener("storage", ...) and window.addEventListener("focus",
...).

Data Schema (localStorage Keys)

1. kalakriti_inventory (Array of StoreItem)

interface StoreItem {
  id: string;                      // Unique ID (e.g. "seed-1" or timestamp string)
  title_hi: string;                // Vernacular Hindi Title
  title_en: string;                // English Title
  suggested_price: number;         // Price in INR
  quantity: number;                // Live Available Stock Count
  imageUrl: string;                // Cloudinary URL or local Blob URL
  artisan_name?: string;           // Maker's Name
  artisan_region?: string;         // Geographic Craft Origin (e.g. "जयपुर, राजस्थान")
  quick_summary_hi?: string;       // 1-sentence Hindi hook
  quick_summary_en?: string;       // 1-sentence English hook
  story_hi?: string;               // Deep cultural narrative (Hindi)
  story_en?: string;               // Deep cultural narrative (English)
  highlights_hi?: string[];        // Array of 3 bullet points (Hindi)
  highlights_en?: string[];        // Array of 3 bullet points (English)
  specs_hi?: Array<{ label: string; value: string }>;
  specs_en?: Array<{ label: string; value: string }>;
  tags?: string[];                 // Search and filter tags
  publishedAt?: string;            // Timestamp or vernacular date string ("आज")
  categoryName?: string;           // "Painting", "Pottery", "Weaving", etc.
}

2. kalakriti_orders (Array of OrderItem)

interface OrderItem {
  orderId: string;                 // e.g. "ONDC-8841"
  productTitle: string;            // Title of ordered item
  buyerCity: string;               // e.g. "बांद्रा वेस्ट, मुंबई (महाराष्ट्र)"
  buyerPlatform: string;           // "PhonePe Pincode" or "Paytm ONDC"
  amount: number;                  // Total order value in INR
  courier: string;                 // "India Post (डाक घर)" or "Delhivery"
  status: "Pending" | "Shipped" | "Delivered";
  orderDate: string;               // e.g. "आज, 2:15 PM"
}

3. kalakriti_cart (Array of CartItem)

interface CartItem {
  product: StoreItem;              // Product instance
  quantity: number;                // Quantity selected in cart
}

4. kalakriti_buyer_address (DeliveryAddress)

interface DeliveryAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

5. User Session Flags

  - artisan_logged_in: "true" | "false"
  - user_role: "seller" | "buyer"
  - kalakriti_language: "hi" | "en" | "mr" | "bn" | "gu" | "ta" | "te"

9. DEVELOPMENT HISTORY

| Change                                   | Why It Was Done                                                                              | Files Affected                                         | Result                                                                             | Status      |
| :--------------------------------------- | :------------------------------------------------------------------------------------------- | :----------------------------------------------------- | :--------------------------------------------------------------------------------- | :---------: |
| **Rebuilt Figma Export**                 | Raw HTML export had messy absolute positions and static images.                              | `App.tsx`, `index.css`                                 | Converted to responsive Tailwind CSS flex/grid layout.                             | IMPLEMENTED |
| **Eliminated `@google/genai` SDK**       | NPM package import caused fatal build and runtime crashes in Vite 8.                         | `App.tsx`                                              | Replaced with direct native `fetch()` calls to the v1beta endpoint.                | IMPLEMENTED |
| **Eliminated Multimodal Hallucinations** | Hardcoded Madhubani examples in schema caused clay pots to be identified as paintings.       | `App.tsx`                                              | Removed static examples; instructed model to inspect visual cues directly.         | IMPLEMENTED |
| **Dynamic Category-Aware Pricing**       | Products were priced statically at ₹150 or ₹750.                                             | `App.tsx`                                              | Dynamic pricing bounds: Pottery ₹149–₹249, Paintings ₹249–₹399.                    | IMPLEMENTED |
| **Decoupled Buyer Navigation**           | Buyer back button routed directly into the seller's private dashboard.                       | `App.tsx`, `OndcBuyerScreen.tsx`                       | Decoupled routing; buyer back button returns to the buyer login screen.            | IMPLEMENTED |
| **Camera & Gallery Split**               | Single generic file input didn't reliably launch the hardware camera on mobile.              | `App.tsx`                                              | Created `cameraInputRef` (`capture="environment"`) and `galleryInputRef`.          | IMPLEMENTED |
| **Pricing & Logout Modals**              | Artisans needed control over pricing and accidental exit protection.                         | `App.tsx`                                              | Added pricing popup modal and vernacular logout confirmation modal.                | IMPLEMENTED |
| **Hero Image in Preview**                | Product image was completely missing from `CatalogPreview.tsx`.                              | `CatalogPreview.tsx`                                   | Added hero image card with "AI सुधारी गई फोटो" and "ONDC Ready" badges.            | IMPLEMENTED |
| **Stock Clamping Fix**                   | `Math.min(product.quantity \|\| 10, ...)` allowed buyers to select 7 items when stock was 1. | `OndcBuyerScreen.tsx`                                  | Clamped quantity strictly to `availableToAdd = sellerStock - inCartQty`.           | IMPLEMENTED |
| **Inventory De-duplication**             | Re-uploading crafts with slightly different titles created duplicate cards in dashboard.     | `App.tsx`                                              | Added `deduplicateInventory()` to merge items with matching image or title.        | IMPLEMENTED |
| **Empty Cart ₹40 Delivery Bug**          | Opening an empty cart assessed a ₹40 courier charge.                                         | `OndcBuyerScreen.tsx`                                  | Added dedicated empty state with ₹0 delivery fee; disabled checkout.               | IMPLEMENTED |
| **Multilingual Engine (7 Languages)**    | Needed a Flipkart-style regional language system for rural artisans and urban shoppers.      | `LanguageContext.tsx`, `LanguageModal.tsx`, `main.tsx` | 7-language bottom sheet selector, synced Web Speech API locale.                    | IMPLEMENTED |
| **Fail-Safe i18n Context**               | App crashed to a white screen if `useLanguage()` was called without `LanguageProvider`.      | `LanguageContext.tsx`                                  | Replaced `throw new Error` with a graceful default fallback object.                | IMPLEMENTED |
| **Rich Storytelling Copy**               | One-line descriptions were bland and lacked cultural value.                                  | `App.tsx`, `CatalogPreview.tsx`, `OndcBuyerScreen.tsx` | Upgraded Gemini prompt to generate `story_hi`/`story_en` and 3x highlight bullets. | IMPLEMENTED |

10. IMPORTANT DECISIONS

1.  Direct Native REST fetch() over NPM SDKs:

      - Decision: Avoid external client SDKs (like @google/genai or
        @cloudinary/url-gen) for API calls.
      - Reason: Prevents bundler/Rollup incompatibilities with React 19 and
        Vite 8 during live hackathon demos.
      - Status: Active and enforced.

2.  Offline-First Resilience via localStorage:

      - Decision: Maintain localStorage as the source of truth, backed by mock
        seeds and fallback generators.
      - Reason: Ensures the app functions seamlessly even on weak mobile
        networks or during Wi-Fi outages at hackathon venues.
      - Status: Active and enforced.

3.  Strict Color Theme Separation:

      - Decision: Terracotta (#6B3A2A) for Seller; Royal Violet (#5B21B6) for
        Buyer.
      - Reason: Establishes visual role separation between rural artisans and
        urban consumers.
      - Status: Active and enforced.

4.  Zero External i18n Libraries:

      - Decision: Implement a custom typed React Context instead of heavy
        packages like i18next or react-intl.
      - Reason: Eliminates bundle bloat, ensures sub-millisecond language
        switching, and avoids React 19 peer-dependency conflicts.
      - Status: Active and enforced.

5.  Strict Stock Clamping Logic:

      - Decision: Buyer quantity selectors cannot exceed available seller stock
        (Math.min(availableToAdd, q + 1)).
      - Reason: Prevents overselling and stock synchronization bugs.
      - Status: Active and enforced.

11. REJECTED APPROACHES

| Approach                                       | Why It Was Rejected                                                                       | What We Use Instead                                                                                 |
| :--------------------------------------------- | :---------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Using `@google/genai` SDK**                  | Threw fatal bundling errors on Vite 8 and React 19.                                       | Native browser `fetch()` to `generativelanguage.googleapis.com/v1beta`.                             |
| **Figma Absolute CSS Exports**                 | Injected fixed `px` coordinates, breaking layouts on varying screen sizes.                | Tailwind CSS flexbox and grid layouts.                                                              |
| **Single Generic File Input**                  | Mobile browsers opened file menus instead of directly launching the camera.               | Dedicated camera button with `capture="environment"` alongside a gallery picker.                    |
| **Hardcoded Madhubani Schema Examples**        | Caused Gemini to hallucinate Madhubani details for clay pots and wooden crafts.           | Direct visual inspection prompts without hardcoded craft examples.                                  |
| **Throwing Unhandled Errors in `useLanguage`** | Caused a white-screen crash if the provider was temporarily disconnected.                 | Graceful fallback returning default Hindi values and no-op functions.                               |
| **Deleting Items on Decrement to 0**           | Decreasing quantity when stock was 1 deleted the item instead of marking it out of stock. | Decrementing stops at 0 ("स्टॉक समाप्त"); deletion requires clicking the explicit **हटाएं** button. |

12. BUGS AND PROBLEMS

1. Photo Enhancement & Background Removal (Current Problem)

  - Problem: Rural artisans photograph crafts in workshops with poor lighting
    and cluttered backgrounds (dirt floors, tools, uneven cloths). Cloudinary's
    current transformation (e_improve,q_auto,f_auto) brightens the image but
    does not isolate the subject.
  - Cause: Background removal requires a specialized AI pipeline (e.g.
    Cloudinary add-on, client-side WebAssembly, or a free-tier REST API).
  - Current Status: Under evaluation; user requested free photo enhancement and
    background removal APIs.

2. tsconfig.json Deprecation Warning

  - Problem: Terminal displays: Option 'baseUrl' is deprecated and will stop
    functioning in TypeScript 7.0.
  - Cause: Legacy baseUrl: "." in tsconfig.json.
  - Current Status: Non-breaking compiler warning.

13. CURRENT DEVELOPMENT STATE

  - Working:
      - Dual-role onboarding (Seller vs Buyer).
      - Direct camera launch via capture="environment" and gallery upload.
      - Continuous voice transcription with regional language adaptation.
      - Cloudinary upload with e_improve,q_auto,f_auto.
      - Gemini 3.5 Flash-Lite multimodal catalog generation (bilingual titles,
        cultural story, highlights, specs, market-tested pricing).
      - Dynamic category-aware pricing and interactive pricing modal.
      - Preview screen featuring hero photo, heritage story, and specs table.
      - Inventory de-duplication preventing duplicate listings.
      - Seller dashboard with real-time stock counters (+ / -), order tracking,
        and 85% Jan Dhan payout ledger.
      - ONDC buyer node with fuzzy search, full description modal, stock-clamped
        quantity selector, empty cart safeguard, and Beckn order execution.
      - 7-language multilingual navigation engine with Flipkart-style bottom
        sheet picker.
      - Real-time cross-tab synchronization between seller inventory and buyer
        feed.
  - Incomplete / Pending:
      - Automated background removal for craft photos.
      - Supabase cloud database integration (runs on localStorage).

14. EXACT NEXT TASK

  - Task: Evaluate and implement Free Photo Enhancement and Background Removal
    APIs.
  - Objective: Remove cluttered workshop backgrounds from craft photos and
    generate studio-quality, white/transparent product cutouts suitable for ONDC
    marketplace listings.
  - Candidate Approaches:
    1.  Client-Side In-Browser AI (@imgly/background-removal):
          - Pros: 100% free, runs locally via WebAssembly, requires zero API
            keys, no server costs, ideal for hackathon demos.
          - Cons: Requires downloading a ~20–30MB ONNX model on initial run.
    2.  Cloudinary AI Background Removal (e_background_removal):
          - Pros: Serverless URL transformation, no client overhead.
          - Cons: Requires a paid add-on or trial credits; may fail on free tier
            accounts.
    3.  Free-Tier REST APIs (e.g. HuggingFace RMBG-1.4 / remove.bg free tier):
          - Pros: High-quality studio cutouts via cloud processing.
          - Cons: Rate-limited (e.g. 50 free calls/month on remove.bg) and
            requires an API key.

15. IMPORTANT PROJECT RULES

1.  Do NOT modify visual themes: Preserve Terracotta Earth (#6B3A2A) for Seller
    and Royal Violet (#5B21B6) for Buyer.
2.  Do NOT import @google/genai: Use native fetch() calls to Gemini REST v1beta
    to avoid Vite bundling crashes.
3.  Do NOT remove localStorage persistence: Keep offline-first fallbacks active
    so the application works without an internet connection during
    presentations.
4.  Do NOT edit source files with macOS TextEdit: Use VS Code exclusively to
    prevent .rtf rich-text syntax corruption.
5.  Do NOT break role decoupling: Buyer workflows must stay separate from Seller
    workflows; buyers must never be routed to the artisan dashboard.
6.  Do NOT allow overselling: Quantity selectors must strictly clamp to
    available seller stock.
7.  Empty carts must NOT assess delivery fees: If cart count is 0, display the
    empty state with ₹0 fees and disable checkout progression.
8.  Keep the i18n hook fail-safe: useLanguage() must never throw an unhandled
    exception if the context provider is unmounted.

16. CONTEXT VS CURRENT CODE DIFFERENCES

| Area                    | Stated in Old Context                                            | Actual State in Codebase                                                                        | Reconciled Reality                                                        |
| :---------------------- | :--------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| **Cloud Database**      | Supabase integration described as active.                        | `localStorage` is used exclusively; `lib/supabase.ts` does not exist.                           | System runs completely offline-first on `localStorage`.                   |
| **Camera Trigger**      | Single file input previously used.                               | Two separate inputs: `cameraInputRef` (`capture="environment"`) and `galleryInputRef`.          | Camera button directly opens mobile hardware shutter.                     |
| **Product Description** | Described as a generic one-line summary.                         | Expanded to include `story_hi`/`story_en`, `highlights_hi`/`highlights_en`, and specs.          | Gemini generates rich cultural storytelling copy.                         |
| **Language Support**    | Mentioned as planned or bilingual only.                          | Fully implemented across 7 Indian languages with `LanguageModal.tsx` and `LanguageContext.tsx`. | Multilingual navigation is live and functioning.                          |
| **Beckn Inspector**     | "View Beckn JSON" button previously visible on buyer feed cards. | Button removed from feed cards per user request; Beckn engine runs during checkout.             | Feed cards are consumer-clean; Beckn execution occurs at order placement. |

17. MASTER PROJECT MEMORY

# KALAKRITI — MASTER PROJECT MEMORY SUMMARY

## 1. Identity & Purpose
- Name: Kalakriti (कलाकृति)
- Competition: Smart India Hackathon (SIH) 2025/2026
- Mission: Eliminate 30–40% middleman markups for rural Indian artisans by providing a vernacular, camera- and voice-driven cataloging interface that publishes directly to the ONDC Retail network (domain: nic2004:52110).

## 2. Design System & User Roles
- Seller Flow (ग्रामीण कारीगर):
  - Theme: Terracotta Earth (#6B3A2A, #8B4513, #FFFBF7, #EDE0D4)
  - Typography: 'Noto Serif' (headings), 'Poppins' (body/numbers)
  - Controls: Hardware camera trigger, regional voice input, stock counter (+ / -), 85% Jan Dhan DBT payout ledger.
- Buyer Flow (शहरी खरीदार):
  - Theme: Royal Violet (#5B21B6, #7C3AED, #5f259f, #FAF5FF)
  - Interface: Modeled after PhonePe Pincode and Paytm ONDC buyer apps
  - Controls: Fuzzy bilingual search, product details with heritage storytelling, stock-clamped quantity selector, empty cart safeguard.

## 3. Technology Architecture
- Frontend: React 19, TypeScript 5.9, Vite 8, Tailwind CSS v4.
- Persistence: Offline-first browser localStorage with live cross-tab storage/focus event listeners.
- AI: Google Gemini 3.5 Flash-Lite via direct REST v1beta fetch (no NPM SDKs).
- Image Service: Cloudinary unsigned preset upload with e_improve,q_auto,f_auto transformations.
- Multilingual: Custom React Context (LanguageContext) supporting 7 Indian languages (hi, en, mr, bn, gu, ta, te) with synchronized Web Speech locales.
- Protocols: Beckn Protocol ONDC Retail Specification (nic2004:52110).

## 4. Key Storage Keys
- kalakriti_inventory: StoreItem[]
- kalakriti_orders: OrderItem[]
- kalakriti_buyer_orders: ConfirmedOrder[]
- kalakriti_cart: CartItem[]
- kalakriti_buyer_address: DeliveryAddress
- kalakriti_language: LanguageCode (hi, en, mr, bn, gu, ta, te)
- artisan_logged_in: "true" | "false"
- user_role: "seller" | "buyer"

## 5. Critical Technical Constraints
1. Preserve color themes: Terracotta (#6B3A2A) for Seller; Royal Violet (#5B21B6) for Buyer.
2. Use native fetch() for Gemini REST calls; do not import @google/genai.
3. Keep localStorage persistence active as an offline fallback.
4. Edit code exclusively in VS Code; avoid macOS TextEdit to prevent .rtf corruption.
5. Keep buyer and seller workflows completely decoupled.
6. Enforce strict stock limits in buyer quantity selectors.
7. Empty carts must display zero fees and prevent checkout progression.
8. Maintain fail-safe fallbacks in useLanguage() to prevent white-screen crashes.

MASTER PROJECT MEMORY COMPLETE
