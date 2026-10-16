// src/utils/craftFairStallService.ts
/**
 * Kalakriti Dynamic 3D Craft Fair Stall Service
 *
 * Responsibilities:
 * 1. Category extraction from products (local catalogue, ONDC, Supabase).
 * 2. Strict category normalization (whitespace trimming, case normalization, deduplication).
 * 3. Dynamic stall generation reflecting genuine marketplace products.
 * 4. Procedural layout coordinate assignment (walkable 2-row layout, zero overlap).
 * 5. Collision detection and player proximity evaluation.
 * 6. Multilingual stall signage across 7 Indic languages (hi, en, mr, bn, gu, ta, te).
 * 7. Empty state detection when inventory is empty.
 */

export type StallType =
  "textile" | "pottery" | "wood" | "jewellery" | "general";

export interface DynamicStallData {
  id: string;
  categoryKey: string;
  rawCategory: string;
  displayName: string;
  icon: string;
  type: StallType;
  color: string;
  x: number;
  z: number;
  facing: "left" | "right";
  products: any[];
  hasProducts?: boolean;
}

export interface StallVisualConfig {
  type: StallType;
  color: string;
  icon: string;
  translationKey?: string;
  defaultName: string;
}

export interface CoreCraftStallDefinition {
  id: string;
  categoryKey: string;
  defaultName: string;
  translationKey: string;
  icon: string;
  type: StallType;
  color: string;
  x: number;
  z: number;
  facing: "left" | "right";
}

/**
 * Foundational 6 Craft Pavilions representing India's core artisanal traditions.
 * Anchors the 3D promenade so all 6 visible stall plots remain populated.
 */
export const CORE_CRAFT_STALLS: CoreCraftStallDefinition[] = [
  {
    id: "stall-textile",
    categoryKey: "textile",
    defaultName: "Weaving",
    translationKey: "cat_weaving",
    icon: "🧵",
    type: "textile",
    color: "#b86f45",
    x: -6,
    z: -5,
    facing: "left",
  },
  {
    id: "stall-painting",
    categoryKey: "painting",
    defaultName: "Painting",
    translationKey: "cat_painting",
    icon: "🎨",
    type: "general",
    color: "#6b8e23",
    x: 6,
    z: -5,
    facing: "right",
  },
  {
    id: "stall-pottery",
    categoryKey: "pottery",
    defaultName: "Pottery",
    translationKey: "cat_pottery",
    icon: "🏺",
    type: "pottery",
    color: "#477da3",
    x: -6,
    z: 2,
    facing: "left",
  },
  {
    id: "stall-jewellery",
    categoryKey: "jewellery",
    defaultName: "Jewellery",
    translationKey: "cat_jewellery",
    icon: "💍",
    type: "jewellery",
    color: "#d19b35",
    x: 6,
    z: 2,
    facing: "right",
  },
  {
    id: "stall-wood",
    categoryKey: "wood",
    defaultName: "Woodcraft",
    translationKey: "cat_wood",
    icon: "🪵",
    type: "wood",
    color: "#9a633c",
    x: -6,
    z: 9,
    facing: "left",
  },
  {
    id: "stall-embroidery",
    categoryKey: "embroidery",
    defaultName: "Embroidery",
    translationKey: "cat_embroidery",
    icon: "🪡",
    type: "textile",
    color: "#a65f42",
    x: 6,
    z: 9,
    facing: "right",
  },
];

/**
 * Normalizes a category string by trimming, collapsing redundant whitespace,
 * and converting to Title Case for display.
 */
export function normalizeCategoryName(raw: string): string {
  if (!raw || typeof raw !== "string") return "Handicrafts";
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return "Handicrafts";

  // If already contains Indic characters, preserve trimmed string
  if (/[\u0900-\u0D7F]/.test(trimmed)) {
    return trimmed;
  }

  return trimmed
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Returns a canonical key for deduplication and grouping.
 * Variations like "pottery", "Pottery", "POTTERY", "  pottery  "
 * all produce the exact same key "pottery".
 */
export function getCategoryKey(raw: string): string {
  if (!raw || typeof raw !== "string") return "handicrafts";
  let trimmed = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (!trimmed) return "handicrafts";

  // Strip stall- prefix if present
  if (trimmed.startsWith("stall-")) {
    trimmed = trimmed.replace(/^stall-/, "");
  }

  // Remove leading emojis/symbols if any
  trimmed = trimmed.replace(/^[\p{Extended_Pictographic}\s]+/u, "").trim();

  // Check known craft keywords / Indic aliases
  if (
    /potter|मिट्टी|मातीकाम|मृৎশিল্প|మాటీకామ|மட்பாண்டம்|కుండలు|clay|terracotta|kalash|कलश|earthen|ghada|घड़ा|matka|मटका|ceramic/i.test(
      trimmed,
    )
  ) {
    return "pottery";
  }
  if (
    /wood|लाकूडकाम|दारुশিল্প|લાકડાકામ|மரவேலை|చెక్కపని|लकड़ी|कठपुतली|puppet|doll|bamboo|timber|cane/i.test(
      trimmed,
    )
  ) {
    return "wood";
  }
  if (
    /weav|textile|handloom|saree|silk|बुनाई|विणकाम|বয়নশিল্প|વણાટકામ|நெசவு|నేతపని|fabric|cloth|cotton|wool|shawl|linen/i.test(
      trimmed,
    )
  ) {
    return "textile";
  }
  if (
    /jewel|gold|silver|आभूषण|गहने|दागिने|গহনা|ઘરેણાં|நகைகள்|నగలు|bangle|necklace|earring|filigree|bead|gem|stone/i.test(
      trimmed,
    )
  ) {
    return "jewellery";
  }
  if (
    /\b(paint|painting|paintings|fine art|traditional art|folk art|wall art|canvas|madhubani|pichwai|warli|thangka|miniature|tanjore|gond|kalamkari)\b|चित्रकारी|चित्रकला|চিত্রকর্ম|ચિત્રકામ|ஓவியம்|చిత్రకళ/i.test(
      trimmed,
    )
  ) {
    return "painting";
  }
  // Standalone "art" matching: only if not "artisan" or "earthen"
  if (
    /\bart\b/i.test(trimmed) &&
    !/\b(artisan|earthen|earth)\b/i.test(trimmed)
  ) {
    return "painting";
  }
  if (
    /embroider|कढ़ाई|भरतकाम|সূচিকর্ম|ભરતકામ|பூவேலை|ఎంబ్రాయిడరీ|needlework|zardozi|chikankari|phulkari/i.test(
      trimmed,
    )
  ) {
    return "embroidery";
  }
  if (
    /metal|धातु|धातूकाम|ধাতুশিল্প|ધાતુકામ|உலோக கைவினை|లోహపు పని|brass|copper|bronze|iron/i.test(
      trimmed,
    )
  ) {
    return "metal";
  }
  if (/leather|चर्म|कातडी|ચર્મકામ|தோல்|తోలు/i.test(trimmed)) {
    return "leather";
  }

  return trimmed;
}

/**
 * Visual styling lookup table for standard craft categories.
 */
export const CRAFT_VISUAL_PALETTE: Record<string, StallVisualConfig> = {
  pottery: {
    type: "pottery",
    color: "#477da3",
    icon: "🏺",
    translationKey: "cat_pottery",
    defaultName: "Pottery",
  },
  wood: {
    type: "wood",
    color: "#9a633c",
    icon: "🪵",
    translationKey: "cat_wood",
    defaultName: "Woodcraft",
  },
  textile: {
    type: "textile",
    color: "#b86f45",
    icon: "🧵",
    translationKey: "cat_weaving",
    defaultName: "Weaving",
  },
  jewellery: {
    type: "jewellery",
    color: "#d19b35",
    icon: "💍",
    translationKey: "cat_jewellery",
    defaultName: "Jewellery",
  },
  painting: {
    type: "general",
    color: "#6b8e23",
    icon: "🎨",
    translationKey: "cat_painting",
    defaultName: "Painting",
  },
  embroidery: {
    type: "textile",
    color: "#a65f42",
    icon: "🪡",
    translationKey: "cat_embroidery",
    defaultName: "Embroidery",
  },
  metal: {
    type: "jewellery",
    color: "#708090",
    icon: "⚒️",
    translationKey: "cat_metal",
    defaultName: "Metalcraft",
  },
  leather: {
    type: "general",
    color: "#8b5a2b",
    icon: "🧳",
    translationKey: "cat_leather",
    defaultName: "Leathercraft",
  },
  handicrafts: {
    type: "general",
    color: "#c47a52",
    icon: "🪆",
    translationKey: "cat_handicraft",
    defaultName: "Handicrafts",
  },
};

/**
 * Infers 3D stall model type, canopy color, and icon for any category key.
 */
export function inferCraftTypeAndVisuals(
  categoryKey: string,
): StallVisualConfig {
  if (CRAFT_VISUAL_PALETTE[categoryKey]) {
    return CRAFT_VISUAL_PALETTE[categoryKey];
  }

  // Keyword heuristic for dynamic artisan additions
  if (/wood|bamboo|timber|cane/i.test(categoryKey)) {
    return {
      type: "wood",
      color: "#9a633c",
      icon: "🪵",
      defaultName: normalizeCategoryName(categoryKey),
    };
  }
  if (/pot|clay|ceramic|terracotta|mud/i.test(categoryKey)) {
    return {
      type: "pottery",
      color: "#477da3",
      icon: "🏺",
      defaultName: normalizeCategoryName(categoryKey),
    };
  }
  if (
    /cloth|textile|silk|saree|cotton|wool|shawl|weave|linen/i.test(categoryKey)
  ) {
    return {
      type: "textile",
      color: "#a65f42",
      icon: "🧵",
      defaultName: normalizeCategoryName(categoryKey),
    };
  }
  if (/jewel|gold|silver|bead|gem|stone|necklace|bangle/i.test(categoryKey)) {
    return {
      type: "jewellery",
      color: "#d19b35",
      icon: "💍",
      defaultName: normalizeCategoryName(categoryKey),
    };
  }

  // Procedural deterministic color based on category string
  let hash = 0;
  for (let i = 0; i < categoryKey.length; i++) {
    hash = (hash << 5) - hash + categoryKey.charCodeAt(i);
    hash |= 0;
  }
  const proceduralColors = [
    "#b86f45",
    "#477da3",
    "#9a633c",
    "#a65f42",
    "#d19b35",
    "#6b8e23",
    "#a0522d",
    "#5c6f84",
  ];
  const color = proceduralColors[Math.abs(hash) % proceduralColors.length];

  return {
    type: "general",
    color,
    icon: "✨",
    defaultName: normalizeCategoryName(categoryKey),
  };
}

/**
 * Extracts category from any product record safely.
 */
export function extractProductCategory(product: any): string {
  if (!product) return "Handicrafts";

  if (
    product.categoryName &&
    typeof product.categoryName === "string" &&
    product.categoryName.trim()
  ) {
    return product.categoryName.trim();
  }
  if (
    product.category &&
    typeof product.category === "string" &&
    product.category.trim()
  ) {
    return product.category.trim();
  }
  if (
    product.craft &&
    typeof product.craft === "string" &&
    product.craft.trim()
  ) {
    return product.craft.trim();
  }

  // Inspect tags
  if (Array.isArray(product.tags)) {
    for (const tag of product.tags) {
      if (typeof tag === "string" && tag.trim()) {
        const lower = tag.trim().toLowerCase();
        if (
          lower !== "ondc ready" &&
          lower !== "handmade" &&
          lower !== "rajasthan" &&
          lower !== "india"
        ) {
          return tag.trim();
        }
      }
    }
  }

  // Inspect specs
  if (Array.isArray(product.specs_en)) {
    const craftSpec = product.specs_en.find((s: any) =>
      /craft|type|style/i.test(s.label || ""),
    );
    if (craftSpec && craftSpec.value) return craftSpec.value;
  }
  if (Array.isArray(product.specs_hi)) {
    const craftSpec = product.specs_hi.find((s: any) =>
      /कला|शैली|प्रकार/i.test(s.label || ""),
    );
    if (craftSpec && craftSpec.value) return craftSpec.value;
  }
  if (Array.isArray(product.specs_local)) {
    const craftSpec = product.specs_local.find((s: any) =>
      /कला|शैली|प्रकार/i.test(s.label || ""),
    );
    if (craftSpec && craftSpec.value) return craftSpec.value;
  }

  // Inspect title text for craft hints
  const titleText =
    `${product.title || ""} ${product.title_en || ""} ${product.title_hi || ""} ${product.title_local || ""}`.toLowerCase();
  if (
    /potter|clay|terracotta|कलश|घड़ा|मटका|मिट्टी|ceramic|earthen/i.test(
      titleText,
    )
  )
    return "Pottery";
  if (/puppet|wood|कठपुतली|लकड़ी/i.test(titleText)) return "Woodcraft";
  if (/silk|saree|handloom|weave|सूट|दुपट्टा|कपड़ा/i.test(titleText))
    return "Weaving";
  if (/jewel|necklace|bangle|earring|filigree|आभूषण|गहने|माला/i.test(titleText))
    return "Jewellery";
  if (
    /\b(paint|painting|paintings|madhubani|pichwai|warli)\b|चित्रकारी|चित्रकला|চিত্রকর্ম/i.test(
      titleText,
    )
  )
    return "Painting";
  if (/embroider|कढ़ाई|भरतकाम|zardozi|chikankari|phulkari/i.test(titleText))
    return "Embroidery";

  return "Handicrafts";
}

/**
 * Formats localized stall name with iconic visual cue for low-literacy artisans.
 */
export function getLocalizedStallName(
  categoryKey: string,
  rawName: string,
  currentLang: string = "en",
  translations?: Record<string, Record<string, string>>,
): string {
  const visuals = inferCraftTypeAndVisuals(categoryKey);

  if (
    visuals.translationKey &&
    translations &&
    translations[visuals.translationKey]
  ) {
    const langMap = translations[visuals.translationKey];
    const translated = langMap[currentLang] || langMap["en"] || langMap["hi"];
    if (translated) {
      return `${visuals.icon} ${translated}`;
    }
  }

  // If rawName is already an Indic string, prefix icon
  if (/[\u0900-\u0D7F]/.test(rawName)) {
    return `${visuals.icon} ${rawName.trim()}`;
  }

  const normalized = normalizeCategoryName(rawName);
  return `${visuals.icon} ${normalized}`;
}

export interface GenerateStallsOptions {
  ensureSixStalls?: boolean;
}

/**
 * Dynamically generates 3D stall definitions from marketplace products.
 *
 * Rules:
 * - Empty inventory -> returns empty array [] (triggering 3D empty state).
 * - Restores all 6 foundational stall positions along the promenade so no empty wasteland or missing stalls occur.
 * - Stalls with active products display their genuine inventory and badge counts.
 * - Stalls without active products display an honest empty state with zero fake products.
 * - Custom and overflow categories (>6) are safely appended along the road without overlap.
 * - If ensureSixStalls is explicitly false, generates only populated category stalls.
 */
export function generateDynamicStalls(
  products: any[],
  currentLang: string = "en",
  translations?: Record<string, Record<string, string>>,
  options?: GenerateStallsOptions,
): DynamicStallData[] {
  if (!products || !Array.isArray(products) || products.length === 0) {
    return [];
  }

  const ensureSix = options?.ensureSixStalls !== false;

  // Filter products with stock > 0
  const activeProducts = products.filter((p) => {
    if (!p) return false;
    const stock = Number(p.stock ?? p.quantity ?? 1);
    return !isNaN(stock) && stock > 0;
  });

  if (activeProducts.length === 0) {
    return [];
  }

  // Group products by canonical category key
  const categoryGroups = new Map<
    string,
    { rawName: string; products: any[] }
  >();

  for (const product of activeProducts) {
    const rawCat = extractProductCategory(product);
    const key = getCategoryKey(rawCat);

    if (!categoryGroups.has(key)) {
      categoryGroups.set(key, { rawName: rawCat, products: [] });
    }
    categoryGroups.get(key)!.products.push(product);
  }

  if (categoryGroups.size === 0) {
    return [];
  }

  // If ensureSixStalls is explicitly false, fall back to pure dynamic row layout
  if (!ensureSix) {
    const stallKeys = Array.from(categoryGroups.keys());
    const N = stallKeys.length;
    const totalRows = Math.ceil(N / 2);
    const startZ = 2 - ((totalRows - 1) * 7) / 2;
    const dynamicStalls: DynamicStallData[] = [];

    stallKeys.forEach((key, index) => {
      const group = categoryGroups.get(key)!;
      const rowIndex = Math.floor(index / 2);
      const isLeft = index % 2 === 0;
      const x = isLeft ? -6 : 6;
      const z = startZ + rowIndex * 7;
      const facing: "left" | "right" = isLeft ? "left" : "right";
      const visuals = inferCraftTypeAndVisuals(key);
      const displayName = getLocalizedStallName(
        key,
        group.rawName,
        currentLang,
        translations,
      );

      dynamicStalls.push({
        id: `stall-${key}`,
        categoryKey: key,
        rawCategory: group.rawName,
        displayName,
        icon: visuals.icon,
        type: visuals.type,
        color: visuals.color,
        x,
        z,
        facing,
        products: group.products,
        hasProducts: true,
      });
    });

    return dynamicStalls;
  }

  // Default: ensureSixStalls = true (Restores all 6 core promenade stall positions)
  const assignedSlots = new Map<number, DynamicStallData>();
  const assignedKeys = new Set<string>();

  // Pass 1: Match active categories that directly match core slot category keys
  CORE_CRAFT_STALLS.forEach((core, slotIndex) => {
    if (categoryGroups.has(core.categoryKey)) {
      const group = categoryGroups.get(core.categoryKey)!;
      const visuals = inferCraftTypeAndVisuals(core.categoryKey);
      const displayName = getLocalizedStallName(
        core.categoryKey,
        group.rawName,
        currentLang,
        translations,
      );

      assignedSlots.set(slotIndex, {
        id: `stall-${core.categoryKey}`,
        categoryKey: core.categoryKey,
        rawCategory: group.rawName,
        displayName,
        icon: visuals.icon,
        type: visuals.type,
        color: visuals.color,
        x: core.x,
        z: core.z,
        facing: core.facing,
        products: group.products,
        hasProducts: true,
      });
      assignedKeys.add(core.categoryKey);
    }
  });

  // Pass 2: Place remaining active categories (e.g. custom crafts) into available core slots
  const unassignedActiveEntries = Array.from(categoryGroups.entries()).filter(
    ([key]) => !assignedKeys.has(key),
  );

  for (const [key, group] of unassignedActiveEntries) {
    let targetSlotIndex = -1;
    for (let i = 0; i < 6; i++) {
      if (!assignedSlots.has(i)) {
        targetSlotIndex = i;
        break;
      }
    }

    if (targetSlotIndex !== -1) {
      const core = CORE_CRAFT_STALLS[targetSlotIndex];
      const visuals = inferCraftTypeAndVisuals(key);
      const displayName = getLocalizedStallName(
        key,
        group.rawName,
        currentLang,
        translations,
      );

      assignedSlots.set(targetSlotIndex, {
        id: `stall-${key}`,
        categoryKey: key,
        rawCategory: group.rawName,
        displayName,
        icon: visuals.icon,
        type: visuals.type,
        color: visuals.color,
        x: core.x,
        z: core.z,
        facing: core.facing,
        products: group.products,
        hasProducts: true,
      });
      assignedKeys.add(key);
    }
  }

  // Pass 3: Fill any remaining vacant core slots as honest empty core stalls (NO fake products)
  for (let i = 0; i < 6; i++) {
    if (!assignedSlots.has(i)) {
      const core = CORE_CRAFT_STALLS[i];
      const visuals = inferCraftTypeAndVisuals(core.categoryKey);
      const displayName = getLocalizedStallName(
        core.categoryKey,
        core.defaultName,
        currentLang,
        translations,
      );

      assignedSlots.set(i, {
        id: core.id,
        categoryKey: core.categoryKey,
        rawCategory: core.defaultName,
        displayName,
        icon: visuals.icon,
        type: visuals.type,
        color: visuals.color,
        x: core.x,
        z: core.z,
        facing: core.facing,
        products: [],
        hasProducts: false,
      });
    }
  }

  // Pass 4: Overflow categories beyond 6 are appended along the road (Row 3 at z = 16, Row 4 at z = 23, etc.)
  const overflowEntries = unassignedActiveEntries.filter(
    ([key]) => !assignedKeys.has(key),
  );
  const overflowStalls: DynamicStallData[] = [];

  overflowEntries.forEach(([key, group], overflowIdx) => {
    const overallIndex = 6 + overflowIdx;
    const rowIndex = Math.floor(overallIndex / 2);
    const isLeft = overallIndex % 2 === 0;
    const x = isLeft ? -6 : 6;
    const z = -5 + rowIndex * 7;
    const facing: "left" | "right" = isLeft ? "left" : "right";
    const visuals = inferCraftTypeAndVisuals(key);
    const displayName = getLocalizedStallName(
      key,
      group.rawName,
      currentLang,
      translations,
    );

    overflowStalls.push({
      id: `stall-${key}`,
      categoryKey: key,
      rawCategory: group.rawName,
      displayName,
      icon: visuals.icon,
      type: visuals.type,
      color: visuals.color,
      x,
      z,
      facing,
      products: group.products,
      hasProducts: true,
    });
  });

  const finalStalls: DynamicStallData[] = [];
  for (let i = 0; i < 6; i++) {
    finalStalls.push(assignedSlots.get(i)!);
  }
  finalStalls.push(...overflowStalls);

  return finalStalls;
}

/**
 * Filters products that genuinely belong to a specific stall category.
 */
export function getStallProducts(
  products: any[],
  stallCategoryKeyOrName: string,
): any[] {
  if (!products || !Array.isArray(products) || products.length === 0) {
    return [];
  }

  const queryKey = getCategoryKey(stallCategoryKeyOrName);

  return products.filter((product) => {
    if (!product) return false;
    const prodCat = extractProductCategory(product);
    const prodKey = getCategoryKey(prodCat);
    if (prodKey === queryKey) return true;

    // Check if product category name directly matches query key
    if (product.category && getCategoryKey(product.category) === queryKey)
      return true;
    if (
      product.categoryName &&
      getCategoryKey(product.categoryName) === queryKey
    )
      return true;
    if (product.craft && getCategoryKey(product.craft) === queryKey)
      return true;

    return false;
  });
}

/**
 * Evaluates whether a given player position collides with any stall boundary.
 */
export function isStallCollision(
  x: number,
  z: number,
  stalls: DynamicStallData[],
  halfWidthX = 2.3,
  halfDepthZ = 1.85,
): boolean {
  if (!stalls || stalls.length === 0) return false;

  for (const stall of stalls) {
    if (
      Math.abs(x - stall.x) < halfWidthX &&
      Math.abs(z - stall.z) < halfDepthZ
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Finds the nearest stall within the specified maximum interaction distance.
 */
export function findNearestStall(
  playerX: number,
  playerZ: number,
  stalls: DynamicStallData[],
  maxDistance: number = 4,
): DynamicStallData | null {
  if (!stalls || stalls.length === 0) return null;

  let nearest: DynamicStallData | null = null;
  let closestDist = maxDistance;

  for (const stall of stalls) {
    const dx = playerX - stall.x;
    const dz = playerZ - stall.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < closestDist) {
      closestDist = dist;
      nearest = stall;
    }
  }

  return nearest;
}
