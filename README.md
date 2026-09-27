# R3X AI Companion

R3X AI Companion is the restored R3X-branded local chatbot, configured for OpenAI only.

## Included configuration

- R3X AI Companion branding
- R3X logo treatment throughout the interface
- OpenAI server-side integration
- `.env.example` configuration
- Configurable OpenAI model
- Configurable R3X system prompt
- Configurable port
- Runtime `/api/config` status endpoint
- VS Code settings and extension recommendations
- `.gitignore` protecting `.env`
- Responsive desktop/mobile UI

## Setup

### 1. Install Node.js

Use Node.js 18 or newer. Node.js 20+ is recommended.

### 2. Install dependencies

Open a terminal in this folder:

```bash
npm install
```

### 3. Create your configuration

Copy `.env.example` to `.env`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Edit `.env`:

```env
OPENAI_API_KEY=your_actual_openai_api_key
OPENAI_MODEL=gpt-5-mini
PORT=3000
R3X_NAME=R3X AI Companion
R3X_SYSTEM_PROMPT=You are R3X, a helpful, friendly AI companion. Give clear and accurate answers.
```

Keep the API key only in `.env`. Do not put it in browser JavaScript.

### 4. Run

```bash
npm start
```

Open:

```text
http://localhost:3000
```

For development:

```bash
npm run dev
```

## Project structure

```text
R3X-AI-Companion/
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Important

This version intentionally uses OpenAI only. Google Gemini is not included.

For public deployment, add authentication, rate limiting, usage controls, secure logging, and other production protections before exposing the API server to the internet.
