// src/utils/transcribeService.ts

export const CRAFT_VOCABULARY = [
  "Kalakriti", "कलाकृति", "कलाकृती",
  "ONDC", "ओएनडीसी",
  "terracotta", "टेराकोटा",
  "Madhubani", "मधुबनी",
  "Warli", "वारली",
  "Pattachitra", "पट्टचित्र",
  "Chikankari", "चिकनकारी",
  "Banarasi", "बनारसी",
  "Dhokra", "ढोकरा",
  "Kathputli", "कठपुतली", "कठपुतळी",
  "handicraft", "हस्तशिल्प", "हस्तकला",
  "pottery", "मातीकाम", "कुंभारकाम",
  "diya", "दिवा", "दीपक",
  "kalash", "कलश", "घडा",
];

export interface TranscribeAudioParams {
  audioBase64?: string;
  mimeType?: string;
  languageCode?: string;
  geminiKey?: string;
}

export interface TranscribeAudioResult {
  success: boolean;
  transcript?: string;
  text?: string;
  error?: string;
  modelUsed?: string;
}

export async function transcribeAudioPayload(
  params: TranscribeAudioParams
): Promise<TranscribeAudioResult> {
  const { audioBase64, mimeType, languageCode, geminiKey } = params;

  console.log(`[VOICE API] request received, language: ${languageCode || "unspecified"}`);

  if (!geminiKey) {
    console.error("[VOICE API] missing Gemini API key on server");
    return { success: false, error: "Gemini API key not configured on server" };
  }

  if (!audioBase64 || typeof audioBase64 !== "string" || audioBase64.trim().length === 0) {
    console.error("[VOICE API] missing or empty audioBase64 payload");
    return { success: false, error: "No audio data provided" };
  }

  const resolvedKey = geminiKey || process.env.VITE_GEMINI_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!resolvedKey) {
    console.error("[VOICE API] missing Gemini API key on server");
    return { success: false, error: "Gemini API key not configured on server" };
  }

  const cleanMimeType = (mimeType || "audio/webm").split(";")[0].trim();
  console.log(`[VOICE API] audio payload verified, MIME: ${cleanMimeType}, base64Length: ${audioBase64.length}`);

  let transcript = "";
  let modelUsed = "";

  // 1. Primary Path: Dedicated Gemini 3.5 Transcribe
  try {
    console.log("[VOICE API] attempting primary model (gemini-3.5-transcribe)...");
    const transcribeUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-transcribe:generateContent?key=${resolvedKey}`;
    
    // Google v1beta REST schema requires camelCase: inlineData and mimeType
    const transcribeBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: cleanMimeType,
                data: audioBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        audioTranscriptionConfig: {
          mode: "SMART",
        },
      },
    };

    const response = await fetch(transcribeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transcribeBody),
    });

    if (response.ok) {
      const data = await response.json();
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        data.candidates?.[0]?.content?.parts?.[0]?.audioTranscription?.words
          ?.map((w: any) => w.word)
          .join(" ");

      if (text && text.trim()) {
        transcript = text.trim();
        modelUsed = "gemini-3.5-transcribe";
        console.log(`[VOICE API] gemini-3.5-transcribe succeeded: "${transcript.substring(0, 50)}..."`);
      }
    } else {
      const errText = await response.text();
      console.warn("[VOICE API] primary model notice, initiating resilient fallback:", errText.substring(0, 200));
    }
  } catch (primaryErr: any) {
    console.warn("[VOICE API] primary model exception, initiating fallback:", primaryErr.message);
  }

  // 2. Resilient Fallback: Multimodal Gemini 3.5 Flash Lite Audio Understanding
  if (!transcript) {
    try {
      console.log("[VOICE API] attempting fallback model (gemini-3.5-flash-lite)...");
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${resolvedKey}`;
      const langHint = languageCode ? `Spoken language hint: ${languageCode}.` : "";
      
      const fallbackPrompt = `
You are an expert audio transcriber for Indian rural artisans.
${langHint}
Listen to the audio recording. Transcribe the spoken words VERBATIM in the original spoken language and script (e.g. Hindi in Devanagari, Marathi in Devanagari, Bengali in Bengali script, Gujarati in Gujarati script, Tamil in Tamil script, Telugu in Telugu script, English in Latin script).
CRITICAL RULES:
1. Do NOT translate the words into English.
2. Preserve authentic regional craft terms and natural code-switching (e.g. "हा handmade मातीचा दिवा आहे").
3. Output ONLY the clean transcribed text. Do NOT wrap in quotes. Do NOT add notes or explanations.
`;

      const fallbackResponse = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: fallbackPrompt },
                {
                  inlineData: {
                    mimeType: cleanMimeType,
                    data: audioBase64,
                  },
                },
              ],
            },
          ],
        }),
      });

      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleanText = rawText
          .replace(/```[a-z]*/gi, "")
          .replace(/```/g, "")
          .replace(/^["']|["']$/g, "")
          .trim();

        if (cleanText) {
          transcript = cleanText;
          modelUsed = "gemini-3.5-flash-lite";
          console.log(`[VOICE API] gemini-3.5-flash-lite succeeded: "${transcript.substring(0, 50)}..."`);
        }
      } else {
        const fallbackErr = await fallbackResponse.text();
        console.error("[VOICE API] fallback model error:", fallbackErr.substring(0, 200));
        return { success: false, error: "Failed to transcribe audio from speech model" };
      }
    } catch (fallbackErr: any) {
      console.error("[VOICE API] fallback model exception:", fallbackErr.message);
      return { success: false, error: fallbackErr.message || "Transcription network error" };
    }
  }

  if (!transcript) {
    console.warn("[VOICE API] no speech detected in audio stream");
    return { success: false, error: "No speech recognized in audio" };
  }

  console.log(`[VOICE API] transcription complete (${modelUsed}): "${transcript.substring(0, 40)}..."`);
  return {
    success: true,
    transcript,
    text: transcript,
    modelUsed,
  };
}

