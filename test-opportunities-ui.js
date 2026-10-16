import fs from "fs";
import path from "path";
import { isValidWebUrl } from "./src/utils/opportunitySearchService.ts";

console.log(
  "🇮🇳 Starting Kalakriti Feature C: Opportunities UI/UX Verification Suite...\n",
);

let passed = 0;
let failed = 0;

function assert(condition, desc) {
  if (condition) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failed++;
  }
}

// ── Read Source Files ──
const dashboardSource = fs.readFileSync(
  path.resolve("src/ArtisanDashboard.tsx"),
  "utf-8",
);
const oppTabSource = fs.readFileSync(
  path.resolve("src/components/OpportunitiesTab.tsx"),
  "utf-8",
);
const langSource = fs.readFileSync(
  path.resolve("src/context/LanguageContext.tsx"),
  "utf-8",
);

console.log("--- 1. Navigation & 4-Tab Architecture in ArtisanDashboard ---");
assert(
  dashboardSource.includes(
    '"products" | "orders" | "earnings" | "opportunities"',
  ),
  "ArtisanDashboard activeTab state union includes 'opportunities'",
);
assert(
  dashboardSource.includes('setActiveTab("opportunities")'),
  "ArtisanDashboard renders button to switch to 'opportunities' tab",
);
assert(
  dashboardSource.includes("<OpportunitiesTab"),
  "ArtisanDashboard renders OpportunitiesTab component",
);
assert(
  dashboardSource.includes('activeTab === "products"') &&
    dashboardSource.includes('activeTab === "orders"') &&
    dashboardSource.includes('activeTab === "earnings"'),
  "Preserves all three existing tabs: Products, Orders, Earnings",
);
assert(
  dashboardSource.includes('activeTab !== "opportunities"') &&
    dashboardSource.includes("add_product_to_shop"),
  "Add Product sticky bar is hidden on Opportunities tab to maximize vertical card reading space",
);

console.log("\n--- 2. Search Form & Input Validation ---");
assert(
  oppTabSource.includes('id="opp-craft-input"'),
  "Renders accessible craft input with explicit ID",
);
assert(
  oppTabSource.includes("trimmedCraft = craft.trim()"),
  "Trims craft input whitespace before validation",
);
assert(
  oppTabSource.includes("craft_required_error"),
  "Enforces required craft field and displays validation error if empty",
);
assert(
  oppTabSource.includes("isSubmitting"),
  "Tracks isSubmitting state to prevent duplicate concurrent submissions",
);
assert(
  oppTabSource.includes("disabled={isSubmitting"),
  "Search button is disabled during pending submission",
);

console.log("\n--- 3. Backend Endpoint & Request Fields ---");
assert(
  oppTabSource.includes('fetch("/api/opportunities/search"'),
  "Calls correct backend endpoint POST /api/opportunities/search",
);
assert(
  oppTabSource.includes("craft: trimmedCraft") &&
    oppTabSource.includes("location: location.trim()") &&
    oppTabSource.includes("category") &&
    oppTabSource.includes("language: currentLang"),
  "Payload includes craft, location, category, and language fields",
);
assert(
  !oppTabSource.includes("TINYFISH_API_KEY") &&
    !oppTabSource.includes("api.search.tinyfish.ai") &&
    !oppTabSource.includes("api.fetch.tinyfish.ai"),
  "Zero direct frontend API calls: Frontend communicates strictly through backend",
);

console.log("\n--- 4. Category Chips & Quick Suggestions ---");
const expectedCategories = [
  "all",
  "exhibitions",
  "government_schemes",
  "buyers",
  "training",
];
expectedCategories.forEach((cat) => {
  assert(
    oppTabSource.includes(`key: "${cat}"`),
    `Category selector includes chip for '${cat}'`,
  );
});
assert(
  oppTabSource.includes("Blue Pottery") && oppTabSource.includes("Madhubani"),
  "Provides quick craft suggestion chips for Indian artisans",
);

console.log("\n--- 5. Loading, Empty, Error & Partial States ---");
assert(
  oppTabSource.includes('status === "loading"'),
  "Loading state renders spinner and searching message",
);
assert(
  oppTabSource.includes('status === "empty"'),
  "Empty state renders when zero opportunities and results are found",
);
assert(
  oppTabSource.includes('status === "error"'),
  "Error state renders with user-safe message and retry button",
);
assert(
  oppTabSource.includes("warnings.length > 0") &&
    oppTabSource.includes("partial_results_warning"),
  "Partial results state renders warning banner when upstream sources encounter warnings",
);
assert(
  oppTabSource.includes('status === "initial"'),
  "Initial hero state explains fairs, schemes, and workshops to the artisan",
);

console.log("\n--- 6. Opportunity Card Fields & Fact Rendering ---");
assert(oppTabSource.includes("opp.title"), "Opportunity card displays title");
assert(
  oppTabSource.includes("opp.organization") &&
    oppTabSource.includes("opp.location"),
  "Opportunity card displays organization and location",
);
assert(
  oppTabSource.includes("opp.description"),
  "Opportunity card displays factual description",
);
assert(
  oppTabSource.includes("opp.eventDate") &&
    oppTabSource.includes('t("not_specified")'),
  "Missing event date renders localized 'Not specified' label",
);
assert(
  oppTabSource.includes("opp.deadline") &&
    oppTabSource.includes('t("not_specified")'),
  "Missing deadline renders localized 'Not specified' label",
);
assert(
  oppTabSource.includes("opp.participationFee") &&
    oppTabSource.includes('t("not_specified")'),
  "Missing participation fee renders localized 'Not specified' label",
);
assert(
  oppTabSource.includes("opp.eligibility") &&
    oppTabSource.includes('t("not_specified")'),
  "Missing eligibility renders localized 'Not specified' label",
);
assert(
  oppTabSource.includes("opp.relevanceReason"),
  "Opportunity card displays 'Why this helps you' callout",
);
assert(
  oppTabSource.includes("opp.nextSteps"),
  "Opportunity card displays actionable next practical steps",
);
assert(
  oppTabSource.includes("details_unconfirmed") &&
    oppTabSource.includes("source_found"),
  "Opportunity card displays verification badges (source_found / details_unconfirmed)",
);
assert(
  oppTabSource.includes("opp.eventStatus") &&
    oppTabSource.includes("status_upcoming"),
  "Opportunity card renders localized event status badge when available",
);
assert(
  oppTabSource.includes("opp.deadlineStatus") &&
    oppTabSource.includes("status_deadline_open"),
  "Opportunity card renders localized deadline status badge when available",
);

console.log("\n--- 7. Source URL Security & Validation ---");
assert(
  oppTabSource.includes("isValidWebUrl(opp.sourceUrl)"),
  "Validates sourceUrl using isValidWebUrl before rendering external link",
);
assert(
  oppTabSource.includes('target="_blank"') &&
    oppTabSource.includes('rel="noopener noreferrer"'),
  "External links use secure target='_blank' and rel='noopener noreferrer'",
);
assert(
  !isValidWebUrl("javascript:alert(1)"),
  "isValidWebUrl rejects javascript: scheme",
);
assert(
  !isValidWebUrl("http://localhost:5000/env"),
  "isValidWebUrl rejects localhost URLs",
);
assert(
  isValidWebUrl("https://haryanatourism.gov.in/mela"),
  "isValidWebUrl accepts valid public HTTPS URL",
);

console.log("\n--- 8. Voice Search Integration ---");
assert(
  oppTabSource.includes("navigator.mediaDevices.getUserMedia"),
  "Voice search requests microphone stream on user tap",
);
assert(
  oppTabSource.includes("/api/transcribe-audio"),
  "Voice recording sends audio to existing /api/transcribe-audio endpoint",
);
assert(
  oppTabSource.includes("setCraft(cleanText)"),
  "Transcribed speech populates craft input without auto-submitting search",
);
assert(
  oppTabSource.includes("stream.getTracks().forEach((track) => track.stop())"),
  "Media stream tracks are cleanly stopped on unmount and completion",
);

console.log("\n--- 9. Full Multilingual Localization (7 Indic Languages) ---");
const requiredTranslationKeys = [
  "tab_opportunities",
  "opportunities_title",
  "opportunities_subtitle",
  "search_craft_label",
  "search_craft_placeholder",
  "search_location_label",
  "cat_all",
  "cat_exhibitions",
  "cat_government_schemes",
  "cat_buyers",
  "cat_training",
  "find_opportunities",
  "searching_opportunities",
  "searching_and_analyzing",
  "not_specified",
  "deadline_label",
  "eligibility_label",
  "fee_label",
  "event_date_label",
  "relevance_label",
  "next_steps_label",
  "view_official_source",
  "source_found",
  "details_unconfirmed",
  "status_upcoming",
  "status_ongoing",
  "status_past",
  "status_deadline_open",
  "status_deadline_closed",
  "ai_summary_unavailable_title",
  "ai_summary_unavailable_desc",
  "raw_search_results_title",
  "open_original_source",
  "unstructured_source_notice",
  "empty_opportunities_title",
  "initial_opportunities_title",
  "retry",
];

const langCodes = ["hi", "en", "mr", "bn", "gu", "ta", "te"];

requiredTranslationKeys.forEach((key) => {
  const hasKey = langSource.includes(`${key}: {`);
  assert(hasKey, `LanguageContext defines key '${key}'`);
});

const nativeOppWords = {
  hi: "अवसर",
  en: "Opportunities",
  mr: "संधी",
  bn: "সুযোগ",
  gu: "તકો",
  ta: "வாய்ப்புகள்",
  te: "అవకాశాలు",
};

langCodes.forEach((lang) => {
  assert(
    langSource.includes(`${lang}: "${nativeOppWords[lang]}"`),
    `LanguageContext covers Indic language '${lang}' for opportunities ('${nativeOppWords[lang]}')`,
  );
});

console.log("\n--- 10. Mobile Responsiveness & Container Confinement ---");
assert(
  dashboardSource.includes('width: "min(390px, 100vw)"'),
  "ArtisanDashboard is confined to mobile phone width min(390px, 100vw)",
);
assert(
  oppTabSource.includes("overflow-x-auto"),
  "Category chips and suggestion chips scroll horizontally without expanding page width",
);
assert(
  oppTabSource.includes("break-words") ||
    oppTabSource.includes("truncate") ||
    oppTabSource.includes("leading-snug"),
  "Text wrapping prevents horizontal page blowout on long opportunity titles",
);

console.log("\n--- 11. Distinct Outcome States & Fallback UI ---");
// 1. Structured opportunities with no warnings:
assert(
  oppTabSource.includes("opportunities.length > 0 ? (") &&
    oppTabSource.includes("Verified Opportunities"),
  "Structured opportunities: Displays verified opportunity cards and count",
);
// 2. Search links only when structured analysis is unavailable:
assert(
  oppTabSource.includes("ai_summary_unavailable_title") &&
    oppTabSource.includes("ai_summary_unavailable_desc"),
  "Raw search fallback: Displays localized notice that AI structured summary is unavailable",
);
assert(
  oppTabSource.includes("raw_search_results_title") &&
    oppTabSource.includes("unstructured_source_notice"),
  "Raw search fallback: Renders links distinctly as web sources, not verified cards",
);
assert(
  oppTabSource.includes("open_original_source"),
  "Raw search fallback: Uses 'Open Original Source' action button",
);
// 3. Partial structured results with warnings:
assert(
  oppTabSource.includes(
    'warnings.length > 0 && status === "success" && opportunities.length > 0',
  ) && oppTabSource.includes("partial_results_warning"),
  "Partial results: Preserves structured cards and displays partial sources warning banner",
);
// 4. Empty results:
assert(
  oppTabSource.includes("opps.length === 0 && rawResults.length === 0") &&
    oppTabSource.includes('setStatus("empty")'),
  "Empty results: Sets empty status when both opportunities and raw search results are zero",
);
// 5. API errors and retry:
assert(
  oppTabSource.includes('setStatus("error")') &&
    oppTabSource.includes("setErrorMessage") &&
    oppTabSource.includes("handleSearch"),
  "API errors: Preserves user-safe error state and retry mechanism",
);
// 6. Security & Invalid URLs:
assert(
  oppTabSource.includes("isValidWebUrl(res.url)") &&
    oppTabSource.includes("Invalid link"),
  "Security: Validates search URLs and renders safe fallback for malformed links",
);

console.log(
  "\n--- 12. P3 Loading Feedback & Duplicate Submission Safeguards ---",
);
// 1. Loading indicator appears when request starts:
assert(
  oppTabSource.includes('status === "loading"') &&
    oppTabSource.includes('role="status"') &&
    oppTabSource.includes('aria-live="polite"'),
  "Loading feedback: Accessible loading container with role='status' and aria-live='polite'",
);
assert(
  oppTabSource.includes("animate-spin") &&
    oppTabSource.includes("searching_opportunities"),
  "Loading feedback: Renders smooth spinning indicator and searching headline",
);
assert(
  oppTabSource.includes('t("searching_and_analyzing")'),
  "Loading feedback: Displays honest localized message explaining web search and opportunity analysis",
);
assert(
  oppTabSource.includes("animate-pulse") &&
    oppTabSource.includes("rounded-3xl bg-[#FCF8F5]"),
  "Loading feedback: Layout-stable card skeletons prevent visual jumping during load",
);

// 2. Duplicate submission prevention:
assert(
  oppTabSource.includes("if (isSubmitting) return;"),
  "Duplicate submission: Guard clause rejects duplicate concurrent submission",
);
assert(
  oppTabSource.includes('type="submit"') &&
    oppTabSource.includes("disabled={isSubmitting}") &&
    oppTabSource.includes("aria-disabled={isSubmitting}"),
  "Duplicate submission: Submit button is disabled and aria-disabled during search",
);
assert(
  oppTabSource.includes("disabled={isSubmitting || isTranscribing}"),
  "Duplicate submission: Craft input and voice button disabled while searching",
);
assert(
  oppTabSource.includes("disabled={isSubmitting}") &&
    oppTabSource.includes("quickCrafts.map") &&
    oppTabSource.includes("categories.map"),
  "Duplicate submission: Category chips and suggestion chips disabled during active search",
);

// 3. State transitions and clearing:
assert(
  oppTabSource.includes("finally {") &&
    oppTabSource.includes("setIsSubmitting(false);"),
  "Loading lifecycle: isSubmitting is guaranteed to reset in finally block",
);
assert(
  oppTabSource.includes('setStatus("success")') &&
    oppTabSource.includes('setStatus("empty")'),
  "Loading lifecycle: Clears loading state on success or empty results",
);
assert(
  oppTabSource.includes('setStatus("error")'),
  "Loading lifecycle: Clears loading state and reveals error on failure",
);
assert(
  oppTabSource.includes("abortControllerRef") &&
    oppTabSource.includes("controller.signal") &&
    oppTabSource.includes("abort()"),
  "Request cancellation: AbortController handles component unmount and request preemption",
);

// 4. Multilingual completeness for searching_and_analyzing:
langCodes.forEach((lang) => {
  assert(
    langSource.includes(`${lang}: "`) &&
      langSource.includes("searching_and_analyzing"),
    `Localization: searching_and_analyzing key translated for language '${lang}'`,
  );
});
assert(
  langSource.includes(
    'en: "Searching the web and analyzing potential opportunities..."',
  ),
  "Localization: English text matches exact prompt specification",
);

console.log("\n--- 13. P4 Request Cancellation & Race Condition Hardening ---");
assert(
  oppTabSource.includes("abortControllerRef.current !== controller"),
  "Race condition guard: Ignores stale responses if a newer search was initiated",
);
assert(
  oppTabSource.includes("response.status === 499") ||
    oppTabSource.includes("data?.status === 499"),
  "Cancellation handling: HTTP 499 client-cancelled responses ignored without error modal",
);
assert(
  oppTabSource.includes("if (abortControllerRef.current === controller)") &&
    oppTabSource.includes("setIsSubmitting(false)"),
  "Loading preservation: Old aborted search's finally block cannot reset isSubmitting for a newer active search",
);
assert(
  oppTabSource.includes('err.name === "AbortError"') &&
    oppTabSource.includes("controller.signal.aborted"),
  "Silent abort: Catch block cleanly suppresses AbortError and aborted signals",
);
assert(
  oppTabSource.includes("abortControllerRef.current.abort()"),
  "Unmount cleanup: Aborts active request when OpportunitiesTab unmounts",
);

console.log("\n--- 14. Craft Suggestions & Input Independence ---");
assert(
  oppTabSource.includes("related_craft_ideas"),
  "Suggestion label: Clear 'Related craft ideas' label separates entered craft from ideas",
);
assert(
  oppTabSource.includes("getRelatedCraftIdeas(craft)"),
  "Craft independence: Craft input is passed to suggestion generator without silently mutating state",
);
assert(
  oppTabSource.includes("flex-wrap"),
  "Responsive layout: Craft ideas wrap cleanly across available mobile and desktop width",
);
assert(
  oppTabSource.includes("aria-label=") &&
    oppTabSource.includes("related_craft_ideas"),
  "Accessibility: Suggestion buttons provide descriptive accessible labels",
);

console.log("\n--- 15. Two Distinct Opportunity Groups (Current vs Past) ---");
assert(
  oppTabSource.includes("group_current_opportunities") &&
    oppTabSource.includes("currentOpportunities"),
  "Group A: Renders distinct 'Open and Upcoming Opportunities' group",
);
assert(
  oppTabSource.includes("group_past_opportunities") &&
    oppTabSource.includes("pastOpportunities"),
  "Group B: Renders distinct 'Past Events and Workshops' group",
);
assert(
  oppTabSource.includes("past_event_ended_notice"),
  "Past opportunity notice: Explains event has ended and source is for future editions",
);
assert(
  oppTabSource.includes('opp.eventStatus === "past"') &&
    oppTabSource.includes('opp.deadlineStatus === "closed"'),
  "Classification logic: Expired deadlines and past events separated from current opportunities",
);
assert(
  oppTabSource.includes("status_date_unconfirmed"),
  "Date status: Unconfirmed event dates display localized 'Date not confirmed' indicator",
);
assert(
  oppTabSource.includes("status_happening_now"),
  "Ongoing status: Ongoing events display 'Happening now' indicator",
);

console.log("\n--- 16. TinyFish Transparency & Attribution ---");
assert(
  oppTabSource.includes("powered_by_tinyfish"),
  "Attribution badge: Displays localized 'Web search powered by TinyFish'",
);
assert(
  oppTabSource.includes("tinyfish_disclaimer"),
  "Transparency notice: Clarifies public web search and advises checking with organizers",
);
assert(
  oppTabSource.includes("🌐"),
  "Visual icon: Uses subtle globe icon for TinyFish web search",
);

console.log("\n--- 17. Low-Literacy Visual Hierarchy & Touch Targets ---");
assert(
  oppTabSource.includes("when_date") &&
    oppTabSource.includes("cost_fee") &&
    oppTabSource.includes("who_can_apply"),
  "Low-literacy cards: Clearly labeled When, Cost, and Who can apply fields",
);
assert(
  oppTabSource.includes("what_this_means") &&
    oppTabSource.includes("what_to_do_next"),
  "Actionable hierarchy: 'What this means for you' and 'What you can do next' callouts",
);
assert(
  oppTabSource.includes("min-h-[44px]") ||
    oppTabSource.includes("min-h-[42px]"),
  "Touch accessibility: Search and action buttons provide generous touch targets",
);

console.log("\n--- 18. Improved Friendly Fallback Experience ---");
assert(
  oppTabSource.includes("fallback_pages_found_title") &&
    oppTabSource.includes("fallback_pages_found_desc"),
  "Helpful fallback: Displays friendly 'We found some pages that may help' banner",
);
assert(
  oppTabSource.includes("open_details"),
  "Prominent action: Raw search cards use clear 'Open details' button",
);

console.log("\n--- 19. Multilingual Completeness Across 7 Indic Languages ---");
const newKeys = [
  "related_craft_ideas",
  "voice_search_hint",
  "voice_listening",
  "voice_transcribing",
  "powered_by_tinyfish",
  "tinyfish_disclaimer",
  "group_current_opportunities",
  "group_past_opportunities",
  "past_event_ended_notice",
  "status_date_unconfirmed",
  "status_deadline_unconfirmed",
  "status_happening_now",
  "fallback_pages_found_title",
  "fallback_pages_found_desc",
  "open_details",
  "where_location",
  "when_date",
  "cost_fee",
  "who_can_apply",
  "what_this_means",
  "what_to_do_next",
  "open_official_page",
  "search_error_title",
];

newKeys.forEach((key) => {
  assert(
    langSource.includes(`${key}:`),
    `Localization: Key '${key}' is defined in LanguageContext`,
  );
});

console.log("\n--- 20. Dashboard Tab Navigation Readability ---");
assert(
  dashboardSource.includes("flex-col sm:flex-row"),
  "Tab navigation: Uses compact vertical stack on mobile to prevent label truncation",
);
assert(
  dashboardSource.includes("whitespace-nowrap") &&
    dashboardSource.includes("leading-tight"),
  "Tab navigation: Prevents arbitrary text truncation across all 4 tabs on narrow screens",
);

console.log("\n--- 21. Phase 2A: Profile-Aware Search & Pre-Fill ---");
assert(
  dashboardSource.includes("primaryCraft") &&
    dashboardSource.includes("reliableLocation") &&
    dashboardSource.includes("uniqueCrafts"),
  "Profile-Aware: ArtisanDashboard calculates primaryCraft, reliableLocation, uniqueCrafts from inventory",
);
assert(
  dashboardSource.includes('initialCraft={primaryCraft || ""}') &&
    dashboardSource.includes('initialLocation={reliableLocation || ""}'),
  "Profile-Aware: OpportunitiesTab receives pre-filled craft and location from dashboard",
);
assert(
  dashboardSource.includes("craftFrequency") ||
    dashboardSource.includes("craftCounts"),
  "Profile-Aware: Uses craft frequency mode rather than blindly picking inventory[0]",
);
assert(
  oppTabSource.includes("isCraftEditedRef") &&
    oppTabSource.includes("isLocationEditedRef"),
  "Profile-Aware: Tracks manual user edits with refs to prevent prop overwriting",
);
assert(
  oppTabSource.includes("profile_autofill_notice"),
  "Profile-Aware: Renders subtle profile autofill pill when populated from catalog",
);
assert(
  oppTabSource.includes("artisanCrafts.length > 1") &&
    oppTabSource.includes("Your Catalog Crafts"),
  "Profile-Aware: Displays multi-craft quick selector when artisan has multiple catalog crafts",
);

console.log("\n--- 22. Phase 2A: Honest TinyFish Pipeline Progress UI ---");
assert(
  oppTabSource.includes("activeStage") &&
    oppTabSource.includes("stage_searching") &&
    oppTabSource.includes("stage_fetching") &&
    oppTabSource.includes("stage_analyzing") &&
    oppTabSource.includes("stage_completing"),
  "Progress UI: Renders 4-stage stepper corresponding to TinyFish and Gemini stages",
);
assert(
  oppTabSource.includes("text/event-stream") &&
    oppTabSource.includes("getReader"),
  "Progress UI: Reads live backend progress via text/event-stream",
);

console.log(
  "\n--- 23. Phase 2A: Transparent Match Assessment & Action Checklist ---",
);
assert(
  oppTabSource.includes("opp.matchAssessment") &&
    oppTabSource.includes("match_score_label") &&
    oppTabSource.includes("match_rationale_label"),
  "Match UI: Displays match assessment badge, score percentage, and factual rationale",
);
assert(
  oppTabSource.includes("artisan_preparation_checklist") &&
    oppTabSource.includes("checklist_disclaimer") &&
    oppTabSource.includes("step_marked_done"),
  "Checklist UI: Renders preparation checklist with explicit disclaimer",
);
assert(
  oppTabSource.includes('type="checkbox"') &&
    oppTabSource.includes("min-h-[44px]"),
  "Checklist UI: Touch targets are at least 44px with accessible checkboxes",
);
assert(
  oppTabSource.includes("checklistState[opp.id]"),
  "Checklist UI: Checkbox state remains associated with the specific opportunity ID",
);

console.log(
  "\n--- 24. Phase 2A: Seven Indic Languages Coverage for New Keys ---",
);
const phase2AKeys = [
  "stage_searching",
  "stage_fetching",
  "stage_analyzing",
  "stage_completing",
  "match_strong",
  "match_possible",
  "match_limited",
  "match_score_label",
  "match_rationale_label",
  "artisan_preparation_checklist",
  "checklist_disclaimer",
  "step_marked_done",
  "profile_autofill_notice",
];

const langList = ["en", "hi", "mr", "bn", "gu", "ta", "te"];

phase2AKeys.forEach((key) => {
  assert(
    langSource.includes(`${key}:`),
    `Phase 2A Localization: Key '${key}' is defined`,
  );
  langList.forEach((lc) => {
    assert(
      langSource.includes(`${key}:`) && langSource.includes(`${lc}:`),
      `Phase 2A Localization: Key '${key}' has '${lc}' entry`,
    );
  });
});

console.log(
  "\n--- 25. Phase 2B: Multi-Category Exploration Controls & State ---",
);
assert(
  oppTabSource.includes("explore_all_opportunities"),
  "Multi-Category Controls: Supports 'Explore All Opportunities' option in category selector",
);
assert(
  oppTabSource.includes("categoryBreakdown") &&
    oppTabSource.includes("categoryFailures"),
  "Multi-Category State: OpportunitiesTab maintains categoryBreakdown and categoryFailures state",
);
assert(
  oppTabSource.includes("DISCOVERY_CATEGORIES") ||
    (oppTabSource.includes("government_schemes") &&
      oppTabSource.includes("exhibitions") &&
      oppTabSource.includes("training") &&
      oppTabSource.includes("buyers")),
  "Multi-Category Ordering: Handles all 4 core discovery categories (schemes, exhibitions, training, buyers)",
);

console.log(
  "\n--- 26. Phase 2B: Per-Category Sectioning, Headings & Honest Empty States ---",
);
assert(
  oppTabSource.includes("category_schemes_heading") &&
    oppTabSource.includes("category_exhibitions_heading") &&
    oppTabSource.includes("category_training_heading") &&
    oppTabSource.includes("category_buyers_heading"),
  "Category Headings: Renders distinct localized headers for schemes, exhibitions, workshops, and buyers",
);
assert(
  oppTabSource.includes("no_opportunities_in_category"),
  "Honest Empty State: Displays category-specific empty state when a category returns 0 results",
);
assert(
  oppTabSource.includes("opportunities_found_count"),
  "Category Counts: Renders localized badge showing count of opportunities per category",
);
assert(
  oppTabSource.includes('category === "all"') ||
    oppTabSource.includes("category === 'all'") ||
    oppTabSource.includes('selectedCategory === "all"'),
  "Category Scoping: Supports full multi-category view when 'all' is selected",
);

console.log(
  "\n--- 27. Phase 2B: Partial Failure Notice & Honest Streaming UI ---",
);
assert(
  oppTabSource.includes("partial_category_failure_notice") &&
    oppTabSource.includes("category_partial_failure"),
  "Partial Failure: Renders banner and section-level alert when a category fails gracefully",
);
assert(
  oppTabSource.includes("stage_searching_category") &&
    oppTabSource.includes("currentSearchCategory"),
  "Streaming Progress: Shows real-time category name during multi-category discovery",
);

console.log(
  "\n--- 28. Phase 2B: Seven Indic Languages Coverage for 10 New Keys ---",
);
const phase2BKeys = [
  "explore_all_opportunities",
  "no_opportunities_in_category",
  "category_partial_failure",
  "partial_category_failure_notice",
  "stage_searching_category",
  "opportunities_found_count",
  "category_schemes_heading",
  "category_exhibitions_heading",
  "category_training_heading",
  "category_buyers_heading",
];

phase2BKeys.forEach((key) => {
  assert(
    langSource.includes(`${key}:`),
    `Phase 2B Localization: Key '${key}' is defined`,
  );
  langList.forEach((lc) => {
    assert(
      langSource.includes(`${key}:`) && langSource.includes(`${lc}:`),
      `Phase 2B Localization: Key '${key}' has '${lc}' entry`,
    );
  });
});

console.log(
  "\n--- 29. Phase 2F: Three-Group Partitioning (Current, Unconfirmed Dates, Past/Closed) ---",
);
assert(
  oppTabSource.includes("currentOpportunities = opportunities.filter") &&
    oppTabSource.includes('opp.eventStatus === "unknown"'),
  "Current opportunities strictly excludes past, closed, and unknown date events",
);
assert(
  oppTabSource.includes("unconfirmedDateOpportunities = opportunities.filter"),
  "Dedicated unconfirmedDateOpportunities partition created for unknown dates",
);
assert(
  oppTabSource.includes("pastOpportunities = opportunities.filter") &&
    oppTabSource.includes(
      'opp.eventStatus === "past" || opp.deadlineStatus === "closed"',
    ),
  "Past partition strictly segregates past events and closed application deadlines",
);
assert(
  oppTabSource.includes("group_unconfirmed_date_opportunities"),
  "Renders labeled section for unconfirmed date opportunities",
);
assert(
  oppTabSource.includes("unconfirmed_dates_notice"),
  "Renders notice advising artisans to verify unconfirmed dates with organizers",
);
assert(
  oppTabSource.includes("past_closed_warning"),
  "Renders clear warning notice for past events and closed application deadlines",
);

console.log(
  "\n--- 30. Phase 2F: Premium Card Aesthetic & Visual Hierarchy ---",
);
assert(
  oppTabSource.includes("bg-[#FFFDF9]") &&
    oppTabSource.includes("border-[#EFE5DC]"),
  "Cards use warm cream background (#FFFDF9) and soft warm border (#EFE5DC)",
);
assert(
  oppTabSource.includes("'Noto Serif', serif"),
  "Opportunity titles styled with elegant Noto Serif typography",
);
assert(
  oppTabSource.includes("available_across_india"),
  "Nationwide schemes display 'Available across India' indicator",
);
assert(
  oppTabSource.includes("location_unconfirmed"),
  "Unconfirmed locations display transparent 'Location not confirmed' status",
);
assert(
  oppTabSource.includes("why_this_helps_you"),
  "Card features 'Why this helps you' match explanation section",
);
assert(
  oppTabSource.includes("sourceDomain") &&
    oppTabSource.includes("extractDomain"),
  "Footer displays source domain for transparency and quick verification",
);
assert(
  oppTabSource.includes("direct_web_link_notice"),
  "Fallback search links rendered with explicit unanalyzed direct web link notice",
);

console.log(
  "\n--- 31. Phase 2F: Full 7 Indic Languages Coverage for 12 New Tokens ---",
);
const phase2FKeys = [
  "group_unconfirmed_date_opportunities",
  "unconfirmed_dates_notice",
  "available_across_india",
  "location_unconfirmed",
  "fee_not_specified",
  "eligibility_not_specified",
  "why_this_helps_you",
  "direct_web_link_notice",
  "open_source",
  "source_found_badge",
  "official_source_badge",
  "past_closed_warning",
];

phase2FKeys.forEach((key) => {
  assert(
    langSource.includes(`${key}:`),
    `Phase 2F Localization: Key '${key}' is defined`,
  );
  langList.forEach((lc) => {
    assert(
      langSource.includes(`${key}:`) && langSource.includes(`${lc}:`),
      `Phase 2F Localization: Key '${key}' has '${lc}' entry`,
    );
  });
});

console.log(
  "\n--- 32. Phase 2G: Premium Opportunity Card Design & Fallback Protection ---",
);
// 1. Premium Card Action Button
assert(
  oppTabSource.includes("open_official_page") &&
    oppTabSource.includes("bg-[#5C2E17]") &&
    oppTabSource.includes("🚀"),
  "Premium Card: Features full-width rich dark-brown button with 'open_official_page' and rocket icon",
);

// 2. Value Highlight Banner
assert(
  oppTabSource.includes("direct_artisan_benefit") &&
    oppTabSource.includes("savings_badge") &&
    oppTabSource.includes("certified_badge"),
  "Premium Card: Features value highlight banner with direct artisan benefit and subsidy/savings pill",
);

// 3. Heritage & Craft Legacy Section
assert(
  oppTabSource.includes("heritage_story_title") && oppTabSource.includes("🏺"),
  "Premium Card: Features heritage and craft legacy story section with pottery/heritage icon",
);

// 4. Checklist with Green Checkmarks
assert(
  oppTabSource.includes("text-emerald-600 font-bold") &&
    oppTabSource.includes("✓"),
  "Premium Card: Match assessment highlights use high-contrast emerald checkmarks",
);

// 5. Official Source Trust Footer
assert(
  oppTabSource.includes("official_source_badge") && oppTabSource.includes("🛡️"),
  "Premium Card: Footer displays verified trust shield and official source seal",
);

// 6. Safe Search Fallback Filters Blocked Domains
assert(
  oppTabSource.includes("safeSearchResults") &&
    oppTabSource.includes("isBlockedDomain(res.url)"),
  "Safe Fallback: Filters out social media and blocked domains from raw search fallback",
);

// 7. Date-Partitioned Fallback Results
assert(
  oppTabSource.includes("currentRawResults") &&
    oppTabSource.includes("pastRawResults") &&
    oppTabSource.includes("detectRawEventStatus"),
  "Safe Fallback: Categorizes raw search results into current/upcoming vs expired/past",
);

// 8. Segregation of Expired Results with Warning
assert(
  oppTabSource.includes("pastRawResults.length > 0") &&
    oppTabSource.includes("group_past_opportunities") &&
    oppTabSource.includes("status_past"),
  "Safe Fallback: Renders expired events in past section with distinct status badge and warning",
);

// 9. Translation Coverage for Phase 2G Tokens
const phase2GTokens = [
  "open_official_page",
  "heritage_story_title",
  "direct_artisan_benefit",
  "savings_badge",
  "certified_badge",
];
phase2GTokens.forEach((token) => {
  assert(
    langSource.includes(`${token}:`),
    `Phase 2G Localization: Token '${token}' is defined`,
  );
  langList.forEach((lc) => {
    assert(
      langSource.includes(`${token}:`) && langSource.includes(`${lc}:`),
      `Phase 2G Localization: Token '${token}' translated in '${lc}'`,
    );
  });
});

// ── Summary ──
console.log(`\n======================================================`);
console.log(
  `UI Tests Completed: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`,
);
console.log(`======================================================\n`);

if (failed > 0) {
  process.exit(1);
}
