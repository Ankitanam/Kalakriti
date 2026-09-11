import { useState } from "react";
import QRCode from "qrcode";

interface ProtectedImageProps {
  imageUrl: string;
  onComplete?: (result: {
    imageUrl: string;
    authenticityId: string;
    verificationUrl: string;
  }) => void;
}

function generateAuthenticityId() {
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();

  return `ART-${random}`;
}
export default function ProtectedImage({
  imageUrl,
  onComplete,
}: ProtectedImageProps) {
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [authenticityId, setAuthenticityId] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [error, setError] = useState("");

  const protectImage = async () => {
    setProcessing(true);
    setError("");

    try {
      const id = generateAuthenticityId();

      // Change this to your deployed verification URL later.
      const verificationUrl =
        `${window.location.origin}/verify/${id}`;

      // Load uploaded image.
     

      const image = new Image();

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(new Error("Could not load uploaded image."));
        image.src = imageUrl;
      });

      // Create canvas.
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas is not supported.");
      }

      canvas.width = image.width;
      canvas.height = image.height;

      // Draw original image.
      ctx.drawImage(image, 0, 0);

      // Generate QR.
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 180,
        margin: 1,
        errorCorrectionLevel: "H",
      });
      setQrUrl(qrDataUrl);

      const qrImage = new Image();

      await new Promise<void>((resolve, reject) => {
        qrImage.onload = () => resolve();
        qrImage.onerror = () =>
          reject(new Error("Could not generate QR code."));
        qrImage.src = qrDataUrl;
      });

      /*
       * Put the QR in the bottom-right corner.
       *
       * We use a semi-transparent background so it remains
       * scannable while being visually subtle.
       */
      const qrSize = Math.min(
        180,
        Math.floor(canvas.width * 0.22)
      );

      const padding = Math.max(12, Math.floor(canvas.width * 0.02));

      const x = canvas.width - qrSize - padding;
      const y = canvas.height - qrSize - padding;

      // Very subtle background.
      ctx.save();

      ctx.globalAlpha = 0.82;

      ctx.fillStyle = "rgba(255,255,255,0.72)";
      ctx.beginPath();
      ctx.roundRect(
        x - 8,
        y - 8,
        qrSize + 16,
        qrSize + 16,
        12
      );
      ctx.fill();

      ctx.globalAlpha = 0.88;

      ctx.drawImage(
        qrImage,
        x,
        y,
        qrSize,
        qrSize
      );

      ctx.restore();

      // Add tiny authenticity marker.
      ctx.save();

      ctx.globalAlpha = 0.65;
      ctx.fillStyle = "#000000";
      ctx.font = `${Math.max(10, canvas.width * 0.012)}px Arial`;

      ctx.fillText(
        id,
        x,
        y - 14
      );

      ctx.restore();

      // Export protected image.
      const protectedImageUrl = canvas.toDataURL(
        "image/jpeg",
        0.92
      );

      setResultUrl(protectedImageUrl);
      setAuthenticityId(id);

      onComplete?.({
        imageUrl: protectedImageUrl,
        authenticityId: id,
        verificationUrl,
      });

      URL.revokeObjectURL(imageUrl);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not protect the image."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={protectImage}
        disabled={processing}
        className="w-full rounded-2xl py-4 font-semibold text-white disabled:opacity-50"
        style={{
          background:
            "linear-gradient(135deg, #8B4513 0%, #6B3A2A 100%)",
        }}
      >
        {processing
          ? "🔐 Protecting image..."
          : "🔐 Protect Image & Create QR"}
      </button>

      {error && (
        <div
          className="rounded-xl p-3 text-sm"
          style={{
            background: "rgba(220,38,38,0.08)",
            color: "#DC2626",
          }}
        >
          {error}
        </div>
      )}

      {resultUrl && (
        <div className="space-y-3">
          <img
            src={resultUrl}
            alt="Protected artisan product"
            className="w-full rounded-2xl"
          />

          <div
            className="rounded-xl p-4"
            style={{
              background: "#FFF8F3",
              border: "1px solid rgba(196,136,107,0.2)",
            }}
          >
            <p
              className="text-xs font-semibold"
              style={{ color: "#9C6644" }}
            >
              AUTHENTICITY ID
            </p>

            <p
              className="text-lg font-bold mt-1"
              style={{ color: "#3D1F0F" }}
            >
              {authenticityId}
            </p>

            <p
              className="text-xs mt-2"
              style={{ color: "#9C6644" }}
            >
              Scan the QR code to verify this artisan product.
            </p>
          </div>

          <a
            href={resultUrl}
            download={`${authenticityId}-protected.jpg`}
            className="block text-center w-full rounded-2xl py-4 font-semibold"
            style={{
              background: "#F0E1D6",
              color: "#6B3A2A",
            }}
          >
            Save Protected Image
          </a>
          {qrUrl && (
  <div className="space-y-3">
    <button
      type="button"
      onClick={() => {
        window.open(qrUrl, "_blank");
      }}
      className="w-full rounded-2xl py-3 font-semibold"
      style={{
        background: "#F0E1D6",
        color: "#6B3A2A",
      }}
    >
      👁️ View QR
    </button>

    <a
      href={qrUrl}
      download={`${authenticityId}-QR.png`}
      className="block w-full text-center rounded-2xl py-3 font-semibold"
      style={{
        background: "#6B3A2A",
        color: "white",
      }}
    >
      📥 Save QR
    </a>
  </div>
)}
        </div>
      )}
    </div>
  );
}