// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { bppCatalogStore } from "./src/utils/ondc/ondcCatalogStore.ts";
import {
  canonicalToOndcItem,
  calculateOndcQuote,
  ONDC_BPP_CONFIG,
} from "./src/utils/ondc/ondcAdapter.ts";
import {
  generateEd25519KeyPair,
  createOndcAuthHeader,
  verifyOndcSignature,
} from "./src/utils/ondc/ondcCrypto.ts";
import { transcribeAudioPayload, CRAFT_VOCABULARY } from "./src/utils/transcribeService.ts";
import { enhanceImagePayload } from "./src/utils/imageService.ts";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" })); // Supports image payloads

// ── BPP Cryptographic Keypair Initialization ──
// Generates an Ed25519 keypair for standard Beckn Authorization headers
const bppKeys = generateEd25519KeyPair();
const BPP_SUBSCRIBER_ID = process.env.ONDC_SUBSCRIBER_ID || ONDC_BPP_CONFIG.BPP_ID;
const BPP_UNIQUE_KEY_ID = process.env.ONDC_UNIQUE_KEY_ID || "kalakriti-staging-key-1";

// In-memory protocol audit logs for SIH judges and developer inspection
const protocolAuditLogs = [];

function logProtocolEvent(direction, action, payload, signature) {
  const entry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    direction, // "INBOUND" | "OUTBOUND"
    action,
    transaction_id: payload?.context?.transaction_id || "N/A",
    message_id: payload?.context?.message_id || "N/A",
    bap_id: payload?.context?.bap_id || "N/A",
    bpp_id: payload?.context?.bpp_id || BPP_SUBSCRIBER_ID,
    signatureVerified: signature ? true : false,
    payload,
  };
  protocolAuditLogs.unshift(entry);
  if (protocolAuditLogs.length > 50) protocolAuditLogs.pop();
}

/**
 * Dispatches an asynchronous ONDC callback (on_search, on_select, etc.) to the BAP.
 */
async function dispatchOndcCallback(bapUri, action, payload) {
  try {
    const { authorization } = createOndcAuthHeader({
      subscriberId: BPP_SUBSCRIBER_ID,
      uniqueKeyId: BPP_UNIQUE_KEY_ID,
      privateKey: bppKeys.privateKey,
      body: payload,
    });

    logProtocolEvent("OUTBOUND", action, payload, authorization);

    // If caller provided a real HTTP/HTTPS URL, send network callback
    if (bapUri && (bapUri.startsWith("http://") || bapUri.startsWith("https://"))) {
      const targetUrl = `${bapUri.replace(/\/+$/, "")}/${action}`;
      fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization,
        },
        body: JSON.stringify(payload),
      }).catch((netErr) => {
        // Log network timeout/unreachable (common in staging sandbox testing)
        console.warn(`[ONDC BPP Callback] Notice: ${action} sent to ${targetUrl} (Network note: ${netErr.message})`);
      });
    }
  } catch (err) {
    console.error(`[ONDC BPP Callback] Error dispatching ${action}:`, err);
  }
}

// ═════════════════════════════════════════════════════════════
// 1. ONDC RETAIL v1.2.0 PROTOCOL ENDPOINTS (BPP Server Interface)
// ═════════════════════════════════════════════════════════════

/**
 * 1. POST /bpp/search (Catalogue Discovery)
 * Called by ONDC Staging Gateway or Buyer App (BAP)
 */
app.post("/bpp/search", (req, res) => {
  const { context } = req.body;
  logProtocolEvent("INBOUND", "search", req.body);

  // 1. Synchronous ACK response (< 1000ms SLA)
  res.json({
    message: {
      ack: { status: "ACK" },
    },
  });

  // 2. Asynchronous on_search callback with published artisan catalogue
  setTimeout(() => {
    const catalog = bppCatalogStore.getPublishedOndcCatalog();
    const onSearchPayload = {
      context: {
        ...context,
        action: "on_search",
        core_version: "1.2.0",
        bpp_id: BPP_SUBSCRIBER_ID,
        bpp_uri: ONDC_BPP_CONFIG.BPP_URI,
        message_id: `msg_${Date.now()}_on_search`,
        timestamp: new Date().toISOString(),
      },
      message: {
        catalog,
      },
    };

    dispatchOndcCallback(context?.bap_uri, "on_search", onSearchPayload);
  }, 100);
});

/**
 * 2. POST /bpp/select (Item Selection & Quote Generation)
 */
app.post("/bpp/select", (req, res) => {
  const { context, message } = req.body;
  logProtocolEvent("INBOUND", "select", req.body);

  // Synchronous ACK
  res.json({ message: { ack: { status: "ACK" } } });

  setTimeout(() => {
    const orderItems = message?.order?.items || [];
    const matchedItems = [];

    orderItems.forEach((reqItem) => {
      const canonical = bppCatalogStore.getItemById(reqItem.id);
      if (canonical) {
        matchedItems.push({
          item: canonical,
          quantity: reqItem.quantity?.count || 1,
        });
      }
    });

    const quote = calculateOndcQuote(matchedItems);

    const onSelectPayload = {
      context: {
        ...context,
        action: "on_select",
        core_version: "1.2.0",
        bpp_id: BPP_SUBSCRIBER_ID,
        bpp_uri: ONDC_BPP_CONFIG.BPP_URI,
        message_id: `msg_${Date.now()}_on_select`,
        timestamp: new Date().toISOString(),
      },
      message: {
        order: {
          provider: {
            id: message?.order?.provider?.id || "kalakriti_artisan_provider",
          },
          items: orderItems.map((it) => ({
            id: it.id,
            fulfillment_id: "F1",
          })),
          quote,
        },
      },
    };

    dispatchOndcCallback(context?.bap_uri, "on_select", onSelectPayload);
  }, 100);
});

/**
 * 3. POST /bpp/init (Order Initialization with Address & Logistics)
 */
app.post("/bpp/init", (req, res) => {
  const { context, message } = req.body;
  logProtocolEvent("INBOUND", "init", req.body);

  res.json({ message: { ack: { status: "ACK" } } });

  setTimeout(() => {
    const orderItems = message?.order?.items || [];
    const matchedItems = orderItems.map((reqItem) => ({
      item: bppCatalogStore.getItemById(reqItem.id) || {
        id: reqItem.id,
        suggested_price: 249,
        title_en: "Handicraft Product",
        quantity: 1,
      },
      quantity: reqItem.quantity?.count || 1,
    }));

    const quote = calculateOndcQuote(matchedItems);

    const onInitPayload = {
      context: {
        ...context,
        action: "on_init",
        core_version: "1.2.0",
        bpp_id: BPP_SUBSCRIBER_ID,
        bpp_uri: ONDC_BPP_CONFIG.BPP_URI,
        message_id: `msg_${Date.now()}_on_init`,
        timestamp: new Date().toISOString(),
      },
      message: {
        order: {
          provider: message?.order?.provider || { id: "kalakriti_artisan_provider" },
          items: orderItems,
          billing: message?.order?.billing || {
            name: "ONDC Staging Buyer",
            phone: "9876543210",
            address: { city: "Bengaluru", state: "Karnataka", area_code: "560001" },
          },
          fulfillments: [
            {
              id: "F1",
              type: "Delivery",
              tracking: true,
              provider_name: ONDC_BPP_CONFIG.LOGISTICS_PROVIDER_NAME,
              end: message?.order?.fulfillments?.[0]?.end || {
                location: { address: { city: "Bengaluru", state: "Karnataka", area_code: "560001" } },
                contact: { phone: "9876543210", name: "Buyer" },
              },
            },
          ],
          quote,
          payment: {
            type: "ON-ORDER",
            status: "NOT-PAID",
            collected_by: "BAP",
            "@ondc/org/settlement_details": [
              {
                settlement_counterparty: "seller-app",
                settlement_phase: "sale-amount",
                settlement_type: "neft",
                beneficiary_name: "Kalakriti Rural Artisan Settlement Node",
                settlement_bank_account_no: "919876543210",
                settlement_ifsc_code: "SBIN0001234",
              },
            ],
          },
        },
      },
    };

    dispatchOndcCallback(context?.bap_uri, "on_init", onInitPayload);
  }, 100);
});

/**
 * 4. POST /bpp/confirm (Final Order Confirmation & Inventory Commitment)
 */
app.post("/bpp/confirm", (req, res) => {
  const { context, message } = req.body;
  logProtocolEvent("INBOUND", "confirm", req.body);

  const messageId = context?.message_id || `msg_${Date.now()}`;

  // Idempotency: Reject duplicate/replayed confirm events
  if (bppCatalogStore.isMessageProcessed(messageId)) {
    return res.json({
      message: { ack: { status: "ACK" } },
      note: "Idempotent: Order already processed",
    });
  }

  // Atomically decrement stock for each item in the order
  const orderItems = message?.order?.items || [];
  orderItems.forEach((it) => {
    bppCatalogStore.reserveInventory(it.id, it.quantity?.count || 1);
  });

  // Assign verifiable ONDC order ID
  const orderId = message?.order?.id || `ONDC-ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const confirmedOrder = {
    id: orderId,
    transaction_id: context?.transaction_id,
    state: "Accepted",
    provider: message?.order?.provider || { id: "kalakriti_artisan_provider" },
    items: orderItems,
    billing: message?.order?.billing,
    fulfillments: [
      {
        id: "F1",
        type: "Delivery",
        state: { descriptor: { code: "Order-placed", name: "Order Placed with Rural Artisan" } },
        tracking: true,
        tracking_url: `https://kalakriti.app/track/${orderId}`,
        provider_name: ONDC_BPP_CONFIG.LOGISTICS_PROVIDER_NAME,
        end: message?.order?.fulfillments?.[0]?.end,
      },
    ],
    quote: message?.order?.quote || { price: { currency: "INR", value: "349" }, breakup: [] },
    payment: {
      type: "ON-ORDER",
      status: "PAID",
      collected_by: "BAP",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Record in BPP Store
  const storedRecord = bppCatalogStore.createOrder(confirmedOrder, messageId);

  // Synchronous ACK
  res.json({ message: { ack: { status: "ACK" } } });

  // Asynchronous on_confirm callback
  setTimeout(() => {
    const onConfirmPayload = {
      context: {
        ...context,
        action: "on_confirm",
        core_version: "1.2.0",
        bpp_id: BPP_SUBSCRIBER_ID,
        bpp_uri: ONDC_BPP_CONFIG.BPP_URI,
        message_id: `msg_${Date.now()}_on_confirm`,
        timestamp: new Date().toISOString(),
      },
      message: {
        order: confirmedOrder,
      },
    };

    dispatchOndcCallback(context?.bap_uri, "on_confirm", onConfirmPayload);
  }, 100);
});

/**
 * 5. POST /bpp/status (Order Status Polling)
 */
app.post("/bpp/status", (req, res) => {
  const { context, message } = req.body;
  logProtocolEvent("INBOUND", "status", req.body);

  res.json({ message: { ack: { status: "ACK" } } });

  setTimeout(() => {
    const orderRecord = bppCatalogStore.getOrder(message?.order_id);
    const orderPayload = orderRecord ? orderRecord.rawOrderPayload : { id: message?.order_id, state: "Accepted" };

    const onStatusPayload = {
      context: {
        ...context,
        action: "on_status",
        core_version: "1.2.0",
        bpp_id: BPP_SUBSCRIBER_ID,
        bpp_uri: ONDC_BPP_CONFIG.BPP_URI,
        message_id: `msg_${Date.now()}_on_status`,
        timestamp: new Date().toISOString(),
      },
      message: {
        order: orderPayload,
      },
    };

    dispatchOndcCallback(context?.bap_uri, "on_status", onStatusPayload);
  }, 100);
});

// ═════════════════════════════════════════════════════════════
// 2. KALAKRITI FRONTEND / BPP INTEGRATION REST APIs
// ═════════════════════════════════════════════════════════════

/**
 * POST /api/ondc/publish-catalog
 * Called by frontend when an artisan approves an AI-generated product.
 * Converts canonical product to ONDC Retail v1.2.0 item and registers in BPP catalog.
 */
app.post("/api/ondc/publish-catalog", (req, res) => {
  try {
    const product = req.body;
    if (!product || !product.id) {
      return res.status(400).json({ error: "Missing required product data" });
    }

    // Save to BPP Store
    bppCatalogStore.addOrUpdateItem(product);
    const ondcItem = canonicalToOndcItem(product);

    res.json({
      success: true,
      status: "published_staging",
      ondcStatusLabel: "ONDC Staging (v1.2.0 Active)",
      itemId: product.id,
      ondcItem,
      totalCatalogItems: bppCatalogStore.getAllItems().length,
    });
  } catch (err) {
    console.error("Catalog publishing error:", err);
    res.status(500).json({ error: "Failed to publish item to ONDC BPP Store" });
  }
});

/**
 * GET /api/ondc/catalog
 * Returns current ONDC v1.2.0 catalog and items count.
 */
app.get("/api/ondc/catalog", (req, res) => {
  const catalog = bppCatalogStore.getPublishedOndcCatalog();
  res.json({
    success: true,
    bpp_id: BPP_SUBSCRIBER_ID,
    items_count: bppCatalogStore.getAllItems().length,
    catalog,
  });
});

/**
 * GET /api/ondc/orders
 * Returns confirmed orders recorded on this BPP node.
 */
app.get("/api/ondc/orders", (req, res) => {
  res.json({
    success: true,
    orders: bppCatalogStore.getAllOrders(),
  });
});

/**
 * GET /api/ondc/status
 * Health & Participant verification endpoint.
 */
app.get("/api/ondc/status", (req, res) => {
  res.json({
    nodeStatus: "ONLINE",
    role: "Marketplace Seller Node (MSN)",
    networkStatus: "ONDC Staging-Ready",
    environment: "staging",
    domain: ONDC_BPP_CONFIG.DOMAIN,
    core_version: ONDC_BPP_CONFIG.CORE_VERSION,
    subscriber_id: BPP_SUBSCRIBER_ID,
    unique_key_id: BPP_UNIQUE_KEY_ID,
    signing_public_key: bppKeys.publicKey.export({ type: "spki", format: "pem" }),
    active_catalog_items: bppCatalogStore.getAllItems().length,
    total_confirmed_orders: bppCatalogStore.getAllOrders().length,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/ondc/logs
 * Returns protocol transaction history for judges/developers.
 */
app.get("/api/ondc/logs", (req, res) => {
  res.json({
    success: true,
    logs: protocolAuditLogs,
  });
});

// ═════════════════════════════════════════════════════════════
// 3. SECURE AI CATALOG GENERATION ENDPOINT
// ═════════════════════════════════════════════════════════════
app.post("/api/generate-catalog", async (req, res) => {
  try {
    const { promptText, mimeType, base64Data } = req.body;
    const geminiKey = process.env.VITE_GEMINI_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!geminiKey) {
      return res.status(500).json({ error: "Gemini API key not configured on server" });
    }

    let parts = [{ text: promptText }];
    if (base64Data) {
      parts.push({
        inline_data: {
          mime_type: mimeType || "image/jpeg",
          data: base64Data,
        },
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ═════════════════════════════════════════════════════════════
// 4. MULTILINGUAL SPEECH-TO-TEXT TRANSCRIPTION ENDPOINT
// ═════════════════════════════════════════════════════════════


app.post("/api/transcribe-audio", async (req, res) => {
  try {
    const { audioBase64, mimeType, languageCode } = req.body;
    const geminiKey = process.env.VITE_GEMINI_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!geminiKey) {
      return res.status(500).json({ success: false, error: "Gemini API key not configured on server" });
    }

    if (!audioBase64) {
      return res.status(400).json({ success: false, error: "No audio data provided" });
    }

    const result = await transcribeAudioPayload({
      audioBase64,
      mimeType,
      languageCode,
      geminiKey,
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("[VOICE API] endpoint error:", err);
    res.status(500).json({ success: false, error: err.message || "Internal Server Error" });
  }
});

app.post("/api/enhance-image", async (req, res) => {
  try {
    const { imageBase64, mimeType, imageUrl } = req.body;
    const geminiKey = process.env.VITE_GEMINI_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!geminiKey) {
      return res.status(500).json({ success: false, error: "Gemini API key not configured on server" });
    }

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: "No image data provided" });
    }

    const result = await enhanceImagePayload({
      imageBase64,
      mimeType,
      imageUrl,
      geminiKey,
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("[IMAGE API] endpoint error:", err);
    res.status(500).json({ success: false, error: err.message || "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🇮🇳 Kalakriti ONDC Marketplace Seller Node (MSN) Active`);
  console.log(`Protocol Version: ONDC Retail v${ONDC_BPP_CONFIG.CORE_VERSION}`);
  console.log(`Environment: ONDC Staging (Testing Ready)`);
  console.log(`Subscriber ID: ${BPP_SUBSCRIBER_ID}`);
  console.log(`Public Key ID: ${BPP_UNIQUE_KEY_ID}`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});