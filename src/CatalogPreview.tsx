import { useEffect, useState } from "react";
import { GoogleGenAI } from "@google/genai";
import QRCode from "qrcode";
import ProtectedImage from "./ProtectedImage";


interface CatalogPreviewProps {
  photoUrl: string | null;
  voiceText: string;
  onBack?: () => void;
  onCheckout?: () => void;
}

interface Listing {
  title: string;
  category: string;
  description: string;
  price: number;
}

export default function CatalogPreview({
  photoUrl,
  voiceText,
  onBack,
  onCheckout,
}: CatalogPreviewProps) {
  const [activeTab, setActiveTab] = useState<"hindi" | "english">("hindi");
  const [published, setPublished] = useState(false);
  const [showProtection, setShowProtection] = useState(false);

  const [listing, setListing] = useState<Listing>({
  title: "Generating...",
  category: "Generating...",
  description: "AI is creating your product description...",
  price: 0,
});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const generateListing = async () => {
    if (!photoUrl && !voiceText.trim()) {
      setAiError("Please add a photo or voice description first.");
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      setAiError(
        "Gemini API key is missing. Add VITE_GEMINI_API_KEY to your .env file."
      );
      return;
    }

    setAiLoading(true);
    setAiError("");

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
      console.log("Gemini key loaded:", !!apiKey);
console.log("Gemini key prefix:", apiKey?.slice(0, 4));
console.log("Gemini key length:", apiKey?.length);

if (!apiKey) {
  setAiError(
    "Gemini API key is missing. Add VITE_GEMINI_API_KEY to your .env file."
  );
  return;
}

const ai = new GoogleGenAI({
  apiKey,
});
    

      const parts: Array<{
        text?: string;
        inlineData?: {
          data: string;
          mimeType: string;
        };
      }> = [
        {
          text: `
You are an AI assistant helping an Indian artisan create an online product listing.

Seller's voice description:
${voiceText || "No voice description was provided."}

Create a listing based on the photo and the seller's description.

Return ONLY valid JSON in exactly this format:

{
  "title": "short product title",
  "category": "product category",
  "description": "clear attractive product description",
  "price": 0
}

Rules:
- "title" must be a clear, short name for the actual product.
- "category" must describe the product type, such as Pottery, Textiles, Jewelry, Home Decor, Food, Clothing, Bags, etc.
- "description" should be attractive but factual.
- "price" must be a reasonable selling price in Indian Rupees.
- Do not include ₹ in the price number.
- Never invent a price if the seller clearly provides one.
- If the seller gives a specific price, use that exact price.
- Do not add markdown.
- Do not add explanations.
- Return valid JSON only.
          `.trim(),
        },
      ];

      /*
       * Add the uploaded product image to the Gemini request.
       */
      if (photoUrl) {
        const imageResponse = await fetch(photoUrl);

        if (!imageResponse.ok) {
          throw new Error("Could not load the product image.");
        }

        const imageBlob = await imageResponse.blob();

        const base64Image = await new Promise<string>(
          (resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = () => {
              const result = reader.result;

              if (typeof result !== "string") {
                reject(new Error("Could not convert image to base64."));
                return;
              }

              const base64 = result.split(",")[1];

              if (!base64) {
                reject(new Error("Invalid image data."));
                return;
              }

              resolve(base64);
            };

            reader.onerror = () => {
              reject(new Error("Could not read image."));
            };

            reader.readAsDataURL(imageBlob);
          }
        );

        parts.push({
          inlineData: {
            data: base64Image,
            mimeType: imageBlob.type || "image/jpeg",
          },
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          {
            role: "user",
            parts,
          },
        ],
      });

      const text = response.text || "";

      if (!text.trim()) {
        throw new Error("Gemini returned an empty response.");
      }

      /*
       * Remove markdown code fences if Gemini adds them.
       */
      const cleanText = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      let result: Partial<Listing>;

      try {
        result = JSON.parse(cleanText);
      } catch {
        console.error("Invalid Gemini JSON:", cleanText);
        throw new Error("Gemini returned invalid JSON.");
      }

      /*
       * Validate the generated listing.
       */
      const title =
        typeof result.title === "string" && result.title.trim()
          ? result.title.trim()
          : "Handcrafted Product";

      const category =
        typeof result.category === "string" && result.category.trim()
          ? result.category.trim()
          : "Handmade";

      const description =
        typeof result.description === "string" &&
        result.description.trim()
          ? result.description.trim()
          : "A beautiful handmade product created by an Indian artisan.";

      const price = Number(result.price);

      const finalPrice = Number.isFinite(price) && price >= 0 ? price : 0;

      const generatedListing: Listing = {
        title,
        category,
        description,
        price: finalPrice,
      };

      setListing(generatedListing);

      /*
       * Save the product only once.
       */
      const existingProductsRaw = localStorage.getItem("artisanProducts");

      let existingProducts: Array<{
        id: string;
        title: string;
        category: string;
        price: number;
      }> = [];

      try {
        existingProducts = existingProductsRaw
          ? JSON.parse(existingProductsRaw)
          : [];
      } catch {
        existingProducts = [];
      }

      const newProduct = {
        id: crypto.randomUUID(),
        title: generatedListing.title,
        category: generatedListing.category,
        price: generatedListing.price,
      };

      existingProducts.push(newProduct);

      localStorage.setItem(
        "artisanProducts",
        JSON.stringify(existingProducts)
      );

      window.dispatchEvent(new Event("artisanProductsUpdated"));
    } catch (error) {
      console.error("AI generation error:", error);

      setAiError(
        error instanceof Error
          ? error.message
          : "AI could not create the listing. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  /*
   * Generate the listing when the component loads.
   */
  useEffect(() => {
    generateListing();
    // We intentionally run this once when CatalogPreview opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePublish = () => {
    setPublished(true);

    setTimeout(() => {
      onCheckout?.();
    }, 600);
  };
  const createAuthenticityImage = async () => {
  if (!photoUrl) {
    setAiError("Please upload a product image first.");
    return;
  }

  try {
    const image = new Image();

    image.crossOrigin = "anonymous";

    image.src = photoUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("Could not load product image."));
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas is not supported.");
    }

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Draw original artisan photo
    ctx.drawImage(image, 0, 0);

    // Generate unique authenticity ID
    const authenticityId =
      "ART-" +
      crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();

    // Data that the QR contains
    const qrData = JSON.stringify({
      type: "ARTISAN_AUTHENTICITY",
      id: authenticityId,
      product: listing.title,
      category: listing.category,
      createdAt: new Date().toISOString(),
    });

    // Generate QR
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 120,
      margin: 1,
      errorCorrectionLevel: "H",
    });

    const qrImage = new Image();

    qrImage.src = qrDataUrl;

    await new Promise<void>((resolve, reject) => {
      qrImage.onload = () => resolve();
      qrImage.onerror = () =>
        reject(new Error("Could not generate QR code."));
    });

    /*
     * Put the QR in the bottom-right corner.
     *
     * It is intentionally small and blended into the image,
     * so it does not visibly dominate the artisan's photo.
     */
    const qrSize = Math.max(
      80,
      Math.round(Math.min(canvas.width, canvas.height) * 0.12)
    );

    const padding = Math.round(qrSize * 0.15);

    ctx.globalAlpha = 0.22;

    ctx.drawImage(
      qrImage,
      canvas.width - qrSize - padding,
      canvas.height - qrSize - padding,
      qrSize,
      qrSize
    );

    ctx.globalAlpha = 1;

    // Save authenticity ID locally
    const existing =
      JSON.parse(
        localStorage.getItem("artisanAuthenticity") || "[]"
      );

    existing.push({
      id: authenticityId,
      product: listing.title,
      category: listing.category,
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem(
      "artisanAuthenticity",
      JSON.stringify(existing)
    );

    // Replace displayed image with protected image
    const protectedImage = canvas.toDataURL("image/jpeg", 0.92);

    console.log("Authenticity ID:", authenticityId);
    console.log("Protected image created.");

    return protectedImage;
  } catch (error) {
    console.error(error);

    setAiError(
      error instanceof Error
        ? error.message
        : "Could not create authenticity QR."
    );

    return null;
  }
};

  return (
    <div
      className="size-full flex items-center justify-center"
      style={{
        background: "#F5EFE7",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Phone shell */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: "min(390px, 100vw)",
          height: "min(844px, 100vh)",
          background: "#FFFBF7",
          borderRadius: "clamp(0px, 2vw, 28px)",
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        {/* Status bar */}
        <div
          className="flex items-center justify-between px-6 pt-3 pb-1 flex-shrink-0"
          style={{ background: "#6B3A2A" }}
        >
          <span className="text-xs font-medium text-white/90">9:41</span>

          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
            >
              <rect
                x="0"
                y="3"
                width="3"
                height="9"
                rx="1"
                fill="white"
                fillOpacity="0.4"
              />
              <rect
                x="4.5"
                y="2"
                width="3"
                height="10"
                rx="1"
                fill="white"
                fillOpacity="0.6"
              />
              <rect
                x="9"
                y="0"
                width="3"
                height="12"
                rx="1"
                fill="white"
                fillOpacity="0.9"
              />
              <rect
                x="13.5"
                y="0"
                width="2.5"
                height="12"
                rx="1"
                fill="white"
              />
            </svg>

            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
            >
              <path
                d="M8 2.5C5.5 2.5 3.2 3.5 1.5 5.2L0 3.7C2.1 1.4 5 0 8 0s5.9 1.4 8 3.7l-1.5 1.5C12.8 3.5 10.5 2.5 8 2.5z"
                fill="white"
              />
              <path
                d="M8 6C6.3 6 4.8 6.7 3.7 7.8L2.2 6.3C3.7 4.9 5.7 4 8 4s4.3.9 5.8 2.3L12.3 7.8C11.2 6.7 9.7 6 8 6z"
                fill="white"
                fillOpacity="0.8"
              />
              <circle cx="8" cy="10.5" r="1.5" fill="white" />
            </svg>

            <svg
              width="26"
              height="13"
              viewBox="0 0 26 13"
              fill="none"
            >
              <rect
                x="0.5"
                y="0.5"
                width="22"
                height="12"
                rx="3.5"
                stroke="white"
                strokeOpacity="0.5"
              />
              <rect
                x="2"
                y="2"
                width="16"
                height="9"
                rx="2"
                fill="white"
              />
              <path
                d="M24 4.5v4a2 2 0 000-4z"
                fill="white"
                fillOpacity="0.5"
              />
            </svg>
          </div>
        </div>

        {/* Top App Bar */}
        <div
          className="flex items-center px-4 py-3 gap-3 flex-shrink-0"
          style={{ background: "#6B3A2A" }}
        >
          <button
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.12)" }}
            onClick={onBack}
            aria-label="Go back"
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

          <div className="flex-1">
            <h1
              className="text-lg font-bold text-white tracking-wide"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              Preview Listing
            </h1>

            <p className="text-xs text-white/60 -mt-0.5">
              AI-generated catalog
            </p>
          </div>

          <button
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.12)" }}
            aria-label="Profile"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="8"
                r="3"
                stroke="white"
                strokeWidth="2"
              />
              <path
                d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: "none",
            paddingBottom: 100,
          }}
        >
          {/* Product Image */}
          <div
            className="mx-5 mt-5 rounded-3xl overflow-hidden relative"
            style={{
              height: 240,
              background: "#F0EBE3",
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={listing.title || "Product"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center px-6">
                  <div
                    className="mx-auto mb-3 w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "#E8D9CC" }}
                  >
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="16"
                        rx="2"
                        stroke="#6B3A2A"
                        strokeWidth="1.8"
                      />
                      <circle
                        cx="8"
                        cy="9"
                        r="1.5"
                        fill="#6B3A2A"
                      />
                      <path
                        d="M4 17l5-5 3 3 2-2 6 6"
                        stroke="#6B3A2A"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <p
                    className="text-sm font-medium"
                    style={{ color: "#6B3A2A" }}
                  >
                    Product image
                  </p>
                </div>
              </div>
            )}
          
    <button
  type="button"
  onClick={() => setShowProtection(true)}
  className="..."
>
  🔐 Protect Artisan Authenticity
</button>
{photoUrl && (
  <ProtectedImage
    imageUrl={photoUrl}
    onComplete={(result) => {
      console.log("Authenticity ID:", result.authenticityId);
      console.log("Verification URL:", result.verificationUrl);
      setShowProtection(false);
    }}
  />
)}

            {/* AI generated tag */}
            <div
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: "rgba(255,255,255,0.92)",
                color: "#6B3A2A",
                backdropFilter: "blur(8px)",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="#C4886B"
              >
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
              </svg>
              AI Enhanced
            </div>

            {/* Image counter dots */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: i === 0 ? 20 : 6,
                    height: 6,
                    background:
                      i === 0
                        ? "#6B3A2A"
                        : "rgba(255,255,255,0.7)",
                    transition: "width 0.2s",
                  }}
                />
              ))}
            </div>
          </div>
          {/* Authenticity Protection */}
<div className="mx-5 mt-3">
  <button
    type="button"
    onClick={async () => {
      const protectedImage = await createAuthenticityImage();

      if (protectedImage) {
        console.log("Protected artisan image:", protectedImage);
      }
    }}
    disabled={!photoUrl}
    className="w-full rounded-2xl py-3 font-semibold text-sm"
    style={{
      background: "#6B3A2A",
      color: "white",
      opacity: photoUrl ? 1 : 0.5,
    }}
  >
    🔐 Protect Artisan Authenticity
  </button>
</div>

          {/* AI Status */}
          <div className="mx-5 mt-3">
            {aiLoading && (
              <p
                className="text-sm"
                style={{ color: "#9C6644" }}
              >
                ✨ AI is creating your listing...
              </p>
            )}

            {aiError && (
              <div
                className="rounded-xl px-3 py-2"
                style={{
                  background: "rgba(220,38,38,0.08)",
                }}
              >
                <p
                  className="text-sm"
                  style={{ color: "#DC2626" }}
                >
                  {aiError}
                </p>

                <button
                  type="button"
                  onClick={generateListing}
                  className="mt-2 text-sm font-semibold underline"
                  style={{ color: "#991B1B" }}
                >
                  Try again
                </button>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="mx-5 mt-4 space-y-3">
            {/* ONDC Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide"
                style={{
                  background: "rgba(124,58,237,0.1)",
                  color: "#7C3AED",
                  border:
                    "1.5px solid rgba(124,58,237,0.25)",
                }}
              >
                ✨ ONDC Ready
              </span>

              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "rgba(22,163,74,0.1)",
                  color: "#16A34A",
                  border:
                    "1.5px solid rgba(22,163,74,0.25)",
                }}
              >
                ● Live Preview
              </span>
            </div>

            {/* Title */}
            <div>
              <h2
                className="text-2xl font-bold leading-tight"
                style={{
                  color: "#3D1F0F",
                  fontFamily: "'Noto Serif', serif",
                }}
              >
                {listing.title}
              </h2>

              <p
                className="text-sm font-medium mt-0.5"
                style={{ color: "#9C6644" }}
              >
                {listing.category}
              </p>
            </div>

            {/* Seller info */}
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "#6B3A2A" }}
              >
                R
              </div>

              <span
                className="text-xs"
                style={{ color: "#9C6644" }}
              >
                Radha Devi · Rajasthan Artisan
              </span>

              <div className="flex items-center gap-0.5 ml-auto">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill={
                      s <= 4 ? "#F59E0B" : "#E5E7EB"
                    }
                  >
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                  </svg>
                ))}

                <span
                  className="text-xs ml-1"
                  style={{ color: "#9C6644" }}
                >
                  4.0
                </span>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: "rgba(196,136,107,0.2)",
              }}
            />

            {/* Pricing */}
            <div
              className="rounded-2xl p-4 flex items-center justify-between gap-3"
              style={{
                background:
                  "linear-gradient(135deg, #FFF8F3 0%, #FEF0E4 100%)",
                border:
                  "1.5px solid rgba(196,136,107,0.2)",
              }}
            >
              <div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-3xl font-bold"
                    style={{
                      color: "#3D1F0F",
                      fontFamily: "'Noto Serif', serif",
                    }}
                  >
                    ₹{listing.price.toLocaleString("en-IN")}
                  </span>

                  <span
                    className="text-base font-medium line-through"
                    style={{ color: "#B07050" }}
                  >
                    ₹250
                  </span>
                </div>

                <p
                  className="text-xs mt-0.5"
                  style={{ color: "#9C6644" }}
                >
                  Incl. of all taxes · Free delivery
                </p>
              </div>

              <div
                className="flex flex-col items-center justify-center rounded-2xl px-4 py-2.5 text-center"
                style={{
                  background: "rgba(22,163,74,0.1)",
                  border:
                    "1.5px solid rgba(22,163,74,0.25)",
                }}
              >
                <span
                  className="text-lg font-bold"
                  style={{ color: "#16A34A" }}
                >
                  40%
                </span>

                <span
                  className="text-xs font-medium leading-tight"
                  style={{ color: "#16A34A" }}
                >
                  Profit for
                  <br />
                  Artisan
                </span>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: "rgba(196,136,107,0.2)",
              }}
            />

            {/* Tabs */}
            <div>
              <div
                className="flex rounded-xl overflow-hidden"
                style={{
                  background: "rgba(196,136,107,0.1)",
                  padding: 3,
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab("hindi")}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{
                    background:
                      activeTab === "hindi"
                        ? "#6B3A2A"
                        : "transparent",
                    color:
                      activeTab === "hindi"
                        ? "white"
                        : "#9C6644",
                    boxShadow:
                      activeTab === "hindi"
                        ? "0 2px 8px rgba(107,58,42,0.25)"
                        : "none",
                  }}
                >
                  हिंदी विवरण
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("english")}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{
                    background:
                      activeTab === "english"
                        ? "#6B3A2A"
                        : "transparent",
                    color:
                      activeTab === "english"
                        ? "white"
                        : "#9C6644",
                    boxShadow:
                      activeTab === "english"
                        ? "0 2px 8px rgba(107,58,42,0.25)"
                        : "none",
                  }}
                >
                  English Copy
                </button>
              </div>

              {/* Tab content */}
              <div
                className="mt-3 rounded-2xl p-4 text-sm leading-relaxed"
                style={{
                  background: "#FFF8F3",
                  border:
                    "1.5px solid rgba(196,136,107,0.15)",
                  color: "#5A2E12",
                }}
              >
                {activeTab === "hindi" ? (
                  <>
                    <p
                      style={{
                        fontFamily: "'Noto Serif', serif",
                        lineHeight: 1.8,
                      }}
                    >
                      {listing.description}
                    </p>

                    <ul className="mt-3 space-y-1.5">
                      {[
                        "सामग्री: प्राकृतिक मिट्टी",
                        "हस्तनिर्मित उत्पाद",
                        "देखभाल: सूखे कपड़े से साफ करें",
                      ].map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2"
                        >
                          <span style={{ color: "#C4886B" }}>
                            •
                          </span>

                          <span
                            style={{
                              fontFamily:
                                "'Noto Serif', serif",
                            }}
                          >
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <p style={{ lineHeight: 1.8 }}>
                      {listing.description}
                    </p>

                    <ul className="mt-3 space-y-1.5">
                      {[
                        "Material: Natural clay",
                        "Handcrafted product",
                        "Care: Wipe with a dry cloth",
                      ].map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2"
                        >
                          <span style={{ color: "#C4886B" }}>
                            •
                          </span>

                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* AI Tags */}
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "#9C6644" }}
              >
                AI-Generated Tags
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  "मिट्टी के बर्तन",
                  "Pottery",
                  "Handmade",
                  "Eco-friendly",
                  "Rajasthan",
                  "Home Décor",
                  "Gift",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background:
                        "rgba(196,136,107,0.12)",
                      color: "#6B3A2A",
                      border:
                        "1px solid rgba(196,136,107,0.3)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div
          className="absolute bottom-0 left-0 right-0 flex-shrink-0 px-5 pt-3 pb-8"
          style={{
            background:
              "linear-gradient(to top, #FFFBF7 70%, transparent)",
            backdropFilter: "blur(2px)",
          }}
        >
          {published ? (
            <div
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold"
              style={{
                background: "rgba(22,163,74,0.12)",
                color: "#16A34A",
                border:
                  "1.5px solid rgba(22,163,74,0.3)",
              }}
            >
              <svg
                width="20"
                height="20"
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

              Published to ONDC!
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-sm transition-all duration-200 active:scale-95"
                style={{
                  flex: "0 0 auto",
                  width: 110,
                  background: "transparent",
                  color: "#6B3A2A",
                  border: "2px solid #6B3A2A",
                }}
                onClick={() => {
                  console.log("Edit listing");
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                    stroke="#6B3A2A"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                    stroke="#6B3A2A"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>

                Edit
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={aiLoading || !!aiError}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-sm transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
                  color: "white",
                  boxShadow:
                    "0 8px 28px rgba(107,58,42,0.38)",
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M22 2L11 13"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M22 2L15 22l-4-9-9-4 20-7z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                Approve &amp; Publish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}