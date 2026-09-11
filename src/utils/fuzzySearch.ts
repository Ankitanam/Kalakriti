// src/utils/fuzzySearch.ts
import { StoreItem } from "../App";

// ── Bilingual Cross-Language Synonym & Phonetic Dictionary ──
const BILINGUAL_SYNONYMS: Record<string, string[]> = {
  // Pottery & Clay
  मिट्टी: ["mitti", "clay", "terracotta", "pot", "pottery", "ghada", "matka", "handi", "kalash", "दीपक", "घड़ा", "हांडी"],
  pottery: ["मिट्टी", "कुम्हार", "हांडी", "कलश", "clay", "terracotta", "pot", "handi", "matka", "ghada"],
  ghada: ["घड़ा", "कलश", "हांडी", "pot", "pottery", "clay", "mitti"],
  handi: ["हांडी", "घड़ा", "clay pot", "cooking pot", "mitti"],

  // Painting & Folk Art
  पेंटिंग: ["painting", "art", "madhubani", "mithila", "warli", "canvas", "चित्र", "चित्रकारी", "मधुबनी"],
  painting: ["पेंटिंग", "चित्र", "चित्रकारी", "मधुबनी", "मिथिला", "art", "folk art", "canvas", "madhubani"],
  madhubani: ["मधुबनी", "मिथिला", "painting", "folk art", "bihar", "sun", "पेंटिंग"],
  मधुबनी: ["madhubani", "mithila", "painting", "art", "bihar", "सूर्य", "पेंटिंग"],

  // Puppets & Dolls
  कठपुतली: ["puppet", "doll", "katputli", "kathputli", "rajasthan", "wood", "गुड़िया", "खिलौना"],
  puppet: ["कठपुतली", "कटपुतली", "गुड़िया", "katputli", "kathputli", "rajasthan", "doll"],
  katputli: ["कठपुतली", "puppet", "doll", "rajasthan"],

  // Weaving & Textiles
  बुनाई: ["weaving", "textile", "saree", "shawl", "dupatta", "कपड़ा", "साड़ी", "दुपट्टा"],
  weaving: ["बुनाई", "हथकरघा", "textile", "handloom", "saree", "shawl", "dupatta"],
};

// ── Levenshtein Distance Algorithm for Typo Tolerance ──
function calculateLevenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// ── Fuzzy Similarity Calculator (0 to 1 Score) ──
function getFuzzyScore(target: string, term: string): number {
  const cleanTarget = target.toLowerCase().trim();
  const cleanTerm = term.toLowerCase().trim();

  // 1. Exact or Substring match (Highest Score)
  if (cleanTarget === cleanTerm) return 1.0;
  if (cleanTarget.includes(cleanTerm)) return 0.85;

  // 2. Token boundary match
  const tokens = cleanTarget.split(/[\s,·\-_/]+/);
  for (const token of tokens) {
    if (token === cleanTerm) return 0.95;
    if (token.startsWith(cleanTerm)) return 0.8;

    // 3. Typo tolerance on word tokens (Handles "madubani" -> "madhubani")
    const distance = calculateLevenshteinDistance(token, cleanTerm);
    if (distance <= 2 && cleanTerm.length > 3) {
      return 0.75 - distance * 0.1;
    }
  }

  // 4. Cross-lingual Synonym mapping
  for (const [key, synonyms] of Object.entries(BILINGUAL_SYNONYMS)) {
    if (cleanTerm === key.toLowerCase() || synonyms.includes(cleanTerm)) {
      for (const syn of [key, ...synonyms]) {
        if (cleanTarget.includes(syn.toLowerCase())) {
          return 0.9;
        }
      }
    }
  }

  return 0;
}

// ── Master Search Function: Searches Products with Relevance Ranking ──
export function searchProductsFuzzy(products: StoreItem[], query: string): StoreItem[] {
  if (!query || query.trim() === "") {
    return products;
  }

  const searchTerms = query.toLowerCase().trim().split(/\s+/);

  const scoredProducts = products.map((product) => {
    // Searchable text corpus from all product fields
    const fieldsToSearch = [
      product.title_local || "",
      product.title_hi || "",
      product.title_en || "",
      product.categoryName || "",
      product.artisan_name || "",
      product.artisan_region || "",
      product.quick_summary_local || "",
      product.quick_summary_hi || "",
      product.quick_summary_en || "",
      ...(product.tags || []),
      ...(product.specs_local?.map((s) => `${s.label} ${s.value}`) || []),
      ...(product.specs_hi?.map((s) => `${s.label} ${s.value}`) || []),
      ...(product.specs_en?.map((s) => `${s.label} ${s.value}`) || []),
    ].join(" ");

    // Aggregate score across all search terms
    let totalScore = 0;
    for (const term of searchTerms) {
      const score = getFuzzyScore(fieldsToSearch, term);
      totalScore += score;
    }

    return {
      product,
      score: totalScore / searchTerms.length,
    };
  });

  // Filter out non-matches (score > 0.3) and sort by highest relevance
  return scoredProducts
    .filter((item) => item.score >= 0.3)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);
}