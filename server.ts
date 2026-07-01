import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Parse large base64 image requests
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // Initialize Gemini client server-side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      }
    }
  });

  // Caricature Generation Endpoint
  app.post("/api/caricature", async (req: any, res: any) => {
    try {
      const { image, learnerProfile } = req.body;
      if (!image) {
        return res.status(400).json({ error: "이미지 데이터가 필요합니다." });
      }

      if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not defined in the environment variables!");
        return res.status(500).json({ 
          error: "API 키 설정이 누락되었습니다. AI Studio Settings > Secrets에서 GEMINI_API_KEY를 등록해 주세요." 
        });
      }

      // Prepare image for Gemini (dynamically extract mimeType if present)
      let mimeType = "image/png";
      let base64Data = image;

      if (image.includes(";base64,")) {
        const parts = image.split(";base64,");
        const mimePart = parts[0];
        if (mimePart.startsWith("data:")) {
          mimeType = mimePart.substring(5); // e.g. "image/jpeg" or "image/png"
        }
        base64Data = parts[1];
      } else if (image.includes(",")) {
        base64Data = image.split(",")[1];
      }

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        }
      };

      const promptPart = {
        text: `Analyze the face, hair style, expression, eyes, clothing, gender, skin tone, and any facial features (e.g., glasses) of the person in this photo.
Based on this photo, generate a stunning, highly polished, modern vector caricature avatar (SVG format) representing this person.
The caricature style, clothing, accessories, and atmosphere MUST reflect the following selected IB Learner Profile (학습자상): "${learnerProfile}".

Modify the caricature's pose, elements, and background to perfectly express the essence of:
- "탐구하는 사람" (Inquirer): Curious eyes, holding a small magnifying glass or having a sparkling lightbulb of ideas floating near the head. Stars and sparkles in the background.
- "생각하는 사람" (Thinker): Hand gently touching the chin in a thoughtful gesture, small rotating gears or question marks floating elegantly in a thought bubble. Intellectual look.
- "소통하는 사람" (Communicator): A bright smile, wave gesture, and a speech bubble containing a friendly greeting (like "Hello!" or "IB!"). Social, expressive vibe.
- "행동하는 사람" (Risk-taker/Actor): Enthusiastic and confident expression, a tiny champion's gold medal or hiking backpack, dynamic stance or wind breeze effects.
- "지식 있는 사람" (Knowledgeable): Wearing a small graduation/mortarboard cap, a small pile of books in the corner, or glasses with a smart, warm smile.
- "성찰하는 사람" (Reflective): A serene, calm, happy smiling face. A floating pocket watch, compass, or a peaceful glowing lantern in the background.
- "배려하는 사람" (Caring): Warm and exceptionally kind eyes, holding a glowing small heart or nurturing a tiny green sprout with both hands. Warm pastel tones.

Technical Guidelines for the SVG:
1. Return ONLY the raw SVG markup. Do NOT wrap it in any Markdown formatting (no \`\`\`xml, no \`\`\`svg, no \`\`\`).
2. The SVG MUST be valid XML, using colorful linear/radial gradients, clean circles, smooth curves, and stylized geometric paths. It must look professional, friendly, and cute (cartoon game avatar style).
3. Set the viewBox to "0 0 400 400".
4. The avatar must be centered and fill a reasonable portion of the canvas.
5. Use solid/gradient fill styles, modern rounded borders, and vivid colors. Avoid plain black and white.
6. The SVG must be entirely self-contained (no external references, no external styles).
7. Return only the SVG text. No conversation, no introductory words.`
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [imagePart, promptPart]
      });

      let svgText = response.text || "";
      
      // Clean up code block markers if the model returns them
      if (svgText.includes("```")) {
        svgText = svgText.replace(/```xml|```svg|```/g, "").trim();
      }

      const svgStartIndex = svgText.indexOf("<svg");
      if (svgStartIndex !== -1) {
        svgText = svgText.substring(svgStartIndex).trim();
      }

      res.json({ svg: svgText });
    } catch (error: any) {
      console.error("Caricature generation server error:", error);
      res.status(500).json({ error: error.message || "캐리커쳐 생성에 실패했습니다." });
    }
  });

  // Vite Middleware for Asset Handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
