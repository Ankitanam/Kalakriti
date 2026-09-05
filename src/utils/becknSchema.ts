// src/utils/becknSchema.ts
import { StoreItem } from "../App";

// ── Step 1: Format Product into Official Beckn JSON Protocol ──
export function transformToOndcCatalog(product: StoreItem, action: "on_search" | "on_confirm" = "on_search") {
  return {
    context: {
      domain: "nic2004:52110", // Official ONDC Domain Code for Retail / Handicrafts
      country: "IND",
      city: "std:080",
      action: action,
      core_version: "1.1.0",
      bap_id: "pincode-buyer-app.phonepe.com",
      bap_uri: "https://pincode.phonepe.com/api/v1",
      bpp_id: "kalakriti-seller-node.app",
      bpp_uri: "https://kalakriti.app/api/bpp",
      transaction_id: `txn_${Date.now()}`,
      message_id: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
    },
    message: {
      catalog: {
        "bpp/descriptor": {
          name: "Kalakriti Rural Artisan Store",
          symbol: "https://kalakriti.app/logo.png",
          short_desc: "Direct-from-village authentic Indian crafts on ONDC",
        },
        "bpp/providers": [
          {
            id: `artisan_${product.artisan_name?.replace(/\s+/g, "_").toLowerCase() || "01"}`,
            descriptor: {
              name: product.artisan_name || "ग्रामीण कारीगर",
              short_desc: `${product.artisan_region || "भारत"} के प्रमाणित कारीगर`,
            },
            categories: [
              {
                id: product.categoryName || "Handicrafts",
                descriptor: { name: product.categoryName || "Handicrafts" },
              },
            ],
            items: [
              {
                id: product.id,
                descriptor: {
                  name: product.title_en || product.title_hi,
                  code: product.title_hi,
                  short_desc: product.quick_summary_en || product.description_en,
                  long_desc: product.quick_summary_hi || product.description_hi,
                  images: [product.imageUrl],
                },
                price: {
                  currency: "INR",
                  value: String(product.suggested_price || 199),
                  maximum_value: String(Math.round((product.suggested_price || 199) * 1.6)),
                },
                category_id: product.categoryName || "Handicrafts",
                matched: true,
                "@ondc/org/returnable": false,
                "@ondc/org/cancellable": true,
                "@ondc/org/available_on_cod": true,
                tags: product.tags || ["Handmade", "ONDC Verified"],
              },
            ],
          },
        ],
      },
    },
  };
}