// src/utils/ondc/ondcTypes.ts
/**
 * Official ONDC Retail API Specification v1.2.0 Types
 * Domain: ONDC:RET12 (Handicrafts, Home & Decor) / nic2004:52110
 * Reference: https://resources.ondc.org/tech-resources
 */

export type OndcAction =
  | "search"
  | "on_search"
  | "select"
  | "on_select"
  | "init"
  | "on_init"
  | "confirm"
  | "on_confirm"
  | "status"
  | "on_status"
  | "track"
  | "on_track"
  | "cancel"
  | "on_cancel"
  | "update"
  | "on_update";

export interface CanonicalProduct {
  id: string;
  title_hi?: string;
  title_en?: string;
  title_local?: string;
  suggested_price: number;
  quantity: number;
  imageUrl?: string;
  imageSignature?: string;
  artisan_name?: string;
  artisan_region?: string;
  quick_summary_hi?: string;
  quick_summary_en?: string;
  quick_summary_local?: string;
  story_hi?: string;
  story_en?: string;
  story_local?: string;
  highlights_hi?: string[];
  highlights_en?: string[];
  highlights_local?: string[];
  specs_hi?: Array<{ label: string; value: string }>;
  specs_en?: Array<{ label: string; value: string }>;
  specs_local?: Array<{ label: string; value: string }>;
  tags?: string[];
  language?: string;
  publishedAt?: string;
  categoryName?: string;
  ondcStatus?: OndcPublishStatus;
}
export type StoreItem = CanonicalProduct;

export interface OndcContext {
  domain: "ONDC:RET12" | "nic2004:52110";
  country: "IND";
  city: string; // e.g., "std:080" or "*"
  action: OndcAction;
  core_version: "1.2.0";
  bap_id: string;
  bap_uri: string;
  bpp_id: string;
  bpp_uri: string;
  transaction_id: string;
  message_id: string;
  timestamp: string;
  ttl?: string; // e.g. "PT30S"
  key?: string;
}

export interface OndcDescriptor {
  name: string;
  code?: string;
  symbol?: string;
  short_desc?: string;
  long_desc?: string;
  images?: string[];
}

export interface OndcPrice {
  currency: "INR";
  value: string;
  maximum_value?: string;
}

export interface OndcTagList {
  code: string;
  value: string;
}

export interface OndcTagGroup {
  code: string;
  list: OndcTagList[];
}

export interface OndcItem {
  id: string;
  parent_item_id?: string;
  descriptor: OndcDescriptor;
  price: OndcPrice;
  category_id: string;
  fulfillment_id: string;
  location_id?: string;
  time?: {
    label: string;
    timestamp: string;
  };
  matched?: boolean;
  "@ondc/org/returnable": boolean;
  "@ondc/org/cancellable": boolean;
  "@ondc/org/return_window"?: string; // e.g., "P7D"
  "@ondc/org/seller_pickup_return"?: boolean;
  "@ondc/org/time_to_ship": string; // e.g., "P3D"
  "@ondc/org/available_on_cod": boolean;
  "@ondc/org/contact_details_consumer_care"?: string;
  "@ondc/org/statutory_reqs_packaged_commodities"?: {
    manufacturer_or_packer_name: string;
    manufacturer_or_packer_address: string;
    common_or_generic_name_of_commodity: string;
    net_quantity_or_measure_of_commodity_in_pkg: string;
    month_year_of_manufacture_packing_import: string;
  };
  tags?: OndcTagGroup[];
}

export interface OndcProvider {
  id: string;
  descriptor: OndcDescriptor;
  categories?: Array<{
    id: string;
    descriptor: OndcDescriptor;
  }>;
  fulfillments?: Array<{
    id: string;
    type: "Delivery" | "Standard" | "Express";
    contact?: { phone: string; email: string };
  }>;
  locations?: Array<{
    id: string;
    gps?: string;
    address?: {
      street?: string;
      city: string;
      state: string;
      area_code: string;
    };
  }>;
  items: OndcItem[];
  tags?: OndcTagGroup[];
}

export interface OndcCatalog {
  "bpp/descriptor": OndcDescriptor;
  "bpp/providers": OndcProvider[];
}

export interface OndcQuoteBreakupItem {
  title: string;
  price: OndcPrice;
  "@ondc/org/item_id"?: string;
  "@ondc/org/title_type": "item" | "delivery" | "packing" | "tax" | "misc" | "discount";
  item?: {
    price: OndcPrice;
    quantity?: { count: number };
  };
}

export interface OndcQuote {
  price: OndcPrice;
  breakup: OndcQuoteBreakupItem[];
  ttl?: string;
}

export interface OndcAddress {
  door?: string;
  name?: string;
  building?: string;
  street?: string;
  city: string;
  state: string;
  area_code: string; // Pincode
}

export interface OndcFulfillmentEnd {
  location: {
    gps?: string;
    address: OndcAddress;
  };
  contact: {
    phone: string;
    name: string;
    email?: string;
  };
  time?: {
    range?: {
      start?: string;
      end?: string;
    };
  };
}

export interface OndcFulfillment {
  id: string;
  type: "Delivery" | "Standard";
  state?: {
    descriptor: {
      code: "Pending" | "Packed" | "Order-picked-up" | "Out-for-delivery" | "Order-delivered" | "Cancelled";
      name: string;
    };
  };
  tracking: boolean;
  tracking_url?: string;
  provider_name?: string;
  end: OndcFulfillmentEnd;
}

export interface OndcPaymentSettlementDetails {
  settlement_counterparty: "seller-app" | "buyer-app";
  settlement_phase: "sale-amount";
  settlement_type: "neft" | "upi";
  beneficiary_name: string;
  settlement_bank_account_no: string;
  settlement_ifsc_code: string;
}

export interface OndcPayment {
  uri?: string;
  tl_method?: string;
  params?: Record<string, string>;
  type: "ON-ORDER" | "POST-FULFILLMENT";
  status: "PAID" | "NOT-PAID";
  collected_by: "BAP" | "BPP";
  "@ondc/org/buyer_app_finder_fee_type"?: "percent" | "amount";
  "@ondc/org/buyer_app_finder_fee_amount"?: string;
  "@ondc/org/settlement_details"?: OndcPaymentSettlementDetails[];
}

export interface OndcOrder {
  id: string;
  state: "Created" | "Accepted" | "In-progress" | "Completed" | "Cancelled";
  provider: {
    id: string;
    descriptor?: OndcDescriptor;
  };
  items: Array<{
    id: string;
    quantity: { count: number };
    price?: OndcPrice;
  }>;
  billing: {
    name: string;
    phone: string;
    email?: string;
    address: OndcAddress;
  };
  fulfillments: OndcFulfillment[];
  quote: OndcQuote;
  payment: OndcPayment;
  created_at: string;
  updated_at: string;
}

export interface OndcAck {
  message: {
    ack: {
      status: "ACK" | "NACK";
    };
  };
  error?: OndcError;
}

export interface OndcError {
  type: "CONTEXT-ERROR" | "CORE-ERROR" | "DOMAIN-ERROR" | "POLICY-ERROR";
  code: string;
  message: string;
  path?: string;
}

// ── Publication State in Kalakriti ──
export type OndcPublishStatus =
  | "draft"
  | "ai_generated"
  | "artisan_approved"
  | "publishing"
  | "published_staging"
  | "publishing_failed";

export interface OndcPublishedItemMetadata {
  internalId: string;
  ondcItemId: string;
  providerId: string;
  status: OndcPublishStatus;
  publishedAt: string;
  lastSyncedAt: string;
  version: "1.2.0";
  environment: "staging" | "preprod" | "prod";
  rawBppPayload?: any;
}
