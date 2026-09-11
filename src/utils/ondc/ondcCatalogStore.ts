import { buildOndcCatalog, calculateOndcQuote, mapOndcOrderToInternal } from "./ondcAdapter.ts";
import type { OndcCatalog, OndcOrder, OndcQuote, StoreItem } from "./ondcTypes.ts";

export interface BppOrderRecord {
  orderId: string;
  transactionId: string;
  messageId: string;
  items: Array<{ id: string; quantity: number; title: string; unitPrice: number }>;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  quote: OndcQuote;
  status: "Created" | "Accepted" | "In-progress" | "Completed" | "Cancelled";
  artisanJanDhanShare: number;
  createdAt: string;
  updatedAt: string;
  rawOrderPayload: OndcOrder;
}

/**
 * In-memory / Persistent BPP Catalog & Order Store for Kalakriti MSN
 */
class OndcCatalogStore {
  private items: Map<string, StoreItem> = new Map();
  private orders: Map<string, BppOrderRecord> = new Map();
  private processedMessages: Set<string> = new Set();

  constructor() {
    this.seedInitialItems();
  }

  private seedInitialItems() {
    // Initial artisan crafts registered into the BPP Catalog
    const seeds: StoreItem[] = [
      {
        id: "artisan_craft_seed_1",
        title_hi: "राजस्थानी पारंपरिक कठपुतली जोड़ा",
        title_en: "Rajasthani Traditional Handmade Puppets Pair",
        suggested_price: 349,
        quantity: 5,
        imageUrl: "https://images.unsplash.com/photo-1599818471241-10515152865c?w=500",
        artisan_name: "शंकर लाल भाट",
        artisan_region: "जयपुर, राजस्थान",
        quick_summary_hi: "कपड़े और लकड़ी से हस्तनिर्मित पारंपरिक राजस्थानी कठपुतली।",
        quick_summary_en: "Authentic handcrafted traditional Rajasthani decorative puppet pair.",
        story_hi: "यह शिल्प राजस्थान की प्राचीन लोक कला और कठपुतली परंपरा की समृद्ध विरासत को दर्शाता है।",
        story_en: "This craft celebrates centuries of Rajasthani folk heritage and generational puppet theatre artistry.",
        categoryName: "कढ़ाई एवं गुड़िया (Embroidery)",
      },
      {
        id: "artisan_craft_seed_2",
        title_hi: "पारंपरिक मधुबनी लोककला पेंटिंग",
        title_en: "Traditional Handpainted Madhubani Folk Artwork",
        suggested_price: 499,
        quantity: 3,
        imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500",
        artisan_name: "माधुरी देवी",
        artisan_region: "मिथिला, बिहार",
        quick_summary_hi: "प्राकृतिक रंगों द्वारा हस्तनिर्मित मधुबनी पेंटिंग।",
        quick_summary_en: "Authentic handmade Madhubani folk painting using organic pigments.",
        story_hi: "मिथिला की महिलाओं द्वारा पीढ़ियों से संजोई गई यह लोककला प्रकृति और उत्सव का सजीव चित्रण करती है।",
        story_en: "Meticulously painted by Mithila master artisans celebrating generational folk culture and biodiversity.",
        categoryName: "चित्रकारी (Painting)",
      },
    ];

    seeds.forEach((item) => this.items.set(item.id, item));
  }

  // ── Idempotency Check ──
  public isMessageProcessed(messageId: string): boolean {
    return this.processedMessages.has(messageId);
  }

  public recordMessageProcessed(messageId: string) {
    this.processedMessages.add(messageId);
  }

  // ── Catalog Management ──
  public addOrUpdateItem(item: StoreItem) {
    const existing = this.items.get(item.id);
    if (existing) {
      this.items.set(item.id, {
        ...existing,
        ...item,
        quantity: Number(item.quantity) || 0,
      });
    } else {
      this.items.set(item.id, {
        ...item,
        quantity: Number(item.quantity) || 1,
      });
    }
  }

  public getAllItems(): StoreItem[] {
    return Array.from(this.items.values());
  }

  public getItemById(id: string): StoreItem | undefined {
    return this.items.get(id);
  }

  public getPublishedOndcCatalog(): OndcCatalog {
    return buildOndcCatalog(this.getAllItems());
  }

  // ── Atomic Inventory Operations ──
  public reserveInventory(itemId: string, requestedCount: number): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;
    const currentQty = Number(item.quantity) || 0;
    if (currentQty < requestedCount) return false;

    // Decrement stock atomically
    item.quantity = currentQty - requestedCount;
    this.items.set(itemId, item);
    return true;
  }

  public releaseInventory(itemId: string, count: number) {
    const item = this.items.get(itemId);
    if (item) {
      item.quantity = (Number(item.quantity) || 0) + count;
      this.items.set(itemId, item);
    }
  }

  // ── Order & Settlement Operations ──
  public createOrder(ondcOrder: OndcOrder, messageId: string): BppOrderRecord {
    const internalMapped = mapOndcOrderToInternal(ondcOrder);

    const itemsSummary = ondcOrder.items.map((it) => {
      const canonical = this.items.get(it.id);
      return {
        id: it.id,
        quantity: it.quantity.count,
        title: canonical?.title_en || canonical?.title_hi || "Handicraft",
        unitPrice: Number(it.price?.value || canonical?.suggested_price || 0),
      };
    });

    const record: BppOrderRecord = {
      orderId: ondcOrder.id,
      transactionId: (ondcOrder as any).transaction_id || `txn_${Date.now()}`,
      messageId,
      items: itemsSummary,
      buyerName: ondcOrder.billing.name,
      buyerPhone: ondcOrder.billing.phone,
      buyerAddress: `${ondcOrder.billing.address.street || ""}, ${ondcOrder.billing.address.city}, ${ondcOrder.billing.address.state} - ${ondcOrder.billing.address.area_code}`,
      quote: ondcOrder.quote,
      status: ondcOrder.state,
      artisanJanDhanShare: internalMapped.artisanJanDhanShare,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rawOrderPayload: ondcOrder,
    };

    this.orders.set(ondcOrder.id, record);
    this.recordMessageProcessed(messageId);
    return record;
  }

  public getOrder(orderId: string): BppOrderRecord | undefined {
    return this.orders.get(orderId);
  }

  public getAllOrders(): BppOrderRecord[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public updateOrderStatus(orderId: string, status: BppOrderRecord["status"]) {
    const order = this.orders.get(orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      this.orders.set(orderId, order);
    }
  }
}

// Singleton BPP Store
export const bppCatalogStore = new OndcCatalogStore();
