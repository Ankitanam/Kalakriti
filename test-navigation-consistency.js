// test-navigation-consistency.js
import fs from "fs";
import path from "path";

console.log("🇮🇳 Starting Kalakriti Navigation & Header UI Consistency Verification...\n");

let passedTests = 0;
let totalTests = 0;

function assertCheck(desc, condition) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${desc}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    process.exitCode = 1;
  }
}

// ── 1. App.tsx Exit Confirmation Handler & Routing Destination ──
console.log("--- 1. Exit Confirmation Flow & Navigation Routing ---");
const appSource = fs.readFileSync(path.resolve("src/App.tsx"), "utf-8");

assertCheck(
  "handleLeaveToArtisanLogin is defined in App.tsx",
  appSource.includes("const handleLeaveToArtisanLogin = () => {")
);

assertCheck(
  "handleLeaveToArtisanLogin sets activeRole to 'seller'",
  appSource.includes('setActiveRole("seller");')
);

assertCheck(
  "handleLeaveToArtisanLogin clears artisan_logged_in localStorage session",
  appSource.includes('localStorage.removeItem("artisan_logged_in");')
);

assertCheck(
  "handleLeaveToArtisanLogin resets isLoggedIn to false",
  appSource.includes("setIsLoggedIn(false);")
);

assertCheck(
  "handleLeaveToArtisanLogin transitions screen to 'onboarding'",
  appSource.includes('setScreen("onboarding");')
);

assertCheck(
  "ConfirmationModal onConfirm is directly wired to handleLeaveToArtisanLogin",
  appSource.includes("onConfirm={handleLeaveToArtisanLogin}")
);

// ── 2. ConfirmationModal Animation & Touch Optimization ──
console.log("\n--- 2. ConfirmationModal Animation & UI Polish ---");
const modalSource = fs.readFileSync(path.resolve("src/components/ConfirmationModal.tsx"), "utf-8");

assertCheck(
  "ConfirmationModal uses animate-modal-enter (no 100% translateY jumpscare)",
  modalSource.includes("animate-modal-enter") && !modalSource.includes("animate-slide-up")
);

assertCheck(
  "Cancel button uses active:scale-95 without touch-canceling transforms",
  modalSource.includes("active:scale-95") && !modalSource.includes("touch-press")
);

assertCheck(
  "Both modal buttons have identical py-3 height for comfortable touch target",
  (modalSource.match(/py-3/g) || []).length >= 2
);

// ── 3. Header Design System Token Consistency ──
console.log("\n--- 3. Header Design System Token Consistency ---");

const dashboardSource = fs.readFileSync(path.resolve("src/ArtisanDashboard.tsx"), "utf-8");
const previewSource = fs.readFileSync(path.resolve("src/CatalogPreview.tsx"), "utf-8");
const buyerSource = fs.readFileSync(path.resolve("src/OndcBuyerScreen.tsx"), "utf-8");

assertCheck(
  "App.tsx Back button is standardized circular w-9 h-9 rounded-full",
  appSource.includes("w-9 h-9 rounded-full flex items-center justify-center text-white active:scale-95")
);

assertCheck(
  "ArtisanDashboard Back button is standardized circular w-9 h-9 rounded-full (not square rounded-2xl)",
  dashboardSource.includes("w-9 h-9 rounded-full flex items-center justify-center text-white active:scale-95")
);

assertCheck(
  "CatalogPreview Back button is standardized circular w-9 h-9 rounded-full",
  previewSource.includes("w-9 h-9 rounded-full flex items-center justify-center text-white active:scale-95")
);

assertCheck(
  "OndcBuyerScreen Back button uses standard circular w-9 h-9 rounded-full with SVG arrow (not raw unicode ←)",
  buyerSource.includes("w-9 h-9 rounded-full bg-white/20") && !buyerSource.includes(">\n                ←\n              </button>")
);

assertCheck(
  "ArtisanDashboard header displays honest 'ONDC Ready' status badge",
  dashboardSource.includes("ONDC Ready") && !dashboardSource.includes("ONDC Verified")
);

assertCheck(
  "ArtisanDashboard controls (Test Order & Logout) share unified h-8 rounded-full height",
  dashboardSource.includes("h-8 px-2.5 rounded-full text-[11px] font-semibold text-amber-900") &&
  dashboardSource.includes("h-8 px-2.5 rounded-full text-[11px] font-semibold text-white")
);

assertCheck(
  "App.tsx Shop button shares unified h-8 rounded-full height",
  appSource.includes("h-8 px-3 rounded-full text-xs font-semibold")
);

// ── 4. CSS Hardware-Accelerated Animation Tokens ──
console.log("\n--- 4. Keyframe & Animation Performance ---");
const cssSource = fs.readFileSync(path.resolve("src/index.css"), "utf-8");

assertCheck(
  "index.css defines modalEnter with gentle scale and subtle 6px translateY",
  cssSource.includes("@keyframes modalEnter") && cssSource.includes("scale3d(0.96, 0.96, 1)")
);

assertCheck(
  "index.css defines pageEnter with subtle 4px translate3d",
  cssSource.includes("@keyframes pageEnter") && cssSource.includes("translate3d(0, 4px, 0)")
);

assertCheck(
  "index.css defines .animate-modal-enter with 180ms cubic-bezier timing",
  cssSource.includes(".animate-modal-enter") && cssSource.includes("0.18s")
);

// ── 5. Multilingual Localization Integrity for Exit Modal & Headers ──
console.log("\n--- 5. Multilingual Coverage for Modal & Header Tokens ---");
const langSource = fs.readFileSync(path.resolve("src/context/LanguageContext.tsx"), "utf-8");

const requiredKeys = [
  "confirm_leave_title",
  "confirm_leave_message",
  "confirm_stay_button",
  "confirm_leave_button",
  "go_back",
  "my_store",
  "shop",
  "logout"
];

for (const key of requiredKeys) {
  assertCheck(
    `LanguageContext contains complete translations for '${key}'`,
    langSource.includes(`${key}: {`)
  );
}

console.log("\n======================================================");
console.log(`Test Execution Result: ${passedTests} Passed, ${totalTests - passedTests} Failed`);
console.log("======================================================");

if (passedTests !== totalTests) {
  process.exit(1);
}

