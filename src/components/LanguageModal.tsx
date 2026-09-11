// src/components/LanguageModal.tsx
import React from "react";
import { useLanguage, LanguageCode } from "../context/LanguageContext";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: "seller" | "buyer";
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  theme = "seller",
}) => {
  const { currentLang, setLanguage, languages, t } = useLanguage();

  if (!isOpen) return null;

  const isSeller = theme === "seller";
  const primaryColor = isSeller ? "#6B3A2A" : "#5B21B6";
  const activeBg = isSeller ? "#FFF5EE" : "#F5F3FF";
  const activeBorder = isSeller ? "#C4886B" : "#7C3AED";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-3xl p-5 space-y-4 shadow-2xl border-t animate-slide-up"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: isSeller ? "rgba(196,136,107,0.4)" : "rgba(124,58,237,0.3)",
          fontFamily: "'Poppins', sans-serif",
          maxHeight: "80vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-inner"
              style={{
                backgroundColor: isSeller ? "#EDE0D4" : "#EDE9FE",
                color: primaryColor,
              }}
            >
              🌐
            </div>
            <div>
              <h3
                className="text-base font-bold text-stone-900"
                style={{ fontFamily: "'Noto Serif', serif" }}
              >
                {t("select_language")}
              </h3>
              <p className="text-[11px] text-stone-500">
                {t("lang_modal_subtitle")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-800 font-bold flex items-center justify-center active:scale-90 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Languages Grid (Flipkart-Style 2-Column Cards) */}
        <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto py-1">
          {languages.map((lang) => {
            const isSelected = currentLang === lang.code;

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  onClose();
                }}
                className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer touch-press ${
                  isSelected ? "shadow-sm" : "hover:border-stone-300"
                }`}
                style={{
                  backgroundColor: isSelected ? activeBg : "#FAF8F5",
                  borderColor: isSelected ? activeBorder : "#E7E2DC",
                  borderWidth: isSelected ? "2px" : "1px",
                }}
              >
                <div>
                  <span
                    className="text-lg font-bold block"
                    style={{
                      color: isSelected ? primaryColor : "#292524",
                      fontFamily: "'Noto Serif', serif",
                    }}
                  >
                    {lang.nativeName}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium block mt-0.5">
                    {lang.englishName}
                  </span>
                </div>

                {isSelected && (
                  <span
                    className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-center text-stone-400">
          {t("lang_modal_hint")}
        </p>
      </div>
    </div>
  );
};