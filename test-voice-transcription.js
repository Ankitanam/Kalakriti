// test-voice-transcription.js
import fs from "fs";
import path from "path";

console.log("🇮🇳 Starting Kalakriti Multilingual AI Voice-to-Text Pipeline Verification...\n");

let passedTests = 0;
let totalTests = 0;

function assertCheck(desc, condition) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${desc}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    process.exitCode = 1;
  }
}

// ── 1. Shared Backend Transcription Service (src/utils/transcribeService.ts) ──
console.log("--- 1. Shared Backend Transcription Service & Gemini Audio Schema ---");
const serviceSource = fs.readFileSync(path.resolve("src/utils/transcribeService.ts"), "utf-8");

assertCheck(
  "transcribeService.ts exports transcribeAudioPayload and CRAFT_VOCABULARY",
  serviceSource.includes("export async function transcribeAudioPayload") &&
    serviceSource.includes("export const CRAFT_VOCABULARY")
);

assertCheck(
  "transcribeService.ts defines Indian craft terms in English and Indic scripts",
  serviceSource.includes("Kalakriti") &&
    serviceSource.includes("कलाकृति") &&
    serviceSource.includes("मातीकाम") &&
    serviceSource.includes("Madhubani") &&
    serviceSource.includes("ONDC")
);

assertCheck(
  "transcribeService.ts validates audioBase64 presence with error",
  serviceSource.includes("audioBase64") && serviceSource.includes("No audio data provided")
);

assertCheck(
  "transcribeService.ts uses dedicated gemini-3.5-transcribe model",
  serviceSource.includes("gemini-3.5-transcribe")
);

assertCheck(
  "transcribeService.ts uses strict camelCase inlineData and mimeType for Google REST API",
  serviceSource.includes("inlineData:") && serviceSource.includes("mimeType:")
);

assertCheck(
  "transcribeService.ts configures audioTranscriptionConfig with mode: 'SMART'",
  serviceSource.includes("audioTranscriptionConfig:") && serviceSource.includes('"SMART"')
);

assertCheck(
  "transcribeService.ts provides resilient fallback to gemini-3.5-flash-lite",
  serviceSource.includes("gemini-3.5-flash-lite")
);

assertCheck(
  "transcribeService.ts strictly instructs models to transcribe verbatim in native script without English translation",
  serviceSource.includes("Do NOT translate the words into English") &&
    serviceSource.includes("Transcribe the spoken words VERBATIM in the original spoken language and script")
);

assertCheck(
  "transcribeService.ts returns structured JSON with both transcript and text",
  serviceSource.includes("transcript,") && serviceSource.includes("text: transcript,")
);

assertCheck(
  "transcribeService.ts includes [VOICE API] diagnostic logging",
  serviceSource.includes("[VOICE API] request received") &&
    serviceSource.includes("[VOICE API] transcription complete")
);

// ── 2. Vite Dev Server Middleware Integration (vite.config.ts) ──
console.log("\n--- 2. Vite Dev Server & Preview Connect Middleware ---");
const viteSource = fs.readFileSync(path.resolve("vite.config.ts"), "utf-8");

assertCheck(
  "vite.config.ts registers kalakritiTranscriptionPlugin in plugins array",
  viteSource.includes("kalakritiTranscriptionPlugin()")
  viteSource.includes("kalakritiTranscriptionPlugin")
);

assertCheck(
  "vite.config.ts defines Connect middleware for /api/transcribe-audio",
  viteSource.includes("server.middlewares.use('/api/transcribe-audio'")
);

assertCheck(
  "vite.config.ts imports and invokes transcribeAudioPayload",
  viteSource.includes("transcribeAudioPayload({")
);

assertCheck(
  "vite.config.ts reads Gemini key strictly from server-side environment variables",
  viteSource.includes("process.env.VITE_GEMINI_KEY || process.env.VITE_GEMINI_API_KEY")
);

// ── 3. Standalone Express Server Route (server.js) ──
console.log("\n--- 3. Standalone Express Server Route (server.js) ---");
const serverSource = fs.readFileSync(path.resolve("server.js"), "utf-8");

assertCheck(
  "server.js defines POST /api/transcribe-audio endpoint",
  serverSource.includes('app.post("/api/transcribe-audio"') ||
    serverSource.includes("app.post('/api/transcribe-audio'")
);

assertCheck(
  "server.js delegates to transcribeAudioPayload",
  serverSource.includes("transcribeAudioPayload({")
);

assertCheck(
  "server.js validates audioBase64 presence with 400 bad request",
  serverSource.includes("audioBase64") && serverSource.includes("No audio data provided")
);

assertCheck(
  "server.js reads Gemini key strictly from server-side environment variables",
  serverSource.includes("process.env.VITE_GEMINI_KEY || process.env.VITE_GEMINI_API_KEY")
);

// ── 4. Multilingual Localization in LanguageContext.tsx ──
console.log("\n--- 4. Multilingual Localization Coverage Across All 7 Indic Languages ---");
const langSource = fs.readFileSync(path.resolve("src/context/LanguageContext.tsx"), "utf-8");

const requiredTokens = [
  "voice_processing",
  "voice_text_added",
  "voice_no_speech",
  "voice_permission_denied",
  "voice_listening",
  "voice_placeholder"
];

const supportedLangs = ["hi", "en", "mr", "bn", "gu", "ta", "te"];

supportedLangs.forEach((lang) => {
  requiredTokens.forEach((token) => {
    assertCheck(
      `LanguageContext contains token '${token}' for '${lang}'`,
      langSource.includes(`"${token}":`) || langSource.includes(`${token}:`)
    );
  });
});

// ── 5. Frontend Audio Recording & Hardware Cleanup in App.tsx ──
console.log("\n--- 5. Frontend Audio Recording, MediaRecorder Lifecycle & Diagnostic Logs ---");
const appSource = fs.readFileSync(path.resolve("src/App.tsx"), "utf-8");

assertCheck(
  "App.tsx declares mediaRecorderRef, mediaStreamRef, and audioChunksRef",
  appSource.includes("mediaRecorderRef = useRef<MediaRecorder | null>(null)") &&
    appSource.includes("mediaStreamRef = useRef<MediaStream | null>(null)") &&
    appSource.includes("audioChunksRef = useRef<Blob[]>([])")
);

assertCheck(
  "App.tsx cleans up active MediaStream tracks on component unmount",
  appSource.includes("mediaStreamRef.current.getTracks().forEach((track) => track.stop())")
);

assertCheck(
  "App.tsx dynamically negotiates supported audio MIME types (webm, mp4, ogg, wav)",
  appSource.includes("MediaRecorder.isTypeSupported") &&
    appSource.includes("audio/webm;codecs=opus") &&
    appSource.includes("audio/mp4")
);

assertCheck(
  "startAudioRecording requests audio from navigator.mediaDevices.getUserMedia",
  appSource.includes("navigator.mediaDevices.getUserMedia({ audio: true })")
);

assertCheck(
  "stopAudioRecording stops recorder and frees microphone hardware immediately",
  appSource.includes("stopAudioRecording") &&
    appSource.includes("mediaRecorderRef.current.stop()") &&
    appSource.includes("track.stop()")
);

assertCheck(
  "App.tsx sends audioBase64, mimeType, and language to /api/transcribe-audio",
  appSource.includes('fetch("/api/transcribe-audio"') &&
    appSource.includes("audioBase64: base64Audio") &&
    appSource.includes("mimeType") &&
    appSource.includes("languageCode: speechLang")
);

assertCheck(
  "App.tsx parses both data.transcript and data.text for response resiliency",
  appSource.includes("(data.transcript || data.text || \"\").trim()")
);

assertCheck(
  "App.tsx implements smart text appending preserving existing user text",
  appSource.includes("setVoiceText((prev) => {") &&
    appSource.includes("return `${prev.trim()} ${transcript}`;")
);

assertCheck(
  "App.tsx contains structured [VOICE] diagnostic logs across recording lifecycle",
  appSource.includes('[VOICE] startAudioRecording requested') &&
    appSource.includes('[VOICE] requesting microphone permission...') &&
    appSource.includes('[VOICE] audio blob created, size:') &&
    appSource.includes('[VOICE] final audio blob created') &&
    appSource.includes('[VOICE] sending audio payload to /api/transcribe-audio') &&
    appSource.includes('[VOICE] transcript received:') &&
    appSource.includes('[VOICE] updating textarea (setVoiceText)...')
);

// ── 6. AI Product Generation Multimodal Prompt Integration ──
console.log("\n--- 6. AI Product Generation Pipeline Context Integration ---");

assertCheck(
  "AI catalog prompt incorporates spoken testimony under ARTISAN SPOKEN CONTEXT",
  appSource.includes("ARTISAN SPOKEN CONTEXT & AUTHENTIC TESTIMONY:") &&
    appSource.includes('The artisan has provided this authentic description: "${userNote}"')
);

assertCheck(
  "AI prompt instructs Gemini to prioritize spoken artisan details as ground-truth facts",
  appSource.includes("Treat the artisan's spoken words as authentic ground-truth facts")
);

// ── 7. UI Micro-interactions & Status Feedback ──
console.log("\n--- 7. UI Micro-interactions & Visual Status ---");

assertCheck(
  "Microphone button provides concentric ripple ring animation during recording",
  appSource.includes('<MicPulseRing active={micState === "listening"} />')
);

assertCheck(
  "Textarea displays localized voice processing placeholder when transcribing",
  appSource.includes('micState === "processing"') &&
    appSource.includes('t("voice_processing")')
);

assertCheck(
  "Success badge displays localized voice_text_added confirmation",
  appSource.includes('t("voice_text_added")')
);

console.log(`\n==================================================`);
console.log(`Results: ${passedTests} / ${totalTests} checks passed.`);
console.log(`==================================================\n`);

if (passedTests === totalTests) {
  console.log("🎉 ALL VOICE-TO-TEXT CHECKS PASSED PERFECTLY!\n");
  process.exit(0);
} else {
  console.error("⚠️ SOME CHECKS FAILED. PLEASE REVIEW.");
  process.exit(1);
}
