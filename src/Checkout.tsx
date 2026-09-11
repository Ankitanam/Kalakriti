import React from "react";

interface CheckoutProps {
  onBack?: () => void;
}

export default function Checkout({ onBack }: CheckoutProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "#F5EFE7",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: "min(390px, 100vw)",
          minHeight: "100vh",
          background: "#FFFBF7",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-4"
          style={{ background: "#6B3A2A" }}
        >
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M15 18l-6-6 6-6"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div>
            <h1
              className="text-lg font-bold text-white"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              Publish Product
            </h1>

            <p className="text-xs text-white/60">
              Final step
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          <div
            className="rounded-3xl p-5"
            style={{
              background: "#FFF8F3",
              border: "1.5px solid rgba(196,136,107,0.2)",
            }}
          >
            <div className="text-center">
              <div
                className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(22,163,74,0.12)",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="#16A34A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2
                className="mt-4 text-2xl font-bold"
                style={{
                  color: "#3D1F0F",
                  fontFamily: "'Noto Serif', serif",
                }}
              >
                Your listing is ready!
              </h2>

              <p
                className="mt-2 text-sm"
                style={{ color: "#9C6644" }}
              >
                Review the details below before publishing.
              </p>
            </div>

            {/* Publish status */}
            <div
              className="mt-6 rounded-2xl p-4"
              style={{
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-medium"
                  style={{ color: "#6B3A2A" }}
                >
                  ONDC Listing
                </span>

                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: "rgba(22,163,74,0.12)",
                    color: "#16A34A",
                  }}
                >
                  READY
                </span>
              </div>
            </div>

            {/* Product summary */}
            <div className="mt-5 space-y-4">
              <div>
                <p
                  className="text-xs"
                  style={{ color: "#9C6644" }}
                >
                  Product
                </p>

                <p
                  className="text-base font-semibold"
                  style={{ color: "#3D1F0F" }}
                >
                  Your AI-generated product
                </p>
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{ color: "#9C6644" }}
                >
                  Status
                </p>

                <p
                  className="text-base font-semibold"
                  style={{ color: "#16A34A" }}
                >
                  Ready to publish
                </p>
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={() => {
                alert("Product published successfully!");
              }}
              className="w-full mt-7 rounded-2xl py-4 font-semibold text-sm text-white"
              style={{
                background:
                  "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                boxShadow:
                  "0 8px 28px rgba(107,58,42,0.3)",
              }}
            >
              Confirm & Publish
            </button>

            <p
              className="text-center text-xs mt-3"
              style={{ color: "#9C6644" }}
            >
              Your product will be added to your catalog.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}