// test-ondc-unit.js
/**
 * In-process Unit Test Suite for Kalakriti ONDC Retail v1.2.0 Protocol Implementation
 * Tests adapter transformations, catalog store, quote calculations, and cryptographic signing.
 */
import {
  canonicalToOndcItem,
  buildOndcProvider,
  buildOndcCatalog,
  calculateOndcQuote,
  mapOndcOrderToInternal,
  ONDC_BPP_CONFIG,
} from "./src/utils/ondc/ondcAdapter.ts";
import { bppCatalogStore } from "./src/utils/ondc/ondcCatalogStore.ts";
import {
  generateEd25519KeyPair,
  createOndcAuthHeader,
  verifyOndcSignature,
  computeBlake512Digest,
} from "./src/utils/ondc/ondcCrypto.ts";

console.log("🇮🇳 Starting Kalakriti ONDC Retail v1.2.0 Protocol Unit Tests...\n");

let passed = 0;
let failed = 0;

function assert(condition, name, details = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${name} - ${details}`);
    failed++;
  }
}

// ── 1. Adapter & Schema Compliance ──
console.log("--- 1. Canonical Product to ONDC v1.2.0 Item Transformation ---");
const testCanonicalProduct = {
  id: "artisan_pot_test_01",
  title_hi: "हाथ से बनी टेराकोटा हांडी",
  title_en: "Handmade Terracotta Clay Cooking Pot",
  suggested_price: 299,
  quantity: 5,
  artisan_name: "गोपाल प्रजापति (Gopal Prajapati)",
  artisan_region: "अलवर, राजस्थान",
  categoryName: "मिट्टी शिल्प (Pottery)",
  imageUrl: "https://images.unsplash.com/photo-1599818471241-10515152865c?w=500",
};

const ondcItem = canonicalToOndcItem(testCanonicalProduct);
assert(ondcItem.id === testCanonicalProduct.id, "Preserves stable item ID");
assert(ondcItem.descriptor.name === testCanonicalProduct.title_en, "Sets English title in descriptor");
assert(ondcItem.descriptor.code === testCanonicalProduct.title_hi, "Sets Hindi code in descriptor");
assert(ondcItem.price.currency === "INR", "Price currency is INR");
assert(ondcItem.price.value === "299", "Price value matches suggested_price");
assert(Number(ondcItem.price.maximum_value) > Number(ondcItem.price.value), "Sets realistic MRP > selling price");
assert(ondcItem["@ondc/org/time_to_ship"] === "P3D", "Sets time_to_ship as P3D (3 days)");
assert(ondcItem["@ondc/org/returnable"] === false, "Sets returnable policy");
assert(ondcItem["@ondc/org/cancellable"] === true, "Sets cancellable policy");
assert(ondcItem["@ondc/org/available_on_cod"] === true, "Enables Cash on Delivery support");
assert(ondcItem["@ondc/org/statutory_reqs_packaged_commodities"]?.manufacturer_or_packer_name.includes("Gopal"), "Includes packaged commodities statutory requirements");

// ── 2. Provider & Catalog Construction ──
console.log("\n--- 2. Multi-Provider Marketplace Seller Node (MSN) Catalog ---");
const catalog = buildOndcCatalog([testCanonicalProduct]);
assert(catalog["bpp/descriptor"].name.includes("Kalakriti"), "BPP descriptor identifies Kalakriti MSN");
assert(catalog["bpp/providers"].length >= 1, "Catalog includes at least 1 provider");
const provider = catalog["bpp/providers"][0];
assert(provider.id.startsWith("prv_"), "Provider assigned stable provider ID");
assert(provider.descriptor.name.includes("Gopal"), "Provider descriptor attributes specific rural artisan");
assert(provider.items.length === 1, "Provider holds artisan items");

// ── 3. Quote Calculation & Jan Dhan Payout Breakdown ──
console.log("\n--- 3. Official ONDC Quote & 85% Jan Dhan Accounting ---");
const quote = calculateOndcQuote([{ item: testCanonicalProduct, quantity: 2 }]);
assert(Number(quote.price.value) === 299 * 2 + 0, "Free delivery applied for order >= ₹499 (Total: ₹598)");
const itemBreakup = quote.breakup.find((b) => b["@ondc/org/title_type"] === "item");
assert(itemBreakup !== undefined, "Breakup contains itemized line total");
assert(itemBreakup.price.value === "598", "Item line total is ₹598");

// Test order < 499 (delivery fee applied)
const smallQuote = calculateOndcQuote([{ item: testCanonicalProduct, quantity: 1 }]);
assert(Number(smallQuote.price.value) === 299 + 40, "Delivery fee of ₹40 applied for order < ₹499 (Total: ₹339)");
const deliveryBreakup = smallQuote.breakup.find((b) => b["@ondc/org/title_type"] === "delivery");
assert(deliveryBreakup.price.value === "40", "Delivery fee explicitly declared in breakup");

// ── 4. Cryptographic Signing & Verification ──
console.log("\n--- 4. Cryptographic Ed25519 & BLAKE-512 Security ---");
const keys = generateEd25519KeyPair();
assert(keys.privateKey && keys.publicKey, "Generated valid Ed25519 keypair");

const samplePayload = {
  context: { domain: "ONDC:RET12", action: "on_search", transaction_id: "txn_123" },
  message: { catalog },
};

const digest = computeBlake512Digest(samplePayload);
assert(digest.length > 40, "Generated BLAKE-512 Base64 digest");

const { authorization } = createOndcAuthHeader({
  subscriberId: "bpp-staging.kalakriti.app",
  uniqueKeyId: "key-1",
  privateKey: keys.privateKey,
  body: samplePayload,
});
assert(authorization.startsWith("Signature keyId="), "Authorization header has standard ONDC format");
assert(authorization.includes('algorithm="ed25519"'), "Algorithm declared as ed25519");
assert(authorization.includes('headers="(created) (expires) digest"'), "Declared signed headers list");

const isSigValid = verifyOndcSignature({
  authHeader: authorization,
  body: samplePayload,
  publicKey: keys.publicKey,
});
assert(isSigValid === true, "Ed25519 signature successfully verified against public key");

// Tamper test: modify payload, verification must fail
const tamperedPayload = { ...samplePayload, tampered: true };
const isTamperedValid = verifyOndcSignature({
  authHeader: authorization,
  body: tamperedPayload,
  publicKey: keys.publicKey,
});
assert(isTamperedValid === false, "Tampered payload correctly rejected by signature verification");

// ── 5. BPP Catalog Store & Atomic Inventory ──
console.log("\n--- 5. BPP Catalog Store & Inventory Concurrency ---");
bppCatalogStore.addOrUpdateItem(testCanonicalProduct);
assert(bppCatalogStore.getItemById(testCanonicalProduct.id) !== undefined, "Item added to active store");

// Stock reservation test
const reserveSuccess = bppCatalogStore.reserveInventory(testCanonicalProduct.id, 3);
assert(reserveSuccess === true, "Successfully reserved 3 units from 5");
assert(bppCatalogStore.getItemById(testCanonicalProduct.id).quantity === 2, "Stock accurately decremented to 2");

// Oversell protection
const oversellAttempt = bppCatalogStore.reserveInventory(testCanonicalProduct.id, 5);
assert(oversellAttempt === false, "Blocked overselling 5 units when only 2 available");
assert(bppCatalogStore.getItemById(testCanonicalProduct.id).quantity === 2, "Stock preserved at 2");

// Idempotency check
const testMsgId = "msg_test_idempotent_123";
assert(bppCatalogStore.isMessageProcessed(testMsgId) === false, "Message ID initially unseen");
bppCatalogStore.recordMessageProcessed(testMsgId);
assert(bppCatalogStore.isMessageProcessed(testMsgId) === true, "Message ID correctly recorded as processed");

console.log(`\n======================================================`);
console.log(`Test Execution Result: ${passed} Passed, ${failed} Failed`);
console.log(`======================================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

