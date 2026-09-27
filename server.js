import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 3000);
const appName = process.env.R3X_NAME || "R3X AI Companion";
const systemPrompt =
  process.env.R3X_SYSTEM_PROMPT ||
  "You are R3X, a helpful, friendly AI companion. Give clear and accurate answers.";

const selectedProvider = (process.env.AI_PROVIDER || "openrouter").toLowerCase();
const openAIKey = process.env.OPENAI_API_KEY;
const openRouterKey = process.env.OPENROUTER_API_KEY;

const openAIClient = openAIKey && openAIKey !== "your_openai_api_key_here"
  ? new OpenAI({ apiKey: openAIKey })
  : null;

const openRouterClient = openRouterKey && openRouterKey !== "your_openrouter_api_key_here"
  ? new OpenAI({
    apiKey: openRouterKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
      "X-Title": appName
    }
  })
  : null;

const providerOrder = [selectedProvider, selectedProvider === "openai" ? "openrouter" : "openai"];
const client = providerOrder
  .map((provider) => provider === "openai" ? openAIClient : openRouterClient)
  .find(Boolean) || null;

const model =
  selectedProvider === "openai"
    ? process.env.OPENAI_MODEL || "gpt-5-mini"
    : process.env.OPENROUTER_MODEL || "openai/gpt-5-mini";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/config", (_req, res) => {
  res.json({
    name: appName,
    provider: selectedProvider,
    model,
    configured: Boolean(client)
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!client) {
      return res.status(500).json({
        error: "No AI provider is configured. Copy .env.example to .env and add an API key for OpenAI or OpenRouter."
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

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...cleanMessages],
      temperature: 0.7
    });

    const reply = response.choices?.[0]?.message?.content || "R3X could not generate a response.";
    res.json({ message: reply });
  } catch (error) {
    console.error(error);
    const message =
      error?.status === 401
        ? `The ${selectedProvider} API key was rejected. Check your .env file.`
        : error?.message || `Something went wrong while contacting ${selectedProvider}.`;
    res.status(500).json({ error: message });
  }
});

app.get("*splat", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`${appName} running at http://localhost:${port}`);
});
