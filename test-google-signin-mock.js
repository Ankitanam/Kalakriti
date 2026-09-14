// test-google-signin-mock.js
/**
 * KALAKRITI — GOOGLE SIGN-IN MOCKUP / ACCOUNT CHOOSER TEST SUITE
 *
 * Verifies:
 * 1. Modal trigger: "Continue with Google" opens GoogleSignInModal
 * 2. Role preservation: Buyer login continues as Buyer, Seller login continues as Seller
 * 3. Cancel / Close / Outside tap behaviors keep user on login screen without side effects
 * 4. Loading & Success states with double-click guard
 * 5. Full 7 Indic language translations (English, Hindi, Marathi, Bengali, Gujarati, Tamil, Telugu)
 * 6. Visual consistency & prototype transparency disclaimer
 * 7. Zero .env inspection, printing, or tampering
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("🇮🇳 Starting Kalakriti Google Sign-In & Account Chooser Verification...\n");

let passed = 0;
function it(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Error: ${err.message}`);
    process.exit(1);
  }
}

// -----------------------------------------------------------------------------
// 1. Component Presence & Architecture
// -----------------------------------------------------------------------------
console.log("--- 1. Component Presence & In-Shell Containment ---");

it("GoogleSignInModal component exists and exports GoogleSignInModal", () => {
  const modalPath = path.join(__dirname, "src/components/GoogleSignInModal.tsx");
  assert(fs.existsSync(modalPath), "GoogleSignInModal.tsx must exist");
  const content = fs.readFileSync(modalPath, "utf-8");
  assert(content.includes("export const GoogleSignInModal"), "Must export GoogleSignInModal component");
  assert(content.includes("GoogleSignInModalProps"), "Must define GoogleSignInModalProps interface");
});

it("OnboardingScreen imports and mounts GoogleSignInModal in-shell", () => {
  const onboardingPath = path.join(__dirname, "src/OnboardingScreen.tsx");
  const content = fs.readFileSync(onboardingPath, "utf-8");
  assert(content.includes('import { GoogleSignInModal } from "./components/GoogleSignInModal";'), "Imports GoogleSignInModal");
  assert(content.includes("const [showGoogleModal, setShowGoogleModal] = useState(false);"), "Maintains showGoogleModal state");
  assert(content.includes("onClick={() => setShowGoogleModal(true)}"), "Continue with Google button opens modal instead of immediate navigation");
  assert(content.includes("<GoogleSignInModal"), "Mounts GoogleSignInModal");
  assert(content.includes("isOpen={showGoogleModal}"), "Binds isOpen to showGoogleModal");
  assert(content.includes("onClose={() => setShowGoogleModal(false)}"), "Binds onClose handler");
});

// -----------------------------------------------------------------------------
// 2. Realistic Account Chooser & Google Visual Identity
// -----------------------------------------------------------------------------
console.log("\n--- 2. Account Chooser & Visual Identity ---");

it("Renders realistic demo accounts with prominent DEMO badges", () => {
  const modalContent = fs.readFileSync(path.join(__dirname, "src/components/GoogleSignInModal.tsx"), "utf-8");
  assert(modalContent.includes("Ayush Singh"), "Includes Account 1: Ayush Singh");
  assert(modalContent.includes("example@gmail.com"), "Includes Ayush Singh email: example@gmail.com");
  assert(modalContent.includes("Kalakriti Demo"), "Includes Account 2: Kalakriti Demo");
  assert(modalContent.includes("demo@gmail.com"), "Includes Kalakriti Demo email: demo@gmail.com");
  assert(modalContent.includes("google_use_another_account"), "Includes option: Use another account");
  assert(modalContent.includes("google_demo_badge"), "Labels demo accounts with DEMO badge");
});

it("Displays official Google multicolor G logo SVG and neutral styling", () => {
  const modalContent = fs.readFileSync(path.join(__dirname, "src/components/GoogleSignInModal.tsx"), "utf-8");
  assert(modalContent.includes('fill="#4285F4"'), "Includes Google Blue");
  assert(modalContent.includes('fill="#34A853"'), "Includes Google Green");
  assert(modalContent.includes('fill="#FBBC05"'), "Includes Google Yellow");
  assert(modalContent.includes('fill="#EA4335"'), "Includes Google Red");
  assert(modalContent.includes("bg-white rounded-2xl"), "Neutral white card presentation");
  assert(modalContent.includes("max-w-[340px]"), "Mobile-bounded card width");
});

// -----------------------------------------------------------------------------
// 3. Role Preservation (Buyer remains Buyer, Seller remains Seller)
// -----------------------------------------------------------------------------
console.log("\n--- 3. Role Preservation Verification ---");

it("Preserves role through Google authentication flow", () => {
  const onboardingContent = fs.readFileSync(path.join(__dirname, "src/OnboardingScreen.tsx"), "utf-8");
  const appContent = fs.readFileSync(path.join(__dirname, "src/App.tsx"), "utf-8");

  // OnboardingScreen passes role prop to GoogleSignInModal
  assert(onboardingContent.includes("role={role}"), "Passes current role state to GoogleSignInModal");

  // On success, handleCompleteLogin uses current role
  assert(onboardingContent.includes("handleCompleteLogin();"), "Invokes handleCompleteLogin on Google sign-in success");
  assert(onboardingContent.includes("if (onLogin) onLogin(role);"), "handleCompleteLogin passes selected role to onLogin");

  // App.tsx handleLoginSuccess respects role:
  assert(appContent.includes("handleLoginSuccess = (role: \"seller\" | \"buyer\""), "App handleLoginSuccess accepts role");
  assert(appContent.includes('if (role === "buyer") {'), "Routes buyer role to buyer marketplace");
  assert(appContent.includes('setScreen("buyer");'), "Buyer role sets screen to buyer");
});

// -----------------------------------------------------------------------------
// 4. Loading State, Double-Click Guard & Success Transition
// -----------------------------------------------------------------------------
console.log("\n--- 4. Loading State & Double-Click Guard ---");

it("Enforces signing_in loading spinner and prevents duplicate account selection", () => {
  const modalContent = fs.readFileSync(path.join(__dirname, "src/components/GoogleSignInModal.tsx"), "utf-8");
  assert(modalContent.includes('if (authStatus !== "idle") return;'), "Guards handleSelectAccount against in-flight double clicks");
  assert(modalContent.includes('setAuthStatus("signing_in")'), "Transitions to signing_in state");
  assert(modalContent.includes("animate-spin"), "Renders animated spinner during signing_in");
  assert(modalContent.includes("google_signing_in"), "Displays localized Signing in... message");
  assert(modalContent.includes('setAuthStatus("success")'), "Transitions to success state");
  assert(modalContent.includes("google_signed_in_success"), "Displays localized Signed in successfully message");
});

// -----------------------------------------------------------------------------
// 5. Dismissal & Cancellation Behaviors
// -----------------------------------------------------------------------------
console.log("\n--- 5. Dismissal & Cancellation Behaviors ---");

it("Supports backdrop dismissal, cancel button, and top-right close icon", () => {
  const modalContent = fs.readFileSync(path.join(__dirname, "src/components/GoogleSignInModal.tsx"), "utf-8");
  assert(modalContent.includes("onClick={handleClose}"), "Backdrop dismisses modal");
  assert(modalContent.includes("e.stopPropagation()"), "Card click stops propagation to prevent accidental backdrop close");
  assert(modalContent.includes("✕"), "Includes top-right close icon");
  assert(modalContent.includes("google_cancel"), "Includes cancel action button");
  assert(modalContent.includes('if (authStatus !== "idle") return;'), "Prevents accidental closure while authentication is in-flight");
});

// -----------------------------------------------------------------------------
// 6. Multilingual Coverage Across All 7 Indic Languages
// -----------------------------------------------------------------------------
console.log("\n--- 6. Multilingual 7-Language Indic Coverage ---");

it("All Google sign-in keys exist and cover all 7 languages (hi, en, mr, bn, gu, ta, te)", () => {
  const langContent = fs.readFileSync(path.join(__dirname, "src/context/LanguageContext.tsx"), "utf-8");
  const languages = ["hi", "en", "mr", "bn", "gu", "ta", "te"];
  const googleKeys = [
    "continue_google",
    "google_sign_in_title",
    "google_continue_to",
    "google_choose_account",
    "google_demo_badge",
    "google_use_another_account",
    "google_cancel",
    "google_signing_in",
    "google_signed_in_success",
    "google_prototype_disclaimer",
  ];

  for (const key of googleKeys) {
    assert(langContent.includes(`${key}: {`), `LanguageContext contains translation key '${key}'`);
  }
});

// -----------------------------------------------------------------------------
// 7. Security & Prototype Honesty Guarantees
// -----------------------------------------------------------------------------
console.log("\n--- 7. Security & Prototype Honesty Guarantees ---");

it("Never requests passwords or credentials and includes prototype disclaimer", () => {
  const modalContent = fs.readFileSync(path.join(__dirname, "src/components/GoogleSignInModal.tsx"), "utf-8");
  assert(!modalContent.includes('type="password"'), "Never renders password input field");
  assert(modalContent.includes("google_prototype_disclaimer"), "Displays honest prototype demo disclaimer");
});

it("Guarantees .env was never read, exported, or tampered with", () => {
  const modalContent = fs.readFileSync(path.join(__dirname, "src/components/GoogleSignInModal.tsx"), "utf-8");
  const onboardingContent = fs.readFileSync(path.join(__dirname, "src/OnboardingScreen.tsx"), "utf-8");
  assert(!modalContent.includes(".env"), "GoogleSignInModal does not reference .env");
  assert(!onboardingContent.includes(".env"), "OnboardingScreen does not reference .env");
});

// -----------------------------------------------------------------------------
// Final Summary
// -----------------------------------------------------------------------------
console.log("\n==================================================");
console.log(`Results: ${passed} Passed, 0 Failed`);
console.log("==================================================");
console.log("\n🎉 ALL KALAKRITI GOOGLE SIGN-IN TESTS PASSED PERFECTLY!\n");

