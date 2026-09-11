// src/components/LanguageDropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import { useLanguage, LanguageCode } from "../context/LanguageContext";

interface LanguageDropdownProps {
  theme?: "seller" | "buyer" | "glass";
  className?: string;
  align?: "right" | "left";
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  theme = "seller",
  className = "",
  align = "right",
}) => {
  const { currentLang, setLanguage, languages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeLang = languages.find((l) => l.code === currentLang) || languages[0];

  // Outside-click listener using pointerdown for immediate mobile/desktop response
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [isOpen]);

  // Styling based on theme
  const isBuyer = theme === "buyer";
  const isGlass = theme === "glass";
  const isAbsolute = className.includes("absolute");

  // Trigger button styles
  const triggerClasses = isGlass
    ? "bg-black/40 backdrop-blur-md text-white border border-white/30 hover:bg-black/50"
    : isBuyer
    ? "bg-white/20 text-white border border-white/30 hover:bg-white/30"
    : "bg-white/15 text-white border border-white/25 hover:bg-white/25";

  const activeHighlightBg = isBuyer ? "#F3E8FF" : "#FFF7ED";
  const activeHighlightText = isBuyer ? "#6B21A8" : "#9A3412";
  const activeBorderColor = isBuyer ? "#C084FC" : "#FDBA74";

  const handleSelect = (code: LanguageCode, e: React.MouseEvent) => {
    e.stopPropagation();
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`inline-block text-left ${className}`}
      style={{
        position: isAbsolute ? "absolute" : "relative",
        zIndex: isOpen ? 60 : undefined,
      }}
    >
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t("select_language")}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${triggerClasses}`}
      >
        <span className="text-sm leading-none">🌐</span>
        <span className="leading-none">{activeLang.nativeName}</span>
        <span
          className="text-[9px] leading-none transition-transform duration-150"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      {/* Floating Dropdown Card */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={t("select_language")}
          className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50 animate-dropdown-enter py-1`}
          style={{
            boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-3.5 py-1.5 border-b border-stone-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              {t("select_language")}
            </span>
            <span className="text-[9px] font-medium text-stone-400">7 Indic</span>
          </div>

          {/* Language Options List */}
          <div className="max-h-60 overflow-y-auto py-1" style={{ scrollbarWidth: "thin" }}>
            {languages.map((lang) => {
              const isSelected = currentLang === lang.code;

              return (
                <button
                  key={lang.code}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={(e) => handleSelect(lang.code, e)}
                  className={`w-full px-3 py-1.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "font-bold"
                      : "hover:bg-stone-50 text-stone-700"
                  }`}
                  style={{
                    backgroundColor: isSelected ? activeHighlightBg : "transparent",
                    color: isSelected ? activeHighlightText : undefined,
                    borderLeft: isSelected ? `3px solid ${activeBorderColor}` : "3px solid transparent",
                  }}
                >
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-xs leading-snug font-semibold truncate">{lang.nativeName}</span>
                    <span className="text-[10px] text-stone-400 font-normal leading-tight truncate">
                      {lang.englishName}
                    </span>
                  </div>

                  {isSelected && (
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0"
                      style={{ backgroundColor: isBuyer ? "#7C3AED" : "#C2410C" }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
