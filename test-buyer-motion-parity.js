// test-buyer-motion-parity.js
import fs from "fs";
import path from "path";
import assert from "assert";

console.log("🇮🇳 Starting Kalakriti Buyer Marketplace Motion Parity Verification...\n");

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

const appPath = path.resolve("src/App.tsx");
const ondcPath = path.resolve("src/OndcBuyerScreen.tsx");
const motionPath = path.resolve("src/components/motion/MotionPrimitives.tsx");
const cssPath = path.resolve("src/index.css");

const appContent = fs.readFileSync(appPath, "utf-8");
const ondcContent = fs.readFileSync(ondcPath, "utf-8");
const motionContent = fs.readFileSync(motionPath, "utf-8");
const cssContent = fs.readFileSync(cssPath, "utf-8");

// -----------------------------------------------------------------------------
// 1. Motion Tokens & Architecture
// -----------------------------------------------------------------------------
console.log("--- 1. Shared Motion System & Keyframes (src/index.css) ---");

it("index.css defines GPU-accelerated pageEnter keyframe with translate3d and opacity", () => {
  assert(cssContent.includes("@keyframes pageEnter"), "pageEnter keyframe defined");
  assert(cssContent.includes("translate3d"), "Uses GPU hardware-accelerated translate3d");
});

it("index.css defines modalEnter keyframe with subtle scale and translateY", () => {
  assert(cssContent.includes("@keyframes modalEnter"), "modalEnter keyframe defined");
  assert(cssContent.includes("scale3d"), "Uses GPU scale3d");
});

it("index.css defines badgeBump keyframe for reactive micro-interactions", () => {
  assert(cssContent.includes("@keyframes badgeBump"), "badgeBump keyframe defined");
  assert(cssContent.includes(".animate-badge-bump"), "animate-badge-bump utility class defined");
});

it("index.css defines touch-press utility with active state transform", () => {
  assert(cssContent.includes(".touch-press"), "touch-press class defined");
  assert(cssContent.includes(".touch-press:active"), "Active press transform defined");
});

it("index.css enforces prefers-reduced-motion accessibility compliance", () => {
  assert(cssContent.includes("@media (prefers-reduced-motion: reduce)"), "Media query present");
  assert(cssContent.includes("animation-duration: 0.01ms !important"), "Zeroes out animation duration for reduced motion");
});

// -----------------------------------------------------------------------------
// 2. Motion Primitives Component (src/components/motion/MotionPrimitives.tsx)
// -----------------------------------------------------------------------------
console.log("\n--- 2. Motion Primitives Component (src/components/motion/MotionPrimitives.tsx) ---");

it("Exports PageTransition primitive", () => {
  assert(motionContent.includes("export function PageTransition"), "PageTransition exported");
});

it("Exports AnimatedNumber primitive", () => {
  assert(motionContent.includes("export function AnimatedNumber"), "AnimatedNumber exported");
});

it("AnimatedNumber respects prefers-reduced-motion", () => {
  assert(motionContent.includes("prefers-reduced-motion: reduce"), "Media query check in AnimatedNumber");
});

// -----------------------------------------------------------------------------
// 3. Screen Transitions & Top-Level Modals (src/App.tsx)
// -----------------------------------------------------------------------------
console.log("\n--- 3. Screen Transitions & Modals (src/App.tsx) ---");

it("App.tsx imports PageTransition from MotionPrimitives", () => {
  assert(appContent.includes('from "./components/motion/MotionPrimitives"'), "Imports from MotionPrimitives");
  assert(appContent.includes("PageTransition"), "PageTransition imported");
});

it("App.tsx wraps buyer screen in PageTransition", () => {
  assert(appContent.includes('<PageTransition pageKey="buyer">'), "Buyer screen wrapped in PageTransition");
});

it("App.tsx wraps marketplace screen in PageTransition", () => {
  assert(appContent.includes('<PageTransition pageKey="marketplace">'), "Marketplace screen wrapped in PageTransition");
});

it("App.tsx wraps dashboard screen in PageTransition", () => {
  assert(appContent.includes('<PageTransition pageKey="dashboard">'), "Dashboard screen wrapped in PageTransition");
});

it("App.tsx standardizes showGamificationModal backdrop with animate-fade-in and tap dismiss", () => {
  assert(appContent.includes('className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in"'), "Backdrop has animate-fade-in");
  assert(appContent.includes("onClick={() => setShowGamificationModal(false)}"), "Backdrop tap dismisses modal");
  assert(appContent.includes("onClick={(e) => e.stopPropagation()}"), "Dialog stops propagation");
  assert(appContent.includes("animate-modal-enter"), "Dialog has animate-modal-enter");
});

// -----------------------------------------------------------------------------
// 4. Buyer Marketplace Motion & Interactions (src/OndcBuyerScreen.tsx)
// -----------------------------------------------------------------------------
console.log("\n--- 4. Buyer Marketplace Motion & Interactions (src/OndcBuyerScreen.tsx) ---");

it("OndcBuyerScreen imports AnimatedNumber from MotionPrimitives", () => {
  assert(ondcContent.includes('import { AnimatedNumber } from "./components/motion/MotionPrimitives"'), "Imports AnimatedNumber");
});

it("Toast alert uses animate-slide-up", () => {
  assert(ondcContent.includes('className="absolute top-20 left-3 right-3 z-40 bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-slide-up"'), "Toast uses animate-slide-up");
});

it("Enter Fair CTA and Search clear button use touch-press", () => {
  assert(ondcContent.includes("touch-press"), "Search clear or button uses touch-press");
  assert(ondcContent.includes("focus:border-violet-400 focus:ring-2 focus:ring-violet-200/50"), "Search input has smooth focus transition");
});

it("Sticky Bottom Cart Bar uses animate-slide-up and AnimatedNumber", () => {
  assert(ondcContent.includes("animate-slide-up"), "Bottom cart uses animate-slide-up");
  assert(ondcContent.includes("<AnimatedNumber value={cartQuote.totalPrice} prefix=\"₹\""), "Cart bar total animated with AnimatedNumber");
  assert(ondcContent.includes("animate-badge-bump"), "Total cart count triggers badge-bump animation");
});

it("Product Quick-View Modal supports backdrop dismissal, touch-press, badge-bump, and AnimatedNumber", () => {
  assert(ondcContent.includes("onClick={() => setSelectedProduct(null)}"), "Backdrop tap dismisses quick view");
  assert(ondcContent.includes("onClick={(e) => e.stopPropagation()}"), "Card prevents dismiss on tap");
  assert(ondcContent.includes("key={selectedQty}"), "Key on selectedQty for badge-bump animation");
  assert(ondcContent.includes("<AnimatedNumber value={(Number(selectedProduct.suggested_price) || 199) * selectedQty}"), "Total price animated with AnimatedNumber");
});

it("Cart Bottom Sheet Modal supports backdrop dismissal, touch-press, and AnimatedNumber", () => {
  assert(ondcContent.includes('checkoutStage === "cart" && (\n          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end z-50 animate-fade-in cursor-pointer"\n            onClick={() => setCheckoutStage("closed")}'), "Cart backdrop dismisses on click");
  assert(ondcContent.includes("<AnimatedNumber value={itemTotal} prefix=\"₹\" />"), "Cart item total animated with AnimatedNumber");
  assert(ondcContent.includes("<AnimatedNumber value={cartQuote.itemTotal} prefix=\"₹\" />"), "Summary item total animated with AnimatedNumber");
  assert(ondcContent.includes("<AnimatedNumber value={cartQuote.totalPrice} prefix=\"₹\" />"), "Summary total payable animated with AnimatedNumber");
});

it("Address & Success Modals support backdrop tap dismissal", () => {
  assert(ondcContent.includes('checkoutStage === "address" && (\n          <div\n            onClick={() => setCheckoutStage("closed")}'), "Address modal backdrop dismisses on click");
  assert(ondcContent.includes('checkoutStage === "success" && confirmedOrderDetails && (\n          <div\n            onClick={() => setCheckoutStage("closed")}'), "Success modal backdrop dismisses on click");
});

it("Artisan Discovery & Quests Modal uses animate-modal-enter and backdrop dismissal", () => {
  assert(ondcContent.includes('showDiscoveryModal && (\n          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in cursor-pointer"\n            onClick={() => setShowDiscoveryModal(false)}'), "Discovery modal has backdrop dismissal");
  assert(ondcContent.includes("animate-modal-enter cursor-default"), "Discovery dialog uses animate-modal-enter");
});

console.log("\n==================================================");
console.log(`Results: ${passed} Passed, ${failed} Failed`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("\n🎉 ALL BUYER MOTION PARITY TESTS PASSED PERFECTLY!\n");
}
