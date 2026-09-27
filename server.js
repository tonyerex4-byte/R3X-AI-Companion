import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || "gpt-5-mini";
const appName = process.env.R3X_NAME || "R3X AI Companion";
const systemPrompt =
  process.env.R3X_SYSTEM_PROMPT ||
  "You are R3X, a helpful, friendly AI companion. Give clear and accurate answers.";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey && apiKey !== "your_openai_api_key_here"
  ? new OpenAI({ apiKey })
  : null;

app.get("/api/config", (_req, res) => {
  res.json({
    name: appName,
    model,
    configured: Boolean(client)
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!client) {
      return res.status(500).json({
        error: "OpenAI is not configured. Copy .env.example to .env and add your API key."
      });
    }

    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const cleanMessages = messages
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
      .slice(-30)
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 12000)
      }));

    if (!cleanMessages.length || cleanMessages.at(-1).role !== "user") {
      return res.status(400).json({ error: "Send a user message first." });
    }

    const response = await client.responses.create({
      model,
      instructions: systemPrompt,
      input: cleanMessages
    });

    res.json({ message: response.output_text || "R3X could not generate a response." });
  } catch (error) {
    console.error(error);
    const message =
      error?.status === 401
        ? "The OpenAI API key was rejected. Check your .env file."
        : error?.message || "Something went wrong while contacting OpenAI.";
    res.status(500).json({ error: message });
  }
});

app.get("*splat", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`${appName} running at http://localhost:${port}`);
});
