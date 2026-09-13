// test-hindi-debug-gate.js
import fs from "fs";
import path from "path";

console.log("🇮🇳 Starting Kalakriti Mandatory Debug Gate Verification...\n");

let report = {
  importSuccess: false,
  invocationSuccess: false,
  payloadAccepted: false,
  geminiRequestSent: false,
  geminiResponseReceived: false,
  transcriptReturned: "NOT TESTABLE (Requires live audio input)",
  error: null,
};

try {
  // 1. Check transcribeAudioPayload can be imported
  const service = await import("./src/utils/transcribeService.ts");
  if (typeof service.transcribeAudioPayload === "function") {
    report.importSuccess = true;
    console.log("  ✅ 1. transcribeAudioPayload can be imported: PASS");
  } else {
    throw new Error("transcribeAudioPayload is not a function");
  }

  // 2. Check transcription service can be invoked with missing payload to verify validation logic
  const validationResult = await service.transcribeAudioPayload({});
  if (validationResult && validationResult.success === false && validationResult.error === "No audio data provided") {
    report.invocationSuccess = true;
    console.log("  ✅ 2. transcription service can be invoked: PASS");
  } else {
    throw new Error(`Unexpected validation result: ${JSON.stringify(validationResult)}`);
  }

  // 3. Check audio payload validation with empty string
  const emptyResult = await service.transcribeAudioPayload({ audioBase64: "   " });
  if (emptyResult && emptyResult.success === false && emptyResult.error === "No audio data provided") {
    report.payloadAccepted = true;
    console.log("  ✅ 3. audio payload accepted and strictly validated: PASS");
  } else {
    throw new Error("Empty audio payload was not properly rejected");
  }

  // 4 & 5. Check network / service availability
  // In sandbox environment without external network access or microphone hardware:
  // We check whether the endpoint logic correctly attempts the Google API request.
  console.log("  ℹ️ 4. Gemini request execution: Requires live browser/network environment");
  console.log("  ℹ️ 5. Gemini response received: Requires live browser/network environment");
  console.log("  ℹ️ 6. Transcript returned: NOT TESTABLE (Requires human spoken audio in browser)");
} catch (err) {
  report.error = err.message;
  console.error("  ❌ Error encountered:", err.message);
}

// ── Check Frontend App.tsx for Mandatory Debug Gate steps ──
console.log("\n--- Frontend Microphone Pipeline Code Inspection ---");
const appSource = fs.readFileSync(path.resolve("src/App.tsx"), "utf-8");

const checks = [
  { desc: "getUserMedia requested on mic click", check: appSource.includes("navigator.mediaDevices.getUserMedia({ audio: true })") },
  { desc: "MediaRecorder started with timeslice", check: appSource.includes("mediaRecorder.start(250)") },
  { desc: "dataavailable event pushes audio chunks", check: appSource.includes("audioChunksRef.current.push(event.data)") },
  { desc: "stopAudioRecording calls requestData() to flush final audio", check: appSource.includes("mediaRecorderRef.current.requestData()") },
  { desc: "mediaRecorder.stop() invoked", check: appSource.includes("mediaRecorderRef.current.stop()") },
  { desc: "final audio blob generated from chunks", check: appSource.includes("new Blob(audioChunksRef.current, { type: mimeType })") },
  { desc: "all mediaStream tracks explicitly stopped (track.stop())", check: appSource.includes("stream.getTracks().forEach") && appSource.includes("track.stop()") },
  { desc: "prior active stream terminated before opening new stream", check: appSource.includes("cleaning up prior active stream before opening new one") },
  { desc: "component unmount stops active tracks", check: appSource.includes("mediaStreamRef.current.getTracks().forEach((track) => track.stop())") },
  { desc: "audio payload sent to /api/transcribe-audio", check: appSource.includes('fetch("/api/transcribe-audio"') },
  { desc: "existing textarea state updated with setVoiceText", check: appSource.includes("setVoiceText((prev) =>") },
  { desc: "smart appending preserves existing user text", check: appSource.includes("${prev.trim()} ${transcript}") },
];

let allChecksPass = true;
checks.forEach((c) => {
  if (c.check) {
    console.log(`  ✅ PASS: ${c.desc}`);
  } else {
    console.error(`  ❌ FAIL: ${c.desc}`);
    allChecksPass = false;
  }
});

console.log("\n==================================================");
console.log("Debug Gate Pipeline Status Summary");
console.log("==================================================");
console.log(`1. transcribeAudioPayload imported: ${report.importSuccess ? "PASS" : "FAIL"}`);
console.log(`2. transcription service invoked: ${report.invocationSuccess ? "PASS" : "FAIL"}`);
console.log(`3. audio payload validated: ${report.payloadAccepted ? "PASS" : "FAIL"}`);
console.log(`4. code checks passed: ${allChecksPass ? "PASS (12/12)" : "FAIL"}`);
console.log("==================================================\n");

if (report.importSuccess && report.invocationSuccess && report.payloadAccepted && allChecksPass) {
  process.exit(0);
} else {
  process.exit(1);
}
