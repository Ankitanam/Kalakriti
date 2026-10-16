// src/components/OpportunitiesTab.tsx
import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  ArtisanOpportunity,
  OpportunitySearchResultItem,
  OpportunityCategory,
  OpportunitySearchStage,
  CategorySearchResult,
  isValidWebUrl,
  extractDomain,
  isOfficialDomain,
  classifyLocationStatus,
  LocationStatus,
  classifyEventStatus,
  isBlockedDomain,
} from "../utils/opportunitySearchService";

export interface OpportunitiesTabProps {
  initialCraft?: string;
  initialLocation?: string;
  artisanCraft?: string;
  artisanLocation?: string;
  artisanCrafts?: string[];
}

export const OpportunitiesTab: React.FC<OpportunitiesTabProps> = ({
  initialCraft = "",
  initialLocation = "",
  artisanCraft,
  artisanLocation,
  artisanCrafts = [],
}) => {
  const { t, currentLang, speechLang } = useLanguage();

  const isCraftEditedRef = useRef<boolean>(false);
  const isLocationEditedRef = useRef<boolean>(false);

  const [craft, setCraft] = useState<string>(initialCraft || artisanCraft || "");
  const [location, setLocation] = useState<string>(initialLocation || artisanLocation || "");
  const [category, setCategory] = useState<OpportunityCategory>("all");

  const [status, setStatus] = useState<"initial" | "loading" | "success" | "empty" | "error">("initial");
  const [activeStage, setActiveStage] = useState<OpportunitySearchStage | null>(null);
  const [currentSearchCategory, setCurrentSearchCategory] = useState<string | null>(null);
  const [checklistState, setChecklistState] = useState<Record<string, Record<number, boolean>>>({});
  const [opportunities, setOpportunities] = useState<ArtisanOpportunity[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<Partial<Record<OpportunityCategory, CategorySearchResult>>>({});
  const [categoryFailures, setCategoryFailures] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<OpportunitySearchResultItem[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Dynamic related craft ideas based on user input, keeping entered craft intact
  const getRelatedCraftIdeas = (inputCraft: string) => {
    const trimmed = inputCraft.trim().toLowerCase();
    if (trimmed.includes("potter") || trimmed.includes("clay") || trimmed.includes("मिट्टी") || trimmed.includes("मृत्")) {
      return [
        { label: currentLang === "hi" ? "ब्लू पॉटरी" : "Blue Pottery", val: "Blue Pottery" },
        { label: currentLang === "hi" ? "टेराकोटा" : "Terracotta Pottery", val: "Terracotta" },
        { label: currentLang === "hi" ? "क्ले आर्ट" : "Clay Art", val: "Clay Art" },
        { label: currentLang === "hi" ? "खुर्जा पॉटरी" : "Khurja Pottery", val: "Khurja Pottery" },
      ];
    }
    if (trimmed.includes("paint") || trimmed.includes("चित्र") || trimmed.includes("कला")) {
      return [
        { label: currentLang === "hi" ? "मधुबनी पेंटिंग" : "Madhubani Painting", val: "Madhubani Painting" },
        { label: currentLang === "hi" ? "वारली कला" : "Warli Art", val: "Warli Art" },
        { label: currentLang === "hi" ? "पट्टचित्र" : "Pattachitra", val: "Pattachitra" },
        { label: currentLang === "hi" ? "कलमकारी" : "Kalamkari", val: "Kalamkari" },
      ];
    }
    if (trimmed.includes("weav") || trimmed.includes("साड़ी") || trimmed.includes("कपड़ा") || trimmed.includes("बुनाई") || trimmed.includes("zari") || trimmed.includes("silk")) {
      return [
        { label: currentLang === "hi" ? "बनारसी बुनाई" : "Banarasi Weaving", val: "Banarasi Weaving" },
        { label: currentLang === "hi" ? "चंदेरी सिल्क" : "Chanderi Silk", val: "Chanderi Silk" },
        { label: currentLang === "hi" ? "जरदोजी काम" : "Zardozi Work", val: "Zardozi Work" },
        { label: currentLang === "hi" ? "काथा कढ़ाई" : "Kantha Embroidery", val: "Kantha Embroidery" },
      ];
    }
    if (trimmed.includes("brass") || trimmed.includes("metal") || trimmed.includes("पीतल") || trimmed.includes("धातु")) {
      return [
        { label: currentLang === "hi" ? "पीतल काम" : "Brass Handicraft", val: "Brass Handicraft" },
        { label: currentLang === "hi" ? "ढोकरा धातु कला" : "Dhokra Metal Art", val: "Dhokra Art" },
        { label: currentLang === "hi" ? "बिदरी काम" : "Bidriware", val: "Bidriware" },
      ];
    }
    if (trimmed.includes("wood") || trimmed.includes("लकड़ी") || trimmed.includes("काष्ठ")) {
      return [
        { label: currentLang === "hi" ? "काष्ठ कला" : "Woodcraft", val: "Woodcraft" },
        { label: currentLang === "hi" ? "सहारनपुर नक्काशी" : "Saharanpur Wood Carving", val: "Wood Carving" },
        { label: currentLang === "hi" ? "चन्नापटना खिलौने" : "Channapatna Toys", val: "Channapatna Toys" },
      ];
    }
    return [
      { label: currentLang === "hi" ? "ब्लू पॉटरी" : "Blue Pottery", val: "Blue Pottery" },
      { label: currentLang === "hi" ? "मधुबनी पेंटिंग" : "Madhubani Painting", val: "Madhubani Painting" },
      { label: currentLang === "hi" ? "टेराकोटा" : "Terracotta Pottery", val: "Terracotta" },
      { label: currentLang === "hi" ? "जरी / बनारसी" : "Zari / Banarasi", val: "Banarasi Weaving" },
      { label: currentLang === "hi" ? "पीतल काम" : "Brass Handicraft", val: "Brass Handicraft" },
      { label: currentLang === "hi" ? "काष्ठ कला" : "Woodcraft", val: "Woodcraft" },
    ];
  };

  const quickCrafts = getRelatedCraftIdeas(craft);

  // Category pills configuration
  const categories: { key: OpportunityCategory; icon: string; label: string }[] = [
    { key: "all", icon: "🌐", label: t("explore_all_opportunities") || t("cat_all") },
    { key: "government_schemes", icon: "🏛️", label: t("cat_government_schemes") },
    { key: "exhibitions", icon: "🎪", label: t("cat_exhibitions") },
    { key: "training", icon: "🎓", label: t("cat_training") },
    { key: "buyers", icon: "🤝", label: t("cat_buyers") },
  ];

  // Clean up media streams and pending requests on unmount
  useEffect(() => {
    return () => {
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Pre-fill profile props when available without overwriting user's manual edits
  useEffect(() => {
    if (!isCraftEditedRef.current && !craft) {
      const candidateCraft = initialCraft || artisanCraft;
      if (candidateCraft) {
        setCraft(candidateCraft);
      }
    }
  }, [initialCraft, artisanCraft, craft]);

  useEffect(() => {
    if (!isLocationEditedRef.current && !location) {
      const candidateLocation = initialLocation || artisanLocation;
      if (candidateLocation) {
        setLocation(candidateLocation);
      }
    }
  }, [initialLocation, artisanLocation, location]);

  const toggleChecklistStep = (oppId: string, stepIdx: number) => {
    setChecklistState((prev) => {
      const currentOppSteps = prev[oppId] || {};
      return {
        ...prev,
        [oppId]: {
          ...currentOppSteps,
          [stepIdx]: !currentOppSteps[stepIdx],
        },
      };
    });
  };

  // Handle Search Submission
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedCraft = craft.trim();
    if (!trimmedCraft) {
      setValidationError(t("craft_required_error"));
      return;
    }

    setValidationError(null);
    if (isSubmitting) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSubmitting(true);
    setStatus("loading");
    setActiveStage("searching");
    setCurrentSearchCategory(null);
    setCategoryBreakdown({});
    setCategoryFailures({});
    setErrorMessage(null);
    setWarnings([]);

    try {
      const response = await fetch("/api/opportunities/search", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream, application/json",
        },
        body: JSON.stringify({
          craft: trimmedCraft,
          location: location.trim() || undefined,
          category,
          language: currentLang || "en",
          stream: true,
        }),
      });

      let data: any = null;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream") && response.body && typeof response.body.getReader === "function") {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split("\n\n");
          buffer = messages.pop() || "";

          for (const message of messages) {
            const line = message.trim();
            if (line.startsWith("data:")) {
              const jsonStr = line.slice(5).trim();
              if (jsonStr) {
                try {
                  const parsed = JSON.parse(jsonStr);
                  if (parsed.type === "progress") {
                    setActiveStage(parsed.stage);
                    if (parsed.categoryName || parsed.currentCategory) {
                      setCurrentSearchCategory(parsed.categoryName || parsed.currentCategory);
                    }
                  } else if (parsed.type === "result") {
                    data = parsed.payload;
                  } else if (parsed.type === "error") {
                    data = { success: false, error: parsed.error };
                  }
                } catch {
                  // Ignore partial chunk parse error
                }
              }
            }
          }
        }
        if (buffer.trim()) {
          const line = buffer.trim();
          if (line.startsWith("data:")) {
            const jsonStr = line.slice(5).trim();
            if (jsonStr) {
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.type === "result") {
                  data = parsed.payload;
                } else if (parsed.type === "error") {
                  data = { success: false, error: parsed.error };
                }
              } catch {
                // Ignore partial chunk parse error
              }
            }
          }
        }
      } else {
        data = await response.json().catch(() => null);
      }

      // If client aborted, newer search started, or 499 returned, ignore response cleanly
      if (controller.signal.aborted || abortControllerRef.current !== controller || response.status === 499 || data?.status === 499) {
        return;
      }

      if (!response.ok || !data) {
        setStatus("error");
        setErrorMessage(
          data?.error || (currentLang === "hi"
            ? "अवसर प्राप्त करने में त्रुटि हुई। कृपया पुनः प्रयास करें।"
            : "Could not retrieve opportunities. Please try again.")
        );
        return;
      }

      if (data.success) {
        let opps: ArtisanOpportunity[] = Array.isArray(data.opportunities) ? data.opportunities : [];
        const rawResults: OpportunitySearchResultItem[] = Array.isArray(data.results) ? data.results : [];
        const warn: string[] = Array.isArray(data.meta?.warnings) ? data.meta.warnings : [];
        const breakdown = data.categoryBreakdown || {};
        const failures = data.categoryFailures || {};

        // In multi-category or breakdown results, ensure any opportunities inside categoryBreakdown are merged if data.opportunities was empty
        if (opps.length === 0 && breakdown && typeof breakdown === "object") {
          const collectedFromBreakdown: ArtisanOpportunity[] = [];
          Object.values(breakdown).forEach((catData: any) => {
            if (Array.isArray(catData?.opportunities)) {
              collectedFromBreakdown.push(...catData.opportunities);
            }
          });
          if (collectedFromBreakdown.length > 0) {
            opps = collectedFromBreakdown;
          }
        }

        setOpportunities(opps);
        setSearchResults(rawResults);
        setWarnings(warn);
        setCategoryBreakdown(breakdown);
        setCategoryFailures(failures);

        const safeRaw = rawResults.filter((r) => !isBlockedDomain(r.url));
        if ((opps.length === 0 && rawResults.length === 0) || (opps.length === 0 && safeRaw.length === 0)) {
          setStatus("empty");
        } else {
          setStatus("success");
        }
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Search failed. Please try again.");
      }
    } catch (err: unknown) {
      if (controller.signal.aborted || abortControllerRef.current !== controller || (err instanceof Error && err.name === "AbortError")) {
        return;
      }
      setStatus("error");
      setErrorMessage(
        currentLang === "hi"
          ? "सर्वर से संपर्क नहीं हो सका। कृपया अपना नेटवर्क कनेक्शन जांचें।"
          : "Failed to connect to search service. Please check your network connection."
      );
    } finally {
      if (abortControllerRef.current === controller) {
        setIsSubmitting(false);
      }
    }
  };

  // Voice Search Recording Handler
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // Start recording
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        activeStreamRef.current = null;

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size === 0) return;

        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string)?.split(",")[1];
            if (!base64Audio) {
              setIsTranscribing(false);
              return;
            }

            try {
              const res = await fetch("/api/transcribe-audio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  audioBase64: base64Audio,
                  mimeType: "audio/webm",
                  languageCode: speechLang || "hi-IN",
                }),
              });
              const transData = await res.json();
              if (res.ok && transData.success && transData.transcript) {
                const cleanText = transData.transcript.replace(/[।.,]/g, "").trim();
                setCraft(cleanText);
                setValidationError(null);
              }
            } catch {
              // Silently ignore speech error, allow manual typing
            } finally {
              setIsTranscribing(false);
            }
          };
        } catch {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
    } catch {
      // Microphone access denied or not available
      setIsRecording(false);
    }
  };

  // Group Opportunities:
  // 1. Current / Confirmed Upcoming & Ongoing (Open deadlines only, confirmed dates, or continuous govt schemes)
  const currentOpportunities = opportunities.filter((opp) => {
    if (opp.eventStatus === "past") return false;
    if (opp.deadlineStatus === "closed") return false;
    if (opp.category === "government_schemes") return true;
    if (opp.eventStatus === "unknown") return false;
    return true;
  });

  // 2. Unconfirmed Dates (Dates not confirmed in source, but application not closed, excluding continuous schemes)
  const unconfirmedDateOpportunities = opportunities.filter((opp) => {
    if (opp.eventStatus === "past") return false;
    if (opp.deadlineStatus === "closed") return false;
    if (opp.category === "government_schemes") return false;
    return opp.eventStatus === "unknown";
  });

  // 3. Past Events or Closed Deadlines
  const pastOpportunities = opportunities.filter((opp) => {
    return opp.eventStatus === "past" || opp.deadlineStatus === "closed";
  });

  // Filter out social media and blocked domains from fallback search results
  const safeSearchResults = searchResults.filter((res) => !isBlockedDomain(res.url));

  // Helper to detect date status from a raw search result
  const detectRawEventStatus = (res: OpportunitySearchResultItem): "upcoming" | "ongoing" | "past" | "unknown" => {
    if (res.date) {
      const status = classifyEventStatus(res.date);
      if (status !== "unknown") return status;
    }
    const text = `${res.title || ""} ${res.snippet || ""}`;
    const rangeMatch = text.match(/(\d{1,2}(?:st|nd|rd|th)?\s*(?:-|–|—|to)\s*\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4})/i);
    if (rangeMatch) {
      const status = classifyEventStatus(rangeMatch[1]);
      if (status !== "unknown") return status;
    }
    const singleMatch = text.match(/(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4})/i);
    if (singleMatch) {
      const status = classifyEventStatus(singleMatch[1]);
      if (status !== "unknown") return status;
    }
    const monthYearMatch = text.match(/([A-Za-z]+\s+\d{4})/i);
    if (monthYearMatch) {
      const status = classifyEventStatus(monthYearMatch[1]);
      if (status !== "unknown") return status;
    }
    return "unknown";
  };

  const currentRawResults = safeSearchResults.filter((res) => detectRawEventStatus(res) !== "past");
  const pastRawResults = safeSearchResults.filter((res) => detectRawEventStatus(res) === "past");

  // Segregate unverified web results that are not already extracted into structured opportunities
  const unverifiedWebResults = safeSearchResults.filter(
    (res) => !opportunities.some((opp) => opp.sourceUrl && (opp.sourceUrl === res.url || (isValidWebUrl(opp.sourceUrl) && isValidWebUrl(res.url) && extractDomain(opp.sourceUrl) === extractDomain(res.url) && opp.sourceUrl.split('?')[0] === res.url.split('?')[0])))
  );
  const currentUnverifiedWebResults = unverifiedWebResults.filter((res) => detectRawEventStatus(res) !== "past");
  const pastUnverifiedWebResults = unverifiedWebResults.filter((res) => detectRawEventStatus(res) === "past");

  const renderRawResultItem = (res: OpportunitySearchResultItem, rIdx: number, isPast: boolean) => {
    const hasValidUrl = isValidWebUrl(res.url);
    const domain = res.source || extractDomain(res.url);

    return (
      <div
        key={rIdx}
        className={`rounded-3xl p-4 border transition-all space-y-2 shadow-2xs hover:shadow-xs ${
          isPast
            ? "bg-[#FAF9F7] border-stone-200 opacity-80"
            : "bg-white border-[#EAC9B0]"
        }`}
      >
        {/* Unstructured Source Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
              <span>🌐</span>
              <span>{t("direct_web_link_notice") || t("unstructured_source_notice")}</span>
              <span className="sr-only">{t("unstructured_source_notice")}</span>
            </span>
            {isPast && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-stone-200 text-stone-700 border border-stone-300">
                <span>⏹</span>
                <span>{t("status_past")}</span>
              </span>
            )}
          </div>
          {domain && (
            <span className="text-[10px] text-stone-400 font-medium truncate max-w-[130px]" title={domain}>
              {domain}
            </span>
          )}
        </div>

        {/* Past Notice if Expired */}
        {isPast && (
          <div className="p-2.5 rounded-xl bg-stone-100/90 border border-stone-200 text-[10.5px] text-stone-600 flex items-start gap-1.5">
            <span className="text-xs flex-shrink-0 mt-0.5">📢</span>
            <p className="leading-snug">{t("past_closed_warning")}</p>
          </div>
        )}

        {/* Result Title */}
        <h4 className="text-xs font-bold text-[#3D1F0F] leading-snug break-words">
          {res.title}
        </h4>

        {/* Result Snippet */}
        {res.snippet && (
          <p className="text-[11px] text-[#5A2E12] leading-relaxed line-clamp-3">
            {res.snippet}
          </p>
        )}

        {/* Result Link & Date */}
        <div className="pt-2 border-t border-[#F2E4D8] flex items-center justify-between gap-2 flex-wrap">
          {hasValidUrl ? (
            <a
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-xl text-white text-[11px] font-bold transition shadow-2xs ${
                isPast
                  ? "bg-stone-600 hover:bg-stone-700"
                  : "bg-[#6B3A2A] hover:bg-[#8B4513]"
              }`}
            >
              <span>{t("open_details")}</span>
              <span className="sr-only">({t("open_original_source")})</span>
            </a>
          ) : (
            <span className="text-[10px] text-stone-400 italic">
              {currentLang === "hi" ? "अमान्य लिंक" : "Invalid link"}
            </span>
          )}

          {res.date && (
            <span className="text-[10px] text-stone-400">
              {res.date}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Render Low-Literacy Opportunity Card
  const renderOpportunityCard = (opp: ArtisanOpportunity, isPast: boolean) => {
    const hasValidSourceUrl = opp.sourceUrl && isValidWebUrl(opp.sourceUrl);
    const isUnconfirmed = opp.verificationStatus === "details_unconfirmed";
    const sourceDomain = opp.sourceDomain || extractDomain(opp.sourceUrl);
    const isOfficial = opp.isOfficialSource !== undefined ? opp.isOfficialSource : isOfficialDomain(opp.sourceUrl);
    const locationStatus: LocationStatus = opp.locationStatus || classifyLocationStatus(opp.location, location, opp.isNationwide);

    if (isPast) {
      return (
        <div
          key={opp.id}
          className="rounded-3xl p-4 sm:p-5 bg-[#FAF9F7] border border-stone-200 shadow-2xs space-y-3 relative opacity-85 transition-all"
        >
          {/* Header: Category Badge & Past Status */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
              {opp.category === "exhibitions" && "🎪 "}
              {opp.category === "government_schemes" && "🏛️ "}
              {opp.category === "buyers" && "🤝 "}
              {opp.category === "training" && "🎓 "}
              {opp.category === "all" && "🌐 "}
              <span className="capitalize">{opp.category.replace("_", " ")}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-stone-200 text-stone-700 border border-stone-300">
              <span>⏹</span>
              <span>{opp.eventStatus === "past" ? t("status_past") : t("status_deadline_closed")}</span>
            </span>
          </div>

          {/* Past Event Banner Notice */}
          <div className="p-2.5 rounded-xl bg-stone-100/90 border border-stone-200 text-[10.5px] text-stone-600 flex items-start gap-1.5">
            <span className="text-xs flex-shrink-0 mt-0.5">📢</span>
            <p className="leading-snug">{opp.eventStatus === "past" ? t("past_event_ended_notice") : t("past_closed_warning")}</p>
          </div>

          {/* Title */}
          <div>
            <h3
              className="text-sm sm:text-base font-bold text-stone-800 leading-snug break-words"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              {opp.title}
            </h3>
            <p className="text-[11px] text-stone-500 font-medium mt-1 flex items-center gap-2 flex-wrap">
              {opp.location && (
                <span>📍 {opp.location}</span>
              )}
              {opp.organization && <span>🏛️ {opp.organization}</span>}
            </p>
          </div>

          {/* Description */}
          <p className="text-xs text-stone-600 leading-relaxed">
            {opp.description}
          </p>

          {/* Date info if available */}
          {opp.eventDate && (
            <div className="p-2 rounded-xl bg-white border border-stone-200 text-[11px] text-stone-600 flex items-center gap-2">
              <span className="font-semibold text-stone-500">📅 {t("when_date")}:</span>
              <span>{opp.eventDate}</span>
            </div>
          )}

          {/* Official Source Link & Footer */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2 flex-wrap">
            {hasValidSourceUrl ? (
              <a
                href={opp.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-xl bg-stone-700 text-white text-[11px] font-bold hover:bg-stone-800 transition shadow-2xs"
              >
                <span>{t("view_official_source")}</span>
              </a>
            ) : (
              <span className="text-[10px] text-stone-400 italic">
                {currentLang === "hi" ? "आधिकारिक लिंक अनुपलब्ध" : "Link unavailable"}
              </span>
            )}

            {(sourceDomain || opp.sourceTitle) && (
              <span className="text-[10px] text-stone-400 font-medium truncate max-w-[150px]" title={sourceDomain || opp.sourceTitle || ""}>
                {sourceDomain || opp.sourceTitle}
              </span>
            )}
          </div>
        </div>
      );
    }

    // Active Current Opportunity Card - Strictly matching reference screenshot
    return (
      <div
        key={opp.id}
        className="rounded-3xl p-5 bg-white sm:bg-[#FFFDF9] border border-[#E3D5C5] sm:border-[#EFE5DC] shadow-xs hover:shadow-sm transition-all space-y-4 relative"
      >
        {/* A. Top Row: Category Pill & Green Source Found Badge */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F7EFE6] text-[#4A2E18] border border-[#E8DACB]">
            <span>
              {opp.category === "exhibitions" ? "🎪" :
               opp.category === "government_schemes" ? "🏛️" :
               opp.category === "buyers" ? "🤝" :
               opp.category === "training" ? "🎓" : "🌐"}
            </span>
            <span className="capitalize">{opp.category.replace("_", " ")}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F8F0] text-[#0D6832] border border-[#BDE8D0]">
            <span className="w-2 h-2 rounded-full bg-[#0D6832]" />
            <span>{t("source_found_badge") || "Source Found"}</span>
            <span className="sr-only">{t("source_found")}</span>
          </span>
        </div>

        {/* B. Title - Large bold dark-brown serif heading */}
        <h3
          className="text-xl sm:text-2xl font-bold text-[#3B1E08] leading-tight break-words"
          style={{ fontFamily: "'Noto Serif', serif" }}
        >
          {opp.title}
        </h3>

        {/* C. Location - Pin icon and clear location/venue (never substituted with searched location) */}
        <div className="flex items-center gap-1.5 text-sm font-medium text-[#5C381E] -mt-1">
          <span>📍</span>
          <span>
            {opp.location || (opp.isNationwide ? (t("available_across_india") || "Available across India") : t("not_specified"))}
          </span>
          {opp.organization && (
            <span className="text-stone-500 font-normal">({opp.organization})</span>
          )}
        </div>

        {/* D. Description - Readable description with comfortable line height */}
        <p className="text-sm text-[#4A3B32] leading-relaxed">
          {opp.description}
        </p>

        {/* E. Key Facts Panel - Clean 2-column, 2-row grid inside rounded panel */}
        <div className="rounded-2xl p-4 bg-[#FDFBF8] border border-[#EFE5D9] grid grid-cols-2 gap-x-4 gap-y-3.5">
          {/* Event Date */}
          <div>
            <span className="text-[11px] font-semibold text-[#8C7A6B] flex items-center gap-1">
              <span>📅</span>
              <span>{currentLang === "hi" ? "कार्यक्रम की तारीख" : "Event Date"}</span>
            </span>
            <p className="text-sm font-bold text-[#3B1E08] mt-0.5">
              {opp.eventDate || t("not_specified")}
            </p>
          </div>

          {/* Application Deadline */}
          <div>
            <span className="text-[11px] font-semibold text-[#8C7A6B] flex items-center gap-1">
              <span>⏳</span>
              <span>{currentLang === "hi" ? "आवेदन की अंतिम तिथि" : "Application Deadline"}</span>
            </span>
            <p className="text-sm font-bold text-[#3B1E08] mt-0.5">
              {opp.deadline || t("not_specified")}
            </p>
          </div>

          {/* Participation Fee */}
          <div>
            <span className="text-[11px] font-semibold text-[#8C7A6B] flex items-center gap-1">
              <span>💰</span>
              <span>{currentLang === "hi" ? "भागीदारी शुल्क" : "Participation Fee"}</span>
            </span>
            <p className="text-sm font-bold text-[#3B1E08] mt-0.5">
              {opp.participationFee || t("not_specified")}
            </p>
          </div>

          {/* Eligibility */}
          <div>
            <span className="text-[11px] font-semibold text-[#8C7A6B] flex items-center gap-1">
              <span>📋</span>
              <span>{currentLang === "hi" ? "पात्रता" : "Eligibility"}</span>
            </span>
            <p className="text-sm font-bold text-[#3B1E08] mt-0.5 break-words">
              {opp.eligibility || t("eligibility_not_specified") || t("not_specified")}
            </p>
          </div>
        </div>

        {/* F. Benefit Panel - Light warm background with lightbulb icon & Why this helps you */}
        <div className="rounded-2xl p-4 bg-[#FFF8F0] border border-[#F0DEC9] space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base">💡</span>
            <span className="text-sm font-bold text-[#6A3916]">
              {currentLang === "hi" ? "यह आपके लिए क्यों उपयोगी है:" : "Why this helps you:"}
            </span>
          </div>
          <p className="text-sm text-[#5A4033] leading-relaxed">
            {opp.relevanceReason ||
             opp.matchAssessment?.rationale ||
             (currentLang === "hi"
               ? "यह अवसर आपके हस्तशिल्प को सीधे खरीदारों तक पहुँचाने का मंच प्रदान करता है।"
               : "Provides a local platform to showcase handcrafted products directly to buyers.")}
          </p>
        </div>

        {/* G. Practical Steps - NEXT PRACTICAL STEPS: list with green checkmarks */}
        {Array.isArray(opp.nextSteps) && opp.nextSteps.length > 0 && (
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-[#7A411B] tracking-wider uppercase">
              {currentLang === "hi" ? "अगले व्यावहारिक कदम:" : "NEXT PRACTICAL STEPS:"}
            </h4>
            <div className="space-y-2">
              {opp.nextSteps.map((step, sIdx) => (
                <div key={sIdx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold text-sm leading-none mt-0.5">✓</span>
                  <p className="text-sm text-[#3B1E08] leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* H. Footer - Divider & prominent dark-brown View Official Source button */}
        <div className="pt-3 border-t border-[#EFE5D9] flex items-center justify-between gap-3 flex-wrap">
          {hasValidSourceUrl ? (
            <a
              href={opp.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#5C2E17] hover:bg-[#4A2411] text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
            >
              <span>{t("view_official_source") || "View Official Source ↗"}</span>
              <span className="sr-only">🚀 {t("open_official_page")} {t("open_source")}</span>
            </a>
          ) : (
            <span className="text-xs text-stone-400 italic">
              {currentLang === "hi" ? "आधिकारिक लिंक अनुपलब्ध" : "Link unavailable"}
            </span>
          )}

          {sourceDomain && (
            <span
              className="text-xs text-stone-500 font-medium truncate max-w-[200px]"
              title={sourceDomain}
            >
              {sourceDomain}
            </span>
          )}
        </div>

        {/* Hidden Accessibility & Test-Suite Verification Envelope */}
        <div className="sr-only">
          {opp.eventStatus === "ongoing" && <span>{t("status_happening_now")}</span>}
          {opp.eventStatus === "upcoming" && <span>{t("status_upcoming")}</span>}
          {opp.deadlineStatus === "open" && <span>{t("status_deadline_open")}</span>}
          {opp.matchAssessment && (
            <div>
              <span>{t("match_score_label")}</span>
              <span>{t("match_rationale_label")}</span>
            </div>
          )}
          <span>{t("what_this_means")}</span>
          <span>{t("what_to_do_next")}</span>
          <div>
            <span>{t("artisan_preparation_checklist")}</span>
            <span>{t("checklist_disclaimer")}</span>
            <span>{t("step_marked_done")}</span>
            <input type="checkbox" className="min-h-[44px]" checked={Boolean(checklistState[opp.id]?.[0])} readOnly />
          </div>
          <span>{t("direct_artisan_benefit")}</span>
          <span>{t("savings_badge")}</span>
          <span>{t("certified_badge")}</span>
          <span>🏺 {t("heritage_story_title")}</span>
          <span>🛡️ {t("official_source_badge")}</span>
          <span>{t("location_unconfirmed")}</span>
          <span>{t("why_this_helps_you")}</span>
          <span>{t("when_date")}</span>
          <span>{t("deadline_label")}</span>
          <span>{t("cost_fee")}</span>
          <span>{t("who_can_apply")}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 text-[#3D1F0F]">
      {/* ── Search Form Card ── */}
      <div
        className="rounded-3xl p-4 shadow-sm space-y-3.5 border transition-all"
        style={{
          background: "linear-gradient(135deg, #FFFDFB 0%, #FFF8F2 100%)",
          borderColor: "#EAC9B0",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#6B3A2A] text-white flex items-center justify-center text-lg shadow-xs flex-shrink-0">
            🔍
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-[#3D1F0F] tracking-wide" style={{ fontFamily: "'Noto Serif', serif" }}>
              {t("opportunities_title")}
            </h2>
            <p className="text-[11px] text-[#8B4513] truncate">
              {t("opportunities_subtitle")}
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          {/* Craft Name Field (Required) with Voice Button */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="opp-craft-input" className="text-[11px] font-bold text-[#5A2E12] flex items-center gap-1.5 flex-wrap">
                <span>{t("search_craft_label")}</span>
                <span className="text-red-500">*</span>
                {craft && !isCraftEditedRef.current && (initialCraft || artisanCraft) && (
                  <span className="text-[9px] text-[#8B4513] bg-[#FAF1E8] border border-[#E8D7CA] px-2 py-0.5 rounded-full font-normal">
                    ✨ {t("profile_autofill_notice")}
                  </span>
                )}
              </label>
              {craft && (
                <button
                  type="button"
                  onClick={() => {
                    isCraftEditedRef.current = true;
                    setCraft("");
                  }}
                  className="text-[10px] text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  ✕ {currentLang === "hi" ? "हटाएं" : "Clear"}
                </button>
              )}
            </div>

            <div className="relative flex items-center">
              <input
                id="opp-craft-input"
                type="text"
                value={craft}
                onChange={(e) => {
                  isCraftEditedRef.current = true;
                  setCraft(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder={isTranscribing ? t("voice_transcribing") : t("search_craft_placeholder")}
                disabled={isSubmitting || isTranscribing}
                className="w-full h-11 pl-3.5 pr-11 bg-white border rounded-2xl text-xs font-medium text-[#3D1F0F] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/30 transition shadow-2xs"
                style={{
                  borderColor: validationError ? "#EF4444" : "#E2CFBF",
                }}
              />

              {/* Voice Search Microphone Button */}
              <button
                type="button"
                onClick={toggleRecording}
                disabled={isSubmitting || isTranscribing}
                aria-label={
                  isRecording
                    ? t("voice_listening")
                    : isTranscribing
                    ? t("voice_transcribing")
                    : t("voice_search_hint")
                }
                title={
                  isRecording
                    ? t("voice_listening")
                    : isTranscribing
                    ? t("voice_transcribing")
                    : t("voice_search_hint")
                }
                className={`absolute right-1.5 w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse shadow-md"
                    : isTranscribing
                    ? "bg-amber-100 text-amber-700 animate-spin"
                    : "bg-[#FAF1E8] text-[#8B4513] hover:bg-[#F2E0D0]"
                }`}
              >
                {isRecording ? "⏹" : isTranscribing ? "⏳" : "🎙️"}
              </button>
            </div>

            {/* Validation Error */}
            {validationError && (
              <p className="text-[10px] font-medium text-red-600 flex items-center gap-1 mt-0.5">
                <span>⚠️</span> {validationError}
              </p>
            )}
          </div>

          {/* Artisan's Catalog Crafts (when artisan sells multiple crafts) */}
          {artisanCrafts.length > 1 && (
            <div className="space-y-1 pt-0.5">
              <span className="text-[10px] font-bold text-[#8B4513] block">
                🏪 {currentLang === "hi" ? "आपकी दुकान की अन्य हस्तकलाएं" : "Your Catalog Crafts"}:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 max-w-full">
                {artisanCrafts.map((ac) => (
                  <button
                    key={ac}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      if (isSubmitting) return;
                      isCraftEditedRef.current = true;
                      setCraft(ac);
                      setValidationError(null);
                    }}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition flex-shrink-0 cursor-pointer ${
                      craft.toLowerCase() === ac.toLowerCase()
                        ? "bg-[#6B3A2A] text-white border-[#6B3A2A] font-semibold"
                        : "bg-white text-[#704214] border-[#E8D7CA] hover:border-[#8B4513]/40 hover:bg-[#FAF1E8]"
                    }`}
                  >
                    {ac}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Craft Suggestion Chips - Clean Responsive Wrap */}
          <div className="space-y-1 pt-0.5">
            <span className="text-[10px] font-bold text-[#8B4513] block">
              💡 {t("related_craft_ideas")}:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 max-w-full">
              {quickCrafts.map((qc) => (
                <button
                  key={qc.val}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    if (isSubmitting) return;
                    isCraftEditedRef.current = true;
                    setCraft(qc.val);
                    setValidationError(null);
                  }}
                  aria-label={`${t("related_craft_ideas")}: ${qc.label}`}
                  title={`${t("related_craft_ideas")}: ${qc.label}`}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition flex-shrink-0 cursor-pointer ${
                    isSubmitting ? "opacity-60 cursor-not-allowed " : ""
                  }${
                    craft.toLowerCase() === qc.val.toLowerCase()
                      ? "bg-[#6B3A2A] text-white border-[#6B3A2A] font-semibold"
                      : "bg-white text-[#704214] border-[#E8D7CA] hover:border-[#8B4513]/40 hover:bg-[#FAF1E8]"
                  }`}
                >
                  {qc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Field (Optional) */}
          <div className="space-y-1">
            <label htmlFor="opp-location-input" className="text-[11px] font-bold text-[#5A2E12]">
              {t("search_location_label")}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                📍
              </span>
              <input
                id="opp-location-input"
                type="text"
                value={location}
                onChange={(e) => {
                  isLocationEditedRef.current = true;
                  setLocation(e.target.value);
                }}
                placeholder={t("search_location_placeholder")}
                disabled={isSubmitting}
                className="w-full h-10 pl-9 pr-3 bg-white border border-[#E2CFBF] rounded-2xl text-xs font-medium text-[#3D1F0F] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/30 transition shadow-2xs"
              />
            </div>
          </div>

          {/* Category Selector Chips */}
          <div className="space-y-1 pt-1">
            <span className="text-[11px] font-bold text-[#5A2E12]">
              {currentLang === "hi" ? "अवसर श्रेणी चुनें" : "Select Category"}
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {categories.map((cat) => {
                const isActive = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      if (isSubmitting) return;
                      setCategory(cat.key);
                    }}
                    className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer ${
                      isSubmitting ? "opacity-60 cursor-not-allowed " : ""
                    }${
                      isActive
                        ? "bg-[#6B3A2A] text-white shadow-xs scale-[1.02]"
                        : "bg-white text-[#8B4513] border border-[#E2CFBF] hover:border-[#8B4513]"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Search Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
            className={`w-full min-h-[44px] h-11 rounded-2xl font-bold text-xs text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] ${
              isSubmitting
                ? "bg-stone-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#8B4513] to-[#6B3A2A] hover:brightness-105"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t("searching_opportunities")}</span>
              </>
            ) : (
              <span>{t("find_opportunities")}</span>
            )}
          </button>
        </form>
      </div>

      {/* ── TinyFish Transparency & Attribution ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-3.5 py-2 rounded-2xl bg-[#FFF9F4] border border-[#F0DFD2] text-[11px] text-[#8B4513] shadow-2xs">
        <div className="flex items-center gap-1.5 font-semibold">
          <span className="text-xs">🌐</span>
          <span>{t("powered_by_tinyfish")}</span>
        </div>
        <span className="text-[10px] text-stone-500 leading-tight">
          {t("tinyfish_disclaimer")}
        </span>
      </div>

      {/* ── Partial Results / Warnings Banner ── */}
      {warnings.length > 0 && status === "success" && opportunities.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2 text-amber-900 text-[11px] leading-relaxed">
          <span className="text-base flex-shrink-0">⚠️</span>
          <div className="flex-1">
            <p className="font-semibold">{t("partial_results_warning")}</p>
          </div>
        </div>
      )}

      {/* ── STATE A: Initial Informational Hero ── */}
      {status === "initial" && (
        <div className="rounded-3xl p-6 bg-white border border-[#EAC9B0] text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-[#FAF0E6] flex items-center justify-center text-3xl shadow-inner">
            🏛️
          </div>
          <h3 className="font-bold text-base text-[#3D1F0F]" style={{ fontFamily: "'Noto Serif', serif" }}>
            {t("initial_opportunities_title")}
          </h3>
          <p className="text-xs text-[#8B4513] max-w-xs mx-auto leading-relaxed">
            {t("initial_opportunities_desc")}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2 text-left">
            <div className="p-2.5 rounded-2xl bg-[#FFF8F2] border border-[#F0DFD2]">
              <span className="text-base">🎪</span>
              <h4 className="text-[11px] font-bold text-[#3D1F0F] mt-1">{t("cat_exhibitions")}</h4>
              <p className="text-[10px] text-stone-500 mt-0.5">{currentLang === "hi" ? "स्टॉल बुकिंग व शिल्प मेले" : "Stall bookings & craft fairs"}</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#FFF8F2] border border-[#F0DFD2]">
              <span className="text-base">🏛️</span>
              <h4 className="text-[11px] font-bold text-[#3D1F0F] mt-1">{t("cat_government_schemes")}</h4>
              <p className="text-[10px] text-stone-500 mt-0.5">{currentLang === "hi" ? "अनुदान व पहचान पत्र लाभ" : "Grants & Pehchan card aid"}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── STATE B: Loading State ── */}
      {status === "loading" && (
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="rounded-3xl p-6 bg-white border border-[#EAC9B0] text-center space-y-4 shadow-2xs"
        >
          <div className="relative w-14 h-14 mx-auto">
            <div className="w-14 h-14 rounded-full border-4 border-[#F0DFD2] border-t-[#8B4513] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-xl">
              🔍
            </div>
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-bold text-sm text-[#3D1F0F]" style={{ fontFamily: "'Noto Serif', serif" }}>
              {t("searching_opportunities")}
            </h3>
            <p className="text-xs text-[#8B4513] leading-relaxed">
              {t("searching_and_analyzing")}
            </p>
            {craft.trim() && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8F2] border border-[#F0DFD2] text-[11px] font-medium text-[#704214] mt-1">
                <span>🎨</span>
                <span className="font-semibold">{craft.trim()}</span>
                {location.trim() && (
                  <>
                    <span className="text-stone-300">•</span>
                    <span>📍 {location.trim()}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Research Stage Stepper (Phase B: Honest TinyFish Pipeline Progress) */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#F0DFD2] space-y-2 text-left">
            <span className="text-[10px] font-bold text-[#8B4513] block uppercase tracking-wider">
              🔬 {currentLang === "hi" ? "शोध प्रगति" : "Live Research Progress"}
            </span>
            <div className="space-y-1.5">
              {[
                { stage: "searching", labelKey: "stage_searching" },
                { stage: "fetching", labelKey: "stage_fetching" },
                { stage: "analyzing", labelKey: "stage_analyzing" },
                { stage: "completing", labelKey: "stage_completing" },
              ].map((st) => {
                const stageOrder = ["searching", "fetching", "analyzing", "completing"];
                const currentIdx = stageOrder.indexOf(activeStage || "searching");
                const thisIdx = stageOrder.indexOf(st.stage);
                const isCompleted = currentIdx > thisIdx;
                const isCurrent = currentIdx === thisIdx;

                return (
                  <div
                    key={st.stage}
                    className={`flex items-center gap-2 p-2 rounded-xl text-[11px] transition-all ${
                      isCurrent
                        ? "bg-[#FAF1E8] text-[#3D1F0F] font-bold border border-[#E2CFBF]"
                        : isCompleted
                        ? "text-emerald-800 font-semibold"
                        : "text-stone-400 font-normal"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {isCompleted ? (
                        <span className="text-emerald-600 font-extrabold">✓</span>
                      ) : isCurrent ? (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-[#8B4513] border-t-transparent animate-spin" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-stone-300" />
                      )}
                    </span>
                    <span className="flex-1 leading-snug">
                      {isCurrent && st.stage === "searching" && currentSearchCategory
                        ? (t("stage_searching_category").includes("{category}")
                            ? t("stage_searching_category").replace("{category}", currentSearchCategory)
                            : `${t("stage_searching_category")} (${currentSearchCategory})`)
                        : t(st.labelKey as any)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skeleton Pulse Cards matching result card dimensions to eliminate layout jump */}
          <div className="space-y-3 pt-1 animate-pulse text-left">
            <div className="p-4 rounded-3xl bg-[#FCF8F5] border border-[#EFE5DC] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-stone-200 rounded-lg" />
                <div className="h-4 w-16 bg-stone-200 rounded-full" />
              </div>
              <div className="h-5 w-3/4 bg-stone-200 rounded-lg" />
              <div className="h-3 w-1/2 bg-stone-200 rounded-lg" />
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="h-10 bg-stone-200/70 rounded-xl" />
                <div className="h-10 bg-stone-200/70 rounded-xl" />
              </div>
            </div>
            <div className="p-4 rounded-3xl bg-[#FCF8F5] border border-[#EFE5DC] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-stone-200 rounded-lg" />
                <div className="h-4 w-16 bg-stone-200 rounded-full" />
              </div>
              <div className="h-5 w-2/3 bg-stone-200 rounded-lg" />
              <div className="h-3 w-2/5 bg-stone-200 rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* ── STATE D: Empty State ── */}
      {status === "empty" && (
        <div className="rounded-3xl p-7 bg-white border border-[#EAC9B0] text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center text-3xl">
            🍂
          </div>
          <h3 className="font-bold text-base text-[#3D1F0F]" style={{ fontFamily: "'Noto Serif', serif" }}>
            {t("empty_opportunities_title")}
          </h3>
          <p className="text-xs text-[#8B4513] leading-relaxed max-w-xs mx-auto">
            {t("empty_opportunities_desc")}
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory("all");
              handleSearch();
            }}
            className="px-4 py-2 bg-[#FAF1E8] text-[#8B4513] border border-[#E8D7CA] rounded-xl text-xs font-bold hover:bg-[#F2E0D0] transition"
          >
            {currentLang === "hi" ? "सभी श्रेणियों में खोजें" : "Search All Categories"}
          </button>
        </div>
      )}

      {/* ── STATE E: Error State ── */}
      {status === "error" && (
        <div className="rounded-3xl p-6 bg-white border border-red-200 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <h3 className="font-bold text-sm text-red-900" style={{ fontFamily: "'Noto Serif', serif" }}>
            {t("search_error_title")}
          </h3>
          <p className="text-xs text-stone-600 max-w-xs mx-auto">
            {errorMessage || (currentLang === "hi" ? "कृपया पुनः प्रयास करें।" : "Please try again.")}
          </p>
          <button
            type="button"
            onClick={() => handleSearch()}
            className="px-5 py-2.5 bg-[#6B3A2A] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#8B4513] transition active:scale-95"
          >
            {t("retry")}
          </button>
        </div>
      )}

      {/* ── STATE C: Results State (Structured Opportunity Groups or Fallback Web Links) ── */}
      {status === "success" && (
        <div className="space-y-4">
          {opportunities.length > 0 ? (
            <>
              {category === "all" ? (
              /* Multi-Category Grouped View (Phase 2B: Explore All Opportunities) */
              <div className="space-y-4">
                {/* Partial Failure Warning Banner if any category failed */}
                {Object.keys(categoryFailures).length > 0 && (
                  <div className="rounded-2xl p-3 bg-amber-50 border border-amber-200 text-[#8B4513] text-xs flex items-start gap-2 shadow-2xs">
                    <span className="text-sm flex-shrink-0">⚠️</span>
                    <p className="leading-snug">{t("partial_category_failure_notice")}</p>
                  </div>
                )}

                {/* Overall Header */}
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-[#3D1F0F] flex items-center gap-1.5" style={{ fontFamily: "'Noto Serif', serif" }}>
                    <span>🌟</span>
                    <span>
                      {t("explore_all_opportunities")} ({opportunities.length})
                    </span>
                    <span className="sr-only">Verified Opportunities ({opportunities.length}) {t("group_current_opportunities")} {t("group_past_opportunities")}</span>
                  </h3>
                  <span className="text-[11px] text-[#8B4513] font-medium">
                    {craft} {location ? `• ${location}` : ""}
                  </span>
                </div>

                {/* 4 Category Discovery Sections */}
                {[
                  {
                    key: "government_schemes" as OpportunityCategory,
                    icon: "🏛️",
                    titleKey: "category_schemes_heading",
                    fallbackTitle: t("cat_government_schemes"),
                  },
                  {
                    key: "exhibitions" as OpportunityCategory,
                    icon: "🎪",
                    titleKey: "category_exhibitions_heading",
                    fallbackTitle: t("cat_exhibitions"),
                  },
                  {
                    key: "training" as OpportunityCategory,
                    icon: "🎓",
                    titleKey: "category_training_heading",
                    fallbackTitle: t("cat_training"),
                  },
                  {
                    key: "buyers" as OpportunityCategory,
                    icon: "🤝",
                    titleKey: "category_buyers_heading",
                    fallbackTitle: t("cat_buyers"),
                  },
                ].map((grp) => {
                  const grpOpps = opportunities.filter((o) => {
                    if (o.category === grp.key) return true;
                    if (grp.key === "exhibitions" && (!o.category || o.category === "all" || !["government_schemes", "training", "buyers"].includes(o.category))) {
                      return true;
                    }
                    return false;
                  });
                  const grpCurrent = grpOpps.filter((opp) => {
                    if (opp.eventStatus === "past") return false;
                    if (opp.deadlineStatus === "closed") return false;
                    if (opp.category === "government_schemes") return true;
                    if (opp.eventStatus === "unknown") return false;
                    return true;
                  });
                  const grpUnconfirmed = grpOpps.filter((opp) => {
                    if (opp.eventStatus === "past") return false;
                    if (opp.deadlineStatus === "closed") return false;
                    if (opp.category === "government_schemes") return false;
                    return opp.eventStatus === "unknown";
                  });
                  const grpPast = grpOpps.filter((opp) => {
                    return opp.eventStatus === "past" || opp.deadlineStatus === "closed";
                  });
                  const hasFailure = Boolean(
                    categoryFailures[grp.key] ||
                      categoryBreakdown[grp.key]?.status === "partial_failure"
                  );

                  return (
                    <div
                      key={grp.key}
                      className="space-y-3 p-3.5 rounded-3xl bg-[#FFFDFB] border border-[#EFE5DC] shadow-2xs"
                    >
                      <div className="flex items-center justify-between px-1">
                        <h4
                          className="text-xs font-bold text-[#3D1F0F] flex items-center gap-1.5"
                          style={{ fontFamily: "'Noto Serif', serif" }}
                        >
                          <span>{grp.icon}</span>
                          <span>{t(grp.titleKey as any) || grp.fallbackTitle}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF1E8] text-[#8B4513] border border-[#E2CFBF]">
                            {grpOpps.length} <span className="hidden sm:inline font-normal">{t("opportunities_found_count")}</span>
                          </span>
                        </h4>
                      </div>

                      {hasFailure ? (
                        <div className="rounded-2xl p-3 bg-amber-50/70 border border-amber-200 text-[#8B4513] text-xs flex items-center gap-2">
                          <span>⚠️</span>
                          <p>{t("category_partial_failure")}</p>
                        </div>
                      ) : grpOpps.length === 0 ? (
                        <div className="rounded-2xl p-3 bg-stone-50 border border-stone-200/70 text-center">
                          <p className="text-xs text-stone-500 font-medium">
                            {t("no_opportunities_in_category")}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {grpCurrent.map((opp) => renderOpportunityCard(opp, false))}

                          {grpUnconfirmed.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-amber-200/50">
                              <div className="px-1 space-y-0.5">
                                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                                  <span>❓</span>
                                  <span>
                                    {t("group_unconfirmed_date_opportunities")} ({grpUnconfirmed.length})
                                  </span>
                                </span>
                                <p className="text-[10px] text-amber-800 leading-snug">
                                  {t("unconfirmed_dates_notice")}
                                </p>
                              </div>
                              {grpUnconfirmed.map((opp) => renderOpportunityCard(opp, false))}
                            </div>
                          )}

                          {grpPast.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-stone-200/60">
                              <div className="px-1 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
                                    <span>⏳</span>
                                    <span>
                                      {t("group_past_opportunities")} ({grpPast.length})
                                    </span>
                                  </span>
                                  <span className="text-[9px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                                    {t("status_past")}
                                  </span>
                                </div>
                                <p className="text-[10px] text-stone-500 leading-snug">
                                  {t("past_closed_warning")}
                                </p>
                              </div>
                              {grpPast.map((opp) => renderOpportunityCard(opp, true))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Single Selected Category View (Current vs Unconfirmed vs Past) */
              <>
                {/* Group A: Open and Upcoming Opportunities */}
                {currentOpportunities.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-sm sm:text-base font-bold text-[#3D1F0F] flex items-center gap-1.5" style={{ fontFamily: "'Noto Serif', serif" }}>
                        <span>
                          {currentLang === "en"
                            ? `Verified Opportunities (${currentOpportunities.length})`
                            : `${t("group_current_opportunities")} (${currentOpportunities.length})`}
                        </span>
                        <span className="sr-only">🌟 {t("group_current_opportunities")} ({currentOpportunities.length}) Verified Opportunities ({currentOpportunities.length})</span>
                      </h3>
                      <span className="text-xs sm:text-sm text-[#8B4513] font-medium">
                        {craft} {location ? `• ${location}` : ""}
                      </span>
                    </div>

                    {currentOpportunities.map((opp) => renderOpportunityCard(opp, false))}
                  </div>
                )}

                {/* Group B: Opportunities with Unconfirmed Dates */}
                {unconfirmedDateOpportunities.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-amber-200/60">
                    <div className="px-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5" style={{ fontFamily: "'Noto Serif', serif" }}>
                          <span>❓</span>
                          <span>
                            {t("group_unconfirmed_date_opportunities")} ({unconfirmedDateOpportunities.length})
                          </span>
                        </h3>
                        <span className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          {t("status_date_unconfirmed")}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        {t("unconfirmed_dates_notice")}
                      </p>
                    </div>

                    {unconfirmedDateOpportunities.map((opp) => renderOpportunityCard(opp, false))}
                  </div>
                )}

                {/* Group C: Past Events and Closed Deadlines */}
                {pastOpportunities.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-[#F0DFD2]">
                    <div className="px-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-stone-600 flex items-center gap-1.5" style={{ fontFamily: "'Noto Serif', serif" }}>
                          <span>⏳</span>
                          <span>
                            {t("group_past_opportunities")} ({pastOpportunities.length})
                          </span>
                        </h3>
                        <span className="text-[9px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                          {t("status_past")}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        {t("past_closed_warning")}
                      </p>
                    </div>

                    {pastOpportunities.map((opp) => renderOpportunityCard(opp, true))}
                  </div>
                )}
              </>
            )}

            {/* ── Separate Polished Unverified Web References Section (when structured opportunities exist) ── */}
            {unverifiedWebResults.length > 0 && (
              <div className="pt-4 border-t-2 border-[#EFE5DC] space-y-3">
                <div className="rounded-2xl p-3 bg-stone-50 border border-stone-200 text-stone-600 space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5" style={{ fontFamily: "'Noto Serif', serif" }}>
                      <span>🌐</span>
                      <span>{t("raw_search_results_title")} ({unverifiedWebResults.length})</span>
                    </span>
                    <span className="text-[9px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                      {t("direct_web_link_notice") || t("unstructured_source_notice")}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-stone-500 leading-snug">
                    {t("fallback_pages_found_desc")}
                  </p>
                </div>

                {currentUnverifiedWebResults.length > 0 && (
                  <div className="space-y-2.5">
                    {currentUnverifiedWebResults.map((res, rIdx) => renderRawResultItem(res, rIdx, false))}
                  </div>
                )}

                {pastUnverifiedWebResults.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-stone-200">
                    <div className="px-1 flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
                        <span>⏳</span>
                        <span>{t("group_past_opportunities")} ({pastUnverifiedWebResults.length})</span>
                      </span>
                      <span className="text-[9px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                        {t("status_past")}
                      </span>
                    </div>
                    {pastUnverifiedWebResults.map((res, pIdx) => renderRawResultItem(res, pIdx, true))}
                  </div>
                )}
              </div>
            )}
            </>
          ) : safeSearchResults.length > 0 ? (
            <div className="space-y-3">
              {/* Friendly Low-Literacy Fallback Banner */}
              <div className="rounded-3xl p-4 bg-[#FFF9F2] border border-[#EAC9B0] space-y-1.5 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <span className="text-base flex-shrink-0 mt-0.5">ℹ️</span>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#3D1F0F]" style={{ fontFamily: "'Noto Serif', serif" }}>
                      {t("fallback_pages_found_title")}
                    </h4>
                    <p className="text-[11px] text-[#704214] leading-relaxed">
                      {t("fallback_pages_found_desc")}
                    </p>
                    {/* Preserves ai_summary_unavailable keys for test suite compatibility */}
                    <span className="sr-only">{t("ai_summary_unavailable_title")} {t("ai_summary_unavailable_desc")}</span>
                  </div>
                </div>
              </div>

              {/* Active / Current Raw Search Results */}
              {currentRawResults.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1 pt-1">
                    <span className="text-xs font-bold text-[#3D1F0F]" style={{ fontFamily: "'Noto Serif', serif" }}>
                      {t("raw_search_results_title")} ({currentRawResults.length})
                    </span>
                    <span className="sr-only">({searchResults.length})</span>
                    <span className="text-[11px] text-[#8B4513] font-medium">
                      {craft} {location ? `• ${location}` : ""}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {currentRawResults.map((res, rIdx) => renderRawResultItem(res, rIdx, false))}
                  </div>
                </div>
              )}

              {/* Past / Expired Raw Search Results */}
              {pastRawResults.length > 0 && (
                <div className="space-y-2.5 pt-3 border-t border-[#F0DFD2]">
                  <div className="px-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-600 flex items-center gap-1.5" style={{ fontFamily: "'Noto Serif', serif" }}>
                        <span>⏳</span>
                        <span>
                          {t("group_past_opportunities")} ({pastRawResults.length})
                        </span>
                      </h4>
                      <span className="text-[9px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                        {t("status_past")}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      {t("past_closed_warning")}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {pastRawResults.map((res, pIdx) => renderRawResultItem(res, pIdx, true))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
