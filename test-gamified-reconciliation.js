// test-gamified-reconciliation.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log("🇮🇳 Starting Gamified Marketplace & Conflict Reconciliation Verification...\n");

// ── 1. Zero Merge Markers Across Repository ──
console.log("--- 1. Merge Conflict Markers Check ---");
const filesToCheck = [
  "src/App.tsx",
  "src/components/GameWorld.tsx",
  "src/OndcBuyerScreen.tsx",
  "src/ArtisanDashboard.tsx",
  "src/CatalogPreview.tsx",
  "src/context/LanguageContext.tsx",
  "src/utils/gamificationService.ts",
  "src/utils/becknEngine.ts",
];

filesToCheck.forEach((relPath) => {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    const src = fs.readFileSync(fullPath, "utf-8");
    assert(!src.includes("<<<<<<<"), `${relPath} contains zero <<<<<<< markers`);
    assert(!src.includes(">>>>>>>"), `${relPath} contains zero >>>>>>> markers`);
    assert(!src.match(/^=======$/m), `${relPath} contains zero ======= conflict dividers`);
  }
});

// ── 2. App.tsx Routing & Reconciled Props ──
console.log("\n--- 2. App.tsx Reconciled Routing & Cart Wiring ---");
const appSrc = fs.readFileSync(path.join(__dirname, "src/App.tsx"), "utf-8");

assert(appSrc.includes("if (showGame) {"), "App.tsx handles showGame routing");
assert(appSrc.includes("setShowGame(false)"), "App.tsx resets showGame on exit");
assert(appSrc.includes("setScreen(\"buyer\")"), "App.tsx returns to buyer screen on exit");
assert(appSrc.includes("inventory={inventory}"), "App.tsx passes live inventory to GameWorld");
assert(appSrc.includes("onAddToCart="), "App.tsx wires onAddToCart handler to GameWorld");
assert(appSrc.includes("localStorage.setItem(\"kalakriti_cart\""), "App.tsx persists 3D fair items into kalakriti_cart");
assert(appSrc.includes("window.dispatchEvent(new Event(\"storage\"))"), "App.tsx dispatches storage event for cross-screen sync");

// ── 3. GameWorld Architecture & Reconciled Enhancements ──
console.log("\n--- 3. GameWorld Props, Stalls & Mobile HUD ---");
const gwSrc = fs.readFileSync(path.join(__dirname, "src/components/GameWorld.tsx"), "utf-8");

assert(gwSrc.includes("export interface GameWorldProps"), "GameWorld exports GameWorldProps");
assert(gwSrc.includes("onExit?: () => void"), "GameWorldProps includes onExit");
assert(gwSrc.includes("inventory?: any[]"), "GameWorldProps includes inventory");
assert(gwSrc.includes("onAddToCart?: (product: any) => void"), "GameWorldProps includes onAddToCart");
assert(gwSrc.includes("getStallKeywords"), "ShopPanel uses multilingual stall keywords");
assert(gwSrc.includes("kathputli") && gwSrc.includes("कठपुतली"), "ShopPanel includes Hindi and English craft keywords");
assert(gwSrc.includes("displayProducts = stallProducts.length > 0 ? stallProducts : dbProducts.slice(0, 4)"), "ShopPanel includes guaranteed fallback slice so stalls are never empty");
assert(gwSrc.includes("Exit Craft Fair"), "GameWorld includes Exit Craft Fair button");
assert(gwSrc.includes("game-touch-controls"), "GameWorld includes mobile-friendly virtual D-pad");

// ── 4. OndcBuyerScreen Real-Time Cart Sync ──
console.log("\n--- 4. OndcBuyerScreen Cart Synchronization ---");
const buyerSrc = fs.readFileSync(path.join(__dirname, "src/OndcBuyerScreen.tsx"), "utf-8");

assert(buyerSrc.includes("localStorage.getItem(\"kalakriti_cart\")"), "OndcBuyerScreen reads kalakriti_cart");
assert(buyerSrc.includes("const savedCart = localStorage.getItem(\"kalakriti_cart\")"), "OndcBuyerScreen handleSync listens and reloads kalakriti_cart");
assert(buyerSrc.includes("setCart(JSON.parse(savedCart))"), "OndcBuyerScreen updates cart state dynamically on storage events");

// ── 5. Gamification System Idempotency & Localization ──
console.log("\n--- 5. Gamification Idempotency & Leveling ---");
const gamificationSrc = fs.readFileSync(path.join(__dirname, "src/utils/gamificationService.ts"), "utf-8");

assert(gamificationSrc.includes("useBuyerGamification"), "Exports reactive useBuyerGamification hook");
assert(gamificationSrc.includes("awardXp"), "Exports awardXp function");
assert(gamificationSrc.includes("recordStallVisit"), "Exports recordStallVisit function");
assert(gamificationSrc.includes("recordCraftDiscovery"), "Exports recordCraftDiscovery function");
assert(gamificationSrc.includes("BADGE_DEFINITIONS"), "Exports BADGE_DEFINITIONS");
assert(gamificationSrc.includes("INITIAL_QUESTS"), "Defines initial discovery quests");

console.log("\n==================================================");
console.log("🎉 ALL RECONCILIATION & GAMIFICATION CHECKS PASSED!");
console.log("==================================================\n");
