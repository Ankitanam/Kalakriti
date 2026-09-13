// src/utils/imageService.ts
/**
 * Kalakriti Artisan Product Image Processing Service
 * - Cloudinary transparent background removal (e_background_removal:fineedges_y,f_png)
 * - Gemini 3.1 Flash Lite Image (Nano Banana 2 Lite, 1K output) enhancement
 * - Preserves both original artisan photo and enhanced assets
 */

export interface CloudinaryUploadResult {
  success: boolean;
  originalUrl: string;
  transparentUrl: string;
  publicId?: string;
  format?: string;
  error?: string;
}

export interface EnhanceImageParams {
  imageBase64?: string;
  mimeType?: string;
  geminiKey?: string;
  imageUrl?: string;
}

export interface EnhanceImageResult {
  success: boolean;
  enhancedBase64?: string;
  mimeType?: string;
  enhancedUrl?: string;
  modelUsed?: string;
  error?: string;
}

export interface ProcessProductImageResult {
  originalUrl: string;
  transparentUrl: string;
  enhancedUrl: string;
  finalUrl: string;
  stagesCompleted: string[];
}

/**
 * Generates transparent PNG URL using Cloudinary e_background_removal
 */
export function getCloudinaryTransparentUrl(cloudName: string, publicId: string): string {
  const cleanId = publicId.replace(/\.[a-zA-Z0-9]+$/, "");
  return `https://res.cloudinary.com/${cloudName}/image/upload/e_background_removal:fineedges_y,f_png/${cleanId}.png`;
}

/**
 * Injects background removal transformation into an existing Cloudinary secure_url
 */
export function injectCloudinaryBgRemoval(secureUrl: string): string {
  if (!secureUrl || !secureUrl.includes("/image/upload/")) {
    return secureUrl;
  }
  const parts = secureUrl.split("/image/upload/");
  const transformedPath = parts[1].replace(/\.[a-zA-Z0-9]+$/, ".png");
  return `${parts[0]}/image/upload/e_background_removal:fineedges_y,f_png/${transformedPath}`;
}

/**
 * Uploads an image to Cloudinary and generates both original and transparent URLs
 */
export async function uploadToCloudinaryWithBgRemoval(
  file: File | Blob | string,
  options?: { cloudName?: string; uploadPreset?: string }
): Promise<CloudinaryUploadResult> {
  const cloudName =
    options?.cloudName ||
    (typeof process !== "undefined" ? process.env?.VITE_CLOUDINARY_CLOUD_NAME : "") ||
    "";
  const uploadPreset =
    options?.uploadPreset ||
    (typeof process !== "undefined" ? process.env?.VITE_CLOUDINARY_UPLOAD_PRESET : "") ||
    "";

  console.log(`[IMAGE PIPELINE] Uploading to Cloudinary (cloud: ${cloudName || "unspecified"})...`);

  if (!cloudName || !uploadPreset) {
    console.warn("[IMAGE PIPELINE] Cloudinary credentials missing, using original asset fallback");
    return {
      success: false,
      originalUrl: typeof file === "string" ? file : "",
      transparentUrl: typeof file === "string" ? file : "",
      error: "Cloudinary credentials not configured",
    };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[IMAGE PIPELINE] Cloudinary upload failed:", errText);
      return {
        success: false,
        originalUrl: typeof file === "string" ? file : "",
        transparentUrl: typeof file === "string" ? file : "",
        error: `Cloudinary error: ${res.statusText}`,
      };
    }

    const data = await res.json();
    const originalUrl = data.secure_url || "";
    const publicId = data.public_id || "";
    const transparentUrl = getCloudinaryTransparentUrl(cloudName, publicId);

    console.log("[IMAGE PIPELINE] Cloudinary upload successful:");
    console.log(`  - Original URL: ${originalUrl}`);
    console.log(`  - Transparent PNG URL: ${transparentUrl}`);

    return {
      success: true,
      originalUrl,
      transparentUrl,
      publicId,
      format: data.format,
    };
  } catch (err: any) {
    console.error("[IMAGE PIPELINE] Cloudinary upload exception:", err);
    return {
      success: false,
      originalUrl: typeof file === "string" ? file : "",
      transparentUrl: typeof file === "string" ? file : "",
      error: err.message || "Upload exception",
    };
  }
}

/**
 * Enhances an artisan craft image using Gemini 3.1 Flash Lite Image (Nano Banana 2 Lite)
 * Strictly preserves product geometry, colors, patterns, and craftsmanship while optimizing lighting and presentation.
 */
export async function enhanceImagePayload(
  params: EnhanceImageParams
): Promise<EnhanceImageResult> {
  const { imageBase64, mimeType, geminiKey } = params;

  console.log("[IMAGE API] Request received for Gemini image enhancement...");

  if (!imageBase64 || typeof imageBase64 !== "string" || imageBase64.trim().length === 0) {
    console.error("[IMAGE API] missing or empty imageBase64 payload");
    return { success: false, error: "No image data provided" };
  }

  const resolvedKey =
    geminiKey ||
    (typeof process !== "undefined"
      ? process.env?.VITE_GEMINI_KEY || process.env?.VITE_GEMINI_API_KEY
      : "");

  if (!resolvedKey) {
    console.error("[IMAGE API] missing Gemini API key on server");
    return { success: false, error: "Gemini API key not configured on server" };
  }

  const cleanMimeType = (mimeType || "image/jpeg").split(";")[0].trim();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent?key=${resolvedKey}`;

  const prompt =
    "Enhance this artisan product photograph for an e-commerce marketplace. " +
    "Preserve the exact product, shape, colors, patterns, embroidery, texture and craftsmanship. " +
    "Improve lighting, exposure, clarity and presentation. " +
    "Do not invent, remove, recolor, reshape or redesign the product. " +
    "Create a clean professional marketplace presentation.";

  try {
    console.log("[IMAGE API] Invoking gemini-3.1-flash-lite-image (Nano Banana 2 Lite, 1K output)...");
    const reqBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: cleanMimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K",
        },
      },
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn("[IMAGE API] Gemini image model returned error status:", res.status, errText.substring(0, 200));
      return {
        success: false,
        error: `Gemini image model error: ${res.status}`,
      };
    }

    const data = await res.json();
    const candidateParts = data.candidates?.[0]?.content?.parts || [];

    for (const part of candidateParts) {
      if (part.inlineData && part.inlineData.data) {
        const outMime = part.inlineData.mimeType || "image/png";
        const enhancedBase64 = part.inlineData.data;
        const enhancedUrl = `data:${outMime};base64,${enhancedBase64}`;
        console.log("[IMAGE API] Successfully generated enhanced 1K image from gemini-3.1-flash-lite-image");
        return {
          success: true,
          enhancedBase64,
          mimeType: outMime,
          enhancedUrl,
          modelUsed: "gemini-3.1-flash-lite-image",
        };
      }
    }

    console.warn("[IMAGE API] Gemini response did not contain image data part");
    return {
      success: false,
      error: "No image generated by model",
    };
  } catch (err: any) {
    console.error("[IMAGE API] Gemini image generation exception:", err);
    return {
      success: false,
      error: err.message || "Image generation exception",
    };
  }
}

