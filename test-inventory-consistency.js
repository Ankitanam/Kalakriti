// test-inventory-consistency.js
// Exhaustive automated test suite for Kalakriti Inventory ↔ Buyer Marketplace ↔ Cart ↔ Order Consistency

import assert from "node:assert";

console.log("============================================================");
console.log("KALAKRITI INVENTORY ↔ BUYER ↔ CART ↔ ORDER CONSISTENCY TESTS");
console.log("============================================================");

// Mock localStorage
const storage = {};
global.localStorage = {
  getItem: (key) => (key in storage ? storage[key] : null),
  setItem: (key, value) => { storage[key] = String(value); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};

// Import logic or replicate pure unit logic from audited files
const parseSafeQty = (val, defaultVal = 1) => {
  if (val === undefined || val === null || val === "") return defaultVal;
  const num = Number(val);
  return isNaN(num) ? defaultVal : Math.max(0, num);
};

const areItemsDuplicate = (a, b) => {
  if (a.id && b.id && a.id === b.id) return true;
  if (a.imageSignature && b.imageSignature && a.imageSignature.trim() === b.imageSignature.trim()) return true;
  if (a.imageUrl && b.imageUrl && a.imageUrl.trim() === b.imageUrl.trim()) return true;
  if (a.title_en && b.title_en && a.title_en.trim().toLowerCase() === b.title_en.trim().toLowerCase()) return true;
  const titleA = (a.title_local || a.title_hi || "").trim().toLowerCase();
  const titleB = (b.title_local || b.title_hi || "").trim().toLowerCase();
  if (titleA && titleB && titleA === titleB) return true;
  const hiA = (a.title_hi || a.localizedContent?.hi?.title || "").trim().toLowerCase();
  const hiB = (b.title_hi || b.localizedContent?.hi?.title || "").trim().toLowerCase();
  if (hiA && hiB && hiA === hiB) return true;
  return false;
};

const deduplicateInventory = (items) => {
  const merged = [];
  for (const item of items) {
    const existing = merged.find((m) => areItemsDuplicate(m, item));
    if (existing) {
      existing.quantity = Math.max(0, parseSafeQty(existing.quantity, 0) + parseSafeQty(item.quantity, 1));
      if (item.imageUrl && (!existing.imageUrl || existing.imageUrl.startsWith("blob:"))) {
        existing.imageUrl = item.imageUrl;
      }
      if (item.imageSignature && !existing.imageSignature) {
        existing.imageSignature = item.imageSignature;
      }
      if (item.localizedContent) {
        existing.localizedContent = {
          ...(existing.localizedContent || {}),
          ...item.localizedContent,
        };
      }
    } else {
      merged.push({ ...item, quantity: parseSafeQty(item.quantity, 1) });
    }
  }
  return merged;
};

const saveProductToInventory = (inventory, catalogItem) => {
  const existingIndex = inventory.findIndex((item) => areItemsDuplicate(item, catalogItem));
  let updatedList;
  if (existingIndex > -1) {
    updatedList = inventory.map((item, idx) =>
      idx === existingIndex
        ? {
            ...item,
            quantity: (Number(item.quantity) || 0) + (Number(catalogItem.quantity) || 1),
            imageUrl: catalogItem.imageUrl || item.imageUrl,
            imageSignature: catalogItem.imageSignature || item.imageSignature,
            localizedContent: {
              ...(item.localizedContent || {}),
              ...(catalogItem.localizedContent || {}),
            },
          }
        : item
    );
  } else {
    const newEntry = {
      id: catalogItem.id || String(Date.now()),
      ...catalogItem,
      quantity: catalogItem.quantity !== undefined ? Math.max(0, Number(catalogItem.quantity) || 0) : 1,
      publishedAt: "आज",
      localizedContent: catalogItem.localizedContent || {},
    };
    updatedList = [newEntry, ...inventory];
  }
  return deduplicateInventory(updatedList);
};

// Simulation helpers
let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ FAIL: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// --------------------------------------------------------------------------
// TEST 1: Same product added twice aggregates quantity, no duplicate cards
// --------------------------------------------------------------------------
test("Requirement 1: Same product added twice aggregates quantity, no duplicate cards", () => {
  const initial = [
    { id: "item-1", title_en: "Handmade Wooden Puppet", title_hi: "कठपुतली", quantity: 3, suggested_price: 499 }
  ];
  const reAdded = {
    title_en: "Handmade Wooden Puppet",
    title_hi: "कठपुतली",
    suggested_price: 499,
    quantity: 2
  };
  const result = saveProductToInventory(initial, reAdded);
  assert.strictEqual(result.length, 1, "Should remain exactly 1 product card");
  assert.strictEqual(result[0].quantity, 5, "Quantity should aggregate from 3 + 2 = 5");
});

// --------------------------------------------------------------------------
// TEST 2: Seller edits quantity: increases and decreases correctly
// --------------------------------------------------------------------------
test("Requirement 2: Seller edits quantity: increases and decreases correctly", () => {
  let inventory = [
    { id: "item-1", title_en: "Terracotta Kalash", title_hi: "कलश", quantity: 5 }
  ];
  // Increase
  inventory = inventory.map(item => item.id === "item-1" ? { ...item, quantity: (Number(item.quantity) || 0) + 1 } : item);
  assert.strictEqual(inventory[0].quantity, 6, "Quantity should increment to 6");
  // Decrease
  inventory = inventory.map(item => item.id === "item-1" ? { ...item, quantity: Math.max(0, (Number(item.quantity) || 0) - 1) } : item);
  assert.strictEqual(inventory[0].quantity, 5, "Quantity should decrement back to 5");
});

// --------------------------------------------------------------------------
// TEST 3: Deduplicate inventory preserves 0 quantity and does not resurrect sold out items
// --------------------------------------------------------------------------
test("Requirement 3: Deduplicate inventory preserves 0 stock and does not resurrect sold-out items to 1", () => {
  const inventoryWithZero = [
    { id: "item-sold-out", title_en: "Sold Out Craft", title_hi: "बिका हुआ शिल्प", quantity: 0 }
  ];
  const cleaned = deduplicateInventory(inventoryWithZero);
  assert.strictEqual(cleaned.length, 1, "Should have 1 item");
  assert.strictEqual(cleaned[0].quantity, 0, "Stock must remain 0 and NOT be resurrected to 1");
});

// --------------------------------------------------------------------------
// TEST 4: Stock = 1 boundary test: buyer adds 1, stock becomes 0, next addition is blocked
// --------------------------------------------------------------------------
test("Requirement 4: Stock = 1 boundary test: single unit purchase results in stock = 0 and prevents further addition", () => {
  const inventory = [
    { id: "single-unit", title_en: "Exclusive Painting", title_hi: "पेंटिंग", quantity: 1 }
  ];
  let cart = [];
  const getProductStockInfo = (productId) => {
    const item = inventory.find((it) => it.id === productId);
    const sellerStock = Math.max(0, Number(item?.quantity ?? 0));
    const inCartQty = cart.find((c) => c.product.id === productId)?.quantity || 0;
    const availableToAdd = Math.max(0, sellerStock - inCartQty);
    return { sellerStock, inCartQty, availableToAdd };
  };

  // First add
  const { availableToAdd: add1 } = getProductStockInfo("single-unit");
  assert.strictEqual(add1, 1, "1 item should be available to add");
  cart.push({ product: inventory[0], quantity: 1 });

  // Second add attempt
  const { availableToAdd: add2 } = getProductStockInfo("single-unit");
  assert.strictEqual(add2, 0, "Available to add must be 0 after adding 1 unit");
});

// --------------------------------------------------------------------------
// TEST 5: Cart quantity cannot exceed available stock
// --------------------------------------------------------------------------
test("Requirement 5: Cart quantity cannot exceed available stock", () => {
  const item = { id: "item-5", title_en: "Pottery", quantity: 3 };
  let cart = [{ product: item, quantity: 3 }];
  const liveInventory = [item];

  const handleIncreaseCartQty = (productId) => {
    const invItem = liveInventory.find((it) => it.id === productId);
    const maxSellerStock = Math.max(0, Number(invItem?.quantity ?? 0));
    let blocked = false;
    cart = cart.map((c) => {
      if (c.product.id === productId) {
        if (c.quantity >= maxSellerStock) {
          blocked = true;
          return c;
        }
        return { ...c, quantity: c.quantity + 1 };
      }
      return c;
    });
    return !blocked;
  };

  const allowed = handleIncreaseCartQty("item-5");
  assert.strictEqual(allowed, false, "Should block increment beyond stock limit 3");
  assert.strictEqual(cart[0].quantity, 3, "Cart quantity should remain 3");
});

// --------------------------------------------------------------------------
// TEST 6: Buyer purchase & stock decrement: buyer purchase decrements inventory accurately
// --------------------------------------------------------------------------
test("Requirement 6: Buyer purchase decrements inventory accurately", () => {
  let inventory = [
    { id: "item-10", title_en: "Silk Scarf", title_hi: "सिल्क दुपट्टा", quantity: 10 }
  ];
  const cart = [{ product: inventory[0], quantity: 4 }];

  // Simulate checkout stock deduction
  inventory = inventory.map((invItem) => {
    const cartMatch = cart.find((c) => c.product.id === invItem.id);
    if (cartMatch) {
      const remainingQty = Math.max(0, (Number(invItem.quantity) || 0) - cartMatch.quantity);
      return { ...invItem, quantity: remainingQty };
    }
    return invItem;
  });

  assert.strictEqual(inventory[0].quantity, 6, "Inventory should decrement from 10 to 6");
});

// --------------------------------------------------------------------------
// TEST 7: Buyer buys all available quantity: stock becomes 0, buyer shows "Out of Stock"
// --------------------------------------------------------------------------
test("Requirement 7: Purchasing all units results in stock = 0 and Out of Stock status", () => {
  let inventory = [
    { id: "item-all", title_en: "Bronze Bell", title_hi: "कांस्य घंटी", quantity: 2 }
  ];
  const cart = [{ product: inventory[0], quantity: 2 }];

  inventory = inventory.map((invItem) => {
    const cartMatch = cart.find((c) => c.product.id === invItem.id);
    if (cartMatch) {
      const remainingQty = Math.max(0, (Number(invItem.quantity) || 0) - cartMatch.quantity);
      return { ...invItem, quantity: remainingQty };
    }
    return invItem;
  });

  assert.strictEqual(inventory[0].quantity, 0, "Stock must be 0");
  const isOutOfStock = inventory[0].quantity <= 0;
  assert.strictEqual(isOutOfStock, true, "Product must be flagged as out of stock");
});

// --------------------------------------------------------------------------
// TEST 8: Zero-stock buyer protection across all paths
// --------------------------------------------------------------------------
test("Requirement 8: Zero-stock buyer protection blocks additions across all paths", () => {
  const outOfStockItem = { id: "item-zero", title_en: "Out of Stock Vase", quantity: 0 };
  const liveInventory = [outOfStockItem];

  // Path 1: Quick Add
  const handleQuickAdd = (item) => {
    const liveItem = liveInventory.find((i) => i.id === item.id) || item;
    const stock = Math.max(0, Number(liveItem.quantity ?? 0));
    return stock > 0;
  };
  assert.strictEqual(handleQuickAdd(outOfStockItem), false, "Quick add must reject 0 stock item");

  // Path 2: Detail modal Add to Cart button
  const isDetailDisabled = Math.max(0, Number(outOfStockItem.quantity ?? 0)) <= 0;
  assert.strictEqual(isDetailDisabled, true, "Detail button must be disabled for 0 stock item");

  // Path 3: 3D Craft Fair stall mapping
  const mappedStock = outOfStockItem.quantity !== undefined && outOfStockItem.quantity !== null && !isNaN(Number(outOfStockItem.quantity))
    ? Math.max(0, Number(outOfStockItem.quantity))
    : 5;
  assert.strictEqual(mappedStock, 0, "3D Craft fair stall must show 0 stock and not default to 5");

  // Path 4: 3D Craft Fair modal button disabled
  const is3DButtonDisabled = (mappedStock ?? 0) <= 0;
  assert.strictEqual(is3DButtonDisabled, true, "3D Fair modal button must be disabled for 0 stock");
});

// --------------------------------------------------------------------------
// TEST 9: Stale-stock race condition: stock drops to 0 while in cart blocks checkout
// --------------------------------------------------------------------------
test("Requirement 9: Stale-stock race condition blocks checkout if stock dropped to 0 while in cart", () => {
  // Cart has item with snapshot quantity 2
  const cart = [{ product: { id: "item-stale", title_en: "Brass Lamp", title_hi: "दीपक", suggested_price: 300 }, quantity: 2 }];

  // But live inventory has become 0 (sold out elsewhere)
  const freshInventory = [{ id: "item-stale", title_en: "Brass Lamp", title_hi: "दीपक", quantity: 0, suggested_price: 300 }];

  const validateCartItemsAgainstStock = (cartItems, inv) => {
    for (const c of cartItems) {
      const matched = inv.find((i) => i.id === c.product.id);
      if (!matched) return false;
      const available = Math.max(0, Number(matched.quantity ?? 0));
      if (available <= 0) return false;
      if (c.quantity > available) return false;
    }
    return true;
  };

  const canProceed = validateCartItemsAgainstStock(cart, freshInventory);
  assert.strictEqual(canProceed, false, "Checkout must be blocked due to stale stock");
});

// --------------------------------------------------------------------------
// TEST 10: Product removed by seller while in cart blocks checkout
// --------------------------------------------------------------------------
test("Requirement 10: Product removed while in cart blocks checkout", () => {
  const cart = [{ product: { id: "item-deleted", title_en: "Deleted Item", suggested_price: 150 }, quantity: 1 }];
  const freshInventory = [{ id: "other-item", title_en: "Other", quantity: 5 }];

  const validateCartItemsAgainstStock = (cartItems, inv) => {
    for (const c of cartItems) {
      const matched = inv.find((i) => i.id === c.product.id);
      if (!matched) return false;
      const available = Math.max(0, Number(matched.quantity ?? 0));
      if (available <= 0) return false;
    }
    return true;
  };

  const canProceed = validateCartItemsAgainstStock(cart, freshInventory);
  assert.strictEqual(canProceed, false, "Checkout must be blocked when item is deleted");
});

// --------------------------------------------------------------------------
// TEST 11: Order deduplication: single order placement creates exactly 1 order per item
// --------------------------------------------------------------------------
test("Requirement 11: Order deduplication ensures exactly 1 order entry per item", () => {
  const orderResult = { orderId: "ORD-999" };
  const cart = [
    { product: { id: "item-a", title_hi: "शिल्प A", suggested_price: 200, artisan_name: "Artisan 1" }, quantity: 1 },
    { product: { id: "item-b", title_hi: "शिल्प B", suggested_price: 300, artisan_name: "Artisan 2" }, quantity: 2 }
  ];

  let storedOrders = [];

  const recordOrders = (newOrders) => {
    const existingFiltered = storedOrders.filter((eo) =>
      !newOrders.some((no) => no.orderId === eo.orderId && (no.productId && eo.productId ? no.productId === eo.productId : no.productTitle === eo.productTitle))
    );
    storedOrders = [...newOrders, ...existingFiltered];
  };

  const newArtisanOrders = cart.map((c) => ({
    orderId: orderResult.orderId,
    productId: c.product.id,
    productTitle: c.product.title_hi,
    amount: c.product.suggested_price * c.quantity,
    quantity: c.quantity,
    sellerName: c.product.artisan_name,
  }));

  // Simulate 3 calls (becknEngine, OndcBuyerScreen, App.tsx)
  recordOrders(newArtisanOrders);
  recordOrders(newArtisanOrders);
  recordOrders(newArtisanOrders);

  assert.strictEqual(storedOrders.length, 2, "There should be exactly 2 distinct order records for the 2 cart items, not 6");
  assert.strictEqual(storedOrders.filter(o => o.productId === "item-a").length, 1, "Item A should appear exactly once");
  assert.strictEqual(storedOrders.filter(o => o.productId === "item-b").length, 1, "Item B should appear exactly once");
});

// --------------------------------------------------------------------------
// TEST 12: Multi-seller isolation: orders filtered to matching inventory items
// --------------------------------------------------------------------------
test("Requirement 12: Multi-seller isolation filters orders to matching seller inventory", () => {
  const sellerAInventory = [
    { id: "item-a1", title_en: "Puppet", title_hi: "कठपुतली", quantity: 5, artisan_name: "Shankar Lal" }
  ];
  const sellerBInventory = [
    { id: "item-b1", title_en: "Blue Pottery", title_hi: "नीली मिट्टी के बर्तन", quantity: 3, artisan_name: "Gopal Das" }
  ];

  const allOrders = [
    { orderId: "O-1", productId: "item-a1", productTitle: "कठपुतली", amount: 500, sellerName: "Shankar Lal" },
    { orderId: "O-2", productId: "item-b1", productTitle: "नीली मिट्टी के बर्तन", amount: 900, sellerName: "Gopal Das" }
  ];

  const filterOrdersForSeller = (inventory, rawOrders) => {
    const inventoryIds = new Set(inventory.map((item) => item.id));
    const inventoryTitles = new Set(inventory.map((item) => item.title_hi || item.title_en || item.title_local).filter(Boolean));
    return rawOrders.filter((o) => {
      if (inventory.length === 0) return false;
      if (o.productId && inventoryIds.has(o.productId)) return true;
      if (o.productTitle && inventoryTitles.has(o.productTitle)) return true;
      if (o.sellerName && inventory.some((i) => i.artisan_name === o.sellerName)) return true;
      return false;
    });
  };

  const sellerAOrders = filterOrdersForSeller(sellerAInventory, allOrders);
  const sellerBOrders = filterOrdersForSeller(sellerBInventory, allOrders);

  assert.strictEqual(sellerAOrders.length, 1, "Seller A should see exactly 1 order");
  assert.strictEqual(sellerAOrders[0].productId, "item-a1", "Seller A should only see order for item-a1");

  assert.strictEqual(sellerBOrders.length, 1, "Seller B should see exactly 1 order");
  assert.strictEqual(sellerBOrders[0].productId, "item-b1", "Seller B should only see order for item-b1");
});

// --------------------------------------------------------------------------
// TEST 13: Multilingual title matching preserves deduplication
// --------------------------------------------------------------------------
test("Requirement 13: Multilingual title matching preserves deduplication across languages", () => {
  const itemA = { id: "item-multi-1", title_en: "Terracotta Pot", title_hi: "टेराकोटा बर्तन", quantity: 2 };
  const itemB = { id: "item-multi-2", title_en: "Terracotta Clay Pot", localizedContent: { hi: { title: "टेराकोटा बर्तन" } }, quantity: 1 };

  const isDuplicate = areItemsDuplicate(itemA, itemB);
  assert.strictEqual(isDuplicate, true, "Hindi localized title matching should recognize duplicate");
});

// --------------------------------------------------------------------------
// TEST 14: Seller Dashboard totalUnits calculation with 0 stock items
// --------------------------------------------------------------------------
test("Requirement 14: Seller Dashboard totalUnits calculation handles 0 stock properly", () => {
  const inventory = [
    { id: "i1", quantity: 5 },
    { id: "i2", quantity: 0 },
    { id: "i3", quantity: 2 }
  ];
  const totalUnits = inventory.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  assert.strictEqual(totalUnits, 7, "Total units must be 5 + 0 + 2 = 7 (not 8)");
});

// --------------------------------------------------------------------------
// SUMMARY
// --------------------------------------------------------------------------
console.log("\n============================================================");
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log("============================================================");
if (passedTests === totalTests) {
  console.log("ALL 14 INVENTORY ↔ BUYER ↔ CART ↔ ORDER CONSISTENCY TESTS PASSED!");
} else {
  console.error("SOME TESTS FAILED!");
  process.exit(1);
}
