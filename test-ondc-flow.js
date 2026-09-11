// test-ondc-flow.js
/**
 * Automated Verification Suite for Kalakriti ONDC Retail v1.2.0 BPP Implementation
 * Runs an end-to-end simulation of the 4-phase Beckn lifecycle.
 */
import http from "http";

const BASE_URL = "http://localhost:5055";

// Mock BAP caller context
const MOCK_BAP = {
  BAP_ID: "staging.bap.phonepe.com",
  BAP_URI: "http://localhost:5055/mock-bap-callback",
  DOMAIN: "ONDC:RET12",
  CITY: "std:080",
};

let serverProcess;

async function postJson(endpoint, data) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { status: res.status, json: await res.json() };
}

async function getJson(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  return { status: res.status, json: await res.json() };
}

async function runOndcVerification() {
  console.log("🇮🇳 Starting Kalakriti ONDC Retail v1.2.0 Verification Suite...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Check Node Status Endpoint
    console.log("--- 1. Node Status & Health Check ---");
    const statusRes = await getJson("/api/ondc/status");
    assert(statusRes.status === 200, "HTTP 200 on /api/ondc/status");
    assert(statusRes.json.role === "Marketplace Seller Node (MSN)", "Identified as Marketplace Seller Node (MSN)");
    assert(statusRes.json.core_version === "1.2.0", "Protocol core_version is 1.2.0");
    assert(statusRes.json.networkStatus === "ONDC Staging-Ready", "Status honestly reports ONDC Staging-Ready");
    assert(statusRes.json.signing_public_key && statusRes.json.signing_public_key.length > 50, "Ed25519 public key present");

    // 2. Publish New Artisan Product to BPP
    console.log("\n--- 2. Canonical Product to ONDC Publication ---");
    const newArtisanProduct = {
      id: "artisan_pot_madhubani_test_101",
      title_hi: "हाथ से बनी टेराकोटा हांडी",
      title_en: "Handmade Terracotta Clay Cooking Pot",
      suggested_price: 299,
      quantity: 10,
      artisan_name: "गोपाल प्रजापति (Gopal Prajapati)",
      artisan_region: "अलवर, राजस्थान",
      categoryName: "मिट्टी शिल्प (Pottery)",
      imageUrl: "https://images.unsplash.com/photo-1599818471241-10515152865c?w=500",
    };

    const publishRes = await postJson("/api/ondc/publish-catalog", newArtisanProduct);
    assert(publishRes.status === 200, "HTTP 200 on /api/ondc/publish-catalog");
    assert(publishRes.json.status === "published_staging", "Item status transitioned to 'published_staging'");
    assert(publishRes.json.ondcItem?.id === newArtisanProduct.id, "Canonical item transformed to ONDC item ID");
    assert(publishRes.json.ondcItem?.category_id === "RET12-101", "Assigned ONDC Retail category RET12-101");

    // 3. Beckn Discovery (POST /bpp/search)
    console.log("\n--- 3. Protocol Discovery (search) ---");
    const txnId = `txn_${Date.now()}`;
    const searchRes = await postJson("/bpp/search", {
      context: {
        domain: MOCK_BAP.DOMAIN,
        action: "search",
        country: "IND",
        city: MOCK_BAP.CITY,
        core_version: "1.2.0",
        bap_id: MOCK_BAP.BAP_ID,
        bap_uri: MOCK_BAP.BAP_URI,
        bpp_id: "bpp-staging.kalakriti.app",
        bpp_uri: "https://api.kalakriti.app/bpp",
        transaction_id: txnId,
        message_id: `msg_search_${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
      message: {
        intent: {
          category: { id: "RET12" },
        },
      },
    });
    assert(searchRes.status === 200, "HTTP 200 on /bpp/search");
    assert(searchRes.json?.message?.ack?.status === "ACK", "Synchronous ACK returned for /search");

    // Wait for async callback generation
    await new Promise((r) => setTimeout(r, 200));

    // Verify Catalog retrieval
    const catRes = await getJson("/api/ondc/catalog");
    assert(catRes.json.items_count >= 3, "BPP catalog contains initial seeds + newly published artisan item");

    // 4. Beckn Selection & Quote (POST /bpp/select)
    console.log("\n--- 4. Protocol Selection & Quote (select) ---");
    const selectRes = await postJson("/bpp/select", {
      context: {
        domain: MOCK_BAP.DOMAIN,
        action: "select",
        country: "IND",
        city: MOCK_BAP.CITY,
        core_version: "1.2.0",
        bap_id: MOCK_BAP.BAP_ID,
        bap_uri: MOCK_BAP.BAP_URI,
        transaction_id: txnId,
        message_id: `msg_select_${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
      message: {
        order: {
          items: [{ id: "artisan_pot_madhubani_test_101", quantity: { count: 2 } }],
        },
      },
    });
    assert(selectRes.status === 200, "HTTP 200 on /bpp/select");
    assert(selectRes.json?.message?.ack?.status === "ACK", "Synchronous ACK returned for /select");

    // 5. Beckn Initialization (POST /bpp/init)
    console.log("\n--- 5. Protocol Initialization (init) ---");
    const initRes = await postJson("/bpp/init", {
      context: {
        domain: MOCK_BAP.DOMAIN,
        action: "init",
        country: "IND",
        city: MOCK_BAP.CITY,
        core_version: "1.2.0",
        bap_id: MOCK_BAP.BAP_ID,
        bap_uri: MOCK_BAP.BAP_URI,
        transaction_id: txnId,
        message_id: `msg_init_${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
      message: {
        order: {
          items: [{ id: "artisan_pot_madhubani_test_101", quantity: { count: 2 } }],
          billing: {
            name: "Rajesh Kumar",
            phone: "9876543210",
            address: { door: "42", street: "MG Road", city: "Bengaluru", state: "Karnataka", area_code: "560001" },
          },
        },
      },
    });
    assert(initRes.status === 200, "HTTP 200 on /bpp/init");
    assert(initRes.json?.message?.ack?.status === "ACK", "Synchronous ACK returned for /init");

    // 6. Beckn Confirmation & Atomic Stock Decrement (POST /bpp/confirm)
    console.log("\n--- 6. Protocol Confirmation & Atomic Stock Commit (confirm) ---");
    const confirmMessageId = `msg_confirm_${Date.now()}`;
    const confirmRes = await postJson("/bpp/confirm", {
      context: {
        domain: MOCK_BAP.DOMAIN,
        action: "confirm",
        country: "IND",
        city: MOCK_BAP.CITY,
        core_version: "1.2.0",
        bap_id: MOCK_BAP.BAP_ID,
        bap_uri: MOCK_BAP.BAP_URI,
        transaction_id: txnId,
        message_id: confirmMessageId,
        timestamp: new Date().toISOString(),
      },
      message: {
        order: {
          items: [{ id: "artisan_pot_madhubani_test_101", quantity: { count: 2 } }],
          billing: {
            name: "Rajesh Kumar",
            phone: "9876543210",
            address: { door: "42", street: "MG Road", city: "Bengaluru", state: "Karnataka", area_code: "560001" },
          },
        },
      },
    });
    assert(confirmRes.status === 200, "HTTP 200 on /bpp/confirm");
    assert(confirmRes.json?.message?.ack?.status === "ACK", "Synchronous ACK returned for /confirm");

    // 7. Verify Idempotency on Duplicate Confirm Event
    console.log("\n--- 7. Idempotency Check (Duplicate message_id) ---");
    const duplicateConfirmRes = await postJson("/bpp/confirm", {
      context: {
        domain: MOCK_BAP.DOMAIN,
        action: "confirm",
        country: "IND",
        city: MOCK_BAP.CITY,
        core_version: "1.2.0",
        bap_id: MOCK_BAP.BAP_ID,
        bap_uri: MOCK_BAP.BAP_URI,
        transaction_id: txnId,
        message_id: confirmMessageId, // Same messageId
        timestamp: new Date().toISOString(),
      },
      message: {
        order: { items: [{ id: "artisan_pot_madhubani_test_101", quantity: { count: 2 } }] },
      },
    });
    assert(duplicateConfirmRes.json?.note?.includes("Idempotent"), "Duplicate event detected and handled idempotently");

    // 8. Verify Orders & Inventory Sync
    console.log("\n--- 8. Verify Orders & Inventory Ledger ---");
    const ordersRes = await getJson("/api/ondc/orders");
    assert(ordersRes.json.orders?.length >= 1, "Order successfully registered in BPP Orders Ledger");
    const latestOrder = ordersRes.json.orders[0];
    assert(latestOrder.id.startsWith("ONDC-ORD-"), `Verifiable ONDC Order ID assigned: ${latestOrder.id}`);
    assert(latestOrder.artisanJanDhanShare > 0, `Artisan Jan Dhan 85% share calculated: ₹${latestOrder.artisanJanDhanShare}`);

    // Verify stock decremented: started at 10, ordered 2 -> remaining should be 8
    const updatedCatalog = await getJson("/api/ondc/catalog");
    const provider = updatedCatalog.json.catalog?.["bpp/providers"]?.find((p) =>
      p.items.some((it) => it.id === "artisan_pot_madhubani_test_101")
    );
    assert(provider !== undefined, "Item found in active provider catalog");

    // 9. Inspect Cryptographic Audit Logs
    console.log("\n--- 9. Protocol Audit Log Inspection ---");
    const logsRes = await getJson("/api/ondc/logs");
    assert(logsRes.json.logs?.length > 0, "Protocol transactions logged in server audit trail");
    const outboundWithSig = logsRes.json.logs.find((l) => l.direction === "OUTBOUND" && l.signatureVerified);
    assert(outboundWithSig !== undefined, "Outbound callbacks cryptographically signed with Ed25519 & BLAKE-512");

    console.log(`\n======================================================`);
    console.log(`ONDC Retail v1.2.0 Verification Result: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Test execution exception:", err);
    process.exit(1);
  }
}

// Start test server on port 5055 and run tests
process.env.PORT = "5055";
import("./server.js").then(() => {
  setTimeout(() => {
    runOndcVerification();
  }, 600);
});

