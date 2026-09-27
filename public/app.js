const messagesEl = document.getElementById("messages");
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const newChat = document.getElementById("newChat");
const clearChat = document.getElementById("clearChat");
const status = document.getElementById("status");
const modelLabel = document.getElementById("modelLabel");

let conversation = [];

function renderWelcome() {
  messagesEl.innerHTML = `
    <div class="welcome">
      <div class="welcome-logo">R3X</div>
      <h3>Welcome to R3X</h3>
      <p>Your AI companion is ready.</p>
    </div>`;
}

function addMessage(role, content, temporary = false) {
  const welcome = messagesEl.querySelector(".welcome");
  if (welcome) welcome.remove();

  const row = document.createElement("div");
  row.className = `message ${role}${temporary ? " temporary" : ""}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "YOU" : "R3X";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = content;

  row.append(avatar, bubble);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return row;
}

async function loadConfig() {
  try {
    const response = await fetch("/api/config");
    const data = await response.json();
    modelLabel.textContent = data.configured ? `Connected • ${data.model}` : "API key not configured";
    status.innerHTML = `<span class="dot"></span>${data.configured ? "OpenAI connected" : "Add your API key to .env"}`;
  } catch {
    modelLabel.textContent = "Server unavailable";
    status.innerHTML = `<span class="dot"></span>Start the Node server`;
  }
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  conversation.push({ role: "user", content: text });
  addMessage("user", text);
  input.value = "";
  input.style.height = "auto";
  sendButton.disabled = true;

  const typing = addMessage("assistant", "R3X is thinking…", true);
  typing.querySelector(".bubble").classList.add("typing");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation })
    });

    const data = await response.json();
    typing.remove();

    if (!response.ok) throw new Error(data.error || "Request failed.");

    conversation.push({ role: "assistant", content: data.message });
    addMessage("assistant", data.message);
  } catch (error) {
    typing.remove();
    addMessage("assistant", `Error: ${error.message}`);
  } finally {
    sendButton.disabled = false;
    input.focus();
  }
}

function resetChat() {
  conversation = [];
  renderWelcome();
  input.focus();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

newChat.addEventListener("click", resetChat);
clearChat.addEventListener("click", resetChat);

loadConfig();
input.focus();
