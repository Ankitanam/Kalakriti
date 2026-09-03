// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" })); // Supports image payloads

// ── Secure Backend API Endpoint ──
app.post("/api/generate-catalog", async (req, res) => {
  try {
    const { promptText, mimeType, base64Data } = req.body;

    // The secret key is stored on the SERVER only (Never seen in browser Network tab)
    const geminiKey = process.env.VITE_GEMINI_KEY;

    let parts = [{ text: promptText }];
    if (base64Data) {
      parts.push({
        inline_data: {
          mime_type: mimeType || "image/jpeg",
          data: base64Data,
        },
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🔒 Secure Backend running on http://localhost:${PORT}`);
});