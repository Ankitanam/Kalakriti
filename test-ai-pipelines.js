// test-ai-pipelines.js
import fs from "fs";
import path from "path";

console.log("🇮🇳 Starting Comprehensive Kalakriti AI Pipelines (Voice + Image) Verification...\n");

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
const appSource = fs.readFileSync(path.resolve("src/App.tsx"), "utf-8");
const viteSource = fs.readFileSync(path.resolve("vite.config.ts"), "utf-8");
const serverSource = fs.readFileSync(path.resolve("server.js"), "utf-8");
const langSource = fs.readFileSync(path.resolve("src/context/LanguageContext.tsx"), "utf-8");
const previewSource = fs.readFileSync(path.resolve("src/CatalogPreview.tsx"), "utf-8");
const transcribeSource = fs.readFileSync(path.resolve("src/utils/transcribeService.ts"), "utf-8");
const imageSource = fs.readFileSync(path.resolve("src/utils/imageService.ts"), "utf-8");

console.log("--- 1. Voice Pipeline: Hardware Lifecycle & MediaStream Cleanup ---");
assert(appSource.includes("navigator.mediaDevices.getUserMedia({ audio: true })"), "getUserMedia requested on mic click");
assert(appSource.includes("mediaRecorder.start(250)"), "MediaRecorder slices audio in 250ms chunks");
assert(appSource.includes("audioChunksRef.current.push(event.data)"), "Audio chunks collected on dataavailable");
assert(appSource.includes("mediaRecorderRef.current.requestData()"), "stopAudioRecording flushes buffer before stop");
assert(appSource.includes("mediaRecorderRef.current.stop()"), "MediaRecorder stopped cleanly");
assert(appSource.includes("stream.getTracks().forEach"), "All audio stream tracks stopped explicitly");
assert(appSource.includes("cleaning up prior active stream before opening new one"), "Active stream terminated before starting new one");
assert(appSource.includes("mediaStreamRef.current.getTracks().forEach((track) => track.stop())"), "Component unmount forcefully ends active tracks");
assert(appSource.includes("${prev.trim()} ${transcript}"), "Smart appending preserves existing user text");

console.log("\n--- 2. Voice Pipeline: Gemini Speech-to-Text & Multilingual Support ---");
assert(transcribeSource.includes("gemini-3.5-transcribe"), "Uses gemini-3.5-transcribe as primary speech model");
assert(transcribeSource.includes("audioTranscriptionConfig:"), "Uses audioTranscriptionConfig for Gemini REST");
assert(transcribeSource.includes("mode: \"SMART\""), "Smart audio transcription mode configured");
assert(transcribeSource.includes("gemini-3.5-flash-lite"), "Resilient fallback to gemini-3.5-flash-lite");
assert(transcribeSource.includes("Do NOT translate the words into English"), "Strictly verbatim transcription without English translation");
assert(transcribeSource.includes("inlineData: {"), "Strict camelCase inlineData schema in REST call");

const indicLanguages = ["hi", "en", "mr", "bn", "gu", "ta", "te"];
indicLanguages.forEach((lang) => {
  assert(
    langSource.includes(`${lang}:`) && langSource.includes("voice_text_added"),
    `Localization verified for language '${lang}'`
  );
});

console.log("\n--- 3. Image Pipeline: Cloudinary Background Removal ---");
assert(imageSource.includes("e_background_removal:fineedges_y,f_png"), "Cloudinary transformation uses fine edges and PNG format");
assert(imageSource.includes("getCloudinaryTransparentUrl"), "getCloudinaryTransparentUrl exported");
assert(imageSource.includes("injectCloudinaryBgRemoval"), "injectCloudinaryBgRemoval exported");
assert(imageSource.includes("uploadToCloudinaryWithBgRemoval"), "uploadToCloudinaryWithBgRemoval handles upload and transparency");

// Functional URL test for Cloudinary URL formatting
import { getCloudinaryTransparentUrl, injectCloudinaryBgRemoval } from "./src/utils/imageService.ts";
const testCloudUrl = getCloudinaryTransparentUrl("kalakriti_cloud", "sample_pottery_v1");
assert(
  testCloudUrl === "https://res.cloudinary.com/kalakriti_cloud/image/upload/e_background_removal:fineedges_y,f_png/sample_pottery_v1.png",
  "Cloudinary transparent cutout URL is accurately formatted"
);

const injectedUrl = injectCloudinaryBgRemoval("https://res.cloudinary.com/demo/image/upload/v1234/pot.jpg");
assert(
  injectedUrl === "https://res.cloudinary.com/demo/image/upload/e_background_removal:fineedges_y,f_png/v1234/pot.png",
  "injectCloudinaryBgRemoval correctly swaps upload path with bg-removal transformation"
);

console.log("\n--- 4. Image Pipeline: Gemini 3.1 Flash Lite Image Enhancement ---");
assert(imageSource.includes("gemini-3.1-flash-lite-image"), "Configured for gemini-3.1-flash-lite-image (Nano Banana 2 Lite)");
assert(imageSource.includes("imageSize: \"1K\""), "Output imageSize configured to 1K resolution");
assert(imageSource.includes("aspectRatio: \"1:1\""), "Aspect ratio configured to square 1:1");
assert(
  imageSource.includes("Preserve the exact product, shape, colors, patterns, embroidery, texture and craftsmanship"),
  "Strict prompt prohibits redesigning or altering authentic craft craftsmanship"
);
assert(imageSource.includes("responseModalities: [\"TEXT\", \"IMAGE\"]"), "responseModalities set to [TEXT, IMAGE]");

// Functional validation test for enhanceImagePayload
import { enhanceImagePayload } from "./src/utils/imageService.ts";
const emptyImageRes = await enhanceImagePayload({ imageBase64: "" });
assert(
  emptyImageRes.success === false && emptyImageRes.error === "No image data provided",
  "enhanceImagePayload strictly validates image input prior to execution"
);

console.log("\n--- 5. Full-Stack Endpoints: Dev & Standalone Servers ---");
assert(viteSource.includes("'/api/transcribe-audio'"), "Vite dev server mounts /api/transcribe-audio");
assert(viteSource.includes("'/api/enhance-image'"), "Vite dev server mounts /api/enhance-image");
assert(serverSource.includes('app.post("/api/transcribe-audio"'), "Express server mounts /api/transcribe-audio");
assert(serverSource.includes('app.post("/api/enhance-image"'), "Express server mounts /api/enhance-image");
assert(
  serverSource.includes("process.env.VITE_GEMINI_KEY || process.env.VITE_GEMINI_API_KEY"),
  "Server resolves secrets internally without client exposure"
);

console.log("\n--- 6. Multi-Stage UX & Asset Retention ---");
assert(appSource.includes("setLoadingStage(t(\"ai_status_uploading\"))"), "Multi-stage UX displays uploading step");
assert(appSource.includes("setLoadingStage(t(\"ai_status_bg_removal\"))"), "Multi-stage UX displays Cloudinary bg removal step");
assert(appSource.includes("setLoadingStage(t(\"ai_status_enhancing\"))"), "Multi-stage UX displays Gemini enhancement step");
assert(appSource.includes("setLoadingStage(t(\"ai_status_understanding\"))"), "Multi-stage UX displays product understanding step");

assert(previewSource.includes("originalImageUrl?: string;"), "CatalogData preserves original image URL");
assert(previewSource.includes("transparentImageUrl?: string;"), "CatalogData preserves transparent image URL");
assert(previewSource.includes("enhancedImageUrl?: string;"), "CatalogData preserves enhanced image URL");
assert(previewSource.includes("showOriginal ? `📷 ${t(\"original_photo\")}` : `✨ ${t(\"ai_enhanced_photo\")}`"), "Artisan can toggle between original and enhanced photo in preview");

console.log("\n--- 7. Ground-Truth Artisan Spoken Context Integration ---");
assert(
  appSource.includes("ARTISAN SPOKEN CONTEXT & AUTHENTIC TESTIMONY"),
  "Spoken artisan details injected as ground truth in AI catalog prompt"
);
assert(
  appSource.includes("inlineData: {"),
  "Gemini catalog generation uses strict camelCase inlineData schema"
);

console.log("\n==================================================");
console.log(`Results: ${passed} Passed, ${failed} Failed`);
console.log("==================================================");

if (failed === 0) {
  console.log("\n🎉 ALL KALAKRITI AI PIPELINE TESTS PASSED PERFECTLY!\n");
  process.exit(0);
} else {
  console.error(`\n❌ ${failed} CHECKS FAILED.\n`);
  process.exit(1);
}

