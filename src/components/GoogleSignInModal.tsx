// src/components/GoogleSignInModal.tsx
import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

export interface DemoAccount {
  id: string;
  name: string;
  email: string;
  avatarBg: string;
  avatarLetter: string;
  isCustom?: boolean;
}

export interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role: "seller" | "buyer";
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "ayush_singh",
    name: "Ayush Singh",
    email: "example@gmail.com",
    avatarBg: "#1a73e8", // Google Blue
    avatarLetter: "A",
  },
  {
    id: "kalakriti_demo",
    name: "Kalakriti Demo",
    email: "demo@gmail.com",
    avatarBg: "#e37400", // Warm Ochre
    avatarLetter: "K",
  },
];

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  role,
}) => {
  const { t } = useLanguage();
  const [authStatus, setAuthStatus] = useState<"idle" | "signing_in" | "success">("idle");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = (account: DemoAccount) => {
    if (authStatus !== "idle") return; // Prevent duplicate clicks

    setSelectedAccountId(account.id);
    setAuthStatus("signing_in");

    // Realistic authentication latency (650ms verification)
    setTimeout(() => {
      setAuthStatus("success");

      // Short success feedback transition before continuing
      setTimeout(() => {
        onSuccess();
      }, 500);
    }, 700);
  };

  const handleClose = () => {
    if (authStatus !== "idle") return; // Prevent closing while in-flight
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in cursor-pointer"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-signin-title"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[340px] p-5 shadow-2xl border border-stone-200 animate-modal-enter cursor-default relative overflow-hidden"
        style={{ fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={authStatus !== "idle"}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center text-xs transition cursor-pointer touch-press disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={t("google_cancel")}
        >
          ✕
        </button>

        {/* ── Google Branding Header ── */}
        <div className="flex flex-col items-center text-center pt-1 pb-3">
          {/* Official Google Multicolor G Icon */}
          <div className="w-8 h-8 flex items-center justify-center mb-2">
            <svg width="26" height="26" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </div>

          <h2 id="google-signin-title" className="text-base font-semibold text-[#202124] leading-tight">
            {t("google_sign_in_title")}
          </h2>
          <p className="text-xs text-[#5f6368] mt-0.5">
            {t("google_continue_to")}
          </p>
        </div>

        {/* ── Active State / Account Chooser Body ── */}
        {authStatus === "idle" && (
          <div className="mt-2 space-y-1">
            <div className="text-[11px] font-medium text-[#5f6368] px-1 pb-1">
              {t("google_choose_account")}
            </div>

            {/* List of Demo Accounts */}
            <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 shadow-2xs">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelectAccount(acc)}
                  className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-[#f8fafd] transition-colors cursor-pointer touch-press"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Circle Avatar with Letter */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-2xs"
                      style={{ background: acc.avatarBg }}
                    >
                      {acc.avatarLetter}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-[#3c4043] truncate">
                        {acc.name}
                      </div>
                      <div className="text-[11px] text-[#5f6368] truncate font-normal">
                        {acc.email}
                      </div>
                    </div>
                  </div>

                  {/* Explicit DEMO Badge */}
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200/80 flex-shrink-0 ml-2">
                    {t("google_demo_badge")}
                  </span>
                </button>
              ))}

              {/* Option 3: Use another account */}
              <button
                type="button"
                onClick={() =>
                  handleSelectAccount({
                    id: "another_account",
                    name: "Kalakriti Guest",
                    email: "guest.demo@gmail.com",
                    avatarBg: "#5f6368",
                    avatarLetter: "G",
                    isCustom: true,
                  })
                }
                className="w-full px-3 py-2.5 flex items-center gap-2.5 text-left hover:bg-[#f8fafd] transition-colors cursor-pointer touch-press"
              >
                <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 text-xs flex-shrink-0">
                  👤
                </div>
                <div className="text-xs font-medium text-[#3c4043]">
                  {t("google_use_another_account")}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── In-Flight Signing In Loading State ── */}
        {authStatus === "signing_in" && (
          <div className="py-8 flex flex-col items-center justify-center text-center animate-fade-in">
            {/* Subtle Google Blue Spinner */}
            <div className="w-8 h-8 border-3 border-stone-200 border-t-[#1a73e8] rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold text-[#202124]">
              {t("google_signing_in")}
            </p>
            <p className="text-xs text-[#5f6368] mt-1">
              {role === "buyer" ? "ONDC Buyer Sandbox" : "ONDC Artisan MSN"}
            </p>
          </div>
        )}

        {/* ── Successful Authentication State ── */}
        {authStatus === "success" && (
          <div className="py-8 flex flex-col items-center justify-center text-center animate-scale-in">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-lg font-bold mb-2 shadow-xs">
              ✓
            </div>
            <p className="text-sm font-bold text-emerald-800">
              {t("google_signed_in_success")}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              {role === "buyer" ? "🛍️ Marketplace" : "🏺 Artisan Studio"}
            </p>
          </div>
        )}

        {/* ── Footer Actions ── */}
        {authStatus === "idle" && (
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="text-xs font-medium text-[#1a73e8] hover:bg-[#f1f3f4] px-3 py-1.5 rounded-lg transition cursor-pointer touch-press"
            >
              {t("google_cancel")}
            </button>

            {/* Prototype Transparency Disclaimer */}
            <span className="text-[9.5px] text-stone-400 text-right leading-tight max-w-[65%]">
              {t("google_prototype_disclaimer")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

