// src/components/ConfirmationModal.tsx
import React from "react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  cancelText: string;
  confirmText: string;
  icon?: string;
  confirmVariant?: "danger" | "primary";
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  cancelText,
  confirmText,
  icon = "🚪",
  confirmVariant = "danger",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-5 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFDF9] w-full max-w-xs rounded-3xl p-5 space-y-4 border-2 border-[#C4886B] shadow-2xl text-center animate-slide-up"
        style={{ fontFamily: "'Poppins', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-2xl flex items-center justify-center mx-auto shadow-xs">
          {icon}
        </div>

        <div className="space-y-1">
          <h3
            className="text-lg font-bold text-[#3D1F0F] leading-snug"
            style={{ fontFamily: "'Noto Serif', serif" }}
          >
            {title}
          </h3>
          <p className="text-xs text-[#8B4513] leading-relaxed">
            {message}
          </p>
        </div>

        <div className="space-y-2 pt-1">
          {/* Primary / Cancel Button ("Stay Here") */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl font-bold text-sm text-white shadow-md active:scale-98 transition cursor-pointer"
            style={{ background: "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)" }}
          >
            {cancelText}
          </button>

          {/* Secondary / Confirm Action ("Yes, leave") */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirm();
            }}
            className={`w-full py-2.5 rounded-2xl font-bold text-xs active:scale-98 transition cursor-pointer ${
              confirmVariant === "danger"
                ? "text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
                : "text-[#6B3A2A] bg-stone-100 hover:bg-stone-200 border border-stone-300"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

