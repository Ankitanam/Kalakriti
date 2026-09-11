import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export async function generateProductFromImage(image: File) {
  const arrayBuffer = await image.arrayBuffer();

  const base64Image = btoa(
    String.fromCharCode(...new Uint8Array(arrayBuffer))
  );

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: [
      {
        inlineData: {
          mimeType: image.type,
          data: base64Image,
        },
      },
      {
        text: `
          Analyze this artisan product image.

          Identify what the product is and create an online marketplace listing.

          Return ONLY valid JSON in this format:
          {
  "title": "short attractive product title",
  "description": "clear 2-3 sentence product description",
  "category": "product category",
  "suggestedPrice": 500
}
  Suggest a reasonable approximate price in Indian Rupees (INR).
Consider the visible craftsmanship, materials, size and type of product.
This is only a suggestion and should not be treated as an exact market price.

          The product should be described honestly based only on what
          can reasonably be seen in the image.
        `,
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}