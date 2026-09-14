// src/utils/gamificationService.ts
import { useState, useEffect } from "react";
/**
 * Kalakriti Buyer Gamification & Artisan Discovery Service
 * Connects buyer engagement directly to discovering authentic Indian handicrafts and supporting rural artisans.
 */

export interface BuyerBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
}

export interface DiscoveryQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  current: number;
  target: number;
  completed: boolean;
}

export interface GamificationState {
  xp: number;
  level: number;
  levelTitle: string;
  xpForNextLevel: number;
  badges: string[]; // Badge IDs
  discoveredCrafts: string[]; // Categories/items explored
  discoveredProductIds?: string[]; // Unique product IDs viewed
  visitedStalls: string[]; // Stalls visited in 3D Fair
  supportedArtisans: number; // Orders placed
  streakDays: number;
  lastActiveDate: string;
  quests: DiscoveryQuest[];
  awardedEvents?: string[]; // Persistent idempotent event keys
}

const STORAGE_KEY = "kalakriti_buyer_gamification";
const GAMIFICATION_EVENT = "kalakriti_gamification_update";

export const BADGE_DEFINITIONS: Record<string, BuyerBadge> = {
  craft_explorer: {
    id: "craft_explorer",
    name: "Craft Explorer",
    icon: "🧭",
    description: "Explored your first authentic handcrafted artisan product.",
  },
  fair_wanderer: {
    id: "fair_wanderer",
    name: "Fair Wanderer",
    icon: "🎪",
    description: "Entered the 3D Virtual Craft Fair and explored artisan stalls.",
  },
  pottery_patron: {
    id: "pottery_patron",
    name: "Pottery Patron",
    icon: "🏺",
    description: "Discovered traditional terracotta or blue pottery craftsmanship.",
  },
  weaves_admirer: {
    id: "weaves_admirer",
    name: "Weaves Admirer",
    icon: "🧵",
    description: "Explored authentic handloom and Banarasi silk craft heritage.",
  },
  folk_art_lover: {
    id: "folk_art_lover",
    name: "Folk Art Lover",
    icon: "🎨",
    description: "Appreciated Madhubani, Warli, or regional folk art paintings.",
  },
  heritage_guardian: {
    id: "heritage_guardian",
    name: "Heritage Guardian",
    icon: "👑",
    description: "Supported a rural artisan with a confirmed marketplace order.",
  },
};

const INITIAL_QUESTS: DiscoveryQuest[] = [
  {
    id: "explore_fair",
    title: "Visit 3D Craft Fair",
    description: "Step into the virtual fair and visit an artisan stall.",
    xpReward: 50,
    current: 0,
    target: 1,
    completed: false,
  },
  {
    id: "discover_crafts",
    title: "Discover 3 Indian Crafts",
    description: "View details of 3 distinct traditional handicraft items.",
    xpReward: 75,
    current: 0,
    target: 3,
    completed: false,
  },
  {
    id: "support_artisan",
    title: "Support an Artisan",
    description: "Add an item to cart and proceed to purchase.",
    xpReward: 100,
    current: 0,
    target: 1,
    completed: false,
  },
];

export function getLevelTitle(level: number): string {
  if (level >= 6) return "Heritage Grandmaster";
  if (level >= 5) return "Master Connoisseur";
  if (level >= 4) return "Heritage Patron";
  if (level >= 3) return "Craft Collector";
  if (level >= 2) return "Cultural Enthusiast";
  return "Craft Explorer";
}

export function getLocalizedLevelTitle(level: number, t?: (key: any) => string): string {
  if (t) {
    if (level >= 6) {
      const grandmaster = t("level_heritage_grandmaster" as any);
      return grandmaster && grandmaster !== "level_heritage_grandmaster" ? grandmaster : t("level_master_connoisseur");
    }
    if (level >= 5) return t("level_master_connoisseur");
    if (level >= 4) return t("level_heritage_patron");
    if (level >= 3) return t("level_craft_collector");
    if (level >= 2) return t("level_cultural_enthusiast");
    return t("level_craft_explorer");
  }
  return getLevelTitle(level);
}

export function getLocalizedBadge(badgeId: string, t?: (key: any) => string): BuyerBadge {
  const base = BADGE_DEFINITIONS[badgeId] || {
    id: badgeId,
    name: badgeId,
    icon: "🎖️",
    description: "",
  };
  if (!t) return base;

  const titleKey = `badge_${badgeId}_title`;
  const descKey = `badge_${badgeId}_desc`;

  const translatedTitle = t(titleKey as any);
  const translatedDesc = t(descKey as any);

  return {
    ...base,
    name: translatedTitle && translatedTitle !== titleKey ? translatedTitle : base.name,
    description: translatedDesc && translatedDesc !== descKey ? translatedDesc : base.description,
  };
}

export function getLocalizedQuest(quest: DiscoveryQuest, t?: (key: any) => string): DiscoveryQuest {
  if (!t) return quest;
  const titleKey = `quest_${quest.id}_title`;
  const descKey = `quest_${quest.id}_desc`;

  const translatedTitle = t(titleKey as any);
  const translatedDesc = t(descKey as any);

  return {
    ...quest,
    title: translatedTitle && translatedTitle !== titleKey ? translatedTitle : quest.title,
    description: translatedDesc && translatedDesc !== descKey ? translatedDesc : quest.description,
  };
}

export function calculateLevel(xp: number): { level: number; xpForNextLevel: number; minXpForCurrentLevel: number } {
  // Level 1: 0-99 XP, Level 2: 100-249 XP, Level 3: 250-499 XP, Level 4: 500-999 XP, Level 5: 1000-1999 XP, Level 6+: 2000+ XP
  if (xp >= 2000) return { level: 6, xpForNextLevel: 3500, minXpForCurrentLevel: 2000 };
  if (xp >= 1000) return { level: 5, xpForNextLevel: 2000, minXpForCurrentLevel: 1000 };
  if (xp >= 500) return { level: 4, xpForNextLevel: 1000, minXpForCurrentLevel: 500 };
  if (xp >= 250) return { level: 3, xpForNextLevel: 500, minXpForCurrentLevel: 250 };
  if (xp >= 100) return { level: 2, xpForNextLevel: 250, minXpForCurrentLevel: 100 };
  return { level: 1, xpForNextLevel: 100, minXpForCurrentLevel: 0 };
}

export interface NextLevelInfo {
  nextLevel: number;
  nextLevelXp: number;
  xpRemaining: number;
  nextLevelTitle: string;
  progressPercent: number;
}

export function getNextLevelInfo(level: number, xp: number, t?: (key: any) => string): NextLevelInfo {
  const currentThresholds = calculateLevel(xp);
  const nextLevel = currentThresholds.level + 1;
  const nextLevelXp = currentThresholds.xpForNextLevel;
  const xpRemaining = Math.max(0, nextLevelXp - xp);
  const minXp = currentThresholds.minXpForCurrentLevel;
  const range = Math.max(1, nextLevelXp - minXp);
  const progressPercent = Math.min(100, Math.max(0, Math.round(((xp - minXp) / range) * 100)));
  const nextLevelTitle = getLocalizedLevelTitle(nextLevel, t);

  return {
    nextLevel,
    nextLevelXp,
    xpRemaining,
    nextLevelTitle,
    progressPercent,
  };
}

export function getGamificationState(): GamificationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const { level, xpForNextLevel } = calculateLevel(parsed.xp || 0);
      return {
        ...parsed,
        level,
        levelTitle: getLevelTitle(level),
        xpForNextLevel,
        quests: parsed.quests && parsed.quests.length > 0 ? parsed.quests : INITIAL_QUESTS,
        discoveredProductIds: Array.isArray(parsed.discoveredProductIds) ? parsed.discoveredProductIds : [],
        awardedEvents: Array.isArray(parsed.awardedEvents) ? parsed.awardedEvents : ["welcome_bonus"],
      };
    }
  } catch (e) {
    console.warn("[GAMIFICATION] Failed to read state from localStorage:", e);
  }

  return {
    xp: 25, // Welcome bonus for discovering Kalakriti
    level: 1,
    levelTitle: "Craft Explorer",
    xpForNextLevel: 100,
    badges: ["craft_explorer"],
    discoveredCrafts: [],
    discoveredProductIds: [],
    visitedStalls: [],
    supportedArtisans: 0,
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split("T")[0],
    quests: INITIAL_QUESTS,
    awardedEvents: ["welcome_bonus"],
  };
}

export function saveGamificationState(state: GamificationState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(GAMIFICATION_EVENT, { detail: state }));
  } catch (e) {
    console.warn("[GAMIFICATION] Failed to save state to localStorage:", e);
  }
}

export function awardIdempotentXp(
  eventKey: string,
  amount: number,
  reason?: string
): { state: GamificationState; leveledUp: boolean; xpEarned: number } {
  if (!eventKey) return awardXp(amount, reason);
  const current = getGamificationState();
  const awarded = current.awardedEvents || [];

  if (awarded.includes(eventKey)) {
    return { state: current, leveledUp: false, xpEarned: 0 };
  }

  const oldLevel = current.level;
  const newXp = (current.xp || 0) + amount;
  const { level: newLevel, xpForNextLevel } = calculateLevel(newXp);
  const leveledUp = newLevel > oldLevel;

  const updated: GamificationState = {
    ...current,
    xp: newXp,
    level: newLevel,
    levelTitle: getLevelTitle(newLevel),
    xpForNextLevel,
    awardedEvents: [...awarded, eventKey],
  };

  if (reason) {
    console.log(`[GAMIFICATION] +${amount} XP (${reason}). Total: ${newXp} XP (Level ${newLevel}) [Event: ${eventKey}]`);
  }

  saveGamificationState(updated);
  return { state: updated, leveledUp, xpEarned: amount };
}

export function awardXp(
  amount: number,
  reason?: string
): { state: GamificationState; leveledUp: boolean; xpEarned: number } {
  const current = getGamificationState();
  const oldLevel = current.level;
  const newXp = (current.xp || 0) + amount;
  const { level: newLevel, xpForNextLevel } = calculateLevel(newXp);
  const leveledUp = newLevel > oldLevel;

  const updated: GamificationState = {
    ...current,
    xp: newXp,
    level: newLevel,
    levelTitle: getLevelTitle(newLevel),
    xpForNextLevel,
  };

  if (reason) {
    console.log(`[GAMIFICATION] +${amount} XP (${reason}). Total: ${newXp} XP (Level ${newLevel})`);
  }

  saveGamificationState(updated);
  return { state: updated, leveledUp, xpEarned: amount };
}

export function recordCraftDiscovery(
  craftIdOrName: string,
  craftCategory?: string
): GamificationState {
  if (!craftIdOrName) return getGamificationState();
  const current = getGamificationState();

  const rawName = craftCategory || craftIdOrName;
  const cleanName = rawName.trim().toLowerCase();
  const productId = craftCategory ? craftIdOrName.trim() : "";
  const effectiveId = productId || cleanName;

  const awarded = current.awardedEvents || [];
  const discoveredProducts = current.discoveredProductIds || [];

  // Check if duplicate product or craft discovery
  const alreadyDiscoveredProduct = productId ? discoveredProducts.includes(productId) : false;
  if (current.discoveredCrafts.includes(cleanName) && (alreadyDiscoveredProduct || !productId)) {
    return current;
  }

  const updatedDiscoveredCrafts = current.discoveredCrafts.includes(cleanName)
    ? current.discoveredCrafts
    : [...current.discoveredCrafts, cleanName];

  const updatedProductIds = (productId && !discoveredProducts.includes(productId))
    ? [...discoveredProducts, productId]
    : discoveredProducts;

  const newBadges = [...current.badges];
  if (!newBadges.includes("craft_explorer")) {
    newBadges.push("craft_explorer");
  }

  // Check specific craft badges
  if (/pottery|मिट्टी|कलश|हांडी|clay/i.test(cleanName) && !newBadges.includes("pottery_patron")) {
    newBadges.push("pottery_patron");
  }
  if (/weaving|banarasi|handloom|बुनाई|silk|saree/i.test(cleanName) && !newBadges.includes("weaves_admirer")) {
    newBadges.push("weaves_admirer");
  }
  if (/painting|madhubani|warli|चित्रकारी|चित्र/i.test(cleanName) && !newBadges.includes("folk_art_lover")) {
    newBadges.push("folk_art_lover");
  }

  // Update quests: count unique discoveries
  const uniqueCount = Math.max(updatedDiscoveredCrafts.length, updatedProductIds.length);
  const questCompleted = uniqueCount >= 3;

  const updatedQuests = current.quests.map((q) => {
    if (q.id === "discover_crafts") {
      const nextCount = Math.min(q.target, uniqueCount);
      return {
        ...q,
        current: nextCount,
        completed: nextCount >= q.target,
      };
    }
    return q;
  });

  // Calculate XP idempotently
  let bonusXp = 0;
  const newAwarded = [...awarded];

  // 1. Discovery XP (+25 XP per unique craft/product)
  const discoveryEventKey = `craft_discovered:${effectiveId}`;
  if (!newAwarded.includes(discoveryEventKey)) {
    newAwarded.push(discoveryEventKey);
    bonusXp += 25;
  }

  // 2. Quest completion reward (+75 XP once)
  if (questCompleted && !newAwarded.includes("quest:discover_crafts")) {
    newAwarded.push("quest:discover_crafts");
    bonusXp += 75;
  }

  const newXp = current.xp + bonusXp;
  const { level, xpForNextLevel } = calculateLevel(newXp);

  const updated: GamificationState = {
    ...current,
    xp: newXp,
    level,
    levelTitle: getLevelTitle(level),
    xpForNextLevel,
    discoveredCrafts: updatedDiscoveredCrafts,
    discoveredProductIds: updatedProductIds,
    badges: newBadges,
    quests: updatedQuests,
    awardedEvents: newAwarded,
  };

  saveGamificationState(updated);
  return updated;
}

export function recordStallVisit(stallName: string): GamificationState {
  if (!stallName) return getGamificationState();
  const current = getGamificationState();
  const cleanStall = stallName.trim();
  const stallKey = cleanStall.toLowerCase();

  const isFirstVisit = !current.visitedStalls.includes(cleanStall);
  const newVisited = isFirstVisit
    ? [...current.visitedStalls, cleanStall]
    : current.visitedStalls;

  const newBadges = [...current.badges];
  if (!newBadges.includes("fair_wanderer")) {
    newBadges.push("fair_wanderer");
  }

  const updatedQuests = current.quests.map((q) => {
    if (q.id === "explore_fair") {
      return { ...q, current: 1, completed: true };
    }
    return q;
  });

  const awarded = current.awardedEvents || [];
  const newAwarded = [...awarded];
  let bonusXp = 0;

  // First time visiting this specific stall: +35 XP once
  const eventKey = `stall_visit:${stallKey}`;
  if (!newAwarded.includes(eventKey)) {
    newAwarded.push(eventKey);
    bonusXp += 35;
  }

  // Quest explore_fair completion: +50 XP once
  if (!newAwarded.includes("quest:explore_fair")) {
    newAwarded.push("quest:explore_fair");
    bonusXp += 50;
  }

  const newXp = current.xp + bonusXp;
  const { level, xpForNextLevel } = calculateLevel(newXp);

  const updated: GamificationState = {
    ...current,
    xp: newXp,
    level,
    levelTitle: getLevelTitle(level),
    xpForNextLevel,
    visitedStalls: newVisited,
    badges: newBadges,
    quests: updatedQuests,
    awardedEvents: newAwarded,
  };

  saveGamificationState(updated);
  return updated;
}

export function recordFairEntry(): GamificationState {
  const current = getGamificationState();
  const awarded = current.awardedEvents || [];

  const newBadges = [...current.badges];
  if (!newBadges.includes("fair_wanderer")) {
    newBadges.push("fair_wanderer");
  }

  const updatedQuests = current.quests.map((q) => {
    if (q.id === "explore_fair") {
      return { ...q, current: 1, completed: true };
    }
    return q;
  });

  if (awarded.includes("quest:explore_fair")) {
    const updated: GamificationState = {
      ...current,
      badges: newBadges,
      quests: updatedQuests,
    };
    saveGamificationState(updated);
    return updated;
  }

  const newAwarded = [...awarded, "quest:explore_fair"];
  const bonusXp = 50; // Explore Fair quest reward
  const newXp = current.xp + bonusXp;
  const { level, xpForNextLevel } = calculateLevel(newXp);

  const updated: GamificationState = {
    ...current,
    xp: newXp,
    level,
    levelTitle: getLevelTitle(level),
    xpForNextLevel,
    badges: newBadges,
    quests: updatedQuests,
    awardedEvents: newAwarded,
  };

  saveGamificationState(updated);
  return updated;
}

export function recordArtisanOrderSupport(orderId?: string): GamificationState {
  const current = getGamificationState();
  const awarded = current.awardedEvents || [];

  const eventKey = orderId ? `order_placed:${orderId}` : `order_placed:generic_${(current.supportedArtisans || 0) + 1}`;
  if (orderId && awarded.includes(eventKey)) {
    return current;
  }

  const newCount = (current.supportedArtisans || 0) + 1;
  const newBadges = [...current.badges];
  if (!newBadges.includes("heritage_guardian")) {
    newBadges.push("heritage_guardian");
  }

  const updatedQuests = current.quests.map((q) => {
    if (q.id === "support_artisan") {
      return { ...q, current: 1, completed: true };
    }
    return q;
  });

  const newAwarded = [...awarded, eventKey];
  let bonusXp = 0;

  // Order support XP: +100 XP
  bonusXp += 100;

  // Support artisan quest completion
  if (!newAwarded.includes("quest:support_artisan")) {
    newAwarded.push("quest:support_artisan");
  }

  const newXp = current.xp + bonusXp;
  const { level, xpForNextLevel } = calculateLevel(newXp);

  const updated: GamificationState = {
    ...current,
    xp: newXp,
    level,
    levelTitle: getLevelTitle(level),
    xpForNextLevel,
    supportedArtisans: newCount,
    badges: newBadges,
    quests: updatedQuests,
    awardedEvents: newAwarded,
  };

  saveGamificationState(updated);
  return updated;
}

export function useBuyerGamification(): GamificationState {
  const [state, setState] = useState<GamificationState>(getGamificationState);

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const customEv = event as CustomEvent<GamificationState>;
      if (customEv.detail) setState(customEv.detail);
      else setState(getGamificationState());
    };

    window.addEventListener(GAMIFICATION_EVENT, handleUpdate);
    const handleStorage = () => setState(getGamificationState());
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(GAMIFICATION_EVENT, handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return state;
}
